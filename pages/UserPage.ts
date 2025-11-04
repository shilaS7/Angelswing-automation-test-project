import { Page, Locator, expect } from '@playwright/test';

export class UserPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async getHeaderText() {
        return await this.page.locator('h1').textContent();
    }

    async getEmailValue() {
        return await this.page.locator('div:text-is("Email") + div').textContent();
    }

    async getFullNameValue() {
        return await this.page.locator('div:text-is("Name") + div').textContent();
    }

    async getPhoneNumberValue() {
        return await this.page.locator('div:text-is("Phone Number") + div').textContent();
    }

    async getOrganizationValue() {
        return await this.page.locator('div:text-is("Organization") + div').textContent();
    }

    async getPurposeValue() {
        const purpose = await this.page.locator('div:text-is("Purpose") + div').textContent();
        return purpose?.trim() || '';
    }

    async getUserTypeValue(name: string) {
        const userType = await this.page.locator(`div:text-is("${name}") + div`).textContent();
        return userType?.trim() || '';
    }

    async isSignOutButtonVisible() {
        return await this.page.locator('div:text-is("Sign out")').isVisible();
    }

    async clickOnSecurityTab() {
        await this.page.getByRole('button', { name: 'Security' }).click();
    }

    async clickOnBillingTab() {
        await this.page.getByRole('button', { name: 'Billing' }).click();
    }

    async clickOnSettingsTab() {
        await this.page.getByRole('button', { name: 'Settings' }).click();
    }

    async getCountryValue() {
        return await this.page.locator('div:text-is("Country") + div').textContent();
    }

    async getLanguageValue(language: string = 'Language') {
        return await this.page.locator(`div:text-is("${language}") + div`).textContent();
    }

    async clickOnProfileImage() {
        return await this.page.getByTestId('my-page-account-profile-title').locator('..').locator('button svg').click();
    }

    async clickOnName() {
        return await this.page.locator('div:text-is("Name") + div').click();
    }

    async clickOnPhoneNumber() {
        return await this.page.locator('div:text-is("Phone Number") + div').click();
    }

    async clickOnOrganization() {
        return await this.page.locator('div:text-is("Organization") + div').click();
    }

    async clickOnPurpose() {
        return await this.page.locator('div:text-is("Purpose") + div').click();
    }

    async clickOnSignOut() {
        return await this.page.locator('div:text-is("Sign out")').click();
    }

    async clickOnPassword() {
        return await this.page.locator('div:text-is("Password")').click();
    }
    async clickOnLanguage(language: string = 'Language') {
        return await this.page.locator(`div:text-is("${language}") + div`).click();
    }

    async clickOnCountry() {
        return await this.page.locator('div:text-is("Country") + div').click();
    }


    async clickOnChangePlan() {
        return await this.page.locator('div:text-is("Change Plan")').click();
    }

    async clickOnDeleteAccount() {
        return await this.page.locator('div:text-is("Delete Account")').click();
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
        await this.page.getByRole('button', { name: applyButtonText }).click();
        await this.page.waitForTimeout(1000);
    }

    async clickOnCancelButton() {
        return await this.page.getByRole('button', { name: 'Cancel' }).click();
    }

    async clickOnPopUpCloseButton() {
        return await this.page.getByTestId('popup').locator('header div svg').click();
    }

    async clickOnUploadButton() {
        return await this.page.getByRole('button', { name: 'Upload' }).click();
    }

    async clickOnResetToDefaultButton() {
        return await this.page.getByRole('button', { name: 'Reset to Default' }).click();
    }

    async isImageUploaded() {
        return await this.page.getByTestId('change-profile-image').locator('img').isVisible();
    }

    async isImageResetToDefault() {
        return await this.page.getByTestId('change-profile-image').locator('img').isHidden();
    }

    async isImageDisplayedOnProfilePage() {
        return await this.page.getByTestId('my-page-account-profile-title-container').locator('img').isVisible();
    }

    async enterFirstName(firstName: string) {
        const firstNameInput = this.page.getByRole('textbox', { name: 'First Name' });
        await firstNameInput.clear();
        await firstNameInput.pressSequentially(firstName);

    }

    async enterLastName(lastName: string) {
        const lastNameInput = this.page.getByRole('textbox', { name: 'Last Name' });
        await lastNameInput.clear();
        await lastNameInput.pressSequentially(lastName);
    }


    async getFirstNameErrorMessage() {
        return await this.page.getByRole('textbox', { name: 'First Name' }).locator('..').locator('span').textContent();
    }

    async getLastNameErrorMessage() {
        return await this.page.getByRole('textbox', { name: 'Last Name' }).locator('..').locator('span').textContent();
    }

    async enterPhoneNumber(phoneNumber: string) {
        await this.page.getByRole('textbox', { name: 'Phone Number' }).fill(phoneNumber);
    }

    async enterOrganization(organization: string) {
        await this.page.getByRole('textbox', { name: 'Organization' }).fill(organization);
    }

    async enterCurrentPassword(currentPassword: string) {
        await this.page.getByRole('textbox', { name: 'Current Password' }).fill(currentPassword);
    }

    async enterNewPassword(newPassword: string) {
        await this.page.getByRole('textbox', { name: 'New Password' }).fill(newPassword);
    }

    async enterConfirmPassword(confirmPassword: string) {
        await this.page.getByRole('textbox', { name: 'Re-enter your Password' }).fill(confirmPassword);
    }


    async verifyPasswordError(expectedMessage: string) {
        const passwordErrorMessage = this.page.locator('[placeholder="Enter new password"] + div').first();
        await expect(passwordErrorMessage).toHaveText(expectedMessage);
        console.log(`Password validation error displayed: "${expectedMessage}"`);
    }

    async verifyPasswordMismatchError(expectedMessage: string) {
        const passwordErrorMessage = this.page.locator('[placeholder="Re-enter your password"] + div').first();
        await expect(passwordErrorMessage).toHaveText(expectedMessage);
        console.log(`Password validation error displayed: "${expectedMessage}"`);
    }

    async selectCountry(country: any) {
        console.log(`Selecting country: ${country}`);
        const countryDropdown = this.page.locator('button[data-testid="dropdown-mainbutton"]').nth(0);
        await countryDropdown.click();
        await this.page.locator(`text=${country.trim()}`).first().click();
        await expect(countryDropdown).toHaveText(country);
    }

    async selectPurpose(purpose: string,) {
        console.log(`Selecting purpose: ${purpose}`);
        const purposeDropdown = this.page.locator('button[data-testid="dropdown-mainbutton"]');
        await purposeDropdown.click();
        await this.page.locator(`text=${purpose}`).last().click();
        await expect(purposeDropdown).toHaveText(purpose);
    }

    async selectLanguage(language: string) {
        console.log(`Selecting language: ${language}`);
        const languageDropdown = this.page.locator('button[data-testid="dropdown-mainbutton"]').last();
        await languageDropdown.click();
        await this.page.locator(`text=${language}`).last().click();
        await expect(languageDropdown).toHaveText(language);
    }


    async checkIfPopupIsVisible() {
        return await this.page.getByTestId('popup-title').isVisible();
    }


}
