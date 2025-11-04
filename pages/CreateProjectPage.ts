import { Page, expect } from '@playwright/test';

export class CreateProjectPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async clickOnProjectLink() {
        await this.page.getByRole('link', { name: 'Project' }).click();
    }

    async getHeaderText() {
        return this.page.locator('h1').textContent();
    }

    async clickOnSettingsTab() {
        await this.page.getByRole('button', { name: 'Settings' }).click();
    }

    async clickOnMembersTab() {
        await this.page.getByRole('button', { name: 'Members' }).click();
    }

    async clickOnInformationTab() {
        await this.page.getByRole('button', { name: 'Information' }).click();
    }

    async enterProjectTitle(projectTitle: string) {
        await this.page.getByTestId('title-input').fill(projectTitle);
    }

    async enterProjectDescription(projectDescription: string) {
        await this.page.getByRole('textbox', { name: 'Description' }).fill(projectDescription);
    }

    async clickOnUploadButton() {
        await this.page.getByRole('button', { name: 'Upload' }).click();
    }

    async uploadFile(filePath: string) {
        const fileChooserPromise = this.page.waitForEvent('filechooser');
        await this.clickOnUploadButton();
        const fileChooser = await fileChooserPromise;
        await fileChooser.setFiles(filePath);
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

    async checkIfNextButtonIsEnabled() {
        return await this.page.getByRole('button', { name: 'Next' }).isEnabled();
    }

    async checkIfNextButtonIsDisabled() {
        return await this.page.getByRole('button', { name: 'Next' }).isDisabled();
    }

    async clickOnNextButton() {
        return await this.page.getByRole('button', { name: 'Next' }).click();
    }

    async selectCoordinateSystem(coordinateSystem: string) {
        await this.selectDropdownOption('Coordinate System', coordinateSystem, 0);
    }

    async selectUnitSystem(unitSystem: string) {
        await this.selectDropdownOption('Unit System', unitSystem, 1);
    }

    async selectRole(role: string) {
        await this.selectDropdownOption('Collaborator Role', role, 0);
    }

    async enterEmailAddress(emailAddress: string) {
        await this.page.getByPlaceholder('Email').fill(emailAddress);
    }

    async checkIfAddButtonIsEnabled() {
        return await this.page.getByRole('button', { name: 'Add' }).isEnabled();
    }

    async checkIfAddButtonIsDisabled() {
        return await this.page.getByRole('button', { name: 'Add' }).isDisabled();
    }

    async clickOnAddButton() {
        await this.page.getByRole('button', { name: 'Add' }).click();
    }

    async checkIfCreateProjectButtonIsEnabled() {
        return await this.page.getByRole('button', { name: 'Create Project' }).isEnabled();
    }

    async checkIfCreateProjectButtonIsDisabled() {
        return await this.page.getByRole('button', { name: 'Create Project' }).isDisabled();
    }

    async clickOnCreateProjectButton() {
        await this.page.getByRole('button', { name: 'Create Project' }).click();
    }

    async clickOnSkipAndCreateProjectButton() {
        await this.page.getByRole('button', { name: 'Skip and Create Project' }).click();
    }


    private async selectDropdownOption(dropdownName: string, optionValue: string, dropdownIndex: number) {
        console.log(`Selecting ${dropdownName.toLowerCase()}: ${optionValue}`);
        const dropdown = this.page.locator('button[data-testid="dropdown-mainbutton"]').nth(dropdownIndex);
        await dropdown.click();
        await this.page.locator(`text=${optionValue.trim()}`).first().click();
        await expect(dropdown).toHaveText(optionValue);
    }


}
