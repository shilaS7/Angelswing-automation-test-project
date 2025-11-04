import { test } from '../../test-options';
import { expect } from '@playwright/test';
import { sqlInjectionPayloads } from '../../test-data/signup-test-data';
import { PageManager } from '../../pages/PageManager';

// https://playwright.dev/docs/auth#authenticate-with-api-request
// Reset storage state for this file to avoid being authenticated
test.use({ storageState: { cookies: [], origins: [] } });
test.describe('Login Functionality', () => {
    let pageManager: PageManager;
    const email: string = process.env.EMAIL || '';
    const password: string = process.env.PASSWORD || '';
    let expectedLoggedInUrl: string = '/project/dashboard';

    test.beforeEach(async ({ page }) => {
        pageManager = new PageManager(page);

        await pageManager.onLoginPage.openLoginPage();
        const continueButton = pageManager.getPage.getByRole('button', { name: 'Continue with email' });
        await expect(continueButton).toBeVisible();
        await pageManager.getPage.waitForTimeout(1000);
    });

    // UI Validation test
    test.skip('should compare design with figma', async () => {

        const viewportSize = await pageManager.getPage.evaluate(() => ({
            width: window.innerWidth,
            height: window.innerHeight
        }));
        console.log(`Viewport size: ${viewportSize.width}x${viewportSize.height}`);
        await expect(pageManager.getPage).toHaveScreenshot('login-figma-baseline.png');
    });

    // Positive Test Cases
    test('should login successfully with valid credentials @smoke', async () => {
        await pageManager.onLoginPage.login(email, password);
        await expect(pageManager.getPage).toHaveURL(expectedLoggedInUrl);
        await pageManager.onDashboardPage.closeReadUserGuidePopUp();
        expect(await pageManager.onDashboardPage.isSignOutButtonVisible()).toBeTruthy();
        // const getProjectResponse = await pageManager.getPage.waitForResponse(response =>
        //     response.url().includes(`/v2/projects`) && response.status() === 200 && response.request().method() === 'GET'
        // );
        // const getProjectResponseBody = await getProjectResponse.json();
        // console.log(JSON.stringify(getProjectResponseBody));

    });
    test('validate login security by attempting SQL injection.', async () => {
        for (const sqlPayload of sqlInjectionPayloads) {
            await pageManager.onLoginPage.enterEmail(sqlPayload);
            await pageManager.onLoginPage.enterPassword(sqlPayload);
            await pageManager.onLoginPage.clickContinueWithEmail();
            await pageManager.onLoginPage.verifyEmailErrorIsDisplayed();
            await pageManager.onLoginPage.verifyPasswordErrorIsDisplayed();
            await expect(pageManager.getPage).not.toHaveURL(expectedLoggedInUrl);
        }
    });

    test('should login with remember me checked', async () => {
        await pageManager.onLoginPage.checkRememberMe();
        await pageManager.onLoginPage.login(email, password);
        await expect(pageManager.getPage).toHaveURL(expectedLoggedInUrl);
        // add logic to check  localStorage or cookies
    });


    test('should login without remember me checked', async () => {
        await pageManager.onLoginPage.login(email, password);
        await expect(pageManager.getPage).toHaveURL(expectedLoggedInUrl);
    });

    // Negative Test Cases

    test('should show error with empty email and password', async () => {
        await pageManager.onLoginPage.login('', '');
        await pageManager.onLoginPage.verifyEmailError('* Required');
        await pageManager.onLoginPage.verifyPasswordError('* Required');
    });

    test('should show error with empty email', async () => {
        await pageManager.onLoginPage.login('', password);
        await pageManager.onLoginPage.verifyEmailError('* Required');
    });

    test('should show error with empty password', async () => {
        await pageManager.onLoginPage.login('test@example.com', '');
        await pageManager.onLoginPage.verifyPasswordError('* Required');
    });

    test('should show error with invalid email format', async () => {
        await pageManager.onLoginPage.login('invalidEmail', 'password123');

    });

    test('should show error with incorrect credentials', async () => {
        await pageManager.onLoginPage.login('wrong@example.com', 'wrongPassword');
        await pageManager.onLoginPage.verifyLoginPasswordError('* Invalid username or password, Try again or click Forgot password to reset it.');

    });

    // SSO Related Tests
    test('should redirect to Microsoft login', async () => {
        // await pageManager.onLoginPage.microsoftButton.click();

    });

    test('should handle SAML SSO login', async () => {
        await pageManager.onLoginPage.loginWithSaml('my-organization');

    });

    test.skip('should show error with invalid organization slug', async () => {
        await pageManager.onLoginPage.loginWithSaml('invalid-org');
        await expect(pageManager.getPage.locator('error-message')).toBeVisible();
    });

    // Navigation Tests
    test('should navigate to forgot password page', async () => {
        await pageManager.onLoginPage.goToForgetPasswordPage();
        await expect(pageManager.getPage).toHaveURL('/password');
    });
});


