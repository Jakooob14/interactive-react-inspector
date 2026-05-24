import path from "node:path";
import { parse } from "@babel/parser";
import _traverse from "@babel/traverse";
import MagicString from "magic-string";

// Unwrap the default export for ESM compatibility
const traverse = (_traverse as any).default || _traverse;

const ATTR = "data-source";

function normalizeId(id: string) {
    return id.split("?")[0].split("#")[0].replace(/\\/g, "/");
}

function shouldTransform(id: string) {
    return /\.(mjs|js|jsx|ts|tsx)$/.test(normalizeId(id));
}

function isInspectableElement(name: any) {
    if (name.type !== "JSXIdentifier") return false;
    const nameStr = name.name;
    return /^[a-z]/.test(nameStr) || nameStr === "Image" || nameStr === "Link";
}

export function transform(code: string, id: string) {
    if (process.env.NODE_ENV === "production") return;

    const normalizedId = normalizeId(id);

    if (!shouldTransform(normalizedId)) return null;

    const s = new MagicString(code);

    let ast;

    try {
        ast = parse(code, {
            sourceType: "unambiguous",
            plugins: [
                "jsx",
                "typescript",
                "decorators-legacy",
                "classProperties",
                "classPrivateProperties",
                "classPrivateMethods",
                "importAttributes",
            ],
        });
    } catch {
        return null;
    }

    const relative = path.relative(
        process.cwd(),
        normalizedId,
    ).replaceAll("\\", "/");

    traverse(ast, {
        JSXOpeningElement(p: { node: any; }) {
            const node = p.node;

            if (!node.loc) return;
            if (!isInspectableElement(node.name)) return;

            const exists = node.attributes.some(
                (a: { type: string; name: { name: string; }; }) =>
                    a.type === "JSXAttribute"
                    && a.name.name === ATTR,
            );

            if (exists) return;

            const insert = node.end! - (
                node.selfClosing
                    ? 2
                    : 1
            );

            const { line, column } = node.loc.start;

            s.prependLeft(
                insert,
                ` ${ATTR}="${relative}:${line}:${column}"`,
            );
        },
    });

    return {
        code: s.toString(),
        map: s.generateMap(),
    }
}
