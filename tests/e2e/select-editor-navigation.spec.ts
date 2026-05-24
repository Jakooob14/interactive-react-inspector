import { expect, test } from "@playwright/test";

import type { Playground } from "./playgrounds";

type EditorOpenRequest = {
    file: string;
    line: number;
    column: number;
};

test("selecting an element sends editor navigation metadata", async ({ page }, testInfo) => {
    const playground = testInfo.project.metadata.playground as Playground;
    let resolveEditorRequest!: (payload: unknown) => void;
    const editorRequest = new Promise<unknown>((resolve) => {
        resolveEditorRequest = resolve;
    });

    await page.route("**/__open", async (route, request) => {
        expect(request.method()).toBe("POST");
        expect(request.headers()["content-type"]).toContain("application/json");

        resolveEditorRequest(request.postDataJSON());

        await route.fulfill({ status: 204 });
    });

    await page.goto("/");
    await expect(page.getByText(playground.readyText)).toBeVisible();

    await page.getByRole("button", { name: "Select" }).click();
    await expect(page.getByRole("button", { name: "Selecting" })).toHaveAttribute("aria-pressed", "true");

    await page.getByRole(playground.targetRole, { name: playground.targetName }).click();

    const payload = await editorRequest;

    expect(payload).toEqual({
        file: expect.any(String),
        line: expect.any(Number),
        column: expect.any(Number),
    });
    expect(Object.keys(payload as EditorOpenRequest).sort()).toEqual(["column", "file", "line"]);
    expect(payload).toEqual(playground.expectedRequest);
});
