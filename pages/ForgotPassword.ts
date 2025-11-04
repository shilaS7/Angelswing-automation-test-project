import { Page, Locator, expect } from '@playwright/test';
export class ForgotPasswordPage {
    private page: Page;

    // Locators
    private backToSignInLink: Locator;
    private forgotPasswordHeader: Locator;
    private forgotPasswordInfo: Locator;
    private emailInput: Locator;
    private submitButton: Locator;
    private invalidEmailHeader: Locator;
    private unregisteredEmailMessage: Locator;
    private registeredEmailMessage: Locator;
    private goToHomepageButton: Locator;


    constructor(page: Page) {
        this.page = page;
        this.backToSignInLink = page.locator('a[href="/login"]');
        this.forgotPasswordHeader = page.locator('a + span');
        this.invalidEmailHeader = page.locator('p').first();
        this.unregisteredEmailMessage = page.locator('p').last();
        this.registeredEmailMessage = page.locator('p + div').last();
        this.forgotPasswordInfo = page.locator('p');
        this.emailInput = page.getByPlaceholder('Email');
        this.submitButton = page.getByRole('button', { name: 'Submit' });
        this.goToHomepageButton = page.getByRole('button', { name: 'Go to Homepage' });

    }



    async clickBackToSignIn() {
        await this.backToSignInLink.click();
    }

    async validateHeaderOfThePage(headerText: string) {
        await expect(this.forgotPasswordHeader).toHaveText(headerText);
    }

    async validateForgotPasswordMessage(message: string) {
        await expect(this.forgotPasswordInfo).toHaveText(message);
    }

    async enterEmail(email: string) {
        await this.emailInput.fill(email);
    }

    async clickSubmit() {
        await this.submitButton.click();
    }

    async validateSubmitButtonIsDisplayed() {
        await expect(this.submitButton).toBeVisible();
    }

    async validateSubmitButtonIsEnabled() {
        await expect(this.submitButton).toBeEnabled();
    }

    async validateSubmitButtonIsDisabled() {
        await expect(this.submitButton).toBeDisabled();
    }

    async validateUIElements() {
        await this.forgotPasswordHeader.isVisible();
        await this.forgotPasswordInfo.isVisible();
        await this.emailInput.isVisible();
        await this.submitButton.isVisible();
        await this.backToSignInLink.isVisible();
    }

    async verifyEmailError(expectedMessage: string) {
        const emailErrorMessage = this.page.locator('[data-testid="password-input-field-error"]').first();
        await expect(emailErrorMessage).toHaveText(expectedMessage);
        console.log(`✅ Email validation error displayed: "${expectedMessage}"`);
    }

    async getBrowserValidationMessage() {
        // Capture the browser validation message
        const validationMessage = await this.page.locator('#reset-password-email').evaluate(
            (input: HTMLInputElement) => input.validationMessage
        );
        // expect(validationMessage.length).toBeGreaterThan(0);
        return validationMessage;
    }


    async validateInvalidEmailUIElements() {
        await this.backToSignInLink.isVisible();
        await this.invalidEmailHeader.isVisible();
        expect(await this.registeredEmailMessage).toBeVisible();
        await this.unregisteredEmailMessage.isVisible();
        await this.goToHomepageButton.isVisible();
    }

    async validateValidEmailUIElements() {
        await this.backToSignInLink.isVisible();
        await this.invalidEmailHeader.isVisible();
        await this.registeredEmailMessage.isVisible();
        await this.unregisteredEmailMessage.isVisible();
        await this.goToHomepageButton.isVisible();
    }

    async validateInvalidEmailHeader(headerText: string) {
        await expect(this.invalidEmailHeader).toHaveText(headerText);
    }

    async validateUnregisteredEmailMessage(message: string) {
        await expect(this.unregisteredEmailMessage).toHaveText(message);
    }

    async validateRegisteredEmailMessage(email: string) {
        await expect(this.registeredEmailMessage).toHaveText(email);
    }

    async clickGoToHomepage() {
        await this.goToHomepageButton.click();
    }
}

