import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class OrganizationProjectPage extends BasePage {


    constructor(page: Page) {
        super(page);

    }

    async openProject(projectTitle: string) {
        await this.page.locator('h3', { hasText: projectTitle }).click();
    }

    async verifyLoadingBehavior() {
        const loading = this.page.getByTestId('loading-wrapper');
        const isVisible = await loading.isVisible({ timeout: 300 });
        expect(isVisible).toBe(true);
        await expect(loading).toBeHidden({ timeout: 10000 });
    }

    async getOrganizationProjectCount() {
        await this.page.waitForLoadState('networkidle');
        return await this.getProjectCount();
    }
}
