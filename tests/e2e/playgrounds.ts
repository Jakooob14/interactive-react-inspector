export type Playground = {
    name: string;
    command: string;
    cwd: string;
    url: string;
    readyText: string | RegExp;
    targetRole: "button" | "link";
    targetName: string | RegExp;
    expectedRequest: {
        file: string;
        line: number;
        column: number;
    };
};

export const playgrounds: Playground[] = [
    {
        name: "vite-react",
        command: "pnpm exec vite --host 127.0.0.1 --port 5173",
        cwd: "./playgrounds/vite-react",
        url: "http://127.0.0.1:5173",
        readyText: "Get started",
        targetRole: "button",
        targetName: /^Count is 0$/,
        expectedRequest: {
            file: "src/App.tsx",
            line: 24,
            column: 8,
        },
    },
    {
        name: "next webpack",
        command: "pnpm exec next dev --webpack --hostname 127.0.0.1 --port 3001",
        cwd: "./playgrounds/next-webpack",
        url: "http://127.0.0.1:3001",
        readyText: "To get started, edit the page.tsx file.",
        targetRole: "button",
        targetName: "Webpack target",
        expectedRequest: {
            file: "app/inspector-target.tsx",
            line: 5,
            column: 4,
        },
    },
    {
        name: "next turbopack",
        command: "pnpm exec next dev --turbopack --hostname 127.0.0.1 --port 3002",
        cwd: "./playgrounds/next-turbopack",
        url: "http://127.0.0.1:3002",
        readyText: "To get started, edit the page.tsx file.",
        targetRole: "button",
        targetName: "Turbopack target",
        expectedRequest: {
            file: "app/inspector-target.tsx",
            line: 5,
            column: 4,
        },
    },
];
