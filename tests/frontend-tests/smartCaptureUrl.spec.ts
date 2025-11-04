import { test, expect } from '../../test-options';
import { PageManager } from '../../pages/PageManager';
import { BrowserContext, Page } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });
test.describe('Smart Capture Url', () => {
    const ddmEmail: string = process.env.EMAIL || '';
    const password: string = process.env.PASSWORD || '';
    const v2bEmail: string = process.env.V2B_EMAIL || '';
    const v2bPassword: string = process.env.V2B_PASSWORD || '';

    let pm: PageManager;
    let page: Page;
    let context: BrowserContext;

    test.beforeEach(async ({ browser }) => {
        context = await browser.newContext();
        page = await context.newPage();
        pm = new PageManager(page);

    });
    // test.afterEach(async () => {
    //     await context.close();
    // });

    const sideBarMenuItems = ['[data-testid="project-sidebar-menu-item-Mission Sites"]', '[data-testid="project-sidebar-menu-item-Photo Requests"]',
        '[data-testid="project-sidebar-menu-item-Support"]'];

    const loginAndAssertSmartCaptureUrlAndPageElements = async (email: string, password: string) => {
        await pm.getPage.goto('/smart-capture');
        const userProfileButton = pm.getPage.locator('[data-testid="user-profile-button"]');
        await expect(userProfileButton).toBeVisible();
        await userProfileButton.getByText('Sign in').click();
        await expect(pm.getPage).toHaveURL('/login');
        await pm.onLoginPage.login(email, password);
        await expect(pm.getPage).toHaveURL('/smart-capture');
        await expect(pm.getPage.locator('h1')).toHaveText('Mission Sites');

        for (const menuItem of sideBarMenuItems) {
            await expect(pm.getPage.locator(menuItem)).toBeVisible();
        }

        await userProfileButton.click();
        await expect(pm.getPage).toHaveURL(/.*mypage*/);

        for (const menuItem of sideBarMenuItems) {
            await expect(pm.getPage.locator(menuItem)).toBeVisible();
        }
    };
    const openNewTabAndAssertSmartCaptureUrlAndPageElements = async (path: string = '/') => {
        const newTab = await context.newPage();
        const newTabPm = new PageManager(newTab);
        await newTabPm.getPage.goto(path);
        await expect(newTabPm.getPage).toHaveURL('/smart-capture');
        await expect(newTabPm.getPage.locator('h1')).toHaveText('Mission Sites');

        for (const menuItem of sideBarMenuItems) {
            await expect(pm.getPage.locator(menuItem)).toBeVisible();
        }
    };

    test('Should navigate to smart capture url when logged in as v2b user and navigate to base url in new tab', async ({ }) => {
        await loginAndAssertSmartCaptureUrlAndPageElements(v2bEmail, v2bPassword);
        await openNewTabAndAssertSmartCaptureUrlAndPageElements();
    });

    test('Should navigate to smart capture url when logged in as v2b user and navigate to invalid path in new tab', async ({ }) => {
        await loginAndAssertSmartCaptureUrlAndPageElements(v2bEmail, v2bPassword);
        await openNewTabAndAssertSmartCaptureUrlAndPageElements('/invalid-path/invalid-path/invalid-path');
    });

    test('Should navigate to smart capture url when logged in as ddm user and navigate to base url in new tab', async ({ }) => {
        await loginAndAssertSmartCaptureUrlAndPageElements(ddmEmail, password);
        await openNewTabAndAssertSmartCaptureUrlAndPageElements();
    });

    test('Should display ddm dashboard when user logout from smart capture url and login again', async ({ }) => {
        await loginAndAssertSmartCaptureUrlAndPageElements(ddmEmail, password);
        const userProfileButton = pm.getPage.locator('[data-testid="user-profile-button"]');
        await userProfileButton.click();
        await pm.getPage.locator('[data-testid="my-page-account-session-sign-out"]').click();
        await expect(pm.getPage).toHaveURL('/login');
        await pm.onLoginPage.login(ddmEmail, password);
        await expect(pm.getPage).toHaveURL(/.*dashboard/);

        // await openNewTabAndAssertSmartCaptureUrlAndPageElements();
    });

    test('Should navigate to smart capture url when logged in as ddm user and navigate to invalid path in new tab', async ({ }) => {
        await loginAndAssertSmartCaptureUrlAndPageElements(ddmEmail, password);
        await openNewTabAndAssertSmartCaptureUrlAndPageElements('/invalid-path/invalid-path/invalid-path');
    });
});
