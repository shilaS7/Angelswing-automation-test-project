import { BrowserContext, Page } from '@playwright/test';
import { HelperBase } from '../../pages/HelperBase';
import { PageManager } from '../../pages/PageManager';
import { test, expect } from '../../test-options';

test.describe('Pages Navigation Test', () => {

    let pm: PageManager;
    let helper: HelperBase;
    let context: BrowserContext;
    let page: Page;


    test.beforeAll(async ({ browser }, testInfo) => {
        context = await browser.newContext();
        page = await context.newPage();
        pm = new PageManager(page);
        helper = new HelperBase(pm.getPage);
        await pm.onLoginPage.openLoginPageAndWaitForPageToLoad();
        await helper.closeReadUserGuidePopUp(pm, testInfo);
        await pm.onDashboardPage.openProject();
        await pm.onDashboardPage.verifyLoadingBehavior();

    });



    test('should navigate to different pages and validate the url @smoke', async ({ }) => {
        const onProjectSidebarPagePage = pm.onProjectSidebarPage;

        await onProjectSidebarPagePage.clickOnCadOverlay();
        await expect(pm.getPage).toHaveURL(/.*overlay*/);

        await onProjectSidebarPagePage.clickOnMeasurement();
        await expect(pm.getPage).toHaveURL(/.*measurement*/);

        await onProjectSidebarPagePage.clickOnMap();
        await expect(pm.getPage).toHaveURL(/.*map*/);

        await onProjectSidebarPagePage.clickOnIssue();
        await expect(pm.getPage).toHaveURL(/.*issue*/);

        await onProjectSidebarPagePage.clickOnPhotoAlbum();
        await expect(pm.getPage).toHaveURL(/.*photo*/);

        await onProjectSidebarPagePage.clickOnSiteLogistics();
        await expect(pm.getPage).toHaveURL(/.*safety*/);

        await onProjectSidebarPagePage.clickOnViewPoint();
        await expect(pm.getPage).toHaveURL(/.*viewpoint-capture*/);

        // await onProjectSidebarPagePage.workspacePage();
        // await expect(pm.getPage).toHaveURL(/.*project*/);
    });

    test('should navigate to different pages and sidebar expand and collapse behavior', async ({ }) => {
        const onProjectSidebarPagePage = pm.onProjectSidebarPage;
        const sidebarPage = pm.onProjectSidebarPage;

        await onProjectSidebarPagePage.clickOnCadOverlay();
        await expect(pm.getPage).toHaveURL(/.*overlay*/);
        await sidebarPage.collapseSidebar();
        await sidebarPage.expandSidebar();

        await onProjectSidebarPagePage.clickOnMeasurement();
        await expect(pm.getPage).toHaveURL(/.*measurement*/);
        await sidebarPage.collapseSidebar();
        await sidebarPage.expandSidebar();

        await onProjectSidebarPagePage.clickOnMap();
        await expect(pm.getPage).toHaveURL(/.*map*/);
        await sidebarPage.collapseSidebar();
        await sidebarPage.expandSidebar();

        await onProjectSidebarPagePage.clickOnIssue();
        await expect(pm.getPage).toHaveURL(/.*issue*/);
        await sidebarPage.collapseSidebar();
        await sidebarPage.expandSidebar();

        await onProjectSidebarPagePage.clickOnPhotoAlbum();
        await expect(pm.getPage).toHaveURL(/.*photo*/);
        await sidebarPage.collapseSidebar();
        await sidebarPage.expandSidebar();

        await onProjectSidebarPagePage.clickOnSiteLogistics();
        await expect(pm.getPage).toHaveURL(/.*safety*/);
        await sidebarPage.collapseSidebar();
        await sidebarPage.expandSidebar();

        await onProjectSidebarPagePage.clickOnViewPoint();
        await expect(pm.getPage).toHaveURL(/.*viewpoint-capture*/);

    });


});
