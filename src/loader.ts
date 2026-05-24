import { injectSideEffectImport } from "./core/imports.ts";
import { transform as sourceTransform } from "./core/transform.ts";
import ts from "typescript";

type LoaderOptions = {
    runtime?: boolean;
    transform?: boolean;
};

type LoaderContext = {
    resourcePath?: string;
    cacheable?: (flag?: boolean) => void;
    getOptions?: () => LoaderOptions;
    callback?: (error: Error | null, content?: string, sourceMap?: unknown) => void;
};

function getTranspileFileName(fileName?: string) {
    return fileName?.endsWith(".js") ? `${fileName}x` : fileName;
}

function transpileForTurbopack(code: string, fileName?: string) {
    const result = ts.transpileModule(code, {
        fileName: getTranspileFileName(fileName),
        compilerOptions: {
            jsx: ts.JsxEmit.ReactJSX,
            module: ts.ModuleKind.ESNext,
            target: ts.ScriptTarget.ES2022,
            sourceMap: true,
        },
    });

    return {
        code: result.outputText,
        map: result.sourceMapText ? JSON.parse(result.sourceMapText) : undefined,
    };
}

function reactInspectorLoader(
    this: LoaderContext,
    source: string,
    inputSourceMap?: unknown,
) {
    this.cacheable?.();

    const options = this.getOptions?.() ?? {};
    let code = source;
    let map = inputSourceMap;

    if (process.env.NODE_ENV !== "production") {
        if (options.transform !== false) {
            const result = sourceTransform(code, this.resourcePath ?? "");

            if (result) {
                code = result.code;
                map = result.map;
            }
        }

        if (options.runtime) {
            code = injectSideEffectImport(code, "interactive-react-inspector/runtime");
        }
    }

    const transpiled = transpileForTurbopack(code, this.resourcePath);
    code = transpiled.code;
    map = transpiled.map ?? map;

    if (this.callback) {
        this.callback(null, code, map);
        return;
    }

    return code;
}

if (typeof module !== "undefined") {
    module.exports = reactInspectorLoader;
}

export default reactInspectorLoader;
