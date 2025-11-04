import { test } from '../../test-options';
import { BrowserContext, expect, Page } from '@playwright/test';
import { invalidPasswords, mismatchedPasswords, sqlInjectionPayloads } from '../../test-data/signup-test-data';
import { PageManager } from '../../pages/PageManager';
import MailosaurService from '../../services/mailosaur.request';
import { Message } from 'mailosaur/lib/models';
import { waitForEmailAndExtractLink } from '../../services/fetchEmail.requests';

test.use({ storageState: { cookies: [], origins: [] } });
test.describe('Reset Password Functionality', () => {
    let pageManager: PageManager;
    let context: BrowserContext;
    let page: Page;

    let expectedLoggedInUrl: string = '/project/dashboard';

    const validPassword: string = 'ValidPass@123';
    const resetPasswordEmail = process.env.RESET_PASSWORD_EMAIL || '';
    let resetPasswordLink: string;

    // async function verifyEmailAndGetResetPasswordLink(email: string) {
    //     await pageManager.getPage.waitForTimeout(5000);
    //     const mailosaurService = new MailosaurService(process.env.MAILOSAUR_API_KEY || '', process.env.MAILOSAUR_SERVER_ID || '');
    //     const message: Message = await mailosaurService.getEmail(email);
    //     await mailosaurService.validateSenderNameAndEmail(message, 'ANGELSWING', 'no-reply@angelswing.io');
    //     await mailosaurService.verifyEmailSubject(message, '[Angelswing] Reset your password');
    //     return await mailosaurService.extractResetPasswordLink(message);
    // }

    test.beforeAll(async ({ browser, request }) => {
        context = await browser.newContext();
        page = await context.newPage();
        pageManager = new PageManager(page);

        await pageManager.onLoginPage.openLoginPage();
        await pageManager.onLoginPage.goToForgetPasswordPage();
        await expect(pageManager.onLoginPage.page).toHaveURL('/password');
        await pageManager.onForgotPasswordPage.enterEmail(resetPasswordEmail);
        await pageManager.onForgotPasswordPage.clickSubmit();

        await pageManager.getPage.waitForTimeout(5000);
        resetPasswordLink = await waitForEmailAndExtractLink(request, resetPasswordEmail.split('@')[0], 'reset');
        console.log(`Reset Password Link: ${resetPasswordLink}`);
        await context.close();
    });

    //  Positive Test Cases
    test('User should be able to reset password with valid input and login with the new password @smoke', async () => {
        await pageManager.onResetPasswordPage.enterPassword(validPassword);
        await pageManager.onResetPasswordPage.enterConfirmPassword(validPassword);
        await pageManager.onResetPasswordPage.clickSubmit();
        await pageManager.onResetPasswordPage.validatePageHeader('Reset complete');
        await pageManager.onResetPasswordPage.validateResetPasswordSuccessMessage(`Your new password has been set.`);

        await pageManager.onResetPasswordPage.clickOnGoToLogin();
        await expect(pageManager.getPage).toHaveURL('/login');
        await pageManager.onLoginPage.login(resetPasswordEmail, validPassword);
        await expect(pageManager.getPage).toHaveURL(expectedLoggedInUrl);

    });

    test('User should be able to reset password with valid input and should not login with the existing password', async () => {
        const oldPassword = validPassword;
        const newPassword = 'NewSecurePassword123';
        await pageManager.onResetPasswordPage.enterPassword(newPassword);
        await pageManager.onResetPasswordPage.enterConfirmPassword(newPassword);
        await pageManager.onResetPasswordPage.clickSubmit();
        await pageManager.onResetPasswordPage.validatePageHeader('Reset complete');
        await pageManager.onResetPasswordPage.validateResetPasswordSuccessMessage(`Your new password has been set.`);

        await pageManager.onResetPasswordPage.clickOnGoToLogin();
        await expect(pageManager.getPage).toHaveURL('/login');
        await pageManager.onLoginPage.login(resetPasswordEmail, oldPassword);
        await pageManager.onLoginPage.verifyLoginPasswordError('* Invalid username or password, Try again or click Forgot password to reset it.');
        await expect(pageManager.getPage).not.toHaveURL(expectedLoggedInUrl);

    });

    test.beforeEach(async ({ page }) => {
        pageManager = new PageManager(page);
        await pageManager.getPage.goto(resetPasswordLink);
    });

    // UI Validation test
    test.skip('should compare Reset password design with figma baseline', async () => {
        await pageManager.getPage.waitForTimeout(1000);
        await expect(pageManager.getPage).toHaveScreenshot('resetPassword-figma-baseline.png');
    });

    test('User should be able to navigate back to Sign In page', async () => {
        await pageManager.onResetPasswordPage.clickBackToSignIn();
        const continueButton = pageManager.getPage.getByRole('button', { name: 'Continue with email' });
        await expect(continueButton).toBeVisible();
    });

    test('Should validate all elements of reset password page', async () => {
        await pageManager.onResetPasswordPage.validateUIElements();
        await pageManager.onResetPasswordPage.validatePageHeader('Reset password');
        await pageManager.onResetPasswordPage.validateResetPasswordInfo(`Please enter your new password`);
    });

    test('Password guidelines should include correct rules', async () => {
        const [firstGuideline, secondGuideline] = await pageManager.onResetPasswordPage.getPasswordGuidelines();
        expect(firstGuideline).toContain('* At least 6 characters');
        expect(secondGuideline).toContain('* Must include uppercase, lowercase and number');
    });

    //  Negative Test Cases
    test('Should disable submit button when password and confirm password are empty ', async () => {
        await pageManager.onResetPasswordPage.checkSubmitButtonIsDisabled();
    });
    test('Should show error for mismatched passwords', async () => {
        await pageManager.onResetPasswordPage.enterPassword('Password1');
        await pageManager.onResetPasswordPage.enterConfirmPassword('Password2');
        await pageManager.onResetPasswordPage.checkSubmitButtonIsDisabled();
        await pageManager.onResetPasswordPage.verifyConfirmPasswordError(`* These passwords don't match. Try again?`);
    });

    test('Should show error for short password', async () => {
        await pageManager.onResetPasswordPage.enterPassword('Ab1');
        await pageManager.onResetPasswordPage.enterConfirmPassword('Ab1');
        await pageManager.onResetPasswordPage.verifyPasswordError('* Try one with at least 6 characters.');
        await pageManager.onResetPasswordPage.checkSubmitButtonIsDisabled();
    });

    test('Should show error for password without uppercase', async () => {
        await pageManager.onResetPasswordPage.enterPassword('password1');
        await pageManager.onResetPasswordPage.enterConfirmPassword('password1');
        await pageManager.onResetPasswordPage.verifyPasswordError('* Password should include capital letters and numbers.');
        await pageManager.onResetPasswordPage.checkSubmitButtonIsDisabled();
    });

    test('Should show error for password without number', async () => {
        await pageManager.onResetPasswordPage.enterPassword('Password');
        await pageManager.onResetPasswordPage.enterConfirmPassword('Password');
        await pageManager.onResetPasswordPage.verifyPasswordError('* Password should include capital letters and numbers.');
        await pageManager.onResetPasswordPage.checkSubmitButtonIsDisabled();
    });

    //  Edge Cases
    test('Should now allow long passwords greater than defined 22 characters', async () => {
        const longPassword = 'A'.repeat(21) + '1a';
        await pageManager.onResetPasswordPage.enterPassword(longPassword);
        await pageManager.onResetPasswordPage.enterConfirmPassword(longPassword);
        await pageManager.onResetPasswordPage.verifyPasswordError('* Password should be less than 22 characters.');
        await pageManager.onResetPasswordPage.checkSubmitButtonIsDisabled();
    });

    test('Should prevent SQL injection in password fields', async () => {
        await pageManager.onResetPasswordPage.enterPassword("' OR 1=1; --");
        await pageManager.onResetPasswordPage.enterConfirmPassword("' OR 1=1; --");
        await pageManager.onResetPasswordPage.verifyPasswordError('* Password should include capital letters and numbers.');
        await pageManager.onResetPasswordPage.checkSubmitButtonIsDisabled();
    });

    test('Should prevent using an expired reset link', async ({ page }) => {
        await page.goto('https://dev.angelswing.io/reset_password/NMNatEAlyn7bUZd5t4Kaggtt');
        await pageManager.onResetPasswordPage.enterPassword(validPassword);
        await pageManager.onResetPasswordPage.enterConfirmPassword(validPassword);
        await pageManager.onResetPasswordPage.clickSubmit();
        await pageManager.onResetPasswordPage.validatePageHeader('Reset Failed');
    });

    test.describe('Password Validation Tests', () => {
        test('Verify password validation with invalid formats', async ({ }) => {
            for (const { password, expectedMessage } of invalidPasswords) {
                console.log(`Testing with password: "${password}"`);
                await pageManager.onResetPasswordPage.enterPassword(password);
                await pageManager.onResetPasswordPage.enterConfirmPassword(password);
                await pageManager.onResetPasswordPage.checkSubmitButtonIsDisabled();
                await pageManager.onResetPasswordPage.verifyPasswordError(expectedMessage);
            }
        });
    });

    test.describe('Confirm Password Validation Tests', () => {
        test('Verify Confirm Password field requires the same value as Password', async ({ }) => {

            for (const { password, confirmPassword, expectedMessage } of mismatchedPasswords) {
                console.log(`Testing with Password: "${password}" & Confirm Password: "${confirmPassword}"`);

                await pageManager.onResetPasswordPage.enterPassword(password);
                await pageManager.onResetPasswordPage.enterConfirmPassword(confirmPassword);
                await pageManager.onResetPasswordPage.checkSubmitButtonIsDisabled();
                await pageManager.onResetPasswordPage.verifyConfirmPasswordError(expectedMessage);
            }
        });
    });
});
