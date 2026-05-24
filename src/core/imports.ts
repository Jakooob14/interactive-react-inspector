function getDirectiveInsertOffset(code: string) {
    let offset = 0;
    let insertOffset = 0;

    if (code.startsWith("#!")) {
        const lineEnd = code.indexOf("\n");
        offset = lineEnd === -1 ? code.length : lineEnd + 1;
        insertOffset = offset;
    }

    while (offset < code.length) {
        const lineEnd = code.indexOf("\n", offset);
        const end = lineEnd === -1 ? code.length : lineEnd + 1;
        const line = code.slice(offset, end);
        const trimmed = line.trim();

        if (!trimmed || trimmed.startsWith("//")) {
            offset = end;
            continue;
        }

        if (trimmed.startsWith("/*")) {
            const blockEnd = code.indexOf("*/", offset + 2);
            offset = blockEnd === -1 ? code.length : blockEnd + 2;
            if (code[offset] === "\r") offset += 1;
            if (code[offset] === "\n") offset += 1;
            continue;
        }

        if (/^(['"])(.*?)\1;?$/.test(trimmed)) {
            insertOffset = end;
            offset = end;
            continue;
        }

        break;
    }

    return insertOffset;
}

export function injectSideEffectImport(code: string, id: string) {
    const statement = `import ${JSON.stringify(id)};`;

    if (code.includes(statement)) return code;

    const offset = getDirectiveInsertOffset(code);

    return `${code.slice(0, offset)}${statement}\n${code.slice(offset)}`;
}
