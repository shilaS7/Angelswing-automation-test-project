import { test, expect } from '../../test-options';
import { PageManager } from '../../pages/PageManager';
import { HelperBase } from '../../pages/HelperBase';
import { BrowserContext, Page } from '@playwright/test';
import { UI_META } from '../../utils/uiMeta';

test.describe('Dashboard Functionality', () => {
    let pm: PageManager;
    let page: Page;
    let context: BrowserContext;
    let helper: HelperBase;

    test.beforeAll(async ({ browser }, testInfo) => {
        context = await browser.newContext();
        page = await context.newPage();
        pm = new PageManager(page);
        helper = new HelperBase(page);
        await pm.onLoginPage.openLoginPageAndWaitForPageToLoad();
        await helper.closeReadUserGuidePopUp(pm, testInfo);
    });

    test.afterAll(async () => {
        await context.close();
    });

    test.beforeEach(async ({ }, testInfo) => {
        if (await helper.isSmartDevice(testInfo)) {
            await pm.onDashboardPage.collapseSidebar();
        }
    });

    test.afterEach(async ({ }, testInfo) => {
        const shouldSkip =
            testInfo.title.includes('[skip-after-each]');
        if (shouldSkip) {
            console.log(`Skipping afterEach for: ${testInfo.title} in project: ${testInfo.project.name}`);
            return;
        }

        if (await helper.isSmartDevice(testInfo)) {
            await pm.onDashboardPage.expandSidebar();
            await pm.onProjectPage.clickOnDashboardMenu();
        }
    });

    test('Should display first name of the user on the header of the page', async ({ }) => {
        await pm.onDashboardPage.validateHeaderText(`Hello, ${process.env.USER_FIRST_NAME || 'Suraj'}`);
    });

    test('Should open release notes in new tab and validate the URL and content @smoke', async ({ }) => {
        await pm.onDashboardPage.clickLinkAndValidateHeaderOfLinkOnNewTab(
            () => pm.onDashboardPage.clickOnReleaseNotes(),
            UI_META.releaseNotes.url,
            UI_META.releaseNotes.header
        );
    });

    test('Should open user guide in new tab and validate the URL and content @smoke', async ({ }) => {
        await pm.onDashboardPage.clickLinkAndValidateHeaderOfLinkOnNewTab(
            () => pm.onDashboardPage.clickOnUserGuide(),
            UI_META.userGuide.url,
            UI_META.userGuide.header
        );
    });

    test('Should open official website in new tab and validate the URL and content @smoke', async ({ }) => {
        await pm.onDashboardPage.clickLinkAndValidateHeaderOfLinkOnNewTab(
            () => pm.onDashboardPage.clickOnOfficialWebsite(),
            UI_META.officialWebsite.url,
            UI_META.officialWebsite.header
        );
    });

    test('Should open support in new tab and validate the URL and content @smoke', async ({ }, testInfo) => {
        if (await helper.isSmartDevice(testInfo)) {
            await pm.onDashboardPage.expandSidebar();
        }
        await pm.onDashboardPage.clickLinkAndValidateHeaderOfLinkOnNewTab(
            () => pm.onDashboardPage.clickOnSupport(),
            UI_META.support.url,
            UI_META.support.header
        );
        if (await helper.isSmartDevice(testInfo)) {
            await pm.onDashboardPage.collapseSidebar();
        }
    });

    test('Should validate release note, user guide, official website after collapsing the sidebar', async ({ }, testInfo) => {
        if (await helper.isDesktop(testInfo)) {
            await pm.onDashboardPage.collapseSidebar();
        }

        await pm.onDashboardPage.scrollRecentProjectsSectionHorizontally();

        await pm.onDashboardPage.clickLinkAndValidateHeaderOfLinkOnNewTab(
            () => pm.onDashboardPage.clickOnReleaseNotes(),
            UI_META.releaseNotes.url,
            UI_META.releaseNotes.header
        );
        await pm.onDashboardPage.clickLinkAndValidateHeaderOfLinkOnNewTab(
            () => pm.onDashboardPage.clickOnUserGuide(),
            UI_META.userGuide.url,
            UI_META.userGuide.header);

        if (await helper.isDesktop(testInfo)) {
            await pm.onDashboardPage.expandSidebar();
        }
    });

    test('Should open the project by clicking on the project name', async () => {
        await pm.onDashboardPage.openProject();
        await pm.onDashboardPage.validateURL(UI_META.projectWorkspace.url);
        await pm.onProjectSidebarPage.clickOnWorkspace();
    });

    test('Should open the setting of the project by clicking on three dot menu', async () => {
        await pm.onProjectPage.clickOnThreeDotsMenuOfProject();
        await pm.onProjectPage.clickOnProjectSettings();
        await expect(pm.getPage).toHaveURL(UI_META.projectSettings.url);
        await pm.onCreateProjectPage.clickOnProjectLink();
    });

    test('Should scroll recent projects section horizontally/vertically', async ({ }) => {
        console.info('Scrolling recent projects section horizontally');
        await pm.onDashboardPage.scrollRecentProjectsSectionHorizontally();
    });

    test('Should navigate to the project page', async ({ }, testInfo) => {
        if (await helper.isSmartDevice(testInfo)) {
            await pm.onDashboardPage.expandSidebar();
        }
        await pm.onDashboardPage.clickOnProjectMenu();
        await pm.onDashboardPage.validateURL(UI_META.projectList.url);
        if (await helper.isSmartDevice(testInfo)) {
            await pm.onDashboardPage.collapseSidebar();
        }
    });

    test('Should navigate to the user page', async ({ }, testInfo) => {
        if (await helper.isSmartDevice(testInfo)) {
            await pm.onDashboardPage.expandSidebar();
        }
        await pm.onDashboardPage.clickOnUserName();
        await pm.onDashboardPage.validateURL(UI_META.userPage.url);
        if (await helper.isSmartDevice(testInfo)) {
            await pm.onDashboardPage.collapseSidebar();
        }
    });

    test('Should collapse and expand the sidebar', async ({ }) => {
        await pm.onDashboardPage.expandSidebar();
        await pm.getPage.waitForTimeout(2000);
        await pm.onDashboardPage.collapseSidebar();

    });

    test('Should sign out from the application [skip-after-each]', async ({ }, testInfo) => {
        if (await helper.isSmartDevice(testInfo)) {
            await pm.onDashboardPage.expandSidebar();
        }
        await pm.onProjectPage.clickOnDashboardMenu();
        await pm.onDashboardPage.clickOnSignOutButton();
        await pm.onDashboardPage.validateURL(UI_META.loginPage.url);

    });
});
