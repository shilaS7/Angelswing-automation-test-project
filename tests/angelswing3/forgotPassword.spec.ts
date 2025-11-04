import { test } from '../../test-options';
import { expect } from '@playwright/test';
import { invalidEmails, sqlInjectionPayloads } from '../../test-data/signup-test-data';
import { PageManager } from '../../pages/PageManager';

test.use({ storageState: { cookies: [], origins: [] } });
test.describe('Forget Password Functionality', () => {
    let pageManager: PageManager;
    const email: string = process.env.EMAIL || '';
    const password: string = process.env.PASSWORD || '';

    test.beforeEach(async ({ page }) => {
        pageManager = new PageManager(page);

        await pageManager.onLoginPage.openLoginPage();
        const continueButton = pageManager.getPage.getByRole('button', { name: 'Continue with email' });
        await expect(continueButton).toBeVisible();
        await pageManager.onLoginPage.goToForgetPasswordPage();
        await expect(pageManager.onLoginPage.page).toHaveURL('/password');
    });

    // UI Validation test
    test.skip('should compare forget password design with figma', async () => {
        await pageManager.getPage.waitForTimeout(1000);
        await expect(pageManager.getPage).toHaveScreenshot('forgotPassword-figma-baseline.png');
    });


    test('User should be able to navigate back to Sign In page', async () => {
        await pageManager.onForgotPasswordPage.clickBackToSignIn();
        // await expect(pageManager.getPage).toHaveURL('/login');
        const continueButton = pageManager.getPage.getByRole('button', { name: 'Continue with email' });
        await expect(continueButton).toBeVisible();
    });

    test('Should validate all elements of forgot password page', async () => {
        await pageManager.onForgotPasswordPage.validateUIElements();
        await pageManager.onForgotPasswordPage.validateHeaderOfThePage('Forgot your password?');
        await pageManager.onForgotPasswordPage.validateForgotPasswordMessage(`Enter your email account that you registered. We'll send you an email to reset your password.`);
    });


    // Positive Test Cases 
    test('User should be able to submit with a valid email @smoke', async () => {
        const email = process.env.RESET_PASSWORD_EMAIL || '';
        const emailInfoMessage = 'Check your inbox for a link to reset your password. If it does not appear within a few minutes, check your spam folder or contact. cs@angelswing.io';
        await pageManager.onForgotPasswordPage.enterEmail(`${email}`);
        await pageManager.onForgotPasswordPage.clickSubmit();
        await pageManager.onForgotPasswordPage.validateValidEmailUIElements();
        await pageManager.onForgotPasswordPage.validateInvalidEmailHeader('Check your email');
        await pageManager.onForgotPasswordPage.validateRegisteredEmailMessage(email);
        await pageManager.onForgotPasswordPage.validateUnregisteredEmailMessage(emailInfoMessage);

    });



    /**  Negative Test Cases */
    test('Should not enable submit button empty email/white space input', async () => {
        await pageManager.onForgotPasswordPage.validateSubmitButtonIsDisabled();
        await pageManager.onForgotPasswordPage.enterEmail("  ");
        await pageManager.onForgotPasswordPage.validateSubmitButtonIsDisabled();
        await pageManager.onForgotPasswordPage.enterEmail(`${email}`);
        await pageManager.onForgotPasswordPage.validateSubmitButtonIsEnabled();
    });

    test('Should show error for invalid email format', async () => {
        const invalidEmailFormat = 'invalidemail.com';
        const updatedErrorMessage = `* Please enter a valid email address.`;
        await pageManager.onForgotPasswordPage.enterEmail(invalidEmailFormat);
        await pageManager.onForgotPasswordPage.validateSubmitButtonIsDisabled();
        await pageManager.onForgotPasswordPage.verifyEmailError(updatedErrorMessage);
    });

    test.fixme('Should show required field error when submitting without email after entering an invalid email and navigating back', async () => {
        const invalidEmailFormat = 'invali@demail.com';
        await pageManager.onForgotPasswordPage.enterEmail(invalidEmailFormat);
        await pageManager.onForgotPasswordPage.clickSubmit();
        await pageManager.onForgotPasswordPage.validateInvalidEmailUIElements();
        await pageManager.onForgotPasswordPage.validateRegisteredEmailMessage(invalidEmailFormat);
        await pageManager.onForgotPasswordPage.validateInvalidEmailHeader('Invalid email');
        await pageManager.onForgotPasswordPage.validateUnregisteredEmailMessage('Unregistered email.');
        await pageManager.onForgotPasswordPage.clickGoToHomepage();
        await pageManager.onForgotPasswordPage.clickSubmit();
        await pageManager.onForgotPasswordPage.verifyEmailError('* Required');
    });

    test('Should show error for unregistered email', async () => {
        const notRegisteredEmail = 'notregistered@example.com';
        await pageManager.onForgotPasswordPage.enterEmail(notRegisteredEmail);
        await pageManager.onForgotPasswordPage.clickSubmit();
        await pageManager.onForgotPasswordPage.validateInvalidEmailUIElements();
        await pageManager.onForgotPasswordPage.validateRegisteredEmailMessage(notRegisteredEmail);
        await pageManager.onForgotPasswordPage.validateInvalidEmailHeader('Invalid email');
        await pageManager.onForgotPasswordPage.validateUnregisteredEmailMessage('Unregistered email.');
    });

    /**  Edge Cases */
    test('Valid Email with spaces should be trimmed and check your email should be displayed', async () => {
        const email = 'suraj.anand+12@angelswing.io';
        const emailInfoMessage = 'Check your inbox for a link to reset your password. If it does not appear within a few minutes, check your spam folder or contact. support@angelswing.io';
        await pageManager.onForgotPasswordPage.enterEmail(`  ${email}  `);
        await pageManager.onForgotPasswordPage.clickSubmit();
        await pageManager.onForgotPasswordPage.validateValidEmailUIElements();
        await pageManager.onForgotPasswordPage.validateInvalidEmailHeader('Check your email');
        await pageManager.onForgotPasswordPage.validateRegisteredEmailMessage(email);
        await pageManager.onForgotPasswordPage.validateUnregisteredEmailMessage(emailInfoMessage);

    });

    test('Invalid Email with spaces should be trimmed and Invalid email ui should be displayed', async () => {
        const email = 'invalid@angelswing.io';
        const emailInfoMessage = 'Unregistered email.';
        await pageManager.onForgotPasswordPage.enterEmail(`  ${email}  `);
        await pageManager.onForgotPasswordPage.clickSubmit();
        await pageManager.onForgotPasswordPage.validateInvalidEmailUIElements();
        await pageManager.onForgotPasswordPage.validateRegisteredEmailMessage(email);
        await pageManager.onForgotPasswordPage.validateInvalidEmailHeader('Invalid email');
        await pageManager.onForgotPasswordPage.validateUnregisteredEmailMessage(emailInfoMessage);


    });


    test('Should handle both valid and invalid case-insensitive', async () => {
        const emailAddress = ['TEST@EMAIL.COM', 'SURAJ.ANAND+12@ANGELSWING.IO'];
        const emailInfoMessage = 'Unregistered email.';
        for (const email of emailAddress) {
            await pageManager.onForgotPasswordPage.enterEmail(`${email}`);
            await pageManager.onForgotPasswordPage.clickSubmit();
            await pageManager.onForgotPasswordPage.validateValidEmailUIElements();
            await pageManager.onForgotPasswordPage.validateInvalidEmailHeader('Invalid email');
            await pageManager.onForgotPasswordPage.validateUnregisteredEmailMessage(emailInfoMessage);
            await pageManager.getPage.goto('/password');
        }
    });

    test('Long email should be handled correctly', async () => {
        const longEmail = 'a'.repeat(64) + '@example.com';
        const emailInfoMessage = 'Unregistered email.';
        await pageManager.onForgotPasswordPage.enterEmail(longEmail);
        await pageManager.onForgotPasswordPage.clickSubmit();
        await pageManager.onForgotPasswordPage.validateInvalidEmailUIElements();
        await pageManager.onForgotPasswordPage.validateRegisteredEmailMessage(longEmail);
        await pageManager.onForgotPasswordPage.validateInvalidEmailHeader('Invalid email');
        await pageManager.onForgotPasswordPage.validateUnregisteredEmailMessage(emailInfoMessage);

    });

    test('Should prevent SQL injection attempt', async () => {
        const email = "' OR 1=1; --";
        await pageManager.onForgotPasswordPage.enterEmail(email);
        await pageManager.onForgotPasswordPage.validateSubmitButtonIsDisabled();
        const updatedErrorMessage = `* Please enter a valid email address.`;
        await pageManager.onForgotPasswordPage.verifyEmailError(updatedErrorMessage);

    });

    test('Should prevent JavaScript injection attempt', async () => {
        const email = "<script>alert(1)</script>";
        await pageManager.onForgotPasswordPage.enterEmail(email);
        await pageManager.onForgotPasswordPage.validateSubmitButtonIsDisabled();
        const updatedErrorMessage = `* Please enter a valid email address.`;
        await pageManager.onForgotPasswordPage.verifyEmailError(updatedErrorMessage);

    });

    test('Verify email validation with invalid formats', async ({ }) => {
        for (const invalidEmail of invalidEmails) {
            console.log(`Testing with email: ${invalidEmail}`);
            await pageManager.onForgotPasswordPage.enterEmail(invalidEmail);
            await pageManager.onForgotPasswordPage.validateSubmitButtonIsDisabled();
            const updatedErrorMessage = `* Please enter a valid email address.`;
            await pageManager.onForgotPasswordPage.verifyEmailError(updatedErrorMessage);
        }
    });

    test.skip('Should prevent brute force attacks (rate limiting)', async () => {
        for (let i = 0; i < 10; i++) {
            await pageManager.onForgotPasswordPage.enterEmail('validuser@example.com');
            await pageManager.onForgotPasswordPage.clickSubmit();
        }
    });

});
