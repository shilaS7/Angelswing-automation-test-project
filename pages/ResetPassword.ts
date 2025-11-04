import { Page, Locator, expect } from '@playwright/test';

export class ResetPasswordPage {
    private page: Page;

    // Locators
    private backToSignInLink: Locator;
    private resetPasswordHeader: Locator;
    private resetPasswordInfoMessage: Locator;
    private passwordInput: Locator;
    private confirmPasswordInput: Locator;
    private firstPasswordGuidelines: Locator;
    private secondPasswordGuidelines: Locator;
    private submitButton: Locator;
    private errorMessage: Locator;
    private gotToHomepage: Locator;
    private goToLogin: Locator;
    private resetPasswordSuccessMessage: Locator;

    constructor(page: Page) {
        this.page = page;


        this.backToSignInLink = page.getByRole('link', { name: 'Back to Sign in' });
        this.resetPasswordHeader = page.locator('p').first();
        this.resetPasswordInfoMessage = page.locator('p:text("Please enter your new password")');

        this.resetPasswordSuccessMessage = page.locator('p').last();

        this.passwordInput = page.locator('input#reset-password-new');
        this.confirmPasswordInput = page.locator('input#reset-password-confirm');

        this.firstPasswordGuidelines = page.locator('p:has-text("* At least 6 characters")');
        this.secondPasswordGuidelines = page.locator('p:has-text("* Must include uppercase, lowercase and number")');


        this.submitButton = page.getByRole('button', { name: 'Submit' });

        this.errorMessage = page.locator('#reset-password-new + span');

        this.gotToHomepage = page.getByRole('button', { name: 'Go to Homepage' });
        this.goToLogin = page.getByRole('button', { name: 'Go to Login' });
    }

    async openResetPasswordPage() {
        await this.page.goto(`${process.env.RESET_PASSWORD_URL}`);
    }


    async clickBackToSignIn() {
        await this.backToSignInLink.click();
    }

    async clickHomePage() {
        await this.gotToHomepage.click();
    }

    async validatePageHeader(expectedText: string) {
        await expect(this.resetPasswordHeader).toHaveText(expectedText);
    }


    async validateResetPasswordInfo(expectedText: string) {
        await expect(this.resetPasswordInfoMessage).toHaveText(expectedText);
    }

    async validateResetPasswordSuccessMessage(expectedText: string) {
        await expect(this.resetPasswordSuccessMessage).toHaveText(expectedText);
    }

    async getPasswordGuidelines() {
        const firstGuideline = await this.firstPasswordGuidelines.textContent();
        const secondGuideline = await this.secondPasswordGuidelines.textContent();
        return [firstGuideline, secondGuideline];
    }


    async enterPassword(password: string) {
        await this.passwordInput.fill(password);
    }

    async enterConfirmPassword(confirmPassword: string) {
        await this.confirmPasswordInput.fill(confirmPassword);
    }

    async clickSubmit() {
        await this.submitButton.click();
    }

    async validateGoToLoginIsDisplayed() {
        await expect(this.goToLogin).toBeVisible();
    }

    async clickOnGoToLogin() {
        await this.goToLogin.click();
    }

    async validateUIElements() {
        await expect(this.backToSignInLink).toBeVisible();
        await expect(this.resetPasswordHeader).toBeVisible();
        await expect(this.resetPasswordInfoMessage).toBeVisible();
        await expect(this.passwordInput).toBeVisible();
        await expect(this.confirmPasswordInput).toBeVisible();
        await expect(this.submitButton).toBeVisible();
    }

    async verifyPasswordError(expectedMessage: string) {
        await expect(this.errorMessage).toHaveText(expectedMessage, { timeout: 5000 });
        console.log(`Password validation error displayed: "${expectedMessage}"`);
    }

    async verifyConfirmPasswordError(expectedMessage: string) {
        const confirmPasswordErrorMessage = this.page.locator('#reset-password-confirm + span').last();
        await expect(confirmPasswordErrorMessage).toHaveText(expectedMessage);
        console.log(`Confirm Password validation error displayed: "${expectedMessage}"`);
    }

    async getBrowserValidationMessage() {
        const validationMessage = await this.passwordInput.evaluate(
            (input: HTMLInputElement) => input.validationMessage
        );
        return validationMessage;
    }

    async checkSubmitButtonIsDisabled() {
        await expect(this.submitButton).toBeDisabled();
    }

    async checkSubmitButtonIsEnabled() {
        await expect(this.submitButton).toBeEnabled();
    }
}
