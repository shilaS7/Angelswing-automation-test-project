import { HelperBase } from '../../../pages/HelperBase';
import { PageManager } from '../../../pages/PageManager';
import { test, expect } from '../../../test-options';

test.describe('2D Orthomosaic test @smoke', () => {
    let pm: PageManager;
    let helper: HelperBase;

    const email: string = process.env.EMAIL || '';
    const password: string = process.env.PASSWORD || '';
    test.beforeEach(async ({ page }, testInfo) => {
        pm = new PageManager(page);
        helper = new HelperBase(pm.getPage);
        await pm.onLoginPage.openLoginPageAndWaitForPageToLoad();
        await helper.closeReadUserGuidePopUp(pm, testInfo);

    });

    test('Should verify 2D Orthomosaic is selected by default when user click on single project', async ({ }, testInfo) => {
        await pm.onDashboardPage.openProject();
        await helper.collapseSidebarAndVerifyMapIsVisible(pm, testInfo);
        await helper.waitForNumberOfSeconds(1);
        const isSelected = await pm.onMapPage.get2DOrthomosaicIsSelectionState();
        expect(isSelected).not.toBeNull();
        expect(isSelected).toEqual('checked');
    });

    test('Should verify 2D Orthomosaic is selected by default when user navigate from one project to another', async ({ }, testInfo) => {
        await pm.onDashboardPage.openProject();
        await helper.collapseSidebarAndVerifyMapIsVisible(pm, testInfo);
        await helper.waitForNumberOfSeconds(1);
        const isSelected = await pm.onMapPage.get2DOrthomosaicIsSelectionState();
        expect(isSelected).not.toBeNull();
        expect(isSelected).toEqual('checked');

        const projectIds = ['1581', '1584', '1554'];
        for (const projectId of projectIds) {
            await pm.onProjectSidebarPage.workspacePage();
            await helper.closeReadUserGuidePopUp(pm, testInfo);
            await pm.onDashboardPage.openProject(projectId);
            await helper.collapseSidebarAndVerifyMapIsVisible(pm, testInfo);
            await helper.waitForNumberOfSeconds(1);
            const isSelected = await pm.onMapPage.get2DOrthomosaicIsSelectionState();
            expect(isSelected).not.toBeNull();
            expect(isSelected).toEqual('checked');
        }

    });

    test('Should verify 2D Orthomosaic is selected by default when user performs logout and login multiple times', async ({ }, testInfo) => {
        await pm.onDashboardPage.openProject();
        await helper.collapseSidebarAndVerifyMapIsVisible(pm, testInfo);
        await helper.waitForNumberOfSeconds(1);
        const isSelected = await pm.onMapPage.get2DOrthomosaicIsSelectionState();
        expect(isSelected).not.toBeNull();
        expect(isSelected).toEqual('checked');
        await pm.onProjectSidebarPage.workspacePage();
        await pm.onDashboardPage.clickOnSignOutButton();

        for (let i = 0; i < 3; i++) {
            console.info(`Login attempt ${i + 1}`);
            await pm.onLoginPage.login(email, password);
            await helper.closeReadUserGuidePopUp(pm, testInfo);
            await pm.onDashboardPage.openProject();
            await helper.collapseSidebarAndVerifyMapIsVisible(pm, testInfo);
            await helper.waitForNumberOfSeconds(1);
            const isSelected2 = await pm.onMapPage.get2DOrthomosaicIsSelectionState();
            expect(isSelected2).not.toBeNull();
            expect(isSelected2).toEqual('checked');
            await pm.onProjectSidebarPage.workspacePage();
            await pm.onDashboardPage.clickOnSignOutButton();
        }

    });
});
