import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async openLoginPage() {
        await this.page.goto('/');
    }

    async openLoginPageAndWaitForPageToLoad() {
        await this.page.goto('/');
        await this.page.locator('[data-testid="modal-background"]').waitFor({
            state: 'visible', timeout: 10000
        });
    }

    async enterEmail(email: string) {
        await this.page.locator('#sign-in-field-email').fill(email);
    }

    async enterPassword(password: string) {
        await this.page.locator('#sign-in-field-password').fill(password);
    }

    async checkRememberMe() {
        await this.page.locator('span:has-text("Remember me")').click();
    }

    async clickSignIn() {
        // await this.page.getByRole('button', { name: 'Sign in' }).click();//For legacy
        await this.page.getByRole('button', { name: 'Continue with email' }).click();
    }

    async clickContinueWithEmail() {
        await expect(this.page.locator('#sign-in-field-email')).toBeEnabled();
        await this.page.getByRole('button', { name: 'Continue with email' }).click();
    }

    async validateForgetPasswordIsDisplayed() {
        await this.page.getByRole('link', { name: 'Forgot password?' }).isVisible();
    }

    async clickOnForgetPassword() {
        await this.page.getByRole('link', { name: 'Forgot password?' }).click();
    }

    async login(email: string, password: string) {
        await this.enterEmail(email);
        await this.enterPassword(password);
        await this.checkRememberMe();
        await this.clickContinueWithEmail();
    }

    async validateContinueWithMicrosoftIsDisplayed() {
        await this.page.getByRole('button', { name: 'Continue with Microsoft' }).isVisible();
    }

    async loginWithSaml(organizationSlug: string) {
        await this.page.locator('#saml-sign-in-field-text').fill(organizationSlug);
        await this.page.getByRole('button', { name: 'Continue with SAML SSO' }).click();
    }

    async verifyEmailError(expectedMessage: string) {
        const emailErrorMessage = this.page.locator('[data-testid="sign-up-input-field-error"]').first();
        await expect(emailErrorMessage).toHaveText(expectedMessage);
        console.log(`✅ Email validation error displayed: "${expectedMessage}"`);
    }

    async verifyEmailErrorIsDisplayed() {
        const emailErrorMessage = this.page.locator('[data-testid="sign-up-input-field-error"]').first();
        await emailErrorMessage.isVisible();
    }

    async verifyPasswordError(expectedMessage: string) {
        const emailPasswordMessage = this.page.locator('[data-testid="sign-up-input-field-error"]').last();
        await expect(emailPasswordMessage).toHaveText(expectedMessage);
        console.log(`✅ Password validation error displayed: "${expectedMessage}"`);
    }

    async verifyLoginPasswordError(expectedMessage: string) {
        const emailPasswordMessage = this.page.locator('[data-testid="signin-error-message"]').last();
        await expect(emailPasswordMessage).toHaveText(expectedMessage);
        console.log(`✅ Password validation error displayed: "${expectedMessage}"`);
    }


    async verifyPasswordErrorIsDisplayed() {
        const emailErrorMessage = this.page.locator('[data-testid="sign-up-input-field-error"]').last();
        await emailErrorMessage.isVisible();
    }


    async goToSignupPage() {
        await this.page.locator('a[href="/signup"]').click();
        await expect(this.page).toHaveURL('/signup');
    }

    async goToForgetPasswordPage() {
        await this.page.locator('a[href="/password"]').click();
        await expect(this.page).toHaveURL('/password');
    }
}
