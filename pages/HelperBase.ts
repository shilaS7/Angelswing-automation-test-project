import { Page } from '@playwright/test';
import { PageManager } from './PageManager';
import { TestInfo } from '@playwright/test';

export class HelperBase {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async waitForNumberOfSeconds(timeInSeconds: number) {
        await this.page.waitForTimeout(timeInSeconds * 1000);
    }

    async closeReadUserGuidePopUp(pm: PageManager, testInfo?: TestInfo) {
        await pm.onDashboardPage.closeReadUserGuidePopUp();
    };

    async collapseSidebarAndVerifyMapIsVisible(pm: PageManager, testInfo: TestInfo) {
        if (await this.isSmartDevice(testInfo)) {
            await pm.onProjectSidebarPage.collapseSidebar();
        }
        await pm.onMapPage.verifyMapIsVisible();

        if (await this.isSmartDevice(testInfo)) {
            await pm.onProjectSidebarPage.expandSidebar();
        }
    };

    async isSmartDevice(testInfo: TestInfo) {
        return testInfo.project.name.toLowerCase().includes('smartdevice');
    }

    async isDesktop(testInfo: TestInfo) {
        return testInfo.project.name.toLowerCase().includes('desktop');
    }

    async waitForPageToLoad() {
        await this.page.locator('[data-testid="modal-background"]').waitFor({
            state: 'visible', timeout: 10000
        });
    }

}
