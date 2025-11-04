import { Page, expect } from '@playwright/test';

export class ProjectPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
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

    async isAddProjectButtonVisible() {
        const addProjectButton = this.page.getByRole('button', { name: 'New Project' });
        const isVisible = await addProjectButton.isVisible();
        return isVisible;
    }

    async clickOnDashboardMenu() {
        await this.page.locator('p', { hasText: 'Menu' }).locator('..').getByText('Dashboard').click();
    }

    async clickOnThreeDotsMenuOfProject(projectId: string = process.env.PROJECT_ID || '1554') {
        const project = this.page.getByTestId(`project-list-card-${projectId}`);
        await project.scrollIntoViewIfNeeded();
        await project.locator('button svg').click();
    }

    async clickOnProjectSettings() {
        await this.page.getByRole('button', { name: 'Project Setting' }).last().click();
    }

    async clickOnAddButton() {
        await this.page.getByRole('button', { name: 'Add' }).last().click();
    }

    async validatePopUpIsVisible() {
        const popUp = this.page.getByTestId('popup');
        const isVisible = await popUp.isVisible();
        expect(isVisible).toBe(true);
    }

    // ! This is not working as expected as the button is disabled but the test is failing
    async validateInviteButtonIsDisabled() {
        const inviteButton = this.page.getByTestId('popup').locator('button').nth(1);
        const isDisabled = await inviteButton.isDisabled();
        expect(isDisabled).toBe(true);
    }

    async enterEmailOfNewTeamMember(email: string) {
        await this.page.getByRole('textbox', { name: 'Email' }).fill(email);
    }


    async clickOnInviteButton() {
        await this.page.getByTestId('popup').locator('button').nth(1).click();
    }

    async getHeaderText() {
        return this.page.locator('h1').textContent();
    }

    async clickOnNewProjectButton() {
        await this.page.getByRole('button', { name: 'New Project' }).click();
    }

    async clickOnShareTab() {
        await this.page.getByRole('button', { name: 'Share' }).click();
    }


    async getHeaderOfPopup() {
        return await this.page.getByTestId('popup-title').textContent();
    }

    async getMessageOfPopup(text: string) {
        return await this.page.getByTestId('popup').locator(`div:has-text("${text}")`).textContent();
    }

    async checkIfApplyButtonIsEnabled() {
        return await this.page.getByRole('button', { name: 'Apply' }).isEnabled();
    }

    async checkIfApplyButtonIsDisabled() {
        return await this.page.getByRole('button', { name: 'Apply' }).isDisabled();
    }

    async clickOnApplyButton(applyButtonText: string = 'Apply') {
        return await this.page.getByRole('button', { name: applyButtonText }).click();
    }

    async clickOnCancelButton() {
        return await this.page.getByRole('button', { name: 'Cancel' }).click();
    }

    async clickOnPopUpCloseButton() {
        return await this.page.getByTestId('popup').locator('header div svg').click();
    }
}
