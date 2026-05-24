import { defineConfig, devices } from "@playwright/test";

import { playgrounds } from "./tests/e2e/playgrounds";

export default defineConfig({
    testDir: "./tests/e2e",
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    reporter: process.env.CI ? "github" : "list",
    use: {
        trace: "on-first-retry",
    },
    webServer: playgrounds.map((playground) => ({
        command: playground.command,
        cwd: playground.cwd,
        url: playground.url,
        reuseExistingServer: false,
        timeout: 120_000,
    })),
    projects: playgrounds.map((playground) => ({
        name: playground.name,
        metadata: { playground },
        use: {
            ...devices["Desktop Chrome"],
            baseURL: playground.url,
        },
    })),
});
