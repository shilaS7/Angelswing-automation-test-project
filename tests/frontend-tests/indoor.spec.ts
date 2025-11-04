import { BrowserContext, Page } from '@playwright/test';
import { HelperBase } from '../../pages/HelperBase';
import { PageManager } from '../../pages/PageManager';
import { test, expect } from '../../test-options';
import { faker } from '@faker-js/faker';
import { IndoorPage } from '../../pages/IndoorPage';


test.use({
    launchOptions: {
        slowMo: 1000,
    },
    // viewport: { width: 1920, height: 1080 },
});

async function validateSuccessMessageAndCloseToaster(onIndoorPage: IndoorPage, successMessage: string) {
    await expect(onIndoorPage.successMessageText()).toHaveText(successMessage);
    await onIndoorPage.closeSuccessMessageToast();
}

async function waitForLoading3DAnd360PhotoToComplete(onIndoorPage: IndoorPage) {
    await onIndoorPage.waitForLoading3DToComplete();
    await onIndoorPage.waitForLoading360PhotoToComplete();
    await expect(onIndoorPage.threeSixtyMiniMap()).toBeVisible();
}

async function createFloorAndSaveIt(onIndoorPage: IndoorPage, floorName: string, floorPlan: string = 'QA DWG 1', referenceAltitude: string = '100') {
    await onIndoorPage.clickOnNewFloor();
    await expect(onIndoorPage.floorPopupHeader()).toHaveText('Create New Floor');
    expect(await onIndoorPage.checkStateOfSaveButton()).toBeFalsy();
    await onIndoorPage.enterFloorName(floorName);
    await onIndoorPage.selectFloorPlan(floorPlan);
    expect(await onIndoorPage.checkStateOfSaveButton()).toBeTruthy();
    await onIndoorPage.enterReferenceAltitude(referenceAltitude);
    expect(await onIndoorPage.checkStateOfSaveButton()).toBeTruthy();
    await onIndoorPage.clickOnSave();
    await validateSuccessMessageAndCloseToaster(onIndoorPage, 'Floor has been created successfully');
}


async function hoverOverFloorNameAndSelectMoreOptions(onIndoorPage: IndoorPage, floorName: string, functionToCall: () => Promise<void>) {
    await onIndoorPage.hoverOverFloorName(floorName);
    await onIndoorPage.clickOnMoreOptions(floorName);
    await functionToCall();
}

async function setStartAndEndPosition(onIndoorPage: IndoorPage, pm: PageManager, helper: HelperBase) {
    // await onIndoorPage.clickOnSetStartPosition();
    // const boundingBox = await onIndoorPage.getMapBoundingBox();
    // if (!boundingBox) {
    //     console.error('Map element not found or bounding box unavailable.');
    // }
    // const { xStart, yStart } = await onIndoorPage.getStaringPosition(boundingBox, 2);
    // await onIndoorPage.moveMouseToCenter(xStart, yStart);

    // await pm.onMapPage.zoomInMap(200);
    // await helper.waitForNumberOfSeconds(1);
    // await pm.onMapPage.zoomInMap(200);
    // await helper.waitForNumberOfSeconds(1);
    // await pm.onMapPage.zoomInMap(200);
    // await helper.waitForNumberOfSeconds(1);
    // await pm.onMapPage.zoomInMap(200);
    // await onIndoorPage.clickOnMap(xStart, yStart - 10);
    // await helper.waitForNumberOfSeconds(1);


    // await onIndoorPage.clickOnSetEndPosition();
    // await helper.waitForNumberOfSeconds(1);
    // await onIndoorPage.clickOnMap(xStart - 100, yStart - 100);
    // await helper.waitForNumberOfSeconds(1);
    await onIndoorPage.clickOnSave();

    await expect(onIndoorPage.successMessageText()).toBeVisible();
    await validateSuccessMessageAndCloseToaster(onIndoorPage, 'Video has been added successfully');
}

async function selectFirstVideoAndClickOnSave(onIndoorPage: IndoorPage) {
    await onIndoorPage.selectVideoRow(0);
    await onIndoorPage.clickOnNext();
}

test.describe('Indoor Floor Management - Comprehensive Test Suite', () => {
    let pm: PageManager;
    let helper: HelperBase;
    let context: BrowserContext;
    let page: Page;
    let allPassed = true;

    const floorNameWithMultipleVideos = 'Main Building - Second Floor (PA-01)';
    test.beforeAll(async ({ browser }) => {
        context = await browser.newContext();
        page = await context.newPage();

        pm = new PageManager(page);
        helper = new HelperBase(pm.getPage);
        await pm.onLoginPage.openLoginPageAndWaitForPageToLoad();
        await pm.onDashboardPage.closeReadUserGuidePopUp();
        await pm.onDashboardPage.openProject('1613');
        // await helper.waitForNumberOfSeconds(2);
        // expect(await pm.onIndoorPage.indoorTab()).toBeVisible();
        await pm.onProjectSidebarPage.indoorPage();
        await helper.waitForNumberOfSeconds(2);

    });

    test.afterEach(async ({ }, testInfo) => {
        if (testInfo.status !== 'passed') allPassed = false;
    });

    test.afterAll(async () => {
        if (allPassed) {
            await context?.close();
        } else {
            console.warn('Skipping context.close() because at least one test failed.');
        }
    });
    test.describe('Basic UI Display and Indoor Tab', () => {

        test('Should display Indoor Tab', async () => {
            // const onIndoorPage = pm.onIndoorPage;
            console.log('Covered in beforeAll');

        });

        test('Should show Indoor section header when tab is active ', async () => {
            const onIndoorPage = pm.onIndoorPage;
            await helper.waitForNumberOfSeconds(1);
            expect(await onIndoorPage.isIndoorSectionHeaderVisible()).toBe(true);
        });

        test('Should render floor list items with name', async () => {
            const onIndoorPage = pm.onIndoorPage;
            const floorCount = await onIndoorPage.getCountOfFloors();
            if (floorCount > 0) {
                const floorNames = await onIndoorPage.getAllFloorNames();
                expect(floorNames.length).toBeGreaterThan(0);
                floorNames.forEach(name => {
                    expect(name).toBeTruthy();
                });
            }
        });

        test('Should show empty state and New Floor button', async () => {
            const onIndoorPage = pm.onIndoorPage;
            const floorCount = await onIndoorPage.getCountOfFloors();

            if (floorCount === 0) {
                const { emptyStateMessageTitle, emptyStateMessageDescription } = await onIndoorPage.getEmptyStateMessage();
                expect(emptyStateMessageTitle).toBe('No floors yet');
                expect(emptyStateMessageDescription).toBe('Create a new floor to manage indoor.');
            }

            await expect(onIndoorPage.newFloorButton()).toBeVisible();
        });

        test('Should place New Floor button appropriately', async () => {
            const onIndoorPage = pm.onIndoorPage;
            await expect(onIndoorPage.newFloorButton()).toBeVisible();
        });

    });

    test.describe('Floor Creation and Validation', () => {

        test('Should open Create New Floor modal on New Floor click', async () => {
            const onIndoorPage = pm.onIndoorPage;
            await onIndoorPage.clickOnNewFloor();
            await expect(onIndoorPage.floorPopupHeader()).toHaveText('Create New Floor');
            // await expect(onIndoorPage.floorNameInput()).toBeFocused();
            await onIndoorPage.clickOnCancel();
        });

        test('Should enable Save only when required fields are valid', async () => {
            const onIndoorPage = pm.onIndoorPage;
            await onIndoorPage.clickOnNewFloor();

            expect(await onIndoorPage.checkStateOfSaveButton()).toBe(false);

            await onIndoorPage.enterFloorName(faker.word.noun());
            expect(await onIndoorPage.checkStateOfSaveButton()).toBe(false);

            await onIndoorPage.selectFloorPlan('QA DWG 1');
            expect(await onIndoorPage.checkStateOfSaveButton()).toBe(true);

            await onIndoorPage.enterReferenceAltitude('100');
            expect(await onIndoorPage.checkStateOfSaveButton()).toBe(true);

            await onIndoorPage.clickOnCancel();
        });

    });

    test.describe('Floor Plan Selection and Reference Altitude Validation', () => {

        test.fixme('Should list only valid floor-plan assets in dropdown with search/preview', async () => {
            const onIndoorPage = pm.onIndoorPage;
            // find the logic to implement this test

        });

        test('Should accept numeric Reference Altitude with locale-aware formatting', async () => {
            const onIndoorPage = pm.onIndoorPage;
            await onIndoorPage.clickOnNewFloor();

            const validValues = ['100', '-100', '1000.5', '-2500.75'];

            for (const value of validValues) {
                await onIndoorPage.enterReferenceAltitude(value);
                await onIndoorPage.pressTabKey();
                expect(await onIndoorPage.isReferenceAltitudeValidationErrorVisible()).toBe(false);
            }

            const invalidValues = ['abc', 'test123', '100abc'];
            for (const value of invalidValues) {
                await onIndoorPage.clearReferenceAltitudeInput();
                await onIndoorPage.enterReferenceAltitude(value);
                const actualValue = await onIndoorPage.getReferenceAltitudeInputValue();
                expect(actualValue === '' || /^-?\d*\.?\d*$/.test(actualValue)).toBe(true);
            }

            await onIndoorPage.clickOnCancel();
        });
    });

    test.describe('Floor Editing and Management', () => {

        test('Should enable Edit Save only after valid changes', async () => {
            const onIndoorPage = pm.onIndoorPage;
            const testFloorName = `EditTest${faker.number.int({ min: 1000, max: 9999 })}`;

            await createFloorAndSaveIt(onIndoorPage, testFloorName);
            await hoverOverFloorNameAndSelectMoreOptions(onIndoorPage, testFloorName, async () => { await onIndoorPage.clickOnEditFloor(); });

            expect(await onIndoorPage.checkStateOfSaveButton()).toBe(false);

            await onIndoorPage.enterFloorName(`${testFloorName}_edited`);
            expect(await onIndoorPage.checkStateOfSaveButton()).toBe(true);

            await onIndoorPage.clickOnSave();
            await validateSuccessMessageAndCloseToaster(onIndoorPage, 'Floor has been edited successfully');
        });

        test('Should keep Floor Plan field read-only in Edit modal', async () => {
            const onIndoorPage = pm.onIndoorPage;
            const floorNames = await onIndoorPage.getAllFloorNames();

            if (floorNames.length > 0) {
                console.log(floorNames);
                await hoverOverFloorNameAndSelectMoreOptions(onIndoorPage, floorNames[0], async () => { await onIndoorPage.clickOnEditFloor(); });

                expect(await onIndoorPage.getFloorPlanState()).toBe(true);
                await onIndoorPage.clickOnCancel();
            }
        });

        test('Should display More menu for each Floor list', async () => {
            const onIndoorPage = pm.onIndoorPage;
            const floorNames = await onIndoorPage.getAllFloorNames();

            if (floorNames.length > 0) {
                for (let i = 0; i < floorNames.length; i++) {
                    const floorName = floorNames[i];
                    await onIndoorPage.hoverOverFloorName(floorName);
                    await expect(onIndoorPage.moreOptionsButton(floorName)).toBeVisible();
                }
            }
        });

        test('Should close Delete modal with Cancel or X without changes', async () => {
            const onIndoorPage = pm.onIndoorPage;
            const testFloorName = `DeleteTest${faker.number.int({ min: 1000, max: 9999 })}`;

            await createFloorAndSaveIt(onIndoorPage, testFloorName);
            const floorCountBefore = await onIndoorPage.getCountOfFloors();
            await hoverOverFloorNameAndSelectMoreOptions(onIndoorPage, testFloorName, async () => { await onIndoorPage.clickOnDeleteFloor(); });
            await onIndoorPage.clickOnCancel();
            const floorCountAfterCancel = await onIndoorPage.getCountOfFloors();
            expect(floorCountAfterCancel).toBe(floorCountBefore);

            await hoverOverFloorNameAndSelectMoreOptions(onIndoorPage, testFloorName, async () => { await onIndoorPage.clickOnDeleteFloor(); });
            await onIndoorPage.clickOnXIcon();
            const floorCountAfterX = await onIndoorPage.getCountOfFloors();
            expect(floorCountAfterX).toBe(floorCountBefore);
        });
    });

    test.describe('Floor Management Success Flows - E2E Tests', () => {

        test.afterEach(async () => {
            await pm.onIndoorPage.clickOnXIcon();
        });

        test('Should create a floor from empty state and see it listed is sorted by created date in descending order', async () => {
            const onIndoorPage = pm.onIndoorPage;
            const floorCount = await onIndoorPage.getCountOfFloors();

            if (floorCount === 0) {
                const { emptyStateMessageTitle, emptyStateMessageDescription } = await onIndoorPage.getEmptyStateMessage();
                expect(emptyStateMessageTitle).toBe('No floors yet');
                expect(emptyStateMessageDescription).toBe('Create a new floor to manage indoor.');
            }

            await expect(onIndoorPage.newFloorButton()).toBeVisible();
            const floorName = `Success${faker.number.int({ min: 1000, max: 9999 })}`;
            const floorCountBefore = await onIndoorPage.getCountOfFloors();
            await createFloorAndSaveIt(onIndoorPage, floorName);
            const floorCountAfter = await onIndoorPage.getCountOfFloors();
            expect(floorCountAfter).toBe(floorCountBefore + 1);

            const floorNames = await onIndoorPage.getAllFloorNames();
            expect(floorNames).toContain(floorName);
        });
        test('should edit a floor and validate the floor is edited', async ({ }) => {
            const onIndoorPage = pm.onIndoorPage;
            const floorName = `EditTest${faker.number.int({ min: 1000, max: 9999 })}`;
            const floorPlan = 'QA DWG 1';
            const referenceAltitude = '100';
            const floorCountBefore = await onIndoorPage.getCountOfFloors();
            await createFloorAndSaveIt(onIndoorPage, floorName, floorPlan, referenceAltitude);

            const floorCountAfter = await onIndoorPage.getCountOfFloors();
            expect(floorCountAfter).toBe(floorCountBefore + 1);

            await hoverOverFloorNameAndSelectMoreOptions(onIndoorPage, floorName, async () => { await onIndoorPage.clickOnEditFloor(); });

            await expect(onIndoorPage.floorPopupHeader()).toHaveText('Edit Floor');
            await expect(onIndoorPage.floorNameInput()).toHaveValue(floorName);
            expect(await onIndoorPage.getFloorPlanState()).toBe(true);
            await expect(onIndoorPage.referenceAltitudeInput()).toHaveValue(referenceAltitude);

            const newFloorName = `new floor ${faker.word.noun() + faker.number.int({ min: 1, max: 1000 })}`;
            const newReferenceAltitude = faker.number.int({ min: 1, max: 1000 }).toString();
            await onIndoorPage.enterFloorName(newFloorName);
            await onIndoorPage.enterReferenceAltitude(newReferenceAltitude);

            await onIndoorPage.clickOnSave();
            await validateSuccessMessageAndCloseToaster(onIndoorPage, 'Floor has been edited successfully');
            const floorCountAfterUpdate = await onIndoorPage.getCountOfFloors();
            expect(floorCountAfterUpdate).toBe(floorCountAfter);


            await hoverOverFloorNameAndSelectMoreOptions(onIndoorPage, newFloorName, async () => { await onIndoorPage.clickOnEditFloor(); });

            await expect(onIndoorPage.floorNameInput()).toHaveValue(newFloorName);
            await expect(onIndoorPage.referenceAltitudeInput()).toHaveValue(newReferenceAltitude);
            await onIndoorPage.clickOnCancel();

        });

        test('should delete a floor and validate the floor is deleted', async ({ }) => {

            const onIndoorPage = pm.onIndoorPage;
            const floorName = `DeleteTest${faker.number.int({ min: 1000, max: 9999 })}`;
            const floorCountBefore = await onIndoorPage.getCountOfFloors();
            await createFloorAndSaveIt(onIndoorPage, floorName);
            const floorCountAfter = await onIndoorPage.getCountOfFloors();
            expect(floorCountAfter).toBe(floorCountBefore + 1);
            await hoverOverFloorNameAndSelectMoreOptions(onIndoorPage, floorName, async () => { await onIndoorPage.clickOnDeleteFloor(); });
            await expect(onIndoorPage.floorPopupHeader()).toHaveText('Delete Floor');
            const { deleteFloorTitle, deleteFloorDescription } = await onIndoorPage.getDeleteFloorTitleAndDescription();
            expect(deleteFloorTitle).toBe(`Are you sure you want to delete ${floorName}?`);
            expect(deleteFloorDescription).toBe('The 360 videos linked to this floor will remain in the photo gallery, even after deletion.');
            await onIndoorPage.clickOnDelete();

            await validateSuccessMessageAndCloseToaster(onIndoorPage, 'Floor has been deleted successfully');

            const floorCountAfterDelete = await onIndoorPage.getCountOfFloors();
            expect(floorCountAfterDelete).toBe(floorCountBefore);

        });

        test('should create, edit and delete a floor and validate the floor is created, edited and deleted @e2e-test', async ({ }) => {
            const onIndoorPage = pm.onIndoorPage;
            const floorName = `CRUDTest${faker.number.int({ min: 1000, max: 9999 })}`;
            const floorPlan = 'QA DWG 1';
            const referenceAltitude = '100';
            const floorCountBefore = await onIndoorPage.getCountOfFloors();
            await createFloorAndSaveIt(onIndoorPage, floorName, floorPlan, referenceAltitude);

            const floorCountAfter = await onIndoorPage.getCountOfFloors();
            expect(floorCountAfter).toBe(floorCountBefore + 1);

            await hoverOverFloorNameAndSelectMoreOptions(onIndoorPage, floorName, async () => { await onIndoorPage.clickOnEditFloor(); });

            await expect(onIndoorPage.floorPopupHeader()).toHaveText('Edit Floor');
            await expect(onIndoorPage.floorNameInput()).toHaveValue(floorName);
            expect(await onIndoorPage.getFloorPlanState()).toBe(true);
            await expect(onIndoorPage.referenceAltitudeInput()).toHaveValue(referenceAltitude);

            const newFloorName = `new floor ${faker.word.noun() + faker.number.int({ min: 1, max: 1000 })}`;
            const newReferenceAltitude = faker.number.int({ min: 1, max: 1000 }).toString();
            await onIndoorPage.enterFloorName(newFloorName);
            await onIndoorPage.enterReferenceAltitude(newReferenceAltitude);

            await onIndoorPage.clickOnSave();
            await helper.waitForNumberOfSeconds(1);
            await validateSuccessMessageAndCloseToaster(onIndoorPage, 'Floor has been edited successfully');
            const floorCountAfterUpdate = await onIndoorPage.getCountOfFloors();
            expect(floorCountAfterUpdate).toBe(floorCountAfter);


            await hoverOverFloorNameAndSelectMoreOptions(onIndoorPage, newFloorName, async () => { await onIndoorPage.clickOnEditFloor(); });

            await expect(onIndoorPage.floorNameInput()).toHaveValue(newFloorName);
            await expect(onIndoorPage.referenceAltitudeInput()).toHaveValue(newReferenceAltitude);
            await onIndoorPage.clickOnCancel();

            await hoverOverFloorNameAndSelectMoreOptions(onIndoorPage, newFloorName, async () => { await onIndoorPage.clickOnDeleteFloor(); });

            expect(await onIndoorPage.floorPopupHeader()).toHaveText('Delete Floor');
            const { deleteFloorTitle, deleteFloorDescription } = await onIndoorPage.getDeleteFloorTitleAndDescription();
            expect(deleteFloorTitle).toBe(`Are you sure you want to delete ${newFloorName}?`);
            expect(deleteFloorDescription).toBe('The 360 videos linked to this floor will remain in the photo gallery, even after deletion.');

            await onIndoorPage.clickOnDelete();
            await validateSuccessMessageAndCloseToaster(onIndoorPage, 'Floor has been deleted successfully');
            const floorCountAfterDelete = await onIndoorPage.getCountOfFloors();
            expect(floorCountAfterDelete).toBe(floorCountBefore);
        });

        test.skip('should delete all floors and validate the floor is deleted', async ({ }) => {

            const onIndoorPage = pm.onIndoorPage;
            const floorNames = await onIndoorPage.getAllFloorNames();
            // console.log(floorNames);

            for (let i = 0; i < floorNames.length; i++) {
                const floorCountBefore = await onIndoorPage.getCountOfFloors();
                const floorName = floorNames[i];

                if (floorName !== floorNameWithMultipleVideos) {
                    console.info(`Deleting floor: ${floorName}`);
                    await hoverOverFloorNameAndSelectMoreOptions(onIndoorPage, floorName, async () => { await onIndoorPage.clickOnDeleteFloor(); });
                    await expect(onIndoorPage.floorPopupHeader()).toHaveText('Delete Floor');
                    const { deleteFloorTitle, deleteFloorDescription } = await onIndoorPage.getDeleteFloorTitleAndDescription();
                    expect(deleteFloorTitle).toBe(`Are you sure you want to delete ${floorName}?`);
                    expect(deleteFloorDescription).toBe('The 360 videos linked to this floor will remain in the photo gallery, even after deletion.');
                    await onIndoorPage.clickOnDelete();

                    await validateSuccessMessageAndCloseToaster(onIndoorPage, 'Floor has been deleted successfully');
                    const floorCountAfterDelete = await onIndoorPage.getCountOfFloors();
                    expect(floorCountAfterDelete).toBe(floorCountBefore - 1);
                }
            }
        });

        test('Should delete a videos from a floor and validate the videos is deleted', async () => {
            const onIndoorPage = pm.onIndoorPage;
            const floorNames = await onIndoorPage.getAllFloorNames();
            if (floorNames.length > 0) {
                await onIndoorPage.hoverOverFloorNameAndClickOnIt(floorNameWithMultipleVideos);
                await waitForLoading3DAnd360PhotoToComplete(onIndoorPage);

                await onIndoorPage.clickOnSelectDate();
                const dateOptions = await onIndoorPage.getDateSelectorOptions();
                expect(dateOptions.length).toBeGreaterThan(0);

                const optionCountBeforeDelete = dateOptions.length;
                await onIndoorPage.clickOnMoreOptionsInSelectDateOption();
                await onIndoorPage.clickOnDeleteVideo();
                await onIndoorPage.clickOnDelete();
                await validateSuccessMessageAndCloseToaster(onIndoorPage, 'Video has been deleted successfully');
                await onIndoorPage.clickOnSelectDate();
                const optionCountAfterDelete = await onIndoorPage.getDateSelectorOptions();
                expect(optionCountAfterDelete.length).toBe(optionCountBeforeDelete - 1);

            }
        });
        test('Should display Add First Video dialog when floor has no videos and open select video modal on clicking add video', async () => {
            const onIndoorPage = pm.onIndoorPage;
            const testFloorName = `EmptyFloor${faker.number.int({ min: 1000, max: 9999 })}`;
            await createFloorAndSaveIt(onIndoorPage, testFloorName);
            await onIndoorPage.hoverOverFloorNameAndClickOnIt(testFloorName);

            await expect(onIndoorPage.floorPopupHeader()).toHaveText('Add First Video');
            await expect(onIndoorPage.addVideoButtonInModal()).toBeVisible();
            await expect(onIndoorPage.cancelButton()).toBeVisible();
            await expect(onIndoorPage.addFirstVideoPopupMessage()).toHaveText('There are no videos linked to this floor yet.Add the first one to start your 360° site documentation.');

            await onIndoorPage.clickOnAddVideoFromModal();
            await expect(onIndoorPage.floorPopupHeader()).toHaveText('Select Video');
            await onIndoorPage.clickOnCancel();
        });

        test('Should switch videos via left/right arrow buttons and disable Left arrow on earliest and Right arrow on latest video in select date dropdown - 86eugj9qt', async () => {
            const onIndoorPage = pm.onIndoorPage;
            const floorNames = await onIndoorPage.getAllFloorNames();

            if (floorNames.length > 0) {
                await onIndoorPage.hoverOverFloorNameAndClickOnIt(floorNameWithMultipleVideos);
                await waitForLoading3DAnd360PhotoToComplete(onIndoorPage);

                for (let i = 0; i < 1; i++) {
                    console.log(`Iteration: ${i + 1}`);

                    while (await onIndoorPage.rightArrow().isEnabled()) {
                        await onIndoorPage.goToNextDay();
                        await onIndoorPage.waitForLoading360PhotoToComplete();

                    }
                    await expect(onIndoorPage.rightArrow()).toBeDisabled();

                    while (await onIndoorPage.leftArrow().isEnabled()) {
                        await onIndoorPage.goToPreviousDay();
                        await onIndoorPage.waitForLoading360PhotoToComplete();

                    }
                    await expect(onIndoorPage.leftArrow()).toBeDisabled();
                }
            }
        });

        test('Should select the video from the dropdown list and show the video in the select date and viewer ', async () => {
            const onIndoorPage = pm.onIndoorPage;
            const floorNames = await onIndoorPage.getAllFloorNames();
            if (floorNames.length > 0) {
                await onIndoorPage.hoverOverFloorNameAndClickOnIt(floorNameWithMultipleVideos);
                await waitForLoading3DAnd360PhotoToComplete(onIndoorPage);
                await onIndoorPage.clickOnSelectDate();
                const options = await onIndoorPage.getDateSelectorOptions();
                expect(options.length).toBeGreaterThan(0);

                console.log(`Starting to select date from dropdown`);

                for (let i = options.length - 1; i >= 0; i--) {
                    console.log(`Selecting date from dropdown: ${options[i]}`);
                    await onIndoorPage.selectDateFromDropdown(options[i]);
                    await onIndoorPage.waitForLoading360PhotoToComplete();
                    const selectDateText = await onIndoorPage.selectDate().textContent();
                    const optionWithoutSuffix = options[i]?.slice(0, options[i]?.length - 3);
                    expect(selectDateText).toContain(optionWithoutSuffix);
                    await onIndoorPage.clickOnSelectDate();
                }
            }
        });

        test.skip('should switch floor and load the latest 360 video successfully while switching floors frequently', async () => {
            const onIndoorPage = pm.onIndoorPage;
            const floorNames = await onIndoorPage.getAllFloorNames();
            if (floorNames.length > 0) {
                for (let i = 0; i < 10; i++) {
                    await onIndoorPage.hoverOverFloorNameAndClickOnIt(floorNameWithMultipleVideos);
                    await waitForLoading3DAnd360PhotoToComplete(onIndoorPage);
                    const sidebar = pm.onProjectSidebarPage;
                    expect(await sidebar.isSidebarCollapsed()).toBeTruthy();
                    await pm.onProjectSidebarPage.expandSidebar();
                    expect(await sidebar.isSidebarExpanded()).toBeTruthy();
                    await onIndoorPage.hoverOverFloorNameAndClickOnIt(floorNames[0]);
                    await waitForLoading3DAnd360PhotoToComplete(onIndoorPage);
                    await pm.onProjectSidebarPage.expandSidebar();
                }
            }
        });

        test('Should delete the only video on a floor and be routed back to Indoor Sidebar', async () => {
            const onIndoorPage = pm.onIndoorPage;
            const floorNames = await onIndoorPage.getAllFloorNames();
            if (floorNames.length > 0) {
                await expect(onIndoorPage.newFloorButton()).toBeVisible();
                const floorName = `Success${faker.number.int({ min: 1000, max: 9999 })}`;
                await createFloorAndSaveIt(onIndoorPage, floorName);

                const videoCountBefore = await onIndoorPage.getVideoCountOfFloor(floorName);
                console.log(`videoCountBefore: ${videoCountBefore}`);
                await hoverOverFloorNameAndSelectMoreOptions(onIndoorPage, floorName, async () => { await onIndoorPage.clickOnAdd360Video(); });
                const videoRows = await onIndoorPage.getVideoRows();
                expect(videoRows).toBeGreaterThan(0);

                await selectFirstVideoAndClickOnSave(onIndoorPage);
                await setStartAndEndPosition(onIndoorPage, pm, helper);

                const videoCountAfter = await onIndoorPage.getVideoCountOfFloor(floorName);
                console.log(`videoCountAfter: ${videoCountAfter}`);
                expect(videoCountAfter).toBe(videoCountBefore + 1);

                await onIndoorPage.hoverOverFloorNameAndClickOnIt(floorName);
                await waitForLoading3DAnd360PhotoToComplete(onIndoorPage);

                await onIndoorPage.clickOnSelectDate();
                const dateOptions = await onIndoorPage.getDateSelectorOptions();
                expect(dateOptions.length).toBeGreaterThan(0);

                await onIndoorPage.clickOnMoreOptionsInSelectDateOption();
                await onIndoorPage.clickOnDeleteVideo();
                await onIndoorPage.clickOnDelete();
                await validateSuccessMessageAndCloseToaster(onIndoorPage, 'Video has been deleted successfully');

                await expect(onIndoorPage.newFloorButton()).toBeVisible();
                const videoCountAfterDelete = await onIndoorPage.getVideoCountOfFloor(floorName);
                console.log(`videoCountAfterDelete: ${videoCountAfterDelete}`);
                expect(videoCountAfterDelete).toBe(videoCountBefore);

            }
        });

        test('Should unlink a video from a floor and then link it to another floor  via Add 360 Video', async () => {
            const onIndoorPage = pm.onIndoorPage;
            const floorNames = await onIndoorPage.getAllFloorNames();
            if (floorNames.length > 0) {
                const floorB = `Main Building - Second Floor (PA-02)`;
                const floorA = floorNameWithMultipleVideos;

                await hoverOverFloorNameAndSelectMoreOptions(onIndoorPage, floorB, async () => { await onIndoorPage.clickOnAdd360Video(); });
                const videoRowsBefore = await onIndoorPage.getVideoRows();
                console.log(`videoRowsBefore: ${videoRowsBefore}`);
                await onIndoorPage.clickOnCancel();

                await onIndoorPage.hoverOverFloorNameAndClickOnIt(floorA);
                await waitForLoading3DAnd360PhotoToComplete(onIndoorPage);

                await onIndoorPage.clickOnSelectDate();
                const dateOptions = await onIndoorPage.getDateSelectorOptions();
                expect(dateOptions.length).toBeGreaterThan(0);

                await onIndoorPage.clickOnMoreOptionsInSelectDateOption();
                await onIndoorPage.clickOnDeleteVideo();
                await onIndoorPage.clickOnDelete();
                await validateSuccessMessageAndCloseToaster(onIndoorPage, 'Video has been deleted successfully');

                await onIndoorPage.clickOnXIcon();

                const videoCountBefore = await onIndoorPage.getVideoCountOfFloor(floorB);
                console.log(`videoCountBefore: ${videoCountBefore}`);
                await hoverOverFloorNameAndSelectMoreOptions(onIndoorPage, floorB, async () => { await onIndoorPage.clickOnAdd360Video(); });
                const videoRowsAfter = await onIndoorPage.getVideoRows();
                console.log(`videoRowsAfter: ${videoRowsAfter}`);
                expect(videoRowsAfter).toBe(videoRowsBefore + 1);

                await selectFirstVideoAndClickOnSave(onIndoorPage);
                await setStartAndEndPosition(onIndoorPage, pm, helper);
                const videoCountAfter = await onIndoorPage.getVideoCountOfFloor(floorB);
                console.log(`videoCountAfter: ${videoCountAfter}`);
                expect(videoCountAfter).toBe(videoCountBefore + 1);
            }
        });

        test('Should display a success message after adding a 360 video to a floor and load the video after clicking on the floor name', async () => {
            const onIndoorPage = pm.onIndoorPage;
            const floorNames = await onIndoorPage.getAllFloorNames();

            if (floorNames.length > 0) {
                const videoCountBefore = await onIndoorPage.getVideoCountOfFloor(floorNameWithMultipleVideos);
                await hoverOverFloorNameAndSelectMoreOptions(onIndoorPage, floorNameWithMultipleVideos, async () => { await onIndoorPage.clickOnAdd360Video(); });
                const videoRows = await onIndoorPage.getVideoRows();
                if (videoRows > 0) {
                    await selectFirstVideoAndClickOnSave(onIndoorPage);
                    await setStartAndEndPosition(onIndoorPage, pm, helper);

                    const videoCountAfter = await onIndoorPage.getVideoCountOfFloor(floorNameWithMultipleVideos);
                    expect(videoCountAfter).toBe(videoCountBefore + 1);

                    await onIndoorPage.hoverOverFloorNameAndClickOnIt(floorNameWithMultipleVideos);
                    await waitForLoading3DAnd360PhotoToComplete(onIndoorPage);
                    expect(await pm.onProjectSidebarPage.isSidebarCollapsed()).toBeTruthy();

                    await expect(onIndoorPage.selectDate()).toBeVisible();
                    const { currentFrame, totalFrames } = await onIndoorPage.getCurrentFrameAndTotalFrames();
                    expect(await onIndoorPage.getCurrentFrameAndTotalFrames()).toBeDefined();
                    console.log(`currentFrame: ${currentFrame}, totalFrames: ${totalFrames}`);
                    await onIndoorPage.clickOnXIcon();
                }
            }
        });

    });

    test.describe('Video Selection and Management', () => {

        test('Should open Select Video modal on Add 360 Video', async () => {
            const onIndoorPage = pm.onIndoorPage;
            const floorNames = await onIndoorPage.getAllFloorNames();

            if (floorNames.length > 0) {
                await hoverOverFloorNameAndSelectMoreOptions(onIndoorPage, floorNames[0], async () => { await onIndoorPage.clickOnAdd360Video(); });
                await expect(onIndoorPage.floorPopupHeader()).toHaveText('Select Video');
                await onIndoorPage.clickOnCancel();
            }
        });

        test('Should display target Floor Name as read-only in Select Video modal', async () => {
            const onIndoorPage = pm.onIndoorPage;
            const floorNames = await onIndoorPage.getAllFloorNames();

            if (floorNames.length > 0) {
                const targetFloor = floorNames[0];
                await hoverOverFloorNameAndSelectMoreOptions(onIndoorPage, targetFloor, async () => { await onIndoorPage.clickOnAdd360Video(); });
                await expect(onIndoorPage.floorNameInputForSelectVideo()).toHaveValue(targetFloor);
                await expect(onIndoorPage.floorNameInputForSelectVideo()).toBeDisabled();

                await onIndoorPage.clickOnCancel();
            }
        });

        test('Should list only eligible 360 videos that are unlinked and have Process Status "Ready to Link"', async () => {
            const onIndoorPage = pm.onIndoorPage;
            const floorNames = await onIndoorPage.getAllFloorNames();

            if (floorNames.length > 0) {
                await hoverOverFloorNameAndSelectMoreOptions(onIndoorPage, floorNames[0], async () => { await onIndoorPage.clickOnAdd360Video(); });
                const videoRows = await onIndoorPage.getVideoRows();
                if (videoRows > 0) {
                    for (let i = 0; i < videoRows; i++) {
                        const { fileName, processStatus, captureDate, uploadDate, uploadedBy } = await onIndoorPage.getVideoMetadata(i);
                        expect(processStatus).toBe('Ready to Link');
                        expect(fileName).toBeDefined();
                        expect(captureDate).toBeDefined();
                        expect(uploadDate).toBeDefined();
                        expect(uploadedBy).toBeDefined();
                        console.log(`${fileName} | ${processStatus} | ${captureDate} | ${uploadDate} | ${uploadedBy}`);
                    }
                }
                await onIndoorPage.clickOnCancel();
            }
        });

        test('should not show the video in the dropdown list after linking a video to the floor', async () => {
            const onIndoorPage = pm.onIndoorPage;
            const floorNames = await onIndoorPage.getAllFloorNames();

            if (floorNames.length > 0) {

                let videoSelectorOptionsBefore: string = '';
                await hoverOverFloorNameAndSelectMoreOptions(onIndoorPage, floorNames[0], async () => { await onIndoorPage.clickOnAdd360Video(); });

                const videoCountBefore = await onIndoorPage.getVideoRows();
                console.log(videoCountBefore);
                if (videoCountBefore > 0) {
                    const { fileName } = await onIndoorPage.getVideoMetadata(0);
                    videoSelectorOptionsBefore = fileName || '';
                    await selectFirstVideoAndClickOnSave(onIndoorPage);
                    await setStartAndEndPosition(onIndoorPage, pm, helper);
                    await hoverOverFloorNameAndSelectMoreOptions(onIndoorPage, floorNames[0], async () => { await onIndoorPage.clickOnAdd360Video(); });
                    await helper.waitForNumberOfSeconds(1);
                    const videoRowsAfter = await onIndoorPage.getVideoRows();
                    expect(videoRowsAfter, 'Video rows should be less by 1').toBe(videoCountBefore - 1);
                    await onIndoorPage.clickOnCancel();

                    // ! Implement this when the video title is implemented
                    // for (let i = 0; i < videoRowsAfter; i++) {
                    //     const { fileName } = await onIndoorPage.getVideoMetadata(i);
                    //     expect(fileName).not.toBe(videoSelectorOptionsBefore);
                    // }

                }
                else {
                    console.error('No videos found');
                    await onIndoorPage.clickOnCancel();
                    return;
                }
            }
        });
    });

    test.describe('Floor Selection and Viewer Behavior', () => {

        test.afterEach(async () => {
            await pm.onIndoorPage.clickOnXIcon();
        });

        // https://app.clickup.com/t/86euje84x
        test('Should auto-collapse left panel after floor selection', async () => {
            const onIndoorPage = pm.onIndoorPage;
            const floorNames = await onIndoorPage.getAllFloorNames();

            if (floorNames.length > 0) {
                await onIndoorPage.hoverOverFloorNameAndClickOnIt(floorNameWithMultipleVideos);
                await waitForLoading3DAnd360PhotoToComplete(onIndoorPage);

                const sidebar = pm.onProjectSidebarPage;
                expect(await sidebar.isSidebarCollapsed()).toBeTruthy();
            }
        });

        test('Should auto-load most recent video on selected floor by capturedAt', async () => {
            const onIndoorPage = pm.onIndoorPage;
            const floorNames = await onIndoorPage.getAllFloorNames();

            if (floorNames.length > 0 && floorNames.includes(floorNameWithMultipleVideos)) {
                await onIndoorPage.hoverOverFloorNameAndClickOnIt(floorNameWithMultipleVideos);
                await onIndoorPage.waitForLoading3DToComplete();
                await onIndoorPage.waitForLoading360PhotoToComplete();

                await onIndoorPage.clickOnDateSelector();
                const options = (await onIndoorPage.getDateSelectorOptions())
                    .map(s => s.trim())
                    .filter(Boolean);

                expect(options.length).toBeGreaterThan(0);
                const latestOption = options.reduce((max, cur) =>
                    (cur.slice(0, 10) > max.slice(0, 10) ? cur : max), options[0]);

                // const oldestOption = options.reduce((min, cur) =>
                //     (cur.slice(0, 10) < min.slice(0, 10) ? cur : min), options[0]);

                const normalizeForButton = (s: string) => s.replace(/\s\(\d+\)\s*$/, '').trim();
                const expectedButtonText = normalizeForButton(latestOption);

                const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                await expect(onIndoorPage.dateSelector())
                    .toHaveText(new RegExp(`^${escapeRe(expectedButtonText)}\\s*$`), { timeout: 5000 });

            } else {
                console.error('Floor name not found');
            }
        });

        test('Should validate the select date dropdown options are sorted by capturedAt in recent at top', async () => {
            const onIndoorPage = pm.onIndoorPage;
            const floorNames = await onIndoorPage.getAllFloorNames();

            if (floorNames.length > 0) {

                for (const floorName of floorNames) {
                    if (floorName === floorNameWithMultipleVideos) {
                        await onIndoorPage.hoverOverFloorNameAndClickOnIt(floorName);
                        await onIndoorPage.waitForLoading3DToComplete();
                        await onIndoorPage.waitForLoading360PhotoToComplete();

                        await onIndoorPage.clickOnDateSelector();
                        const options = await onIndoorPage.getDateSelectorOptions();
                        expect(options.length).toBeGreaterThan(0);
                        const sortedOptions = options.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
                        console.log(options);
                        console.log(sortedOptions);
                        expect(options).toEqual(sortedOptions);
                    }
                }
            }
        });

        test('Should show Add First Video modal for floor with zero videos and close the modal on cancel', async () => {
            const onIndoorPage = pm.onIndoorPage;
            const testFloorName = `EmptyFloor${faker.number.int({ min: 1000, max: 9999 })}`;
            await createFloorAndSaveIt(onIndoorPage, testFloorName);

            await onIndoorPage.hoverOverFloorNameAndClickOnIt(testFloorName);
            await expect(onIndoorPage.addVideoButtonInModal()).toBeVisible();
            await onIndoorPage.clickOnCancel();
        });

        test.skip('Should add all videos in the floor and validate the total frame count is displayed as per the selected video in a floor', async () => {
            const onIndoorPage = pm.onIndoorPage;
            const floorNames = await onIndoorPage.getAllFloorNames();

            if (floorNames.length > 0) {
                await hoverOverFloorNameAndSelectMoreOptions(onIndoorPage, floorNameWithMultipleVideos, async () => { await onIndoorPage.clickOnAdd360Video(); });

                const videoRows = await onIndoorPage.getVideoRows();
                if (videoRows > 0) {
                    for (let i = 0; i < videoRows; i++) {
                        await selectFirstVideoAndClickOnSave(onIndoorPage);
                        await setStartAndEndPosition(onIndoorPage, pm, helper);
                        await onIndoorPage.hoverOverFloorNameAndClickOnIt(floorNameWithMultipleVideos);
                        await waitForLoading3DAnd360PhotoToComplete(onIndoorPage);

                        await expect(onIndoorPage.selectDate()).toBeVisible();
                        const { currentFrame, totalFrames } = await onIndoorPage.getCurrentFrameAndTotalFrames();
                        expect(await onIndoorPage.getCurrentFrameAndTotalFrames()).toBeDefined();
                        expect(currentFrame).toBe('1');
                        console.log(`currentFrame: ${currentFrame}, totalFrames: ${totalFrames}`);
                        await onIndoorPage.clickOnXIcon();
                        await hoverOverFloorNameAndSelectMoreOptions(onIndoorPage, floorNameWithMultipleVideos, async () => { await onIndoorPage.clickOnAdd360Video(); });
                    }
                }
            }
        });
    });

    test.describe('Date Tab and Video Navigation', () => {
        test.afterEach(async () => {
            await pm.onIndoorPage.clickOnXIcon();
        });

        test('Should open Date Tab dropdown showing videos linked to current floor', async () => {
            const onIndoorPage = pm.onIndoorPage;
            const floorNames = await onIndoorPage.getAllFloorNames();

            if (floorNames.length > 0) {
                await onIndoorPage.hoverOverFloorNameAndClickOnIt(floorNameWithMultipleVideos);
                await waitForLoading3DAnd360PhotoToComplete(onIndoorPage);
                await onIndoorPage.clickOnSelectDate();
                const options = await onIndoorPage.getDateSelectorOptions();
                expect(options.length).toBeGreaterThan(0);
            }

        });

        test('Should close dropdown and immediately switch viewer when date chosen', async () => {
            const onIndoorPage = pm.onIndoorPage;
            const floorNames = await onIndoorPage.getAllFloorNames();

            if (floorNames.length > 0) {
                await onIndoorPage.hoverOverFloorNameAndClickOnIt(floorNameWithMultipleVideos);
                await waitForLoading3DAnd360PhotoToComplete(onIndoorPage);
                await onIndoorPage.clickOnSelectDate();
                const options = await onIndoorPage.getDateSelectorOptions();
                expect(options.length).toBeGreaterThan(0);
                await onIndoorPage.selectDateFromDropdown(options[1]);
                await onIndoorPage.waitForLoading360PhotoToComplete();
                await helper.waitForNumberOfSeconds(1);
                await expect(onIndoorPage.dateSelectorOptions()).toBeHidden();
            }
        });

        // TODO: Fix this test or Test it manually
        test.skip('Should maintain camera viewpoint when switching via dropdown', async () => {

        });
        // TODO: Fix this test or Test it manually
        test.skip('Should maintain camera viewpoint when switching via arrows', async () => {
        });

        test('Should disable previous photo, first photo on first frame and next photo , last photo on last frame', async () => {
            const onIndoorPage = pm.onIndoorPage;
            const floorNames = await onIndoorPage.getAllFloorNames();

            if (floorNames.length > 0) {
                await onIndoorPage.hoverOverFloorNameAndClickOnIt(floorNameWithMultipleVideos);
                await waitForLoading3DAnd360PhotoToComplete(onIndoorPage);
                await onIndoorPage.clickOnFourScreen();

                while (await onIndoorPage.nextPhotoButton().isEnabled() && await onIndoorPage.lastPhotoButton().isEnabled()) {
                    await onIndoorPage.goToNextPhoto();
                }
                await expect(onIndoorPage.nextPhotoButton()).toBeDisabled();
                await expect(onIndoorPage.lastPhotoButton()).toBeDisabled();

                while (await onIndoorPage.previousPhotoButton().isEnabled() && await onIndoorPage.firstPhotoButton().isEnabled()) {
                    await onIndoorPage.goToPreviousPhoto();
                }
                await expect(onIndoorPage.previousPhotoButton()).toBeDisabled();
                await expect(onIndoorPage.firstPhotoButton()).toBeDisabled();

                await onIndoorPage.goToLastPhoto();
                await expect(onIndoorPage.lastPhotoButton()).toBeDisabled();
                await expect(onIndoorPage.nextPhotoButton()).toBeDisabled();

                await onIndoorPage.goToFirstPhoto();
                await expect(onIndoorPage.firstPhotoButton()).toBeDisabled();
                await expect(onIndoorPage.previousPhotoButton()).toBeDisabled();
            }
        });

        test('should validate photo navigation buttons and jump to photo', async ({ }) => {
            const onIndoorPage = pm.onIndoorPage;
            const floorName = floorNameWithMultipleVideos;
            await onIndoorPage.hoverOverFloorNameAndClickOnIt(floorName);
            await onIndoorPage.waitForLoading3DToComplete();
            await onIndoorPage.waitForLoading360PhotoToComplete();

            // console.log(await onIndoorPage.getCurrentFrameAndTotalFrames());

            const { totalFrames } = await onIndoorPage.getCurrentFrameAndTotalFrames();

            if (Number(totalFrames) > 10) {

                for (let i = 1; i < 10; i++) {
                    await onIndoorPage.goToNextPhoto();
                    await expect(onIndoorPage.previousPhotoButton()).toBeEnabled();
                    await expect(onIndoorPage.firstPhotoButton()).toBeEnabled();
                    let { currentFrame } = await onIndoorPage.getCurrentFrameAndTotalFrames();
                    // console.log(currentFrame, totalFrames);
                    expect(currentFrame).toBe((i + 1).toString());
                }

                for (let i = 10; i > 1; i--) {
                    await onIndoorPage.goToPreviousPhoto();
                    await expect(onIndoorPage.nextPhotoButton()).toBeEnabled();
                    await expect(onIndoorPage.lastPhotoButton()).toBeEnabled();
                    let { currentFrame } = await onIndoorPage.getCurrentFrameAndTotalFrames();
                    // console.log(currentFrame, totalFrames);
                    expect(currentFrame).toBe((i - 1).toString());
                }

            }

            await onIndoorPage.goToLastPhoto();

            const { currentFrame: currentFrameLast, totalFrames: totalFramesLast } = await onIndoorPage.getCurrentFrameAndTotalFrames();
            expect(currentFrameLast).toBe(totalFrames);
            expect(totalFramesLast).toBe(totalFrames);

            await onIndoorPage.goToFirstPhoto();
            const { currentFrame: currentFrameFirst, totalFrames: totalFramesFirst } = await onIndoorPage.getCurrentFrameAndTotalFrames();
            expect(currentFrameFirst).toBe('1');
            expect(totalFramesFirst).toBe(totalFrames);


            await onIndoorPage.jumpToPhoto();
            await onIndoorPage.enterFrameNumber(10);

            await onIndoorPage.clickOnJumpButton();
            const { currentFrame: currentFrameJump, totalFrames: totalFramesJump } = await onIndoorPage.getCurrentFrameAndTotalFrames();
            expect(currentFrameJump).toBe('10');
            expect(totalFramesJump).toBe(totalFrames);

            await onIndoorPage.jumpToPhoto();
            await onIndoorPage.enterFrameNumber(100);
            await onIndoorPage.clickOnJumpButton();
            const { currentFrame: currentFrameJump100, totalFrames: totalFramesJump100 } = await onIndoorPage.getCurrentFrameAndTotalFrames();
            expect(currentFrameJump100).toBe('100');
            expect(totalFramesJump100).toBe(totalFrames);


            await onIndoorPage.jumpToPhoto();
            await onIndoorPage.enterFrameNumber(1);
            await onIndoorPage.clickOnJumpButton();
            await expect(onIndoorPage.previousPhotoButton()).toBeDisabled();
            await expect(onIndoorPage.firstPhotoButton()).toBeDisabled();


            await onIndoorPage.jumpToPhoto();
            await onIndoorPage.enterFrameNumber(Number(totalFrames));
            await onIndoorPage.clickOnJumpButton();
            await expect(onIndoorPage.nextPhotoButton()).toBeDisabled();
            await expect(onIndoorPage.lastPhotoButton()).toBeDisabled();

        });

        test('Should keep both arrows disabled when only single video exists', async () => {
            const onIndoorPage = pm.onIndoorPage;
            const floorNames = await onIndoorPage.getAllFloorNames();

            if (floorNames.length > 0) {
                await onIndoorPage.hoverOverFloorNameAndClickOnIt(floorNameWithMultipleVideos);
                await helper.waitForNumberOfSeconds(2);
                await waitForLoading3DAnd360PhotoToComplete(onIndoorPage);

                await onIndoorPage.clickOnSelectDate();
                const options = await onIndoorPage.getDateSelectorOptions();
                console.log(`Total videos in the floor: ${options.length}`);

                if (options.length === 1) {
                    await expect(onIndoorPage.leftArrow()).toBeDisabled();
                    await expect(onIndoorPage.rightArrow()).toBeDisabled();
                }

            }
        });

        test('Should show the first date option as highlighted in the dropdown', async () => {
            const onIndoorPage = pm.onIndoorPage;
            const floorNames = await onIndoorPage.getAllFloorNames();

            if (floorNames.length > 0) {
                await onIndoorPage.hoverOverFloorNameAndClickOnIt(floorNameWithMultipleVideos);
                await waitForLoading3DAnd360PhotoToComplete(onIndoorPage);
                await onIndoorPage.clickOnSelectDate();
                expect(await onIndoorPage.getStateOfFirstDateOptionInDropdown()).toBeTruthy();
            }
        });

        test('should select a video from dropdown and validate the next and previous photo buttons are enabled accordingly', async () => {
            const onIndoorPage = pm.onIndoorPage;
            const floorNames = await onIndoorPage.getAllFloorNames();
            if (floorNames.length > 0) {
                await onIndoorPage.hoverOverFloorNameAndClickOnIt(floorNameWithMultipleVideos);
                await waitForLoading3DAnd360PhotoToComplete(onIndoorPage);
                await onIndoorPage.clickOnSelectDate();
                const options = await onIndoorPage.getDateSelectorOptions();
                expect(options.length).toBeGreaterThan(0);

                for (let i = 1; i < options.length; i++) {
                    await onIndoorPage.selectDateFromDropdown(options[i]);
                    await onIndoorPage.waitForLoading360PhotoToComplete();
                    const selectDateText = await onIndoorPage.selectDate().textContent();
                    const optionWithoutSuffix = options[i]?.slice(0, options[i]?.length - 3);
                    expect(selectDateText).toContain(optionWithoutSuffix);

                    while (await onIndoorPage.rightArrow().isEnabled()) {
                        await onIndoorPage.goToNextDay();
                        await onIndoorPage.waitForLoading360PhotoToComplete();

                    }
                    await expect(onIndoorPage.rightArrow()).toBeDisabled();

                    while (await onIndoorPage.leftArrow().isEnabled()) {
                        await onIndoorPage.goToPreviousDay();
                        await onIndoorPage.waitForLoading360PhotoToComplete();

                    }
                    await expect(onIndoorPage.leftArrow()).toBeDisabled();

                    await onIndoorPage.clickOnSelectDate();
                }
            }
        });

        //! This test is lengthy and  flaky and needs to be fixed
        test.skip('should select a video from dropdown and validate photo navigation buttons and jump to photo for all available video options', async () => {
            const onIndoorPage = pm.onIndoorPage;
            const floorNames = await onIndoorPage.getAllFloorNames();
            if (floorNames.length > 0) {
                await onIndoorPage.hoverOverFloorNameAndClickOnIt(floorNameWithMultipleVideos);
                await waitForLoading3DAnd360PhotoToComplete(onIndoorPage);
                await onIndoorPage.clickOnSelectDate();
                const options = await onIndoorPage.getDateSelectorOptions();
                expect(options.length).toBeGreaterThan(0);

                for (let i = 1; i < options.length; i++) {
                    await onIndoorPage.selectDateFromDropdown(options[i]);
                    await onIndoorPage.waitForLoading360PhotoToComplete();
                    const selectDateText = await onIndoorPage.selectDate().textContent();
                    const optionWithoutSuffix = options[i]?.slice(0, options[i]?.length - 3);
                    expect(selectDateText).toContain(optionWithoutSuffix);
                    const { totalFrames } = await onIndoorPage.getCurrentFrameAndTotalFrames();

                    while (await onIndoorPage.nextPhotoButton().isEnabled() && await onIndoorPage.lastPhotoButton().isEnabled()) {
                        const { currentFrame: currentFrameBefore } = await onIndoorPage.getCurrentFrameAndTotalFrames();
                        await onIndoorPage.goToNextPhoto();
                        const { currentFrame: currentFrameAfter } = await onIndoorPage.getCurrentFrameAndTotalFrames();
                        expect(Number(currentFrameAfter)).toBe(Number(currentFrameBefore) + 1);
                    }
                    await expect(onIndoorPage.nextPhotoButton()).toBeDisabled();
                    await expect(onIndoorPage.lastPhotoButton()).toBeDisabled();

                    while (await onIndoorPage.previousPhotoButton().isEnabled() && await onIndoorPage.firstPhotoButton().isEnabled()) {
                        const { currentFrame: currentFrameBefore } = await onIndoorPage.getCurrentFrameAndTotalFrames();
                        await onIndoorPage.goToPreviousPhoto();
                        const { currentFrame: currentFrameAfter } = await onIndoorPage.getCurrentFrameAndTotalFrames();
                        expect(Number(currentFrameAfter)).toBe(Number(currentFrameBefore) - 1);
                    }
                    await expect(onIndoorPage.previousPhotoButton()).toBeDisabled();
                    await expect(onIndoorPage.firstPhotoButton()).toBeDisabled();

                    await onIndoorPage.goToLastPhoto();

                    const { currentFrame: currentFrameLast, totalFrames: totalFramesLast } = await onIndoorPage.getCurrentFrameAndTotalFrames();
                    expect(currentFrameLast).toBe(totalFrames);
                    expect(totalFramesLast).toBe(totalFrames);

                    await onIndoorPage.goToFirstPhoto();
                    const { currentFrame: currentFrameFirst, totalFrames: totalFramesFirst } = await onIndoorPage.getCurrentFrameAndTotalFrames();
                    expect(currentFrameFirst).toBe('1');
                    expect(totalFramesFirst).toBe(totalFrames);


                    await onIndoorPage.jumpToPhoto();
                    await onIndoorPage.enterFrameNumber(10);
                    await onIndoorPage.clickOnJumpButton();
                    const { currentFrame: currentFrameJump, totalFrames: totalFramesJump } = await onIndoorPage.getCurrentFrameAndTotalFrames();
                    expect(currentFrameJump).toBe('10');
                    expect(totalFramesJump).toBe(totalFrames);

                    await onIndoorPage.jumpToPhoto();
                    await onIndoorPage.enterFrameNumber(100);
                    await onIndoorPage.clickOnJumpButton();
                    const { currentFrame: currentFrameJump100, totalFrames: totalFramesJump100 } = await onIndoorPage.getCurrentFrameAndTotalFrames();
                    expect(currentFrameJump100).toBe('100');
                    expect(totalFramesJump100).toBe(totalFrames);

                    await onIndoorPage.jumpToPhoto();
                    await onIndoorPage.enterFrameNumber(1);
                    await onIndoorPage.clickOnJumpButton();
                    await expect(onIndoorPage.previousPhotoButton()).toBeDisabled();
                    await expect(onIndoorPage.firstPhotoButton()).toBeDisabled();

                    await onIndoorPage.jumpToPhoto();
                    await onIndoorPage.enterFrameNumber(Number(totalFrames));
                    await onIndoorPage.clickOnJumpButton();
                    await expect(onIndoorPage.nextPhotoButton()).toBeDisabled();
                    await expect(onIndoorPage.lastPhotoButton()).toBeDisabled();

                    await onIndoorPage.clickOnSelectDate();
                }
            }
        });

        test('Should not delete the video if the user clicks on cancel', async () => {
            const onIndoorPage = pm.onIndoorPage;
            const floorNames = await onIndoorPage.getAllFloorNames();
            if (floorNames.length > 0) {
                await onIndoorPage.hoverOverFloorNameAndClickOnIt(floorNameWithMultipleVideos);
                await waitForLoading3DAnd360PhotoToComplete(onIndoorPage);

                await onIndoorPage.clickOnSelectDate();
                const dateOptions = await onIndoorPage.getDateSelectorOptions();
                expect(dateOptions.length).toBeGreaterThan(0);

                const optionCountBeforeDelete = dateOptions.length;
                await onIndoorPage.clickOnMoreOptionsInSelectDateOption();
                await onIndoorPage.clickOnDeleteVideo();
                await onIndoorPage.clickOnCancel();

                await onIndoorPage.clickOnSelectDate();
                const optionCountAfterDelete = await onIndoorPage.getDateSelectorOptions();
                expect(optionCountAfterDelete.length).toBe(optionCountBeforeDelete);
            }
        });

        test.skip('Should delete all videos from a floor and validate the videos are deleted', async () => {
            const onIndoorPage = pm.onIndoorPage;
            const floorNames = await onIndoorPage.getAllFloorNames();
            if (floorNames.length > 0) {
                await onIndoorPage.hoverOverFloorNameAndClickOnIt(floorNameWithMultipleVideos);
                await waitForLoading3DAnd360PhotoToComplete(onIndoorPage);

                await onIndoorPage.clickOnSelectDate();
                const dateOptions = await onIndoorPage.getDateSelectorOptions();
                expect(dateOptions.length).toBeGreaterThan(0);

                for (let i = 1; i < dateOptions.length; i++) {
                    const optionCountBeforeDelete = dateOptions.length;
                    await onIndoorPage.clickOnMoreOptionsInSelectDateOption();
                    await onIndoorPage.clickOnDeleteVideo();
                    await onIndoorPage.clickOnDelete();
                    await validateSuccessMessageAndCloseToaster(onIndoorPage, 'Video has been deleted successfully');
                    const optionCountAfterDelete = await onIndoorPage.getDateSelectorOptions();
                    // expect(optionCountAfterDelete.length).toBe(optionCountBeforeDelete - 1); // ! Fix this line
                    await onIndoorPage.clickOnSelectDate();
                }
            }
        });
    });

    test.describe('Advanced Navigation and State Management', () => {

        test.afterEach(async () => {
            await pm.onIndoorPage.clickOnXIcon();
        });

        test('Should expand panel via Expand control and preserve selection', async () => {
            const onIndoorPage = pm.onIndoorPage;
            const floorNames = await onIndoorPage.getAllFloorNames();

            if (floorNames.length > 0) {
                await onIndoorPage.hoverOverFloorNameAndClickOnIt(floorNameWithMultipleVideos);
                await waitForLoading3DAnd360PhotoToComplete(onIndoorPage);
                const sidebar = pm.onProjectSidebarPage;
                expect(await sidebar.isSidebarCollapsed()).toBeTruthy();
                await sidebar.expandSidebar();
                expect(sidebar.isSidebarExpanded()).toBeTruthy();

                const selectionState = await onIndoorPage.getSelectionStateOfFloor(floorNameWithMultipleVideos);
                expect(selectionState).toBe('true');
            }
        });

        test('Should keep selection idempotent when re-selecting same floor', async () => {
            const onIndoorPage = pm.onIndoorPage;
            const floorNames = await onIndoorPage.getAllFloorNames();

            if (floorNames.length > 0) {
                await onIndoorPage.hoverOverFloorNameAndClickOnIt(floorNameWithMultipleVideos);
                await waitForLoading3DAnd360PhotoToComplete(onIndoorPage);

                const initialURL = await onIndoorPage.getCurrentURL();
                await pm.onProjectSidebarPage.expandSidebar();

                await onIndoorPage.hoverOverFloorNameAndClickOnIt(floorNameWithMultipleVideos);

                const finalURL = await onIndoorPage.getCurrentURL();
                expect(finalURL).toBe(initialURL);

                const selectionState = await onIndoorPage.getSelectionStateOfFloor(floorNameWithMultipleVideos);
                expect(selectionState).toBe('true');
            }
        });
    });


    // 2025 Q3 Sprint 6 - Indoor 360 MVP - Goal

    test.describe('2025 Q3 Sprint 6 - Indoor 360 MVP - Goal', () => {

        test.afterEach(async () => {
            await pm.onIndoorPage.clickOnXIcon();
        });
        test('Should switch to single, double and four screen frequently and validate the screen is switched successfully', async () => {

            const onIndoorPage = pm.onIndoorPage;
            const floorNames = await onIndoorPage.getAllFloorNames();
            console.log(`floorNames: ${floorNames.length}`);
            if (floorNames.length > 0) {
                await onIndoorPage.hoverOverFloorNameAndClickOnIt(floorNameWithMultipleVideos);
                await waitForLoading3DAnd360PhotoToComplete(onIndoorPage);

                for (let i = 0; i < 20; i++) {

                    await onIndoorPage.clickOnDoubleScreen();
                    await expect(onIndoorPage.firstComparisonScreen()).toBeVisible();
                    await expect(onIndoorPage.secondComparisonScreen()).toBeHidden();
                    await expect(onIndoorPage.thirdComparisonScreen()).toBeHidden();


                    await onIndoorPage.clickOnFourScreen();
                    await expect(onIndoorPage.firstComparisonScreen()).toBeVisible();
                    await expect(onIndoorPage.secondComparisonScreen()).toBeVisible();
                    await expect(onIndoorPage.thirdComparisonScreen()).toBeVisible();

                    await onIndoorPage.clickOnSingleScreen();
                    await expect(onIndoorPage.firstComparisonScreen()).toBeHidden();
                    await expect(onIndoorPage.secondComparisonScreen()).toBeHidden();
                    await expect(onIndoorPage.thirdComparisonScreen()).toBeHidden();
                }
            }
        });
    });
});;
