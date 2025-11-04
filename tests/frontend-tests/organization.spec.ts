import { faker } from '@faker-js/faker';
import { HelperBase } from '../../pages/HelperBase';
import { PageManager } from '../../pages/PageManager';
import { test, expect } from '../../test-options';
import { BrowserContext, Page, request } from '@playwright/test';
import { UI_META } from '../../utils/uiMeta';
import { countries, purpose } from '../../test-data/signup-test-data';
import { createTokenAndGetUuid, deleteRequest, deleteToken, waitForEmailAndExtractLink } from '../../services/fetchEmail.requests';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Organization Page', () => {
    let pm: PageManager;
    let helper: HelperBase;
    let context: BrowserContext;
    let page: Page;

    let randomPurpose = purpose[Math.floor(Math.random() * purpose.length)];
    let randomCountry = countries[Math.floor(Math.random() * countries.length)];

    let name: string;
    let organizationName: string;
    const projectName = ['GLOBAL - QA AWS', '1470 Source photo processing EPSG 5174', 'Automation Update'];

    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    let email: string = '';

    const userDetails = {
        email: email || faker.internet.email(),
        password: 'Test@12345',
        firstName: firstName,
        lastName: lastName,
        phone: faker.phone.number({ style: 'international' }),
        organization: faker.company.name(),
        country: randomCountry,
        purpose: randomPurpose,
        language: 'English',
    };
    const emailDomain = [
        "angelswing.io",
        "emailhook.site"
    ];

    const searchValues = UI_META.organizationPage.searchValues;

    async function validateAdminUI({
        tab,
        email,
        organizationName,
        projectCount,
        helper,
    }: {
        tab: Page,
        email: string,
        organizationName: string,
        projectCount: number,
        helper: HelperBase;
    }) {
        const pageManager = new PageManager(tab);
        const orgPage = pageManager.onOrganizationPage;
        const dashboard = pageManager.onDashboardPage;

        await dashboard.clickOnOrganization();
        await orgPage.clickOnAccountsTab();
        await orgPage.validateUserIsListedInAccounts(email);
        await orgPage.clickOnPendingRequestsTab();
        await orgPage.validateUserIsNotListedInPendingRequests(email);
        await dashboard.clickOnOrganizationProject(organizationName);
        const projectPage = pageManager.onOrganizationProjectPage;
        const actualCount = await projectPage.getOrganizationProjectCount();
        expect(actualCount).toBe(projectCount);
    }

    async function completeUserSignupFlow({ request, context, token, userDetails, password }: { request: any, context: BrowserContext, token: string, userDetails: any, password: string; }) {
        const signupLink = await waitForEmailAndExtractLink(request, token, 'signup');
        expect(signupLink).toContain('signup');

        // ---- Open Sign-Up Link in a New Tab ----
        const signupTab = await context.newPage();
        await signupTab.goto(signupLink);

        const signupPM = new PageManager(signupTab);
        const onSignUpPage = signupPM.onSignupPage;

        await onSignUpPage.clickOnSignUpWithEmail();
        await onSignUpPage.enterPassword(password);
        await onSignUpPage.enterConfirmPassword(password);
        await onSignUpPage.clickOnNextButton();

        await onSignUpPage.enterFirstName(userDetails.firstName);
        await onSignUpPage.enterLastName(userDetails.lastName);
        await onSignUpPage.enterOrganization(userDetails.organization, false);
        await onSignUpPage.enterPhoneNumber(userDetails.phone);
        await onSignUpPage.selectPurpose(userDetails.purpose);
        await onSignUpPage.clickOnNextButton();

        await onSignUpPage.selectCountry(userDetails.country);
        await onSignUpPage.selectLanguage(userDetails.language);
        await onSignUpPage.checkTermsAndConditions();
        await onSignUpPage.clickOnCreateAccount();

        return signupTab;
    }

    async function completeEmailVerificationAndLogin({ request, context, token, password }: { request: any, context: BrowserContext, token: string, password: string; }) {
        const verificationLink = await waitForEmailAndExtractLink(request, token, 'verify');
        expect(verificationLink).toContain('confirm-email');
        // ---- Open Verification Link in Another New Tab ----
        const verificationTab = await context.newPage();
        await verificationTab.goto(verificationLink);

        const loginPM = new PageManager(verificationTab);
        const onLoginPage = loginPM.onLoginPage;
        await onLoginPage.enterPassword(password);
        await onLoginPage.clickSignIn();
        await expect(verificationTab).toHaveURL(/.*project\/dashboard/);

        return verificationTab;
    }

    async function setupInvitation(organizationPage: any, projectNames: string[], role: string) {
        await organizationPage.clickOnAccountsTab();
        await organizationPage.clickOnInviteButton();
        expect(await organizationPage.getInvitationPageHeader()).toBe(UI_META.organizationPage.popupHeader.invitation);

        await organizationPage.clickOnSelectProjects();
        for (const project of projectNames) {
            await organizationPage.selectProject(project);
        }
        await organizationPage.selectRole(role);
    }

    async function setupDashboardAfterLogin(tab: Page, projectCount?: number, viewProjectPosition: number = 0) {
        const newUserDashboard = new PageManager(tab).onDashboardPage;
        const helper = new HelperBase(tab);

        await helper.waitForPageToLoad();
        await newUserDashboard.closeReadUserGuidePopUp();
        await newUserDashboard.clickOnProjectMenu();

        if (projectCount !== undefined) {
            const countOfSharedProjects = await newUserDashboard.getCountOfSharedProjects();
            expect(countOfSharedProjects).toBe(projectCount + 1);
        }

        await newUserDashboard.clickOnViewProjectToCloseProjectSharedPopup(viewProjectPosition);
        await newUserDashboard.validateURL(/.*content\/map\/.*/);

        return { newUserDashboard, helper };
    }

    async function signoutAndCloseTabs(verificationTab: Page, signupTab: Page, dashboard: any) {
        const projectPagePM = new PageManager(verificationTab);
        await projectPagePM.onProjectPage.clickOnDashboardMenu();
        await dashboard.clickOnSignOutButton();
        await verificationTab.close();
        await signupTab.close();
    }

    async function interceptSubscriptionData(page: Page, limit: number, completed: number, start: string, end: string) {
        await pm.getPage.waitForTimeout(2000);
        await page.route('**/v2/organizations/current', async route => {
            const response = await route.fetch();
            const json = await response.json();
            json.data.currentPlan.sourceProcessingLimit = limit;
            json.data.currentPlan.startDate = start;
            json.data.currentPlan.endDate = end;

            await route.fulfill({
                status: response.status(),
                contentType: response.headers()['content-type'] || 'application/json',
                body: JSON.stringify(json)
            });
        });

        await page.route('**/v2/organizations/7/processings', async route => {
            const response = await route.fetch();
            const json = await response.json();
            json.meta.completed = completed;
            await route.fulfill({
                status: response.status(),
                contentType: response.headers()['content-type'] || 'application/json',
                body: JSON.stringify(json)
            });
        });
    }

    function capitalizeFirstLetter(str: string) {
        return str
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }

    test.beforeEach(async ({ page }, testInfo) => {

        pm = new PageManager(page);
        helper = new HelperBase(pm.getPage);
        await pm.onLoginPage.openLoginPage();
        await pm.onLoginPage.login(process.env.ORG_ADMIN_EMAIL || '', process.env.PASSWORD || '');
        const loggedInUserResponse = await pm.onDashboardPage.getAuthAndCurrentUserResponse();
        const userDetails = loggedInUserResponse.signinBody.data.attributes;
        name = `${userDetails.firstName} ${userDetails.lastName}`;
        const userOrganizationDetail = loggedInUserResponse.currentUserBody.data;
        organizationName = userOrganizationDetail.name;
        await helper.closeReadUserGuidePopUp(pm, testInfo);
        await pm.onDashboardPage.clickOnOrganization();
        expect(await pm.onOrganizationPage.isInformationTabShownAsSelected()).toBe(true);
    });

    test('should validate header of the organization settings page', async () => {
        const organizationPage = pm.onOrganizationPage;
        expect(await organizationPage.getHeaderText()).toBe(UI_META.organizationPage.header);
    });

    test('should display organization name when user hover mouse on user name', async () => {
        await pm.onDashboardPage.hoverOnUserName(name);
        expect(await pm.onDashboardPage.getTooltipText()).toBe(`${name} (${organizationName})`);
    });

    test('should show tabs as selected when user click on them', async () => {
        const organizationPage = pm.onOrganizationPage;
        await organizationPage.clickOnAccountsTab();
        expect(await organizationPage.isAccountsTabShownAsSelected()).toBe(true);
        await organizationPage.clickOnDataStorageTab();
        expect(await organizationPage.isDataStorageTabShownAsSelected()).toBe(true);
    });

    test('should validate the organization account count is displayed correctly', async () => {
        const organizationPage = pm.onOrganizationPage;
        await organizationPage.clickOnAccountsTab();
        expect(await organizationPage.isAccountsTabShownAsSelected()).toBe(true);
        const organizationAccountCount = await organizationPage.getOrganizationAccountCount();
        const organizationAccountCountFromTable = await organizationPage.getOrganizationAccountCountFromTable();
        console.log(`organizationAccountCount - organizationAccountCountFromTable: ${organizationAccountCount}  ${organizationAccountCountFromTable}`);
        expect(organizationAccountCount).toBe(organizationAccountCountFromTable);
    });

    test('should validate organization name after updating', async () => {
        const organizationPage = pm.onOrganizationPage;
        const newOrganizationName = faker.company.name();
        await organizationPage.clickOnOrganizationName();
        expect(await organizationPage.getOrganizationPopupHeader()).toBe(UI_META.organizationPage.popupHeader.changeOrganizationName);
        await organizationPage.enterOrganizationName(newOrganizationName);
        await organizationPage.clickOnApply();
        await helper.waitForNumberOfSeconds(1);
        expect(await organizationPage.getOrganizationName()).toBe(newOrganizationName);
    });

    test('should validate region/country after updating', async () => {
        const organizationPage = pm.onOrganizationPage;
        // const newRegionCountry = faker.location.country();
        const newRegionCountry = countries[Math.floor(Math.random() * countries.length)];
        await organizationPage.clickOnCountry();
        expect(await organizationPage.getOrganizationPopupHeader()).toBe(UI_META.organizationPage.popupHeader.changeRegionCountry);
        await organizationPage.enterCountry(newRegionCountry || '');
        await organizationPage.clickOnApply();
        await helper.waitForNumberOfSeconds(1);
        expect(await organizationPage.getCountryName()).toBe(newRegionCountry);
    });

    test('should validate industry after updating', async () => {
        const organizationPage = pm.onOrganizationPage;
        const newIndustry = purpose[Math.floor(Math.random() * purpose.length)];
        await organizationPage.clickOnIndustry();
        expect(await organizationPage.getOrganizationPopupHeader()).toBe(UI_META.organizationPage.popupHeader.changeIndustry);
        await organizationPage.enterIndustry(newIndustry || '');
        await organizationPage.clickOnApply();
        await helper.waitForNumberOfSeconds(1);
        expect(await organizationPage.getIndustryName()).toBe(newIndustry);
    });

    test('should validate searching in accounts tab', async () => {
        const organizationPage = pm.onOrganizationPage;
        await organizationPage.clickOnAccountsTab();
        // await organizationPage.searchByValueAndValidateResult('admin');
        for (const value of searchValues) {
            await organizationPage.searchByValueAndValidateResult(value);
        }
    });

    test('should validate date picker in accounts tab', async () => {
        const organizationPage = pm.onOrganizationPage;

        const startDate = '2024-January-01';
        const endDate = '2025-May-01';

        const [startYear, startMonth, startDay] = startDate.split('-');
        const [endYear, endMonth, endDay] = endDate.split('-');

        await organizationPage.clickOnDataStorageTab();
        await organizationPage.clickOnDatePicker();
        await organizationPage.clickOnStartYear();
        await organizationPage.selectStartYear(startYear);
        await organizationPage.clickOnStartMonth();
        await organizationPage.selectStartMonth(startMonth);
        await organizationPage.selectStartDate(startDay);

        await organizationPage.clickOnEndYear();
        await organizationPage.selectEndYear(endYear);
        await organizationPage.clickOnEndMonth();
        await organizationPage.selectEndMonth(endMonth);
        await organizationPage.selectEndDate(endDay);
        await helper.waitForNumberOfSeconds(1);

    });

    test('should display correct subscription and usage data based on intercepted API responses', async ({ }) => {
        await pm.getPage.waitForTimeout(2000);
        await pm.getPage.route('**/v2/organizations/current', async route => {
            const response = await route.fetch();
            const responseBody = await response.json();
            responseBody.data.currentPlan.sourceProcessingLimit = 50;
            responseBody.data.currentPlan.startDate = '2024-01-01';
            responseBody.data.currentPlan.endDate = '2024-12-31';
            console.log(responseBody);

            await route.fulfill({
                status: response.status(),
                contentType: response.headers()['content-type'] || 'application/json',
                body: JSON.stringify(responseBody)
            });
        });

        await pm.getPage.route('**/v2/organizations/7/processings', async route => {
            const response = await route.fetch();
            const responseBody = await response.json();
            responseBody.meta.completed = 0;
            await route.fulfill({
                status: response.status(),
                contentType: response.headers()['content-type'] || 'application/json',
                body: JSON.stringify(responseBody)
            });
        });

        const organizationPage = pm.onOrganizationPage;
        await organizationPage.clickOnDataStorageTab();
        await pm.getPage.waitForTimeout(1000);

        expect(await organizationPage.getSubscriptionPeriod()).toBe('2024-01-01 ~ 2024-12-31');
        expect(await organizationPage.getTotalQuota()).toBe('50');
        expect(await organizationPage.getUsedCount()).toBe('0');
        expect(await organizationPage.getRemainingCount()).toBe('50');

    });

    const scenarios = [
        { quota: 0, used: 0, start: '2025-01-01', end: '2025-01-31' },
        { quota: 5, used: 5, start: '2025-02-01', end: '2025-02-28' },
        { quota: 3, used: 5, start: '2025-03-01', end: '2025-03-31' },
        { quota: 10, used: 2, start: '2025-04-01', end: '2025-04-30' },
        // { quota: -5, used: 2, start: '2025-05-01', end: '2025-05-31' }, // Invalid as negative will not be send from Backend
        // { quota: 2, used: -5, start: '2025-05-01', end: '2025-05-31' }, // Invalid as negative will not be send from Backend
        { quota: 0, used: 1, start: '2025-06-01', end: '2025-06-30' },
        { quota: 2147483647, used: 1000, start: '2025-07-01', end: '2025-07-31' }, // Invalid as 2147483647 is not a valid number
    ];
    for (const { quota, used, start, end } of scenarios) {
        test(`should handle quota=${quota}, used=${used}`, async ({ }) => {
            await interceptSubscriptionData(pm.getPage, quota, used, start, end);

            const organizationPage = pm.onOrganizationPage;
            await organizationPage.clickOnDataStorageTab();
            await pm.getPage.waitForTimeout(1000);

            // Assertions (you can vary these based on expected behavior)
            expect(await organizationPage.getSubscriptionPeriod()).toBe(`${start} ~ ${end}`);
            expect(await organizationPage.getUsedCount()).toBe(String(used));
            // expect(await organizationPage.getRemainingCount()).toBe(String(quota - used));
            // expect(await organizationPage.getTotalQuota()).toBe(String(quota));
        });
    }

    test.describe('Invitation tests', () => {
        let token: string;
        let email: string;

        test.beforeEach(async ({ request }) => {
            token = await createTokenAndGetUuid(request);
            email = `${token}@${process.env.EMAIL_HOOK_URL}`;
            userDetails.email = email;
        });

        test.afterEach(async ({ request }) => {
            await deleteToken(request, token);
            await pm.getPage.close();
        });

        async function validate2DOrthomosaicIsSelected(verificationTab: Page) {
            const mapPagePM = new PageManager(verificationTab);
            const mapPage = mapPagePM.onMapPage;
            const isSelected = await mapPage.get2DOrthomosaicIsSelectionState();
            expect(isSelected).not.toBeNull();
            expect(isSelected).toEqual('checked');
        }


        test('should invite an admin to an organization and validate the invitation page after signup and login from new user/admin @smoke', async ({ request, context }) => {
            const organizationPage = pm.onOrganizationPage;
            await setupInvitation(organizationPage, [projectName[0]], UI_META.organizationPage.role.admin);
            await organizationPage.enterEmail(userDetails.email);
            await organizationPage.clickAddButton();
            expect(await organizationPage.getCountOfInvitedAccounts()).toBe(1);
            await organizationPage.sendInvitation();
            await organizationPage.validateUserIsNotListedInAccounts(userDetails.email);

            await organizationPage.clickOnPendingRequestsTab();
            await organizationPage.validateUserIsInvitedAndListedInPendingRequests(userDetails.email);

            await pm.onProjectPage.clickOnDashboardMenu();
            await pm.onDashboardPage.clickOnSignOutButton();

            const signupTab = await completeUserSignupFlow({ request, context, token, userDetails, password: userDetails.password });
            const verificationTab = await completeEmailVerificationAndLogin({ request, context, token, password: userDetails.password });
            const { newUserDashboard } = await setupDashboardAfterLogin(verificationTab);
            // await validate2DOrthomosaicIsSelected(verificationTab);
            // open dashboard page
            const newUserNavigationPM = new PageManager(verificationTab);
            await newUserNavigationPM.onProjectSidebarPage.clickOnWorkspace();
            await helper.waitForNumberOfSeconds(1);
            await helper.closeReadUserGuidePopUp(newUserNavigationPM);

            await newUserDashboard.clickOnOrganization();
            const newUserOrganizationPage = new PageManager(verificationTab).onOrganizationPage;

            await newUserOrganizationPage.clickOnAccountsTab();
            await newUserOrganizationPage.validateUserIsListedInAccounts(userDetails.email);

            await newUserOrganizationPage.clickOnPendingRequestsTab();
            await newUserOrganizationPage.validateUserIsNotListedInPendingRequests(userDetails.email);

            await verificationTab.close();
            await signupTab.close();
        });

        test('should invite an admin to an organization using folder and validate the invitation page after signup and login from new user/admin @smoke', async ({ request, context }) => {
            const organizationPage = pm.onOrganizationPage;
            await setupInvitation(organizationPage, ['Level 2'], UI_META.organizationPage.role.admin);
            await organizationPage.enterEmail(userDetails.email);
            await organizationPage.clickAddButton();
            expect(await organizationPage.getCountOfInvitedAccounts()).toBe(1);
            await organizationPage.sendInvitation();
            await organizationPage.validateUserIsNotListedInAccounts(userDetails.email);

            await organizationPage.clickOnPendingRequestsTab();
            await organizationPage.validateUserIsInvitedAndListedInPendingRequests(userDetails.email);

            await pm.onProjectPage.clickOnDashboardMenu();
            await pm.onDashboardPage.clickOnSignOutButton();

            const signupTab = await completeUserSignupFlow({ request, context, token, userDetails, password: userDetails.password });
            const verificationTab = await completeEmailVerificationAndLogin({ request, context, token, password: userDetails.password });
            const { newUserDashboard } = await setupDashboardAfterLogin(verificationTab, 2);
            // await validate2DOrthomosaicIsSelected(verificationTab);
            // open dashboard page
            const newUserNavigationPM = new PageManager(verificationTab);
            await newUserNavigationPM.onProjectSidebarPage.clickOnWorkspace();
            await helper.waitForNumberOfSeconds(1);
            await helper.closeReadUserGuidePopUp(newUserNavigationPM);

            await newUserDashboard.clickOnOrganization();
            const newUserOrganizationPage = new PageManager(verificationTab).onOrganizationPage;

            await newUserOrganizationPage.clickOnAccountsTab();
            await newUserOrganizationPage.validateUserIsListedInAccounts(userDetails.email);

            await newUserOrganizationPage.clickOnPendingRequestsTab();
            await newUserOrganizationPage.validateUserIsNotListedInPendingRequests(userDetails.email);
        });

        test('should invite a Project Admin to an organization and validate the invitation page after signup and login from new user/member @smoke', async ({ request, context }) => {
            const organizationPage = pm.onOrganizationPage;
            const role = UI_META.organizationPage.role.member.projectAdmin;
            await setupInvitation(organizationPage, [projectName[0]], role);
            await organizationPage.enterEmail(userDetails.email);
            await organizationPage.clickAddButton();
            expect(await organizationPage.getCountOfInvitedAccounts()).toBe(1);
            await organizationPage.sendInvitation();
            await organizationPage.validateUserIsNotListedInAccounts(userDetails.email);

            await organizationPage.clickOnPendingRequestsTab();
            await organizationPage.validateUserIsInvitedAndListedInPendingRequests(userDetails.email);

            await pm.onProjectPage.clickOnDashboardMenu();
            await pm.onDashboardPage.clickOnSignOutButton();

            const signupTab = await completeUserSignupFlow({ request, context, token, userDetails, password: userDetails.password });
            const verificationTab = await completeEmailVerificationAndLogin({ request, context, token, password: userDetails.password });
            const { newUserDashboard } = await setupDashboardAfterLogin(verificationTab, 1);
            // await validate2DOrthomosaicIsSelected(verificationTab);
            // open dashboard page
            const mapPagePM = new PageManager(verificationTab);
            const mapPage = mapPagePM.onMapPage;
            await mapPage.clickOnInviteButton();
            await mapPage.enterValueInSearchCollaborators(userDetails.email);
            const roleCellText = await mapPage.getRoleCellText();
            console.log(roleCellText);
            expect(roleCellText).toBe(role.split(' ')[1]);
            await mapPage.closeProjectTeamPopup();

            const newUserNavigationPM = new PageManager(verificationTab);
            await newUserNavigationPM.onProjectSidebarPage.clickOnWorkspace();
            const isOrganizationSideBarVisible = await newUserDashboard.isOrganizationSideBarVisible();
            expect(isOrganizationSideBarVisible).toBe(false);
            await verificationTab.close();
            await signupTab.close();
        });


        test('should invite a Project Pilot to an organization and validate the invitation page after signup and login from new Pilot @smoke', async ({ request, context }) => {
            const organizationPage = pm.onOrganizationPage;
            const role = UI_META.organizationPage.role.member.projectPilot;
            await setupInvitation(organizationPage, [projectName[0]], role);
            await organizationPage.enterEmail(userDetails.email);
            await organizationPage.clickAddButton();
            expect(await organizationPage.getCountOfInvitedAccounts()).toBe(1);
            await organizationPage.sendInvitation();
            await organizationPage.validateUserIsNotListedInAccounts(userDetails.email);

            await organizationPage.clickOnPendingRequestsTab();
            await organizationPage.validateUserIsInvitedAndListedInPendingRequests(userDetails.email);

            await pm.onProjectPage.clickOnDashboardMenu();
            await pm.onDashboardPage.clickOnSignOutButton();

            const signupTab = await completeUserSignupFlow({ request, context, token, userDetails, password: userDetails.password });
            const verificationTab = await completeEmailVerificationAndLogin({ request, context, token, password: userDetails.password });
            const { newUserDashboard } = await setupDashboardAfterLogin(verificationTab, 1);
            // await validate2DOrthomosaicIsSelected(verificationTab);

            const mapPagePM = new PageManager(verificationTab);
            const mapPage = mapPagePM.onMapPage;
            await mapPage.clickOnInviteButton();
            expect(await mapPage.getHeaderTextOfShareProjectPopup()).toBe('Authority Required');
            await mapPage.closeAuthorityRequiredPopup();
            // open dashboard page
            const newUserNavigationPM = new PageManager(verificationTab);
            await newUserNavigationPM.onProjectSidebarPage.clickOnWorkspace();
            const isOrganizationSideBarVisible = await newUserDashboard.isOrganizationSideBarVisible();
            expect(isOrganizationSideBarVisible).toBe(false);
            await verificationTab.close();
            await signupTab.close();
        });

        test('should invite a Project Viewer to an organization and validate the invitation page after signup and login from new Viewer @smoke', async ({ request, context }) => {
            const organizationPage = pm.onOrganizationPage;
            const role = UI_META.organizationPage.role.member.projectViewer;
            await setupInvitation(organizationPage, [projectName[0]], role);
            await organizationPage.enterEmail(userDetails.email);
            await organizationPage.clickAddButton();
            expect(await organizationPage.getCountOfInvitedAccounts()).toBe(1);
            await organizationPage.sendInvitation();
            await organizationPage.validateUserIsNotListedInAccounts(userDetails.email);

            await organizationPage.clickOnPendingRequestsTab();
            await organizationPage.validateUserIsInvitedAndListedInPendingRequests(userDetails.email);

            await pm.onProjectPage.clickOnDashboardMenu();
            await pm.onDashboardPage.clickOnSignOutButton();

            const signupTab = await completeUserSignupFlow({ request, context, token, userDetails, password: userDetails.password });
            const verificationTab = await completeEmailVerificationAndLogin({ request, context, token, password: userDetails.password });
            const { newUserDashboard } = await setupDashboardAfterLogin(verificationTab, 1);
            // await validate2DOrthomosaicIsSelected(verificationTab);

            const mapPagePM = new PageManager(verificationTab);
            const mapPage = mapPagePM.onMapPage;
            await mapPage.clickOnInviteButton();
            expect(await mapPage.getHeaderTextOfShareProjectPopup()).toBe('Authority Required');
            await mapPage.closeAuthorityRequiredPopup();
            // open dashboard page
            const newUserNavigationPM = new PageManager(verificationTab);
            await newUserNavigationPM.onProjectSidebarPage.clickOnWorkspace();
            const isOrganizationSideBarVisible = await newUserDashboard.isOrganizationSideBarVisible();
            expect(isOrganizationSideBarVisible).toBe(false);
            await verificationTab.close();
            await signupTab.close();
        });


        test('should invite a member to an organization using folder and validate the invitation page after signup and login from new user/member @smoke', async ({ request, context }) => {
            const organizationPage = pm.onOrganizationPage;
            await setupInvitation(organizationPage, ['Level 2'], UI_META.organizationPage.role.member.projectMember);
            await organizationPage.enterEmail(userDetails.email);
            await organizationPage.clickAddButton();
            expect(await organizationPage.getCountOfInvitedAccounts()).toBe(1);
            await organizationPage.sendInvitation();
            await organizationPage.validateUserIsNotListedInAccounts(userDetails.email);

            await organizationPage.clickOnPendingRequestsTab();
            await organizationPage.validateUserIsInvitedAndListedInPendingRequests(userDetails.email);

            await pm.onProjectPage.clickOnDashboardMenu();
            await pm.onDashboardPage.clickOnSignOutButton();

            const signupTab = await completeUserSignupFlow({ request, context, token, userDetails, password: userDetails.password });
            const verificationTab = await completeEmailVerificationAndLogin({ request, context, token, password: userDetails.password });
            const { newUserDashboard } = await setupDashboardAfterLogin(verificationTab, 2);
            // await validate2DOrthomosaicIsSelected(verificationTab);
            const mapPagePM = new PageManager(verificationTab);
            const mapPage = mapPagePM.onMapPage;
            await mapPage.clickOnInviteButton();
            expect(await mapPage.getHeaderTextOfShareProjectPopup()).toBe('Authority Required');
            await mapPage.closeAuthorityRequiredPopup();
            // open dashboard page
            const newUserNavigationPM = new PageManager(verificationTab);
            await newUserNavigationPM.onProjectSidebarPage.clickOnWorkspace();
            const isOrganizationSideBarVisible = await newUserDashboard.isOrganizationSideBarVisible();
            expect(isOrganizationSideBarVisible).toBe(false);
            await verificationTab.close();
        });

        test('should validate searching in Pending Requests tab', async ({ }) => {
            const organizationPage = pm.onOrganizationPage;
            await organizationPage.clickOnPendingRequestsTab();

            for (const value of searchValues) {
                await organizationPage.searchByValueAndValidateResultInPendingRequests(value);
            }
        });

        test('Should enable the Add button when a valid email is entered', async ({ }) => {
            const organizationPage = pm.onOrganizationPage;
            await setupInvitation(organizationPage, [projectName[0]], UI_META.organizationPage.role.admin);
            await organizationPage.enterEmail(userDetails.email);
            await organizationPage.clickAddButton();
            expect(await organizationPage.getCountOfInvitedAccounts()).toBe(1);
        });

        test('Should accept multiple emails separated by commas', async ({ }) => {
            const organizationPage = pm.onOrganizationPage;
            const email1 = `${token}@${process.env.EMAIL_HOOK_URL}`;
            const email2 = `another-${token}@${process.env.EMAIL_HOOK_URL}`;
            const multipleEmails = `${email1}, ${email2}`;
            await setupInvitation(organizationPage, [projectName[0]], UI_META.organizationPage.role.admin);
            await organizationPage.enterEmail(multipleEmails);
            await organizationPage.clickAddButton();
            expect(await organizationPage.getCountOfInvitedAccounts()).toBe(2);
        });

        test('should validate invitation, signup, and login for multiple emails', async ({ request, context }) => {
            const organizationPage = pm.onOrganizationPage;
            const firstToken = await createTokenAndGetUuid(request);
            const secondToken = await createTokenAndGetUuid(request);
            const thirdToken = await createTokenAndGetUuid(request);

            const email1 = `${firstToken}@${process.env.EMAIL_HOOK_URL}`;
            const email2 = `${secondToken}@${process.env.EMAIL_HOOK_URL}`;
            const combinedEmails = `${email1},${email2}`;

            await setupInvitation(organizationPage, [projectName[0]], UI_META.organizationPage.role.admin);
            await organizationPage.enterEmail(combinedEmails);
            await organizationPage.clickAddButton();
            expect(await organizationPage.getCountOfInvitedAccounts()).toBe(2);
            await organizationPage.sendInvitation();

            await organizationPage.clickOnPendingRequestsTab();
            await organizationPage.validateUserIsInvitedAndListedInPendingRequests(email1);
            await organizationPage.validateUserIsInvitedAndListedInPendingRequests(email2);

            await pm.onProjectPage.clickOnDashboardMenu();
            await pm.onDashboardPage.clickOnSignOutButton();

            for (const { token, email } of [
                { token: firstToken, email: email1 },
                { token: secondToken, email: email2 },
            ]) {

                const signupTab = await completeUserSignupFlow({ request, context, token, userDetails, password: userDetails.password });
                const verificationTab = await completeEmailVerificationAndLogin({ request, context, token, password: userDetails.password });
                const { newUserDashboard } = await setupDashboardAfterLogin(verificationTab);
                // await validate2DOrthomosaicIsSelected(verificationTab);
                // Navigate to workspace and organization to verify
                const workspaceNavPM = new PageManager(verificationTab);
                await workspaceNavPM.onProjectSidebarPage.clickOnWorkspace();

                const orgPage = new PageManager(verificationTab).onOrganizationPage;
                await newUserDashboard.clickOnOrganization();
                await orgPage.clickOnAccountsTab();
                await orgPage.validateUserIsListedInAccounts(email);
                await orgPage.clickOnPendingRequestsTab();
                await orgPage.validateUserIsNotListedInPendingRequests(email);

                await signoutAndCloseTabs(verificationTab, signupTab, newUserDashboard);
            }
            await deleteToken(request, firstToken);
            await deleteToken(request, secondToken);

        });

        test('Should reset all state after successful invite', async ({ }) => {
            const organizationPage = pm.onOrganizationPage;
            await setupInvitation(organizationPage, [projectName[0]], UI_META.organizationPage.role.member.projectMember);
            await organizationPage.enterEmail(userDetails.email);
            await organizationPage.clickAddButton();
            expect(await organizationPage.getCountOfInvitedAccounts()).toBe(1);
            await organizationPage.sendInvitation();
            await helper.waitForNumberOfSeconds(1);
            await organizationPage.clickOnAccountsTab();
            await organizationPage.clickOnInviteButton();
            expect(await organizationPage.getInvitationPageHeader()).toBe(UI_META.organizationPage.popupHeader.invitation);
            expect(await organizationPage.getEmailInputValue()).toBe('');
            expect(await organizationPage.getCountOfInvitedAccounts()).toBe(0);
            expect(await organizationPage.getEmailInputValue()).toBe('');
        });

        test('should invite project member to multiple projects', async ({ request, context }) => {
            const organizationPage = pm.onOrganizationPage;
            await setupInvitation(organizationPage, projectName, UI_META.organizationPage.role.member.projectMember);

            await organizationPage.enterEmail(userDetails.email);
            await organizationPage.clickAddButton();
            expect(await organizationPage.getCountOfInvitedAccounts()).toBe(1);
            await organizationPage.sendInvitation();
            await helper.waitForNumberOfSeconds(1);
            await organizationPage.clickOnPendingRequestsTab();
            await organizationPage.validateUserIsInvitedAndListedInPendingRequests(userDetails.email);

            await pm.onProjectPage.clickOnDashboardMenu();
            await pm.onDashboardPage.clickOnSignOutButton();

            const signupTab = await completeUserSignupFlow({ request, context, token, userDetails, password: userDetails.password });

            const verificationTab = await completeEmailVerificationAndLogin({ request, context, token, password: userDetails.password });
            const { newUserDashboard } = await setupDashboardAfterLogin(verificationTab, 3, 1);
            // await validate2DOrthomosaicIsSelected(verificationTab);
            await verificationTab.close();
            await signupTab.close();
        });

        test('should invite single project to multiple users in one go', async ({ request, context }) => {
            const organizationPage = pm.onOrganizationPage;
            const firstToken = await createTokenAndGetUuid(request);
            const secondToken = await createTokenAndGetUuid(request);

            const memberEmail = `${firstToken}@${process.env.EMAIL_HOOK_URL}`;
            const adminEmail = `${secondToken}@${process.env.EMAIL_HOOK_URL}`;

            await setupInvitation(organizationPage, [projectName[0]], UI_META.organizationPage.role.member.projectMember);

            await organizationPage.enterEmail(adminEmail);
            await organizationPage.clickAddButton();

            await organizationPage.selectRole(UI_META.organizationPage.role.admin);
            await organizationPage.enterEmail(memberEmail);
            await organizationPage.clickAddButton();
            expect(await organizationPage.getCountOfInvitedAccounts()).toBe(2);
            await organizationPage.sendInvitation();

            const response = await Promise.all([
                organizationPage.getOrganizationInviteResponse()
            ]);
            console.log(response);
            console.log(response[0].status);

            await organizationPage.clickOnPendingRequestsTab();
            await organizationPage.validateUserIsInvitedAndListedInPendingRequests(adminEmail);
            await organizationPage.validateUserIsInvitedAndListedInPendingRequests(memberEmail);

            // await pm.onProjectPage.clickOnDashboardMenu();
            // await pm.onDashboardPage.clickOnSignOutButton();

            // for (const { token, email, isAdmin } of [
            //     { token: firstToken, email: adminEmail, isAdmin: true },
            //     { token: secondToken, email: memberEmail, isAdmin: false },
            // ]) {
            //     console.log(`Starting test for ${token} and ${email}`);
            //     const signupTab = await completeUserSignupFlow({ request, context, token, userDetails, password: userDetails.password });
            //     const verificationTab = await completeEmailVerificationAndLogin({ request, context, token, password: userDetails.password });
            //     const { newUserDashboard } = await setupDashboardAfterLogin(verificationTab);
            //     // await validate2DOrthomosaicIsSelected(verificationTab);
            //     const workspaceNavPM = new PageManager(verificationTab);
            //     await workspaceNavPM.onProjectSidebarPage.clickOnWorkspace();

            //     if (isAdmin) {
            //         await validateAdminUI({ tab: verificationTab, email, organizationName, projectCount: 3, helper });
            //     } else {
            //         const isOrganizationSideBarVisible = await newUserDashboard.isOrganizationSideBarVisible();
            //         expect(isOrganizationSideBarVisible).toBe(false);
            //     }
            //     await signoutAndCloseTabs(verificationTab, signupTab, newUserDashboard);
            // }
            await deleteToken(request, firstToken);
            await deleteToken(request, secondToken);
        });

        test.fixme('should invite multiple users to multiple projects', async ({ request, context }) => {
            const organizationPage = pm.onOrganizationPage;
            const firstToken = await createTokenAndGetUuid(request);
            const secondToken = await createTokenAndGetUuid(request);

            const memberEmail = `${firstToken}@${process.env.EMAIL_HOOK_URL}`;
            const adminEmail = `${secondToken}@${process.env.EMAIL_HOOK_URL}`;

            await setupInvitation(organizationPage, projectName, UI_META.organizationPage.role.member.projectMember);

            await organizationPage.enterEmail(adminEmail);
            await organizationPage.clickAddButton();

            await organizationPage.selectRole(UI_META.organizationPage.role.admin);
            await organizationPage.enterEmail(memberEmail);
            await organizationPage.clickAddButton();
            expect(await organizationPage.getCountOfInvitedAccounts()).toBe(2);
            await organizationPage.sendInvitation();

            // const response = await Promise.all([
            //     organizationPage.getOrganizationInviteResponse()
            // ]);
            // console.log(response);
            // console.log(response[0].status);

            await organizationPage.clickOnPendingRequestsTab();
            await organizationPage.validateUserIsInvitedAndListedInPendingRequests(adminEmail);
            await organizationPage.validateUserIsInvitedAndListedInPendingRequests(memberEmail);

            // await pm.onProjectPage.clickOnDashboardMenu();
            // await pm.onDashboardPage.clickOnSignOutButton();

            // for (const { token, email, isAdmin } of [
            //     { token: firstToken, email: adminEmail, isAdmin: true },
            //     { token: secondToken, email: memberEmail, isAdmin: false },
            // ]) {

            //     console.log(`Starting test for ${token} and ${email}`);
            //     const signupTab = await completeUserSignupFlow({ request, context, token, userDetails, password: userDetails.password });
            //     const verificationTab = await completeEmailVerificationAndLogin({ request, context, token, password: userDetails.password });
            //     const { newUserDashboard } = await setupDashboardAfterLogin(verificationTab, projectName.length, 1);
            //     //await validate2DOrthomosaicIsSelected(verificationTab);
            //     const workspaceNavPM = new PageManager(verificationTab);
            //     await workspaceNavPM.onProjectSidebarPage.clickOnWorkspace();

            //     if (isAdmin) {
            //         await validateAdminUI({ tab: verificationTab, email, organizationName, projectCount: 3, helper });
            //     } else {
            //         const isOrganizationSideBarVisible = await newUserDashboard.isOrganizationSideBarVisible();
            //         expect(isOrganizationSideBarVisible).toBe(false);
            //     }
            //     await signoutAndCloseTabs(verificationTab, signupTab, newUserDashboard);
            // }
            await deleteToken(request, firstToken);
            await deleteToken(request, secondToken);
        });

        test('should invite member and admin having different number of projects', async ({ request, context }) => {
            const organizationPage = pm.onOrganizationPage;
            const firstToken = await createTokenAndGetUuid(request);
            const secondToken = await createTokenAndGetUuid(request);

            const memberEmail = `${firstToken}@${process.env.EMAIL_HOOK_URL}`;
            const adminEmail = `${secondToken}@${process.env.EMAIL_HOOK_URL}`;

            await setupInvitation(organizationPage, projectName, UI_META.organizationPage.role.admin);

            await organizationPage.enterEmail(adminEmail);
            await organizationPage.clickAddButton();

            // await organizationPage.clickOnXButton();
            await organizationPage.clickOnSelectProjects();

            for (let i = 0; i < projectName.length - 1; i++) {
                await organizationPage.selectProject(projectName[i]);
            }

            await organizationPage.selectRole(UI_META.organizationPage.role.member.projectMember);
            await organizationPage.enterEmail(memberEmail);
            await organizationPage.clickAddButton();
            expect(await organizationPage.getCountOfInvitedAccounts()).toBe(2);
            const response = await organizationPage.sendInvitationAndGetResponse();
            // console.log(response);
            console.log(response[0].status);
            expect(response[0].status).toBe('pending');

            await organizationPage.clickOnPendingRequestsTab();
            await organizationPage.validateUserIsInvitedAndListedInPendingRequests(adminEmail);
            await organizationPage.validateUserIsInvitedAndListedInPendingRequests(memberEmail);

            // await pm.onProjectPage.clickOnDashboardMenu();
            // await pm.onDashboardPage.clickOnSignOutButton();

            // for (const { token, email, isAdmin, projectCount } of [
            //     { token: firstToken, email: memberEmail, isAdmin: false, projectCount: 2 },
            //     { token: secondToken, email: adminEmail, isAdmin: true, projectCount: 3 },
            // ]) {
            //     console.log(`Starting test for ${token} and ${email}`);
            //     const signupTab = await completeUserSignupFlow({ request, context, token, userDetails, password: userDetails.password });
            //     const verificationTab = await completeEmailVerification({ request, context, token, password: userDetails.password });
            //     const { newUserDashboard } = await setupDashboardAfterLogin(verificationTab, projectCount, 1);
            //     // await validate2DOrthomosaicIsSelected(verificationTab);

            //     const workspaceNavPM = new PageManager(verificationTab);
            //     await workspaceNavPM.onProjectSidebarPage.clickOnWorkspace();

            //     if (isAdmin) {
            //         await validateAdminUI({ tab: verificationTab, email, organizationName, projectCount: 3, helper });
            //     } else {
            //         const isOrganizationSideBarVisible = await newUserDashboard.isOrganizationSideBarVisible();
            //         expect(isOrganizationSideBarVisible).toBe(false);
            //     }
            //     await signoutAndCloseTabs(verificationTab, signupTab, newUserDashboard);
            // }
            await deleteToken(request, firstToken);
            await deleteToken(request, secondToken);
        });

        test('should invite two member having different number of projects and validate the project count', async ({ request, context }) => {

            const organizationPage = pm.onOrganizationPage;
            const firstToken = await createTokenAndGetUuid(request);
            const secondToken = await createTokenAndGetUuid(request);

            const memberEmail1 = `${firstToken}@${process.env.EMAIL_HOOK_URL}`;
            const memberEmail2 = `${secondToken}@${process.env.EMAIL_HOOK_URL}`;

            await setupInvitation(organizationPage, projectName, UI_META.organizationPage.role.member.projectMember);

            await organizationPage.enterEmail(memberEmail2);
            await organizationPage.clickAddButton();

            // await organizationPage.clickOnXButton();
            await organizationPage.clickOnSelectProjects();

            for (let i = 0; i < projectName.length - 1; i++) {
                await organizationPage.selectProject(projectName[i]);
            }

            await organizationPage.selectRole(UI_META.organizationPage.role.member.projectMember);
            await organizationPage.enterEmail(memberEmail1);
            await organizationPage.clickAddButton();
            expect(await organizationPage.getCountOfInvitedAccounts()).toBe(2);
            const response = await organizationPage.sendInvitationAndGetResponse();
            // console.log(response);
            console.log(response[0].status);
            expect(response[0].status).toBe('pending');

            await helper.waitForNumberOfSeconds(1);
            await organizationPage.clickOnPendingRequestsTab();
            await organizationPage.searchByValueAndValidateResultInPendingRequests(memberEmail2);
            await organizationPage.searchByValueAndValidateResultInPendingRequests(memberEmail1);

            // await pm.onProjectPage.clickOnDashboardMenu();
            // await pm.onDashboardPage.clickOnSignOutButton();

            // for (const { token, email, isAdmin, projectCount } of [
            //     { token: firstToken, email: memberEmail1, isAdmin: false, projectCount: 2 },
            //     { token: secondToken, email: memberEmail2, isAdmin: false, projectCount: 3 },
            // ]) {

            //     console.log(`Starting test for ${token} and ${email}`);
            //     const signupTab = await completeUserSignupFlow({ request, context, token, userDetails, password: userDetails.password });
            //     const verificationTab = await completeEmailVerificationAndLogin({ request, context, token, password: userDetails.password });
            //     const { newUserDashboard } = await setupDashboardAfterLogin(verificationTab, projectCount, 1);
            //     //await validate2DOrthomosaicIsSelected(verificationTab);
            //     const workspaceNavPM = new PageManager(verificationTab);
            //     await workspaceNavPM.onProjectSidebarPage.clickOnWorkspace();

            //     if (isAdmin) {
            //         await validateAdminUI({ tab: verificationTab, email, organizationName, projectCount, helper });
            //     } else {
            //         const isOrganizationSideBarVisible = await newUserDashboard.isOrganizationSideBarVisible();
            //         expect(isOrganizationSideBarVisible).toBe(false);
            //     }
            //     await signoutAndCloseTabs(verificationTab, signupTab, newUserDashboard);
            // }
            await deleteToken(request, firstToken);
            await deleteToken(request, secondToken);
        });

        test('should display error if the API returns 400 or 500 status code after clicking Pending Requests tab', async ({ }) => {
            const organizationPage = pm.onOrganizationPage;
            const pendingAccountData = {
                "data": [
                    {
                        "id": 215,
                        "organizationId": 7,
                        "userId": 1654,
                        "avatar": null,
                        "avatarThumbnail": null,
                        "lastName": "WelchWelchWelchWelchWelchWelchWelchWelchWelchWelchWelchWelchWelchWelchWelchWelchWelchWelchWelchWelchWelchWelchWelchWelchWelchWelchWelchWelchWelchWelch",
                        "firstName": "TrishaTrishaTrishaTrishaTrishaTrishaTrishaTrishaTrishaTrishaTrishaTrisha TrishaTrishaTrishaTrishaTrishaTrisha",
                        "email": "4a78fc02-18f7-4d51-b42e-a69b9d115sfsafsf6a6@emailhook.site",
                        "role": "member",
                        "accountType": null,
                        "team": null,
                        "createdAt": "2025-07-07T22:25:47.358+09:00",
                        "updatedAt": "2025-07-07T22:25:47.358+09:00",
                        "status": "pending"
                    }
                ]
            };

            await pm.getPage.route('**/v2/organizations/*/organization_users?status=pending', async (route) => {
                await route.fulfill({ body: JSON.stringify(pendingAccountData) });
            });
            await organizationPage.clickOnPendingRequestsTab();
        });

        test.fixme('should display error if the API returns 500 status code after clicking Pending Requests tab', async ({ }) => {
            const organizationPage = pm.onOrganizationPage;

            await pm.getPage.route('**/v2/organizations/*/organization_users?status=pending', async route => {
                console.log('Mocked 500 error for pending requests API');
                await route.fulfill({
                    status: 500,
                    contentType: 'application/json',
                    body: JSON.stringify({ message: 'Internal Server Error' }),
                });
            });
            await organizationPage.clickOnPendingRequestsTab();
        });

        test.describe('email domain list', () => {

            test('should display correct account type as per email domain configuration of organization in case of single email invitation', async ({ request, context }) => {

                const emails = [`suraj.anand+${faker.number.int()}@angelswing.io`, `suraj.anand+${faker.number.int()}@emailhook.site`, `${faker.internet.email()}`];
                const organizationPage = pm.onOrganizationPage;

                for (const email of emails) {
                    userDetails.email = email;
                    await setupInvitation(organizationPage, [projectName[0]], UI_META.organizationPage.role.admin);
                    await organizationPage.enterEmail(userDetails.email);
                    await organizationPage.clickAddButton();
                    expect(await organizationPage.getCountOfInvitedAccounts()).toBe(1);
                    await organizationPage.sendInvitation();
                    await organizationPage.validateUserIsNotListedInAccounts(userDetails.email);

                    await organizationPage.clickOnPendingRequestsTab();
                    await organizationPage.validateUserIsInvitedAndListedInPendingRequests(userDetails.email);

                    const accountType = await organizationPage.getAccountTypeCellText();
                    if (userDetails.email.includes(emailDomain[0]) || userDetails.email.includes(emailDomain[1])) {
                        expect.soft(capitalizeFirstLetter(accountType ?? '')).toBe(UI_META.organizationPage.accountType.employee);
                    } else {
                        expect.soft(capitalizeFirstLetter(accountType ?? '')).toBe(UI_META.organizationPage.accountType.managedExternal);
                    }
                }
            });

            test('should display correct account type as per email domain configuration of organization in case of multiple emails invitation', async ({ request, context }) => {
                const emailDomain = [
                    "angelswing.io",
                    "emailhook.site"
                ];

                const email1 = `suraj.anand+${faker.number.int()}@angelswing.io`;
                const email2 = `${token}@${process.env.EMAIL_HOOK_URL}`;
                const email3 = `${faker.internet.email()}`;
                const multipleEmails = `${email1}, ${email2}, ${email3}`;

                const organizationPage = pm.onOrganizationPage;
                await setupInvitation(organizationPage, [projectName[0]], UI_META.organizationPage.role.admin);
                await organizationPage.enterEmail(multipleEmails);
                await organizationPage.clickAddButton();
                expect(await organizationPage.getCountOfInvitedAccounts()).toBe(3);
                await organizationPage.sendInvitation();

                const multipleEmailsArray = [email1, email2, email3];
                for (const email of multipleEmailsArray) {

                    await organizationPage.validateUserIsNotListedInAccounts(email);

                    await organizationPage.clickOnPendingRequestsTab();
                    await organizationPage.validateUserIsInvitedAndListedInPendingRequests(email);

                    const accountType = await organizationPage.getAccountTypeCellText();
                    if (email.includes(emailDomain[0]) || email.includes(emailDomain[1])) {
                        expect.soft(capitalizeFirstLetter(accountType ?? '')).toBe(UI_META.organizationPage.accountType.employee);
                    } else {
                        expect.soft(capitalizeFirstLetter(accountType ?? '')).toBe(UI_META.organizationPage.accountType.managedExternal);
                    }
                    await organizationPage.clickOnAccountsTab();
                }
            });

            test('should assign employee role regardless of case differences in email domain', async ({ }) => {
                // Precondition: backend has domain list containing mixed case domain, e.g., "Angelswing.IO"
                const testEmail = `suraj.anand+${faker.number.int()}@angelswing.io`;

                const organizationPage = pm.onOrganizationPage;
                await setupInvitation(organizationPage, [projectName[0]], UI_META.organizationPage.role.admin);

                await organizationPage.enterEmail(testEmail);
                await organizationPage.clickAddButton();
                expect(await organizationPage.getCountOfInvitedAccounts()).toBe(1);
                await organizationPage.sendInvitation();

                await organizationPage.clickOnPendingRequestsTab();
                await organizationPage.validateUserIsInvitedAndListedInPendingRequests(testEmail);

                const accountType = await organizationPage.getAccountTypeCellText();
                expect(capitalizeFirstLetter(accountType ?? '')).toBe(UI_META.organizationPage.accountType.employee);
            });

            test('should handle empty or whitespace email domain list gracefully during invitation', async ({ }) => {

                // Precondition: backend has domain list containing mixed case domain, e.g., "Angelswing.IO    "
                const testEmail = `suraj.anand+${faker.number.int()}@angelswing.io`;

                const organizationPage = pm.onOrganizationPage;
                await setupInvitation(organizationPage, [projectName[0]], UI_META.organizationPage.role.admin);

                await organizationPage.enterEmail(testEmail);
                await organizationPage.clickAddButton();
                expect(await organizationPage.getCountOfInvitedAccounts()).toBe(1);
                await organizationPage.sendInvitation();

                await organizationPage.clickOnPendingRequestsTab();
                await organizationPage.validateUserIsInvitedAndListedInPendingRequests(testEmail);

                const accountType = await organizationPage.getAccountTypeCellText();
                expect(capitalizeFirstLetter(accountType ?? '')).toBe(UI_META.organizationPage.accountType.employee);
            });

            test('should assign roles correctly for subdomains and substring domains', async ({ }) => {

                const emails = [
                    `suraj.anand+${faker.number.int()}@mail.angelswing.io`,
                    `suraj.anand+${faker.number.int()}@notangelswing.io`,
                ];

                const organizationPage = pm.onOrganizationPage;

                for (const email of emails) {
                    await setupInvitation(organizationPage, [projectName[0]], UI_META.organizationPage.role.admin);
                    await organizationPage.enterEmail(email);
                    await organizationPage.clickAddButton();
                    expect(await organizationPage.getCountOfInvitedAccounts()).toBe(1);
                    await organizationPage.sendInvitation();

                    await organizationPage.clickOnPendingRequestsTab();
                    await organizationPage.validateUserIsInvitedAndListedInPendingRequests(email);

                    const accountType = await organizationPage.getAccountTypeCellText();

                    if (email === emailDomain[0] || email === emailDomain[1]) {
                        expect.soft(capitalizeFirstLetter(accountType ?? '')).toBe(UI_META.organizationPage.accountType.employee);
                    } else {
                        expect.soft(capitalizeFirstLetter(accountType ?? '')).toBe(UI_META.organizationPage.accountType.managedExternal);
                    }

                    await organizationPage.clickOnAccountsTab();
                }
            });

        });
        test('Should clear email input after clicking Add', async () => {
            const organizationPage = pm.onOrganizationPage;
            const testEmail = faker.internet.email();

            await setupInvitation(organizationPage, [projectName[0]], UI_META.organizationPage.role.member.projectMember);
            expect(await organizationPage.getEmailInputValue()).toBe('');
            await organizationPage.enterEmail(testEmail);
            expect(await organizationPage.getEmailInputValue()).toBe(testEmail);
            await organizationPage.clickAddButton();
            expect(await organizationPage.getEmailInputValue()).toBe('');
        });

        test('should clear from and close the dialog after clicking Cancel button', async ({ }) => {
            const organizationPage = pm.onOrganizationPage;
            await setupInvitation(organizationPage, [projectName[0]], UI_META.organizationPage.role.admin);
            await organizationPage.enterEmail(userDetails.email);
            await organizationPage.clickAddButton();
            expect(await organizationPage.getCountOfInvitedAccounts()).toBe(1);

            await organizationPage.clickOnCancelButton();
            await organizationPage.clickOnInviteButton();
            expect(await organizationPage.getInvitationPageHeader()).toBe(UI_META.organizationPage.popupHeader.invitation);
            expect(await organizationPage.getEmailInputValue()).toBe('');
            expect(await organizationPage.getCountOfInvitedAccounts()).toBe(0);
            expect(await organizationPage.getEmailInputValue()).toBe('');
        });

        test('should allow sequential add actions and accumulate emails', async ({ }) => {
            const organizationPage = pm.onOrganizationPage;
            await setupInvitation(organizationPage, [projectName[0]], UI_META.organizationPage.role.member.projectMember);
            await organizationPage.enterEmail(faker.internet.email());
            await organizationPage.clickAddButton();
            expect(await organizationPage.getCountOfInvitedAccounts()).toBe(1);

            await organizationPage.clickOnSelectProjects();
            await organizationPage.selectProject(projectName[0]);
            await organizationPage.selectRole(UI_META.organizationPage.role.member.projectPilot);

            await organizationPage.enterEmail(faker.internet.email());
            await organizationPage.clickAddButton();
            expect(await organizationPage.getCountOfInvitedAccounts()).toBe(2);

            await organizationPage.clickOnSelectProjects();
            await organizationPage.selectProject(projectName[0]);
            await organizationPage.selectRole(UI_META.organizationPage.role.member.projectViewer);

            await organizationPage.enterEmail(faker.internet.email());
            await organizationPage.clickAddButton();
            expect(await organizationPage.getCountOfInvitedAccounts()).toBe(3);
        });

        test('should remove user from organization', async ({ }) => {
            const email = 'be0e7695-a2e7-4314-8435-c1de10f6bfd1@emailhook.site';
            const organizationPage = pm.onOrganizationPage;
            await organizationPage.clickOnAccountsTab();
            await organizationPage.removeFromOrganization(email);
            await organizationPage.searchByValueAndValidateResult(email);
        });

        test('should bulk remove users from organization', async ({ }) => {
            const organizationPage = pm.onOrganizationPage;
            await organizationPage.clickOnAccountsTab();
            const multipleEmails = ['6dfaeae8-ec20-4fb3-9bd5-c8744cc48ffe@emailhook.site', 'bhola.thapa@angelswing.io'];
            await organizationPage.bulkRemoveFromOrganization(multipleEmails);
            await organizationPage.searchByValueAndValidateResult(multipleEmails[0]);
            await organizationPage.searchByValueAndValidateResult(multipleEmails[1]);
        });

        test.fixme('should display info message in the organization project page if there is no projects in the organization', async ({ }) => {
            await pm.onDashboardPage.clickOnOrganizationProject(organizationName);
        });

        async function createTestTokens(request: any, count: number = 1): Promise<string[]> {
            const tokens: string[] = [];
            for (let i = 0; i < count; i++) {
                const token = await createTokenAndGetUuid(request);
                tokens.push(token);
            }
            return tokens;
        }

        async function cleanupTestTokens(request: any, tokens: string[], helper: HelperBase) {
            for (const token of tokens) {
                await helper.waitForNumberOfSeconds(1.5);
                await deleteToken(request, token);
            }
        }

        function generateTestEmails(tokens: string[]): string[] {
            return tokens.map(token => `${token}@${process.env.EMAIL_HOOK_URL}`);
        }
        test.skip('Should prevent invite when emails exceed allowed count', async ({ request }) => {
            const organizationPage = pm.onOrganizationPage;
            const projectName = 'GLOBAL - QA AWS';
            const maxAllowedEmails = 5;


            const tokens = await createTestTokens(request, maxAllowedEmails);
            const emails = generateTestEmails(tokens);
            const emailString = emails.join(',');
            await organizationPage.clickOnAccountsTab();
            await organizationPage.clickOnInviteButton();
            expect(await organizationPage.getInvitationPageHeader()).toBe(UI_META.organizationPage.popupHeader.invitation);

            await organizationPage.clickOnSelectProjects();
            await organizationPage.selectProject(projectName);
            await organizationPage.selectRole(UI_META.organizationPage.role.member.projectMember);

            await organizationPage.enterEmail(emailString);
            await organizationPage.clickAddButton();

            const countOfInvitedAccounts = await organizationPage.getCountOfInvitedAccounts();
            console.log(countOfInvitedAccounts);
            expect(countOfInvitedAccounts).toBe(maxAllowedEmails);

            await organizationPage.sendInvitation();

            await helper.waitForNumberOfSeconds(30);
            for (const token of tokens) {
                console.log(`checking for ${token} in the inbox`);
                const signupLink = await waitForEmailAndExtractLink(request, token, 'signup');
                expect(signupLink).toContain('signup');
            }
            await cleanupTestTokens(request, tokens, helper);
        });
    });
});
