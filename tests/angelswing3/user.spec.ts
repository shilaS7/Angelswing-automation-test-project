import { test } from '../../test-options';
import { BrowserContext, expect, Page } from '@playwright/test';
import { countries, invalidPasswords, purpose, sqlInjectionPayloads } from '../../test-data/signup-test-data';
import { PageManager } from '../../pages/PageManager';
import { faker } from '@faker-js/faker';
import { HelperBase } from '../../pages/HelperBase';
import { UI_META } from '../../utils/uiMeta';

test.use({ storageState: { cookies: [], origins: [] } });
test.describe('User Page Functionality', () => {
    let pageManager: PageManager;
    let context: BrowserContext;
    let page: Page;
    const email: string = process.env.EMAIL || '';
    const password: string = process.env.PASSWORD || '';
    let expectedLoggedOutUrl: string = '/login';

    let userDetails: any;
    let userEmail: string;
    let name: string;
    let helper: HelperBase;
    test.beforeAll(async ({ browser }, testInfo) => {
        context = await browser.newContext();
        page = await context.newPage();
        pageManager = new PageManager(page);
        helper = new HelperBase(page);
        await pageManager.onLoginPage.openLoginPage();
        await pageManager.onLoginPage.login(email, password);
        const loggedInUserResponse = await pageManager.onDashboardPage.getLoggedInUserResponse();
        await helper.waitForPageToLoad();
        userDetails = loggedInUserResponse.data.attributes;
        await helper.closeReadUserGuidePopUp(pageManager, testInfo);
        name = `${userDetails.firstName} ${userDetails.lastName}`;
        userEmail = userDetails.email;
        await pageManager.onDashboardPage.clickOnUserName();
    });

    test.afterAll(async () => {
        await context.close();
    });

    test.beforeEach(async ({ }, testInfo) => {
        if (await helper.isSmartDevice(testInfo)) {
            await pageManager.onDashboardPage.collapseSidebar();
        }
    });

    test.afterEach(async ({ }, testInfo) => {
        const shouldSkip =
            testInfo.title.includes('[last-test]');
        if (shouldSkip) {
            console.log(`Skipping afterEach for: ${testInfo.title} in project: ${testInfo.project.name}`);
            return;
        }
        if (await helper.isSmartDevice(testInfo)) {
            await pageManager.onDashboardPage.expandSidebar();
        }

        await pageManager.onDashboardPage.clickOnUserName();
    });

    // UI Validation test
    test.skip('should compare my page design with figma @UI', async () => {
        await expect(pageManager.getPage).toHaveScreenshot('mypage-figma-baseline.png');
        await pageManager.onUserPage.clickOnSecurityTab();
        await expect(pageManager.getPage).toHaveScreenshot('mypage-security-figma-baseline.png');
        await pageManager.onUserPage.clickOnBillingTab();
        await expect(pageManager.getPage).toHaveScreenshot('mypage-billing-figma-baseline.png');
        await pageManager.onUserPage.clickOnSettingsTab();
        await expect(pageManager.getPage).toHaveScreenshot('mypage-settings-figma-baseline.png');
    });

    test('should verify user details', async () => {

        const userPage = pageManager.onUserPage;
        expect(await userPage.getEmailValue()).toBe(userEmail);
        expect(await userPage.getFullNameValue()).toBe(name);
        expect(await userPage.getPhoneNumberValue()).toBe(userDetails.contactNumber);
        expect(await userPage.getOrganizationValue()).toBe(userDetails.organization);
        expect(((await userPage.getPurposeValue()).replace(' ', '')).toLowerCase()).toBe(userDetails.purpose.replace(' ', '').toLowerCase());
        expect((await userPage.getUserTypeValue(name)).toLowerCase()).toBe(userDetails.role.toLowerCase());

        await userPage.clickOnSettingsTab();
        expect(await userPage.getCountryValue()).toBe(userDetails.country);

        if (userDetails.language === 'en-US') {
            expect(await userPage.getLanguageValue()).toBe('English');
        } else {
            expect(await userPage.getLanguageValue()).toBe('Korean');
        }

    });

    test('verify user can update name', async () => {
        const newFirstName = faker.person.firstName();
        const newLastName = faker.person.lastName();
        const newName = `${newFirstName} ${newLastName}`;
        const userPage = pageManager.onUserPage;
        await userPage.clickOnName();
        expect(await userPage.getHeaderOfPopup()).toBe(UI_META.popupHeaders.resetName);
        await userPage.enterFirstName(newFirstName);
        await userPage.enterLastName(newLastName);
        await userPage.clickOnApplyButton();
        await helper.waitForNumberOfSeconds(2);
        expect(await userPage.getFullNameValue()).toBe(newName);
    });

    test('verify user cannot update name with empty fields', async () => {
        const userPage = pageManager.onUserPage;
        await userPage.clickOnName();
        expect(await userPage.getHeaderOfPopup()).toBe(UI_META.popupHeaders.resetName);
        await userPage.enterFirstName('');
        await userPage.enterLastName('');
        await userPage.checkIfApplyButtonIsEnabled();
        await userPage.clickOnCancelButton();
    });

    test.skip('verify user cannot update name with invalid characters', async () => {
        const invalidFirstName = '1234';
        const invalidLastName = '@#$%(';
        const userPage = pageManager.onUserPage;
        await userPage.clickOnName();
        expect(await userPage.getHeaderOfPopup()).toBe(UI_META.popupHeaders.resetName);
        await userPage.enterFirstName(invalidFirstName);
        await userPage.enterLastName(invalidLastName);
        await userPage.clickOnApplyButton();
        await helper.waitForNumberOfSeconds(2);
        expect(await userPage.getFullNameValue()).not.toBe(`${invalidFirstName} ${invalidLastName}`);
    });

    test.fixme('verify user cannot update name with excessively long names', async () => {
        const longFirstName = 'A'.repeat(256);
        const longLastName = 'B'.repeat(256);
        const userPage = pageManager.onUserPage;
        await userPage.clickOnName();
        expect(await userPage.getHeaderOfPopup()).toBe(UI_META.popupHeaders.resetName);
        await userPage.enterFirstName(longFirstName);
        await userPage.enterLastName(longLastName);
        await userPage.clickOnApplyButton();
        await helper.waitForNumberOfSeconds(2);
        expect(await userPage.getFullNameValue()).not.toBe(`${longFirstName} ${longLastName}`);
    });

    test('should not accept only white space', async () => {
        const userPage = pageManager.onUserPage;
        await userPage.clickOnName();
        expect(await userPage.getHeaderOfPopup()).toBe(UI_META.popupHeaders.resetName);
        await userPage.enterFirstName(' ');
        await userPage.enterLastName(' ');
        expect(await userPage.getFirstNameErrorMessage()).toBe(UI_META.popupMessages.nameRequired.firstName);
        expect(await userPage.getLastNameErrorMessage()).toBe(UI_META.popupMessages.nameRequired.lastName);
        await userPage.checkIfApplyButtonIsDisabled();
        await userPage.clickOnCancelButton();
    });

    test('should display validation message when user removes first name and last name', async () => {
        const userPage = pageManager.onUserPage;
        await userPage.clickOnName();
        expect(await userPage.getHeaderOfPopup()).toBe(UI_META.popupHeaders.resetName);
        await userPage.enterFirstName('');
        await userPage.enterLastName('');
        expect(await userPage.getFirstNameErrorMessage()).toBe(UI_META.popupMessages.nameRequired.firstName);
        expect(await userPage.getLastNameErrorMessage()).toBe(UI_META.popupMessages.nameRequired.lastName);
        await userPage.checkIfApplyButtonIsDisabled();
        await userPage.clickOnCancelButton();
    });


    test('verify user can update phone number', async () => {
        const userPage = pageManager.onUserPage;
        const newPhoneNumber = faker.phone.number();
        await userPage.clickOnPhoneNumber();
        expect(await userPage.getHeaderOfPopup()).toBe(UI_META.popupHeaders.editPhone);
        await userPage.enterPhoneNumber(newPhoneNumber);
        await userPage.clickOnApplyButton();

        await helper.waitForNumberOfSeconds(2);
        expect(await userPage.getPhoneNumberValue()).toBe(newPhoneNumber);
    });

    test('verify user can update organization', async () => {
        const userPage = pageManager.onUserPage;
        const newOrganization = faker.lorem.word();
        await userPage.clickOnOrganization();
        expect(await userPage.getHeaderOfPopup()).toBe(UI_META.popupHeaders.editOrganization);
        await userPage.enterOrganization(newOrganization);
        await userPage.clickOnApplyButton();
        await helper.waitForNumberOfSeconds(2);
        expect(await userPage.getOrganizationValue()).toBe(newOrganization);
    });

    test('verify user can update purpose', async () => {
        const userPage = pageManager.onUserPage;
        let newPurpose = purpose[Math.floor(Math.random() * purpose.length)];
        await userPage.clickOnPurpose();
        expect(await userPage.getHeaderOfPopup()).toBe(UI_META.popupHeaders.changePurpose);
        await userPage.selectPurpose(newPurpose);
        await userPage.clickOnApplyButton();
        await helper.waitForNumberOfSeconds(2);
        expect(await userPage.getPurposeValue()).toBe(newPurpose);
    });



    test('Should update the country', async () => {
        const userPage = pageManager.onUserPage;
        await userPage.clickOnSettingsTab();
        const newCountry = countries[Math.floor(Math.random() * countries.length)];
        await userPage.clickOnCountry();
        expect(await userPage.getHeaderOfPopup()).toBe(UI_META.popupHeaders.changeCountry);
        await userPage.selectCountry(newCountry);
        await userPage.clickOnApplyButton();
        await helper.waitForNumberOfSeconds(2);
        expect(await userPage.getCountryValue()).toBe(newCountry);
    });

    test('Should update the language', async () => {

        const languages = { eng: 'English', kor: '한국어' };
        const userPage = pageManager.onUserPage;
        await userPage.clickOnSettingsTab();
        await userPage.clickOnLanguage();
        expect(await userPage.getHeaderOfPopup()).toBe(UI_META.popupHeaders.changeLanguage);
        await userPage.selectLanguage(languages.kor);
        await userPage.clickOnApplyButton();
        await helper.waitForNumberOfSeconds(2);
        expect(await userPage.getLanguageValue('언어')).toBe(languages.kor);


        await userPage.clickOnLanguage('언어');
        await userPage.selectLanguage(languages.eng);
        await userPage.clickOnApplyButton('적용');
        await helper.waitForNumberOfSeconds(2);
        expect(await userPage.getLanguageValue()).toBe(languages.eng);

    });

    test.fixme('Should validate billing tab and popup', async () => {
        const userPage = pageManager.onUserPage;
        await userPage.clickOnBillingTab();
        await userPage.clickOnChangePlan();
        expect(await userPage.getHeaderOfPopup()).toBe(UI_META.popupHeaders.changePlan);
        expect(await userPage.getMessageOfPopup('To change ')).toContain(UI_META.popupMessages.changePlan);

    });

    test.fixme('Should validate delete account popup', async () => {
        const userPage = pageManager.onUserPage;
        await userPage.clickOnSecurityTab();
        await userPage.clickOnDeleteAccount();
        expect(await userPage.getHeaderOfPopup()).toBe(UI_META.popupHeaders.deleteAccount);
        expect(await userPage.getMessageOfPopup('To proceed')).toContain(UI_META.popupMessages.deleteAccount);
    });

    test('Should display success message after password reset', async ({ }, testInfo) => {
        const userPage = pageManager.onUserPage;
        await userPage.clickOnSecurityTab();
        await userPage.clickOnPassword();
        expect(await userPage.getHeaderOfPopup()).toBe(UI_META.popupHeaders.resetPassword);
        await userPage.enterCurrentPassword(password);
        await userPage.enterNewPassword(password);
        await userPage.enterConfirmPassword(password);

        await userPage.clickOnApplyButton();
    });

    test('Should display error message when password mismatch', async () => {
        const userPage = pageManager.onUserPage;
        await userPage.clickOnSecurityTab();
        await userPage.clickOnPassword();
        expect(await userPage.getHeaderOfPopup()).toBe(UI_META.popupHeaders.resetPassword);
        await userPage.enterCurrentPassword(password);
        await userPage.enterNewPassword(password);
        await userPage.enterConfirmPassword(`${password}1`);

        await userPage.verifyPasswordMismatchError(UI_META.popupMessages.passwordMismatch);
        expect(await userPage.checkIfApplyButtonIsDisabled()).toBe(true);
        await userPage.clickOnCancelButton();
    });

    test('Should display error message on invalid password input', async () => {
        const userPage = pageManager.onUserPage;
        await userPage.clickOnSecurityTab();
        await userPage.clickOnPassword();
        expect(await userPage.getHeaderOfPopup()).toBe(UI_META.popupHeaders.resetPassword);

        await userPage.enterCurrentPassword(password);


        for (const { password, expectedMessage } of invalidPasswords) {
            console.log(`Testing with password: "${password}"`);
            await userPage.enterNewPassword(password);
            await userPage.enterConfirmPassword(password);
            expect(await userPage.checkIfApplyButtonIsDisabled()).toBe(true);
            await userPage.verifyPasswordError(expectedMessage);
        }

        await userPage.clickOnCancelButton();
    });

    test('should successfully upload a profile image', async ({ }) => {
        const userPage = pageManager.onUserPage;
        await userPage.clickOnProfileImage();
        expect(await userPage.getHeaderOfPopup()).toBe(UI_META.popupHeaders.changeProfileImage);

        const fileChooserPromise = page.waitForEvent('filechooser');
        await userPage.clickOnUploadButton();
        const fileChooser = await fileChooserPromise;

        await fileChooser.setFiles('./test-data/assets/profile-image.jpeg');
        await helper.waitForNumberOfSeconds(2);
        expect(await userPage.isImageUploaded()).toBe(true);


        expect(await userPage.checkIfApplyButtonIsEnabled()).toBeTruthy();
        await userPage.clickOnApplyButton();
        await helper.waitForNumberOfSeconds(3);
        expect(await userPage.isImageDisplayedOnProfilePage()).toBe(true);

    });

    test('should reset profile image to default', async () => {
        const userPage = pageManager.onUserPage;
        await userPage.clickOnProfileImage();
        expect(await userPage.getHeaderOfPopup()).toBe(UI_META.popupHeaders.changeProfileImage);
        await userPage.clickOnResetToDefaultButton();
        await helper.waitForNumberOfSeconds(2);
        expect(await userPage.isImageResetToDefault()).toBe(true);
        await userPage.clickOnApplyButton();
        await helper.waitForNumberOfSeconds(2);
        expect(await userPage.isImageDisplayedOnProfilePage()).toBe(false);
    });

    test('Should logout user after clicking on sign out button [last-test]', async () => {
        const userPage = pageManager.onUserPage;
        await userPage.clickOnSignOut();
        await expect(pageManager.getPage).toHaveURL(expectedLoggedOutUrl);
    });


});

