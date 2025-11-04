import { faker } from '@faker-js/faker';
import { HelperBase } from '../../pages/HelperBase';
import { PageManager } from '../../pages/PageManager';
import { test, expect } from '../../test-options';
import { Message } from 'mailosaur/lib/models';
import MailosaurService from '../../services/mailosaur.request';
import { countries, purpose } from '../../test-data/signup-test-data';
import { MESSAGE } from '../../utils/message';
import { BrowserContext, Page } from '@playwright/test';
import { UI_META } from '../../utils/uiMeta';

const yesterday = new Date(Date.now() - 48 * 60 * 60 * 1000);

let randomPurpose = purpose[Math.floor(Math.random() * purpose.length)];
let randomCountry = countries[Math.floor(Math.random() * countries.length)];

test.describe('My Projects Page Test', () => {
    let context: BrowserContext;
    let page: Page;
    let pm: PageManager;
    let helper: HelperBase;

    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email: string = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${process.env.EMAIL_DOMAIN}`;

    const userDetails = {
        email,
        password: 'Test@12345',
        firstName,
        lastName,
        phone: faker.phone.number({ style: 'international' }),
        organization: faker.company.name(),
        country: randomCountry,
        purpose: randomPurpose,
        language: 'English',
    };

    async function verifyEmail(email: string) {
        const mailosaurService = new MailosaurService(
            process.env.MAILOSAUR_API_KEY || '',
            process.env.MAILOSAUR_SERVER_ID || ''
        );

        const message: Message = await mailosaurService.getEmail(email, yesterday);

        await mailosaurService.validateSenderNameAndEmail(message, 'ANGELSWING', 'no-reply@angelswing.io');
        await mailosaurService.validateEmailId(message, email);
        await mailosaurService.validateEmailFooter(message, 'Angelswing Inc.');
        await mailosaurService.validateEmailSupportContact(message, 'support@angelswing.io');

        return await mailosaurService.extractVerificationLink(message);
    }

    test.beforeAll(async ({ browser }, testInfo) => {
        context = await browser.newContext();
        page = await context.newPage();
        pm = new PageManager(page);
        helper = new HelperBase(page);
        await pm.onLoginPage.openLoginPageAndWaitForPageToLoad();
        await helper.waitForNumberOfSeconds(1);
        await helper.closeReadUserGuidePopUp(pm, testInfo);
    });

    test.afterAll(async () => {
        await context.close();
    });

    test.beforeEach(async ({ }, testInfo) => {
        if (await helper.isSmartDevice(testInfo)) {
            await pm.onDashboardPage.clickOnProjectMenu();
            expect(await pm.onProjectPage.isAddProjectButtonVisible()).toBe(true);
            await pm.onDashboardPage.collapseSidebar();
        } else {
            await pm.onDashboardPage.clickOnProjectMenu();
            expect(await pm.onProjectPage.isAddProjectButtonVisible()).toBe(true);
        }
    });

    test.afterEach(async ({ }, testInfo) => {
        const shouldSkip =
            testInfo.title.includes('[skip-after-each]');
        if (shouldSkip) {
            console.log(`Skipping afterEach for: ${testInfo.title} in project: ${testInfo.project.name}`);
            return;
        }

        if (await helper.isSmartDevice(testInfo)) {
            await pm.onDashboardPage.expandSidebar();
        }
    });

    test('should validate header of the my projects page', async () => {
        expect(await pm.onProjectPage.getHeaderText()).toBe(UI_META.myProjects.header);
    });

    test('should navigate user to the New Project page after clicking on the New Project button', async () => {
        await pm.onProjectPage.clickOnNewProjectButton();
        await expect(pm.getPage).toHaveURL(UI_META.newProjectPage.url);
    });

    test('Should open the project by clicking on the project card', async ({ }, testInfo) => {
        await pm.onDashboardPage.openProject();
        await pm.onDashboardPage.validateURL(UI_META.projectWorkspace.url);
        await pm.onProjectSidebarPage.clickOnWorkspace();

    });

    test('Should open the setting of the project by clicking on three dot menu', async () => {
        await pm.onProjectPage.clickOnThreeDotsMenuOfProject();
        await pm.onProjectPage.clickOnProjectSettings();
        await expect(pm.getPage).toHaveURL(UI_META.projectSettings.url);
        await pm.onCreateProjectPage.clickOnProjectLink();
    });


    test('should validate header, New Project button, and project click and project setting on my project page after collapsing the sidebar [skip-after-each]', async ({ }, testInfo) => {
        if (!await helper.isSmartDevice(testInfo)) {
            await pm.onDashboardPage.collapseSidebar();
        }
        expect(await pm.onProjectPage.getHeaderText()).toBe(UI_META.myProjects.header);
        await pm.onProjectPage.clickOnNewProjectButton();
        await expect(pm.getPage).toHaveURL(UI_META.newProjectPage.url);

        await pm.onCreateProjectPage.clickOnProjectLink();

        await pm.onProjectPage.clickOnThreeDotsMenuOfProject();
        await pm.onProjectPage.clickOnProjectSettings();
        await expect(pm.getPage).toHaveURL(UI_META.projectSettings.url);
        await pm.onCreateProjectPage.clickOnProjectLink();

        await pm.onDashboardPage.openProject();
        await pm.onDashboardPage.validateURL(UI_META.projectWorkspace.url);
    });
});
