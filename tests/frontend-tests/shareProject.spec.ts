import { faker } from '@faker-js/faker';
import { HelperBase } from '../../pages/HelperBase';
import { PageManager } from '../../pages/PageManager';
import { test, expect } from '../../test-options';
import { countries, purpose } from '../../test-data/signup-test-data';
import { createTokenAndGetUuid, deleteRequest, deleteToken, waitForEmailAndExtractLink } from '../../services/fetchEmail.requests';

let randomPurpose = purpose[Math.floor(Math.random() * purpose.length)];
let randomCountry = countries[Math.floor(Math.random() * countries.length)];

test.describe('My Projects Page Test', () => {
    let pm: PageManager;
    let helper: HelperBase;
    let token: string;

    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    let email: string = '';

    const userDetails = {
        email: email,
        password: 'Test@12345',
        firstName: firstName,
        lastName: lastName,
        phone: faker.phone.number({ style: 'international' }),
        organization: faker.company.name(),
        country: randomCountry,
        purpose: randomPurpose,
        language: 'English',
    };

    test.beforeEach(async ({ page, request }) => {
        pm = new PageManager(page);
        helper = new HelperBase(page);
        token = await createTokenAndGetUuid(request);
        email = `${token}@${process.env.EMAIL_HOOK_URL}`;
        userDetails.email = email;

    });

    test.afterEach(async ({ request }) => {
        await deleteToken(request, token);
    });

    test('Should login and access shared project after completing the signup through email invitation', async ({ context, page, request }, testInfo) => {

        await pm.onLoginPage.openLoginPageAndWaitForPageToLoad();
        await helper.waitForNumberOfSeconds(1);
        await helper.closeReadUserGuidePopUp(pm, testInfo);
        // Project sharing steps
        await pm.onProjectPage.clickOnThreeDotsMenuOfProject();
        await pm.onProjectPage.clickOnProjectSettings();
        await expect(page).toHaveURL(/.*information*/);
        await pm.onProjectPage.clickOnShareTab();
        await expect(page).toHaveURL(/.*share*/);
        await pm.onProjectPage.clickOnAddButton();
        await pm.onProjectPage.validatePopUpIsVisible();
        expect(await pm.onProjectPage.getHeaderOfPopup()).toBe('Add Collaborators');
        await pm.onProjectPage.enterEmailOfNewTeamMember(email);
        await pm.onProjectPage.checkIfApplyButtonIsDisabled();
        await pm.onProjectPage.clickOnAddButton();
        await pm.onProjectPage.checkIfApplyButtonIsEnabled();
        await pm.onProjectPage.clickOnApplyButton();

        await pm.onProjectPage.clickOnDashboardMenu();
        await pm.onDashboardPage.clickOnSignOutButton();

        // // ---- Open Sign-Up Link in a New Tab ----
        const signupLink = await waitForEmailAndExtractLink(request, token, 'signup');
        expect(signupLink).toContain('signup');

        const signupTab = await context.newPage();
        await signupTab.goto(signupLink);
        // await deleteRequest(request, token);
        const signupPM = new PageManager(signupTab);
        const onSignUpPage = signupPM.onSignupPage;

        await onSignUpPage.clickOnSignUpWithEmail();
        await onSignUpPage.enterPassword(userDetails.password);
        await onSignUpPage.enterConfirmPassword(userDetails.password);
        await onSignUpPage.clickOnNextButton();

        await onSignUpPage.enterFirstName(userDetails.firstName);
        await onSignUpPage.enterLastName(userDetails.lastName);
        await onSignUpPage.enterOrganization(userDetails.organization);
        await onSignUpPage.enterPhoneNumber(userDetails.phone);
        await onSignUpPage.selectPurpose(userDetails.purpose);
        await onSignUpPage.clickOnNextButton();

        await onSignUpPage.selectCountry(userDetails.country);
        await onSignUpPage.selectLanguage(userDetails.language);
        await onSignUpPage.checkTermsAndConditions();
        await onSignUpPage.clickOnCreateAccount();

        // ---- Open Verification Link in Another New Tab ----
        const verificationLink = await waitForEmailAndExtractLink(request, token, 'verify');
        expect(verificationLink).toContain('confirm-email');

        const verificationTab = await context.newPage();
        await verificationTab.goto(verificationLink);

        const verifyPM = new PageManager(verificationTab);
        const onLoginPage = verifyPM.onLoginPage;

        await onLoginPage.enterPassword(userDetails.password);
        await onLoginPage.clickSignIn();

        const expectedLoggedInUrl: string = '/project/dashboard';
        await expect(verificationTab).toHaveURL(expectedLoggedInUrl);

        const onDashboardPagePM = new PageManager(verificationTab);
        const newUserDashboardPage = onDashboardPagePM.onDashboardPage;

        await newUserDashboardPage.closeReadUserGuidePopUp();
        await newUserDashboardPage.clickOnProjectMenu();
        await newUserDashboardPage.clickOnViewProjectToCloseProjectSharedPopup();
        await newUserDashboardPage.validateURL(new RegExp(`.*${process.env.PROJECT_ID}.*`));

        const isSelected = await onDashboardPagePM.onMapPage.get2DOrthomosaicIsSelectionState();
        expect(isSelected).not.toBeNull();
        expect(isSelected).toEqual('checked');

        await signupTab.close();
        await verificationTab.close();
        await page.close();

    });
});
