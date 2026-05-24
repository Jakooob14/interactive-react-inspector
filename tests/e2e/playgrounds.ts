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
        name: "next",
        command: "pnpm exec next dev --webpack --hostname 127.0.0.1 --port 3000",
        cwd: "./playgrounds/next",
        url: "http://127.0.0.1:3000",
        readyText: "To get started, edit the page.tsx file.",
        targetRole: "link",
        targetName: "Documentation",
        expectedRequest: {
            file: "app/page.tsx",
            line: 53,
            column: 10,
        },
    },
];
