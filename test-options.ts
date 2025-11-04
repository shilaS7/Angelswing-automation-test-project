import { test as base, expect as playwrightExpect } from "@playwright/test";
import { PageManager } from './pages/PageManager';


export type TestOptions = {
    pageManager: PageManager;
};

export const test = base.extend<TestOptions>({

    pageManager: async ({ page }, use) => {
        const pm = new PageManager(page);
        // page.goto('/');
        // // await page.waitForTimeout(5000);
        await page.waitForLoadState('networkidle');

        await use(pm);
    }
});

export const expect = playwrightExpect;
