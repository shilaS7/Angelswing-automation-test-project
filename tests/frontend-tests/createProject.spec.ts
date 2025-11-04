import { faker } from '@faker-js/faker';
import { HelperBase } from '../../pages/HelperBase';
import { PageManager } from '../../pages/PageManager';
import { test, expect } from '../../test-options';

test.describe('Project Page Test', () => {
    let pm: PageManager;
    let helper: HelperBase;

    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email: string = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${process.env.EMAIL_DOMAIN}`;

    test.beforeEach(async ({ page }) => {
        pm = new PageManager(page);
        helper = new HelperBase(pm.getPage);
        await pm.onLoginPage.openLoginPage();
        await pm.onDashboardPage.closeReadUserGuidePopUp();
        await pm.onDashboardPage.clickOnProjectMenu();
        await pm.onProjectPage.isAddProjectButtonVisible();


    });

    test('should open create project settings page', async () => {

        await pm.onProjectPage.clickOnNewProjectButton();

        const createProjectPage = pm.onCreateProjectPage;
        expect(await createProjectPage.getHeaderText()).toBe('Create a new project');
        // await pm.onCreateProjectPage.clickOnProjectLink();
        // expect(await pm.onProjectPage.getHeaderText()).toBe('Projects');

        const projectTitle = faker.lorem.word();
        const projectDescription = faker.lorem.sentence();

        await createProjectPage.enterProjectTitle(projectTitle);
        await createProjectPage.enterProjectDescription(projectDescription);

        expect(await createProjectPage.checkIfNextButtonIsEnabled()).toBeTruthy();
        await createProjectPage.clickOnNextButton();

        const coordinateSystemPage = 'Korea2000/Central Belt 2010 - EPSG:5186';
        const unitSystemPage = 'Metric Units';

        await createProjectPage.selectCoordinateSystem(coordinateSystemPage);
        await createProjectPage.selectUnitSystem(unitSystemPage);
        expect(await createProjectPage.checkIfNextButtonIsEnabled()).toBeTruthy();

        await createProjectPage.clickOnNextButton();

        const role = 'Pilot';
        await createProjectPage.selectRole(role);

        await createProjectPage.enterEmailAddress(email);
        expect(await createProjectPage.checkIfAddButtonIsEnabled()).toBeTruthy();
        await createProjectPage.clickOnAddButton();







    });
});
