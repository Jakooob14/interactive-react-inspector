import { createUnplugin } from "unplugin";
import path from "node:path";
import { fileURLToPath } from "node:url";
import launch from "launch-editor";

import { transform as sourceTransform } from "../../core/src/transform";

const VIRTUAL_ID = "virtual:react-inspector";
const RESOLVED_ID = "\0" + VIRTUAL_ID;
const SOURCE_EXT_RE = /\.(mjs|js|jsx|ts|tsx)$/;
const IGNORED_PATH_RE = /\/(node_modules|dist|build|coverage|\.next|\.nuxt|\.svelte-kit|\.output|\.astro)\//;

function normalizeId(id?: string) {
    if (!id) return "";

    // Strip query/hash and normalize Windows paths for consistent matching.
    const cleaned = id.split("?")[0].split("#")[0];
    return cleaned.replace(/\\/g, "/");
}

const RUNTIME_PATH = normalizeId(
    path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        "../../runtime/src/install.ts",
    ),
);

function hasDirective(code: string, directive: string) {
    const lines = code.split(/\r?\n/);
    let inBlockComment = false;

    for (const line of lines) {
        const trimmed = line.trim();

        if (!trimmed) continue;

        if (inBlockComment) {
            if (trimmed.includes("*/")) inBlockComment = false;
            continue;
        }

        if (trimmed.startsWith("/*")) {
            if (!trimmed.includes("*/")) inBlockComment = true;
            continue;
        }

        if (trimmed.startsWith("//")) continue;

        const match = trimmed.match(/^(['"])(.+)\1;?$/);

        if (match?.[2] === directive) return true;

        // First non-directive statement means no `use client`.
        return false;
    }

    return false;
}

function hasUseClientDirective(code: string) {
    return hasDirective(code, "use client");
}

function shouldTransform(id?: string) {
    if (!id) return false;

    const normalized = normalizeId(id);

    if (
        IGNORED_PATH_RE.test(normalized) ||
        normalized.includes("\0")
    ) return false;

    return SOURCE_EXT_RE.test(normalized);
}

function importsClientRenderer(code: string) {
    return /from\s+["']react-dom\/client["']/.test(code) ||
        /require\(\s*["']react-dom\/client["']\s*\)/.test(code);
}

function isLikelyClientEntry(id: string) {
    const normalized = normalizeId(id);
    const file = normalized.split("/").pop() ?? "";
    const stem = file.replace(SOURCE_EXT_RE, "");

    return [
        "main",
        "index",
        "app",
        "_app",
        "root",
        "client",
        "entry-client",
        "entry.client",
    ].includes(stem);
}

function shouldInjectRuntime(id: string | undefined, code: string, framework: string) {
    if (!id) return false;

    const normalized = normalizeId(id);

    if (framework === "webpack" || framework === "rspack") {
        return false;
    }

    if (
        normalized.endsWith("/pages/_app.tsx") ||
        normalized.endsWith("/pages/_app.jsx") ||
        normalized.endsWith("/pages/_app.js")
    ) return true;

    if (
        normalized.endsWith("/app/layout.tsx") ||
        normalized.endsWith("/app/layout.jsx") ||
        normalized.endsWith("/app/page.tsx") ||
        normalized.endsWith("/app/page.jsx")
    ) {
        return hasUseClientDirective(code);
    }

    return hasUseClientDirective(code) ||
        importsClientRenderer(code) ||
        isLikelyClientEntry(normalized);
}

function getRuntimeImport(meta: { framework: string }) {
    if (meta.framework === "vite") {
        return `/@fs/${RUNTIME_PATH}`;
    }

    return RUNTIME_PATH;
}

function prependImport(value: unknown, id: string): unknown {
    if (typeof value === "string") {
        return value === id ? value : [id, value];
    }

    if (Array.isArray(value)) {
        return value.includes(id) ? value : [id, ...value];
    }

    if (value && typeof value === "object" && "import" in value) {
        return {
            ...value,
            import: prependImport((value as { import: unknown }).import, id),
        };
    }

    return value;
}

function injectWebpackEntry(
    compiler: { options: { name?: string; entry?: unknown } },
    id: string,
) {
    const name = compiler.options.name?.toLowerCase() ?? "";

    if (name.includes("server") || name.includes("edge")) return;

    const originalEntry = compiler.options.entry;

    compiler.options.entry = async () => {
        const entry =
            typeof originalEntry === "function"
                ? await originalEntry()
                : originalEntry;

        if (typeof entry === "string" || Array.isArray(entry)) {
            return prependImport(entry, id);
        }

        if (entry && typeof entry === "object") {
            return Object.fromEntries(
                Object.entries(entry).map(([key, value]) => [
                    key,
                    prependImport(value, id),
                ]),
            );
        }

        return entry;
    };
}

function installOpenMiddleware(app: any) {
    app.use("/__open", (req: any, res: any) => {
            let body = "";

            req.on("data", (c: Buffer | string) => body += c);

            req.on("end", () => {
                try {
                    const { file, line, column } = JSON.parse(body);

                    launch(`${file}:${line}:${column}`);

                    res.statusCode = 204;
                    res.end();
                } catch {
                    res.statusCode = 400;
                    res.end();
                }
            });
        },
    );
}

function injectWebpackDevServerOpenRoute(compiler: { options: { devServer?: any } }) {
    const devServer = compiler.options.devServer;

    if (!devServer || typeof devServer !== "object") return;

    const originalSetupMiddlewares = devServer.setupMiddlewares;

    devServer.setupMiddlewares = (middlewares: unknown[], server: { app?: any }) => {
        if (server.app) installOpenMiddleware(server.app);

        return typeof originalSetupMiddlewares === "function"
            ? originalSetupMiddlewares(middlewares, server)
            : middlewares;
    };
}

export default createUnplugin((_options, meta) => ({
    name: "react-inspector",
    enforce: "pre",

    resolveId(id) {
        if (id === VIRTUAL_ID) {
            return RESOLVED_ID;
        }
    },

    load(id) {
        if (id === RESOLVED_ID) {
            return `
"use client";
import ${JSON.stringify(getRuntimeImport(meta))};
`;
        }
    },

    transform(code, id) {
        if (!shouldTransform(id)) return;

        let result = sourceTransform(code, id);

        if (shouldInjectRuntime(id, code, meta.framework) && result) {
            result.code =
                `import "${VIRTUAL_ID}";\n` +
                result.code;
        }

        return result;
    },

    vite: {
        configureServer(server) {
            installOpenMiddleware(server.middlewares);
        },
    },

    webpack(compiler) {
        injectWebpackEntry(compiler, getRuntimeImport(meta));
        injectWebpackDevServerOpenRoute(compiler);
    },
}));
