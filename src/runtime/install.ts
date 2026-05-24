// @ts-nocheck

const ATTR = "data-source";
const INSPECTOR_ROOT_ID = "__react_inspector_overlay__";

const REGEX = /(.+):(\d+):(\d+)$/;

/**
 * @param {string | null} value
 */
function parseSource(value) {
    if (!value) return null;

    const match = value.match(REGEX);

    if (!match) return null;

    return {
        file: match[1],
        line: Number(match[2]),
        column: Number(match[3])
    }
}

/**
 * @param {{ file: string; line: number; column: number } | null} source
 */
async function openSource(source) {
    if (!source) return;

    await fetch("/__open", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(source),
    });
}

let installed = false
let selectMode = false;
let activeTarget = null;
let root = null;
let toggleButton = null;
let highlight = null;
let label = null;

function createOverlay() {
    root = document.createElement("div");
    root.id = INSPECTOR_ROOT_ID;
    root.style.all = "initial";
    root.style.position = "fixed";
    root.style.top = "16px";
    root.style.right = "16px";
    root.style.zIndex = "2147483647";
    root.style.fontFamily = "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif";
    root.style.pointerEvents = "auto";

    const shadow = root.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = `
        :host {
            all: initial;
        }

        button {
            align-items: center;
            background-color: black;
            border: 1px solid rgba(255, 255, 255, 0.28);
            border-radius: 8px;
            color: #f9fafb;
            cursor: pointer;
            display: inline-flex;
            font: 600 13px/1 ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            gap: 8px;
            min-height: 34px;
            padding: 0 12px;
            outline: none;
            transition: background-color 100ms ease-in-out;
        }
        
        button:hover {
            background-color: hsl(0, 0%, 7%);
        }

        button::before {
            background: currentColor;
            content: "";
            display: block;
            height: 14px;
            mask: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNyb3NzaGFpci1pY29uIGx1Y2lkZS1jcm9zc2hhaXIiPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjEwIi8+PGxpbmUgeDE9IjIyIiB4Mj0iMTgiIHkxPSIxMiIgeTI9IjEyIi8+PGxpbmUgeDE9IjYiIHgyPSIyIiB5MT0iMTIiIHkyPSIxMiIvPjxsaW5lIHgxPSIxMiIgeDI9IjEyIiB5MT0iNiIgeTI9IjIiLz48bGluZSB4MT0iMTIiIHgyPSIxMiIgeTE9IjIyIiB5Mj0iMTgiLz48L3N2Zz4=") center / contain no-repeat;
            -webkit-mask: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNyb3NzaGFpci1pY29uIGx1Y2lkZS1jcm9zc2hhaXIiPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjEwIi8+PGxpbmUgeDE9IjIyIiB4Mj0iMTgiIHkxPSIxMiIgeTI9IjEyIi8+PGxpbmUgeDE9IjYiIHgyPSIyIiB5MT0iMTIiIHkyPSIxMiIvPjxsaW5lIHgxPSIxMiIgeDI9IjEyIiB5MT0iNiIgeTI9IjIiLz48bGluZSB4MT0iMTIiIHgyPSIxMiIgeTE9IjIyIiB5Mj0iMTgiLz48L3N2Zz4=") center / contain no-repeat;
            width: 14px;
        }

        button[data-active="true"] {
            background-color: hsl(0, 0%, 10%);
        }

        button[data-active="true"]::before {
            background: #fef3c7;
        }
    `;

    toggleButton = document.createElement("button");
    toggleButton.type = "button";
    toggleButton.textContent = "Select";
    toggleButton.setAttribute("aria-pressed", "false");
    toggleButton.addEventListener("click", () => setSelectMode(!selectMode));

    shadow.append(style, toggleButton);
    document.documentElement.appendChild(root);

    highlight = document.createElement("div");
    highlight.style.position = "fixed";
    highlight.style.zIndex = "2147483646";
    highlight.style.border = "2px solid hsl(193, 80%, 50%)";
    highlight.style.borderRadius = "4px";
    highlight.style.boxShadow = "0 0 0 999999px hsla(193, 80%, 50%, 0.12), 0 0 24px hsla(193, 80%, 50%, 0.55)";
    highlight.style.pointerEvents = "none";
    highlight.style.display = "none";
    highlight.style.transition = "left 0.15s ease-out, top 0.15s ease-out, width 0.15s ease-out, height 0.15s ease-out";

    label = document.createElement("div");
    label.style.position = "fixed";
    label.style.zIndex = "2147483646";
    label.style.maxWidth = "min(520px, calc(100vw - 24px))";
    label.style.overflow = "hidden";
    label.style.textOverflow = "ellipsis";
    label.style.whiteSpace = "nowrap";
    label.style.background = "hsl(193, 90%, 50%)";
    label.style.color = "black";
    label.style.borderRadius = "6px";
    label.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.22)";
    label.style.font = "600 12px/1 ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif";
    label.style.padding = "6px 8px";
    label.style.pointerEvents = "none";
    label.style.display = "none";
    label.style.transition = "left 0.15s ease-out, top 0.15s ease-out";

    document.documentElement.append(highlight, label);
}

function setSelectMode(next) {
    selectMode = next;

    if (toggleButton) {
        toggleButton.dataset.active = String(selectMode);
        toggleButton.textContent = selectMode ? "Selecting" : "Select";
        toggleButton.setAttribute("aria-pressed", String(selectMode));
    }

    document.documentElement.style.cursor = selectMode ? "crosshair" : "";

    if (!selectMode) {
        activeTarget = null;
        hideHighlight();
    }
}

function hideHighlight() {
    if (highlight) highlight.style.display = "none";
    if (label) label.style.display = "none";
}

function getSourceTarget(e) {
    const path = e.composedPath();

    return path.find(
        (node) =>
            node instanceof Element
            && node.id !== INSPECTOR_ROOT_ID
            && !root?.contains(node)
            && node.hasAttribute(ATTR)
    );
}

function renderHighlight(target) {
    if (!highlight || !label) return;
    if (!(target instanceof Element)) {
        hideHighlight();
        return;
    }

    const source = target.getAttribute(ATTR) || "";
    const rect = target.getBoundingClientRect();

    highlight.style.display = "block";
    highlight.style.left = `${rect.left}px`;
    highlight.style.top = `${rect.top}px`;
    highlight.style.width = `${rect.width}px`;
    highlight.style.height = `${rect.height}px`;

    label.textContent = source;
    label.style.display = "block";
    label.style.left = `${Math.max(8, Math.min(rect.left, window.innerWidth - 532))}px`;
    label.style.top = `${Math.max(8, rect.top - 30)}px`;
}

export function installInspector() {
    if (installed || typeof document === "undefined") return;
    console.log("[react-inspector] installing");
    
    installed = true
    createOverlay();
    
    document.addEventListener("pointermove", (e) => {
        if (!selectMode) return;

        const target = getSourceTarget(e);

        if (target === activeTarget) return;

        activeTarget = target;
        renderHighlight(activeTarget);
    }, true);

    document.addEventListener("scroll", () => {
        if (!selectMode || !(activeTarget instanceof Element)) return;
        renderHighlight(activeTarget);
    }, true);

    window.addEventListener("resize", () => {
        if (!selectMode || !(activeTarget instanceof Element)) return;
        renderHighlight(activeTarget);
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && selectMode) setSelectMode(false);
    }, true);

    document.addEventListener("click", async (e) => {
        if (!selectMode) return;
        if (e.button !== 0) return;

        const target = getSourceTarget(e);

        if (!(target instanceof Element)) return;

        const parsed = parseSource(target.getAttribute(ATTR));

        e.preventDefault();
        e.stopPropagation();
        setSelectMode(false);

        await openSource(parsed);
    }, true);
}

installInspector();