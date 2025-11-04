import { BrowserContext, Page } from '@playwright/test';
import { HelperBase } from '../../pages/HelperBase';
import { MeasurementPage } from '../../pages/MeasurementPage';
import { PageManager } from '../../pages/PageManager';
import { test, expect } from '../../test-options';
import { faker } from '@faker-js/faker';

test.describe('Measurement Page Test', () => {

    let pageManager: PageManager;
    let context: BrowserContext;
    let page: Page;
    let measurementPage: MeasurementPage;
    let xStart: number;
    let yStart: number;
    let helper: HelperBase;
    const newName = faker.string.alpha(10);

    test.beforeAll(async ({ browser }, testInfo) => {
        context = await browser.newContext({
            recordVideo: {
                dir: testInfo.outputPath('videos'),
                size: {
                    width: 1920,
                    height: 1080
                }
            }
        });
        page = await context.newPage();
        pageManager = new PageManager(page);
        helper = new HelperBase(pageManager.getPage);
        await pageManager.onLoginPage.openLoginPageAndWaitForPageToLoad();
        await helper.closeReadUserGuidePopUp(pageManager, testInfo);
        await pageManager.onDashboardPage.openProject();
        await pageManager.onDashboardPage.verifyLoadingBehavior();
        await pageManager.onProjectSidebarPage.clickOnMeasurement();
        await expect(pageManager.getPage).toHaveURL(/.*measurement*/);

        measurementPage = pageManager.onMeasurementPage;
    });

    test.beforeEach(async () => {
        ({ xStart, yStart } = await setupLocationCoordinates());
    });

    test.afterAll(async ({ }, testInfo) => {
        await deleteAllGroups(measurementPage);
        const videoPath = testInfo.outputPath('my-video.webm');
        await Promise.all([
            page.video()?.saveAs(videoPath),
            page.close()
        ]);
        testInfo.attachments.push({
            name: 'video',
            path: videoPath,
            contentType: 'video/webm'
        });
        await context.close();
    });

    async function deleteAllGroups(measurementPage: MeasurementPage) {
        await measurementPage.deleteAllGroups();
        await measurementPage.validateNewGroupForOpenSpaceIsCreated();
    }

    async function setupMeasurementGroup(measurementPage: MeasurementPage) {
        await measurementPage.createGroup();
        const groupId = await measurementPage.getGroupId();
        return groupId;
    }

    async function setupLocationCoordinates() {
        const mapPage = pageManager.onMapPage;
        const boundingBox = await mapPage.getMapBoundingBox();
        if (!boundingBox) throw new Error('Bounding box not found');
        const { xStart, yStart } = await mapPage.getStaringPosition(boundingBox, 3);
        await mapPage.clickOnZoomInButton(faker.number.int({ min: 200, max: 300 }));
        return { xStart, yStart };
    }

    function generateRandomMultipleOf5(min: number, max: number) {
        return Math.floor(faker.number.int({ min: min, max: max }) / 5) * 5;
    }

    async function markLocationOnMap(measurementPage: MeasurementPage, xStart: number, yStart: number) {
        // const generateRandomMultipleOf5 = (min: number, max: number) =>
        //     Math.floor(faker.number.int({ min: min, max: max }) / 5) * 5;

        const clickX = xStart + generateRandomMultipleOf5(1, 200);
        const clickY = yStart + generateRandomMultipleOf5(1, 200);
        await pageManager.onMapPage.moveMouseToCenter(clickX, clickY);
        await helper.waitForNumberOfSeconds(1.5);
        await pageManager.onMapPage.moveMouseToCenter(clickX, clickY);

        const expectedYCoordinate = await measurementPage.getValueOfYCoordinate();
        const expectedXCoordinate = await measurementPage.getValueOfXCoordinate();

        await measurementPage.createNewMeasurementItem(clickX, clickY);
        return { expectedYCoordinate, expectedXCoordinate };
    }

    async function hoverAndGetValueFromMap(measurementPage: MeasurementPage, LocationTitle: string) {
        await measurementPage.hoverOverMeasurementItemInMap(LocationTitle);
        const { y: yCoordinateOnMap, x: xCoordinateOnMap } = await measurementPage.getYXValueFromMap();
        await helper.waitForNumberOfSeconds(1);
        const expectedElevation = await measurementPage.getElevationValueFromMap();
        return { yCoordinateOnMap, xCoordinateOnMap, expectedElevation };
    }

    async function getLocationValueFromSideBar(measurementPage: MeasurementPage, locationId: string) {
        const yCoordinateOnSideBar = await measurementPage.getValueOfYFromSideBar(locationId);
        const xCoordinateOnSideBar = await measurementPage.getValueOfXFromSideBar(locationId);
        const elevationOnSideBar = await measurementPage.getElevationValueFromSideBar(locationId);
        return { yCoordinateOnSideBar, xCoordinateOnSideBar, elevationOnSideBar };
    }

    async function assertLocationValuesOnMapAndSideBarWithExpectedValues(yCoordinateOnMap: string, xCoordinateOnMap: string, yCoordinateOnSideBar: string, xCoordinateOnSideBar: string, elevationOnSideBar: string, expectedYCoordinate: string, expectedXCoordinate: string, expectedElevation: string) {
        expect(yCoordinateOnMap, 'Y Coordinate on map is not equal to expected Y Coordinate').toBe(expectedYCoordinate);
        expect(xCoordinateOnMap, 'X Coordinate on map is not equal to expected X Coordinate').toBe(expectedXCoordinate);
        expect(yCoordinateOnSideBar, 'Y Coordinate on side bar is not equal to expected Y Coordinate').toBe(expectedYCoordinate);
        expect(xCoordinateOnSideBar, 'X Coordinate on side bar is not equal to expected X Coordinate').toBe(expectedXCoordinate);
        expect(elevationOnSideBar, 'Elevation on side bar is not equal to expected Elevation').toBe(expectedElevation);
    }

    async function assertLocationResponseValuesWithExpectedValues(location: any, expectedYCoordinate: string, expectedXCoordinate: string) {
        expect(location, 'Location coordinates are missing in response').toBeDefined();
        expect(Array.isArray(location), 'Location should be an array').toBe(true);
        expect(location.length).toBe(2);

        const [xCoordFromResponse, yCoordFromResponse] = location;

        expect(typeof yCoordFromResponse).toBe('number');
        expect(typeof xCoordFromResponse).toBe('number');

        expect(yCoordFromResponse.toFixed(3), 'Y Coordinate from response is not equal to expected Y Coordinate').toBe(expectedYCoordinate);
        expect(xCoordFromResponse.toFixed(3), 'X Coordinate from response is not equal to expected X Coordinate').toBe(expectedXCoordinate);
    }

    test.describe('Group Delete Test', () => {

        test('should create a group and delete it using context menu delete in the measurement page', async ({ }) => {
            const groupId = await setupMeasurementGroup(measurementPage);

            await measurementPage.toggleShowHideGroupFolder(groupId);

            await measurementPage.deleteGroup(groupId);
            expect(await measurementPage.verifyGroupDeleted(groupId)).toBe(true);
            await measurementPage.validateGroupIsNotDisplayedInUI(groupId);
        });

        test('should create a group, sub group under it and delete group using context menu delete in the measurement page ', async ({ }) => {
            const groupId = await setupMeasurementGroup(measurementPage);
            console.log(`Created Group ID: ${groupId}`);

            await measurementPage.createSubGroup();
            const subGroupId = await measurementPage.getGroupId();
            console.log(`Created Sub Group ID: ${subGroupId}`);

            await measurementPage.toggleShowHideGroupFolder(groupId);
            await measurementPage.deleteGroup(groupId);
            expect(await measurementPage.verifyGroupDeleted(groupId)).toBe(true);
            await measurementPage.validateGroupIsNotDisplayedInUI(groupId);


        });

        test('Should create a group and location and delete MeasurementItem and group using context menu delete in the measurement page', async ({ }) => {

            const groupId = await setupMeasurementGroup(measurementPage);
            console.log(`Created Group ID: ${groupId}`);

            const { xStart, yStart } = await setupLocationCoordinates();

            await pageManager.onMapPage.clickOnLocationMarker();
            await measurementPage.createNewMeasurementItem(xStart, yStart);
            const responseData = await measurementPage.getMeasurementItemPostResponse();
            const locationId = responseData.data.id;
            console.log(`Created Group ID: ${locationId}`);

            await measurementPage.validateMeasurementItemIsShownInMap(locationId);
            await measurementPage.toggleShowHideLayer(locationId);
            await measurementPage.validateMeasurementItemIsNotShownInMap(locationId);
            await measurementPage.toggleShowHideLayer(locationId);
            await measurementPage.validateMeasurementItemIsShownInMap(locationId);


            await measurementPage.renameMeasurementItem(locationId, newName);

            await measurementPage.centerOnMap(locationId);
            await measurementPage.toggleShowHideDetails(locationId);

            await measurementPage.deleteMeasurementItem(locationId);
            const isMeasurementItemDeleted = await measurementPage.verifyMeasurementItemDeleted(locationId);
            expect(isMeasurementItemDeleted).toBe(true);
            await measurementPage.validateMeasurementItemIsNotDisplayedInUI(locationId);

            await measurementPage.deleteGroup(groupId);
            const isDeleted = await measurementPage.verifyGroupDeleted(groupId);
            expect(isDeleted).toBe(true);
            await measurementPage.validateGroupIsNotDisplayedInUI(groupId);



        });

        test('Should create a group , sub group and location under sub group and delete MeasurementItem and group using context menu delete in the measurement page', async ({ }) => {

            const groupId = await setupMeasurementGroup(measurementPage);
            console.log(`Created Group ID: ${groupId}`);

            await measurementPage.createSubGroup();
            const subGroupId = await measurementPage.getGroupId();
            console.log(`Created Sub Group ID: ${subGroupId}`);

            const { xStart, yStart } = await setupLocationCoordinates();

            await pageManager.onMapPage.clickOnLocationMarker();
            await measurementPage.createNewMeasurementItem(xStart, yStart);
            const responseData = await measurementPage.getMeasurementItemPostResponse();
            const locationId = responseData.data.id;
            console.log(`Created Group ID: ${locationId}`);

            await measurementPage.validateMeasurementItemIsShownInMap(locationId);
            await measurementPage.toggleShowHideLayer(locationId);
            await measurementPage.validateMeasurementItemIsNotShownInMap(locationId);
            await measurementPage.toggleShowHideLayer(locationId);
            await measurementPage.validateMeasurementItemIsShownInMap(locationId);

            await measurementPage.renameMeasurementItem(locationId, newName);

            await measurementPage.centerOnMap(locationId);
            await measurementPage.toggleShowHideDetails(locationId);

            await measurementPage.deleteMeasurementItem(locationId);
            const isMeasurementItemDeleted = await measurementPage.verifyMeasurementItemDeleted(locationId);
            expect(isMeasurementItemDeleted).toBe(true);
            await measurementPage.validateMeasurementItemIsNotDisplayedInUI(locationId);

            await measurementPage.clickOnGroup(groupId);
            await measurementPage.deleteGroup(groupId);
            const isDeleted = await measurementPage.verifyGroupDeleted(groupId);
            expect(isDeleted).toBe(true);
            await measurementPage.validateGroupIsNotDisplayedInUI(groupId);
        });

        test('Should create a group , sub group and location under sub group and delete MeasurementItem , sub group and group using context menu delete in the measurement page', async ({ }) => {

            const groupId = await setupMeasurementGroup(measurementPage);
            await measurementPage.createSubGroup();
            const subGroupId = await measurementPage.getGroupId();
            console.log(`Created Group ID: ${groupId}`);

            const { xStart, yStart } = await setupLocationCoordinates();

            await pageManager.onMapPage.clickOnLocationMarker();
            await measurementPage.createNewMeasurementItem(xStart, yStart);
            const responseData = await measurementPage.getMeasurementItemPostResponse();
            const locationId = responseData.data.id;
            console.log(`Created Group ID: ${locationId}`);

            await measurementPage.validateMeasurementItemIsShownInMap(locationId);
            await measurementPage.toggleShowHideLayer(locationId);
            await measurementPage.validateMeasurementItemIsNotShownInMap(locationId);
            await measurementPage.toggleShowHideLayer(locationId);
            await measurementPage.validateMeasurementItemIsShownInMap(locationId);

            await measurementPage.renameMeasurementItem(locationId, newName);

            await measurementPage.centerOnMap(locationId);
            await measurementPage.toggleShowHideDetails(locationId);

            await measurementPage.deleteMeasurementItem(locationId);
            const isMeasurementItemDeleted = await measurementPage.verifyMeasurementItemDeleted(locationId);
            expect(isMeasurementItemDeleted).toBe(true);
            await measurementPage.validateMeasurementItemIsNotDisplayedInUI(locationId);

            await measurementPage.deleteGroup(subGroupId);
            const isSubGroupDeleted = await measurementPage.verifyGroupDeleted(subGroupId);
            expect(isSubGroupDeleted).toBe(true);
            await measurementPage.validateGroupIsNotDisplayedInUI(subGroupId);

            await measurementPage.clickOnGroup(groupId);
            await measurementPage.deleteGroup(groupId);
            const isDeleted = await measurementPage.verifyGroupDeleted(groupId);
            expect(isDeleted).toBe(true);
            await measurementPage.validateGroupIsNotDisplayedInUI(groupId);

        });

        test('Should create a group , sub group and location and length under group and deleting group should delete both sub group and MeasurementItem and length in the measurement page', async ({ }) => {

            await helper.waitForNumberOfSeconds(3);
            const groupId = await setupMeasurementGroup(measurementPage);
            await measurementPage.createSubGroup();
            const subGroupId = await measurementPage.getGroupId();
            console.log(`Created Group ID: ${groupId}`);

            const { xStart, yStart } = await setupLocationCoordinates();

            await pageManager.onMapPage.clickOnLocationMarker();
            await measurementPage.createNewMeasurementItem(xStart, yStart);
            const responseData = await measurementPage.getMeasurementItemPostResponse();
            const locationId = responseData.data.id;
            console.log(`Created MeasurementItem ID: ${locationId}`);

            await measurementPage.validateMeasurementItemIsShownInMap(locationId);
            await measurementPage.toggleShowHideLayer(locationId);
            await measurementPage.validateMeasurementItemIsNotShownInMap(locationId);
            await measurementPage.toggleShowHideLayer(locationId);
            await measurementPage.validateMeasurementItemIsShownInMap(locationId);

            await measurementPage.renameMeasurementItem(locationId, newName);

            await measurementPage.centerOnMap(locationId);
            await measurementPage.toggleShowHideDetails(locationId);

            // length -- distance
            await helper.waitForNumberOfSeconds(1 / 3);
            await pageManager.onMapPage.clickOnLength();
            await measurementPage.createNewLength(xStart, yStart);
            const lengthResponseData = await measurementPage.getMeasurementItemPostResponse();
            const lengthId = lengthResponseData.data.id;
            console.log(`Created Length ID: ${lengthId}`);
            await helper.waitForNumberOfSeconds(1 / 3);

            await measurementPage.validateMeasurementItemIsShownInMap(lengthId);
            await measurementPage.toggleShowHideLayer(lengthId);
            await measurementPage.validateMeasurementItemIsNotShownInMap(lengthId);
            await measurementPage.toggleShowHideLayer(lengthId);
            await measurementPage.validateMeasurementItemIsShownInMap(lengthId);

            const newLengthName = `Length - ${faker.string.alpha(10)}`;
            await measurementPage.renameMeasurementItem(lengthId, newLengthName);

            await measurementPage.centerOnMap(lengthId);
            await measurementPage.toggleShowHideDetails(lengthId);

            await measurementPage.clickOnGroup(groupId);
            await measurementPage.deleteGroup(groupId);
            const isDeleted = await measurementPage.verifyGroupDeleted(groupId);
            expect(isDeleted).toBe(true);
            await measurementPage.validateGroupIsNotDisplayedInUI(groupId);
            await measurementPage.validateGroupIsNotDisplayedInUI(subGroupId);
            await measurementPage.validateMeasurementItemIsNotDisplayedInUI(locationId);


        });
    });


    test.describe('Location E2E Test', () => {

        test(`Should create group, Location and validate x, y coordinates and elevation on map and side bar`, async ({ }) => {

            const groupId = await setupMeasurementGroup(measurementPage);
            console.log(`Created Group ID: ${groupId}`);
            await pageManager.onMapPage.clickOnLocationMarker();

            const { expectedYCoordinate, expectedXCoordinate } = await markLocationOnMap(measurementPage, xStart, yStart);
            const responseData = await measurementPage.getMeasurementItemPostResponse();
            const locationId = responseData.data.id;
            const LocationTitle = responseData.data.title;
            console.log(`Created Measurement Item Location with ID: ${locationId} and Title: ${LocationTitle}`);

            const location = responseData.data.info?.location;
            await assertLocationResponseValuesWithExpectedValues(location, expectedYCoordinate || '', expectedXCoordinate || '');

            const { yCoordinateOnMap, xCoordinateOnMap, expectedElevation } = await hoverAndGetValueFromMap(measurementPage, LocationTitle);
            const { yCoordinateOnSideBar, xCoordinateOnSideBar, elevationOnSideBar } = await getLocationValueFromSideBar(measurementPage, locationId);

            await assertLocationValuesOnMapAndSideBarWithExpectedValues(yCoordinateOnMap, xCoordinateOnMap, yCoordinateOnSideBar || '', xCoordinateOnSideBar || '', elevationOnSideBar || '', expectedYCoordinate || '', expectedXCoordinate || '', expectedElevation || '');

            // await measurementPage.toggleShowHideFolder(groupId);
            await measurementPage.deleteGroup(groupId);
            expect(await measurementPage.verifyGroupDeleted(groupId)).toBe(true);
            await measurementPage.validateGroupIsNotDisplayedInUI(groupId);


        });

        test(`Should create Location under default group and validate x, y coordinates and elevation on map and side bar`, async ({ }) => {
            await pageManager.onMapPage.clickOnLocationMarker();

            const { expectedYCoordinate, expectedXCoordinate } = await markLocationOnMap(measurementPage, xStart, yStart);
            const responseData = await measurementPage.getMeasurementItemPostResponse();
            const locationId = responseData.data.id;
            const LocationTitle = responseData.data.title;
            console.log(`Created Measurement Item Location with ID: ${locationId} and Title: ${LocationTitle}`);

            const location = responseData.data.info?.location;
            await assertLocationResponseValuesWithExpectedValues(location, expectedYCoordinate || '', expectedXCoordinate || '');

            const { yCoordinateOnMap, xCoordinateOnMap, expectedElevation } = await hoverAndGetValueFromMap(measurementPage, LocationTitle);
            const { yCoordinateOnSideBar, xCoordinateOnSideBar, elevationOnSideBar } = await getLocationValueFromSideBar(measurementPage, locationId);

            await assertLocationValuesOnMapAndSideBarWithExpectedValues(yCoordinateOnMap, xCoordinateOnMap, yCoordinateOnSideBar || '', xCoordinateOnSideBar || '', elevationOnSideBar || '', expectedYCoordinate || '', expectedXCoordinate || '', expectedElevation || '');

        });

        test('Should show/hide location marker on map when show / hide layer is toggled', async ({ }) => {

            await pageManager.onMapPage.clickOnLocationMarker();
            await markLocationOnMap(measurementPage, xStart, yStart);
            const responseData = await measurementPage.getMeasurementItemPostResponse();
            const locationId = responseData.data.id;
            const locationTitle = responseData.data.title;

            await measurementPage.validateLocationMarkerIsDisplayedOnMap(locationTitle);
            await measurementPage.toggleShowHideLayer(locationId);
            await measurementPage.validateLocationMarkerIsNotDisplayedOnMap(locationTitle);

        });

        test('Should rename location marker and validate the new name on side bar and map', async ({ }) => {
            await helper.waitForNumberOfSeconds(3);
            await pageManager.onMapPage.clickOnLocationMarker();
            await markLocationOnMap(measurementPage, xStart, yStart);
            const responseData = await measurementPage.getMeasurementItemPostResponse();
            const locationId = responseData.data.id;

            await measurementPage.renameMeasurementItem(locationId, newName);
            await measurementPage.validateLocationMarkerIsDisplayedOnMap(newName);


        });

        test.skip('Should delete on location marker and validate it is not displayed in the UI', async ({ }) => {

            await pageManager.onMapPage.clickOnLocationMarker();

            await markLocationOnMap(measurementPage, xStart, yStart);
            const responseData = await measurementPage.getMeasurementItemPostResponse();
            const locationId = responseData.data.id;

            await measurementPage.deleteMeasurementItem(locationId);
            expect(await measurementPage.verifyMeasurementItemDeleted(locationId)).toBe(true);
            await measurementPage.validateMeasurementItemIsNotDisplayedInUI(locationId);


        });

        test('Should center on location marker and validate it is displayed on map', async ({ }) => {
            // Write test
        });

        test('Should toggle show hide details and validate it is displayed on map', async ({ }) => {
            // Write test
        });


    });

    test.describe('Sub Group E2E Test', () => {

        test('Should show/hide sub group folder when show / hide folder is toggled', async ({ }) => {
            const groupId = await setupMeasurementGroup(measurementPage);
            console.log(`Created Group ID: ${groupId}`);

            await measurementPage.createSubGroup();
            const subGroupId = await measurementPage.getGroupId();
            console.log(`Created Sub Group ID: ${subGroupId}`);

            await measurementPage.toggleShowHideSubGroupFolder(subGroupId);
            const dataSelectedAttributeValueBefore = await measurementPage.getSubGroupDataSelectedAttributeValue(subGroupId);
            expect(dataSelectedAttributeValueBefore).toBe('true');

            await measurementPage.toggleShowHideSubGroupFolder(subGroupId);
            const dataSelectedAttributeValueAfter = await measurementPage.getSubGroupDataSelectedAttributeValue(subGroupId);
            expect(dataSelectedAttributeValueAfter).toBe('false');

        });

        test('Should rename sub group folder and validate the new name on side bar', async ({ }) => {
            const groupId = await setupMeasurementGroup(measurementPage);
            console.log(`Created Group ID: ${groupId}`);

            await measurementPage.createSubGroup();
            const subGroupId = await measurementPage.getGroupId();
            console.log(`Created Sub Group ID: ${subGroupId}`);

            await measurementPage.renameSubGroup(subGroupId, newName);


        });

        test('Should delete sub group folder and validate it is not displayed in the UI', async ({ }) => {
            const groupId = await setupMeasurementGroup(measurementPage);
            console.log(`Created Group ID: ${groupId}`);

            await measurementPage.createSubGroup();
            const subGroupId = await measurementPage.getGroupId();
            console.log(`Created Sub Group ID: ${subGroupId}`);

            await measurementPage.toggleShowHideSubGroupFolder(subGroupId);

            await measurementPage.deleteSubGroup(subGroupId);
            const isSubGroupDeleted = await measurementPage.verifySubGroupDeleted(subGroupId);
            expect(isSubGroupDeleted).toBe(true);
            await measurementPage.validateSubGroupIsNotDisplayedInUI(subGroupId);

        });

        // ! Attribute value does not change when folder is folded/unfolded
        test('Should fold/unfold sub group folder when fold/unfold folder is toggled', async ({ }) => {
            const groupId = await setupMeasurementGroup(measurementPage);
            console.log(`Created Group ID: ${groupId}`);

            await measurementPage.createSubGroup();
            const subGroupId = await measurementPage.getGroupId();
            console.log(`Created Sub Group ID: ${subGroupId}`);

            await helper.waitForNumberOfSeconds(1);
            await pageManager.onMapPage.clickOnLocationMarker();
            await markLocationOnMap(measurementPage, xStart, yStart);
            const responseData = await measurementPage.getMeasurementItemPostResponse();
            const locationTitle = responseData.data.title;

            await measurementPage.validateLocationMarkerIsDisplayedOnMap(locationTitle);

            const dataStateAttributeValueInitial = await measurementPage.getSubGroupDataStateAttributeValue(subGroupId);
            expect(dataStateAttributeValueInitial).toBe('show');

            await measurementPage.toggleSubGroupFoldUnfold(subGroupId);
            const dataStateAttributeValueBefore = await measurementPage.getSubGroupDataStateAttributeValue(subGroupId);
            expect(dataStateAttributeValueBefore).toBe('hide');

            await measurementPage.toggleSubGroupFoldUnfold(subGroupId);
            const dataStateAttributeValueAfter = await measurementPage.getSubGroupDataStateAttributeValue(subGroupId);
            expect(dataStateAttributeValueAfter).toBe('show');

        });
    });


    test.describe('Group Context Menu E2E Test', () => {
        test('Should show/hide  group folder when show / hide folder is toggled', async ({ }) => {
            const groupId = await setupMeasurementGroup(measurementPage);
            console.log(`Created Group ID: ${groupId}`);

            await measurementPage.createSubGroup();
            const subGroupIdFirst = await measurementPage.getGroupId();
            console.log(`Created Sub Group ID: ${subGroupIdFirst}`);

            ({ xStart, yStart } = await setupLocationCoordinates());

            await pageManager.onMapPage.clickOnLocationMarker();
            await markLocationOnMap(measurementPage, xStart, yStart);
            const responseDataFirst = await measurementPage.getMeasurementItemPostResponse();
            const locationIdFirst = responseDataFirst.data.id;
            const locationTitleFirst = responseDataFirst.data.title;
            await measurementPage.validateLocationMarkerIsDisplayedOnMap(locationTitleFirst);

            await helper.waitForNumberOfSeconds(1);

            await measurementPage.createSubGroup();
            const subGroupIdSecond = await measurementPage.getGroupId();
            console.log(`Created Sub Group ID: ${subGroupIdSecond}`);

            await measurementPage.clickOnGroupSubGroup(subGroupIdSecond);
            await helper.waitForNumberOfSeconds(1);
            await pageManager.onMapPage.clickOnLocationMarker();
            await markLocationOnMap(measurementPage, xStart, yStart);
            const responseDataSecond = await measurementPage.getMeasurementItemPostResponse();
            const locationIdSecond = responseDataSecond.data.id;
            const locationTitleSecond = responseDataSecond.data.title;
            await measurementPage.validateLocationMarkerIsDisplayedOnMap(locationTitleSecond);


            const dataSelectedAttributeValueBefore = await measurementPage.getGroupDataSelectedAttributeValue(groupId);
            expect(dataSelectedAttributeValueBefore).toBe('true');

            const dataSelectedAttributeValueBeforeSubGroupFirst = await measurementPage.getSubGroupDataSelectedAttributeValue(subGroupIdFirst);
            expect(dataSelectedAttributeValueBeforeSubGroupFirst).toBe('true');

            const dataSelectedAttributeValueBeforeSubGroupSecond = await measurementPage.getSubGroupDataSelectedAttributeValue(subGroupIdSecond);
            expect(dataSelectedAttributeValueBeforeSubGroupSecond).toBe('true');

            const dataSelectedAttributeValueBeforeLocationFirst = await measurementPage.getMeasurementItemDetailsDataSelectedAttributeValue(locationIdFirst);
            expect(dataSelectedAttributeValueBeforeLocationFirst).toBe('true');

            const dataSelectedAttributeValueBeforeLocationSecond = await measurementPage.getMeasurementItemDetailsDataSelectedAttributeValue(locationIdSecond);
            expect(dataSelectedAttributeValueBeforeLocationSecond).toBe('true');

            await measurementPage.toggleShowHideGroupFolder(groupId);
            const dataSelectedAttributeValueAfter = await measurementPage.getGroupDataSelectedAttributeValue(groupId);
            expect(dataSelectedAttributeValueAfter).toBe('false');

            const dataSelectedAttributeValueAfterSubGroupFirst = await measurementPage.getSubGroupDataSelectedAttributeValue(subGroupIdFirst);
            expect(dataSelectedAttributeValueAfterSubGroupFirst).toBe('false');

            const dataSelectedAttributeValueAfterSubGroupSecond = await measurementPage.getSubGroupDataSelectedAttributeValue(subGroupIdSecond);
            expect(dataSelectedAttributeValueAfterSubGroupSecond).toBe('false');

            const dataSelectedAttributeValueAfterLocationFirst = await measurementPage.getMeasurementItemDetailsDataSelectedAttributeValue(locationIdFirst);
            expect(dataSelectedAttributeValueAfterLocationFirst).toBe('false');

            const dataSelectedAttributeValueAfterLocationSecond = await measurementPage.getMeasurementItemDetailsDataSelectedAttributeValue(locationIdSecond);
            expect(dataSelectedAttributeValueAfterLocationSecond).toBe('false');

            await measurementPage.clickOnGroup(groupId);

        });

        test('Should rename group folder and validate the new name on side bar', async ({ }) => {
            const groupId = await setupMeasurementGroup(measurementPage);
            console.log(`Created Group ID: ${groupId}`);
            await measurementPage.renameGroup(groupId, newName);
            await measurementPage.clickOnGroup(groupId);
        });
        test('should create a group and delete it using context menu delete in the measurement page', async ({ }) => {
            const groupId = await setupMeasurementGroup(measurementPage);

            await measurementPage.toggleShowHideGroupFolder(groupId);

            await measurementPage.deleteGroup(groupId);
            expect(await measurementPage.verifyGroupDeleted(groupId)).toBe(true);
            await measurementPage.validateGroupIsNotDisplayedInUI(groupId);

        });

        test('Should fold/unfold group folder when fold/unfold folder is toggled', async ({ }) => {
            const groupId = await setupMeasurementGroup(measurementPage);
            console.log(`Created Group ID: ${groupId}`);

            await measurementPage.createSubGroup();
            const subGroupIdFirst = await measurementPage.getGroupId();
            console.log(`Created Sub Group ID: ${subGroupIdFirst}`);

            ({ xStart, yStart } = await setupLocationCoordinates());

            await pageManager.onMapPage.clickOnLocationMarker();
            await markLocationOnMap(measurementPage, xStart, yStart);
            const responseDataFirst = await measurementPage.getMeasurementItemPostResponse();
            const locationIdFirst = responseDataFirst.data.id;
            const locationTitleFirst = responseDataFirst.data.title;
            await measurementPage.validateLocationMarkerIsDisplayedOnMap(locationTitleFirst);

            await helper.waitForNumberOfSeconds(1);

            await measurementPage.createSubGroup();
            const subGroupIdSecond = await measurementPage.getGroupId();
            console.log(`Created Sub Group ID: ${subGroupIdSecond}`);
            await helper.waitForNumberOfSeconds(1);
            await measurementPage.clickOnGroupSubGroup(subGroupIdSecond);

            await pageManager.onMapPage.clickOnLocationMarker();
            await markLocationOnMap(measurementPage, xStart, yStart);
            const responseDataSecond = await measurementPage.getMeasurementItemPostResponse();
            const locationIdSecond = responseDataSecond.data.id;
            const locationTitleSecond = responseDataSecond.data.title;
            await measurementPage.validateLocationMarkerIsDisplayedOnMap(locationTitleSecond);


            const dataStateAttributeValueInitial = await measurementPage.getGroupDataStateAttributeValue(groupId);
            expect(dataStateAttributeValueInitial).toBe('show');

            const dataSelectedAttributeValueBeforeSubGroupFirst = await measurementPage.getSubGroupDataStateAttributeValue(subGroupIdFirst);
            expect(dataSelectedAttributeValueBeforeSubGroupFirst).toBe('show');

            const dataStateAttributeValueBeforeSubGroupSecond = await measurementPage.getSubGroupDataStateAttributeValue(subGroupIdSecond);
            expect(dataStateAttributeValueBeforeSubGroupSecond).toBe('show');

            const dataStateAttributeValueBeforeLocationFirstCount = await measurementPage.getMeasurementItemDetailsDataStateAttributeCount(locationIdFirst);
            expect(dataStateAttributeValueBeforeLocationFirstCount).toBe(1);

            const dataStateAttributeValueBeforeLocationFirst = await measurementPage.getMeasurementItemDetailsDataStateAttributeValue(locationIdFirst);
            expect(dataStateAttributeValueBeforeLocationFirst).toBe('hide');

            const dataStateAttributeValueBeforeLocationSecond = await measurementPage.getMeasurementItemDetailsDataStateAttributeValue(locationIdSecond);
            expect(dataStateAttributeValueBeforeLocationSecond).toBe('show');

            const dataStateAttributeValueBeforeLocationSecondCount = await measurementPage.getMeasurementItemDetailsDataStateAttributeCount(locationIdSecond);
            expect(dataStateAttributeValueBeforeLocationSecondCount).toBe(1);

            await measurementPage.toggleGroupFoldUnfold(groupId);
            const dataStateAttributeValueAfter = await measurementPage.getGroupDataStateAttributeValue(groupId);
            expect(dataStateAttributeValueAfter).toBe('hide');

            const dataStateAttributeAfterCountForLocationFirst = await measurementPage.getMeasurementItemDetailsDataStateAttributeCount(locationIdFirst);
            expect(dataStateAttributeAfterCountForLocationFirst).toBe(0);

            const dataStateAttributeAfterCountForLocationSecond = await measurementPage.getMeasurementItemDetailsDataStateAttributeCount(locationIdSecond);
            expect(dataStateAttributeAfterCountForLocationSecond).toBe(0);

            const dataStateAttributeAfterCountForSubGroupFirst = await measurementPage.getSubGroupDataStateAttributeCount(subGroupIdFirst);
            expect(dataStateAttributeAfterCountForSubGroupFirst).toBe(0);

            const dataStateAttributeAfterCountForSubGroupSecond = await measurementPage.getSubGroupDataStateAttributeCount(subGroupIdSecond);
            expect(dataStateAttributeAfterCountForSubGroupSecond).toBe(0);

            await measurementPage.clickOnGroup(groupId);

        });

        // !  WIP Fix this test
        test.fixme('Should show group and its contents on maps for all datasets', async ({ }) => {
            const groupId = await setupMeasurementGroup(measurementPage);
            console.log(`Created Group ID: ${groupId}`);

            await measurementPage.createSubGroup();
            const subGroupIdFirst = await measurementPage.getGroupId();
            console.log(`Created Sub Group ID: ${subGroupIdFirst}`);

            ({ xStart, yStart } = await setupLocationCoordinates());

            await pageManager.onMapPage.clickOnLocationMarker();
            await markLocationOnMap(measurementPage, xStart, yStart);
            const responseDataFirst = await measurementPage.getMeasurementItemPostResponse();
            const locationIdFirst = responseDataFirst.data.id;
            const locationTitleFirst = responseDataFirst.data.title;
            // await measurementPage.validateLocationMarkerIsDisplayedOnMap(locationTitleFirst);

            await helper.waitForNumberOfSeconds(1);

            await measurementPage.createSubGroup();
            const subGroupIdSecond = await measurementPage.getGroupId();
            console.log(`Created Sub Group ID: ${subGroupIdSecond}`);
            await helper.waitForNumberOfSeconds(1);
            await measurementPage.clickOnGroupSubGroup(subGroupIdSecond);

            await pageManager.onMapPage.clickOnLocationMarker();
            await markLocationOnMap(measurementPage, xStart, yStart);
            const responseDataSecond = await measurementPage.getMeasurementItemPostResponse();
            const locationIdSecond = responseDataSecond.data.id;
            const locationTitleSecond = responseDataSecond.data.title;
            // await measurementPage.validateLocationMarkerIsDisplayedOnMap(locationTitleSecond);


            const dataStateAttributeValueInitial = await measurementPage.getGroupDataStateAttributeValue(groupId);
            expect(dataStateAttributeValueInitial).toBe('show');

            const dataPinnedAttributeValueBefore = await measurementPage.getGroupDataPinnedAttributeValue(groupId);
            expect(dataPinnedAttributeValueBefore).toBe('false');

            const dataPinnedAttributeValueBeforeSubGroupFirst = await measurementPage.getSubGroupDataPinnedAttributeValue(subGroupIdFirst);
            expect(dataPinnedAttributeValueBeforeSubGroupFirst).toBe('false');

            const dataPinnedAttributeValueBeforeSubGroupSecond = await measurementPage.getSubGroupDataPinnedAttributeValue(subGroupIdSecond);
            expect(dataPinnedAttributeValueBeforeSubGroupSecond).toBe('false');

            const dataPinnedAttributeValueBeforeLocationFirst = await measurementPage.getMeasurementItemDetailsDataPinnedAttributeValue(locationIdFirst);
            expect(dataPinnedAttributeValueBeforeLocationFirst).toBe('true'); // ! This is a bug, it should be false

            const dataPinnedAttributeValueBeforeLocationSecond = await measurementPage.getMeasurementItemDetailsDataPinnedAttributeValue(locationIdSecond);
            expect(dataPinnedAttributeValueBeforeLocationSecond).toBe('true'); // ! This is a bug, it should be false

            await measurementPage.clickOnGroup(groupId);
            await measurementPage.toggleGroupShowMapsForAllDatasets(groupId);
            const dataPinnedAttributeValueAfter = await measurementPage.getGroupDataPinnedAttributeValue(groupId);
            expect(dataPinnedAttributeValueAfter).toBe('true');

            const dataPinnedAttributeValueAfterSubGroupFirst = await measurementPage.getSubGroupDataPinnedAttributeValue(subGroupIdFirst);
            expect(dataPinnedAttributeValueAfterSubGroupFirst).toBe('false'); // ! This is a bug, it should be true

            const dataPinnedAttributeValueAfterSubGroupSecond = await measurementPage.getSubGroupDataPinnedAttributeValue(subGroupIdSecond);
            expect(dataPinnedAttributeValueAfterSubGroupSecond).toBe('false'); // ! This is a bug, it should be true

            const dataPinnedAttributeValueAfterLocationFirst = await measurementPage.getMeasurementItemDetailsDataPinnedAttributeValue(locationIdFirst);
            expect(dataPinnedAttributeValueAfterLocationFirst).toBe('true'); // ! This is a bug, it should be false

            const dataPinnedAttributeValueAfterLocationSecond = await measurementPage.getMeasurementItemDetailsDataPinnedAttributeValue(locationIdSecond);
            expect(dataPinnedAttributeValueAfterLocationSecond).toBe('true'); // ! This is a bug, it should be false

            await measurementPage.clickOnGroup(groupId);

        });
    });

    test.describe('Delete group Test', () => {
        test(`Should create a group automatically when all groups are deleted`, async ({ }) => {
            await deleteAllGroups(measurementPage);
        });
    });


    test.describe.only('Volume Measurement Test', () => {
        let groupId: string = '';
        let volumeId: string = '';

        const randomX = generateRandomMultipleOf5(50, 100);
        const randomY = generateRandomMultipleOf5(50, 100);

        test.afterEach(async () => {
            await measurementPage.deleteGroup(groupId);
            const isDeleted = await measurementPage.verifyGroupDeleted(groupId);
            expect(isDeleted).toBe(true);
            await measurementPage.validateGroupIsNotDisplayedInUI(groupId);
            await measurementPage.validateMeasurementItemIsNotDisplayedInUI(volumeId);
        });

        async function validateCutFillValues(measurementPage: MeasurementPage, pageManager: PageManager, volumeId: string, volumeTitle: string, expectedCutValue: number, expectedFillValue: number, expectedTotalValue: number) {

            const cutValueFromSideBar = await measurementPage.getCutValueFromSideBar(volumeId) || '';
            const fillValueFromSideBar = await measurementPage.getFillValueFromSideBar(volumeId) || '';
            console.log(`Cut Value From Side Bar: ${cutValueFromSideBar}`);
            console.log(`Fill Value From Side Bar: ${fillValueFromSideBar}`);

            const cleanedCutValueFromSideBar = Math.abs(Number(cutValueFromSideBar.replace(',', '').replace('.00', '')));
            const cleanedFillValueFromSideBar = Math.abs(Number(fillValueFromSideBar.replace(',', '').replace('.00', '')));


            const cutValueFromBelowSideBar = await measurementPage.getCutValueFromBelowSideBar(volumeId);
            const fillValueFromBelowSideBar = await measurementPage.getFillValueFromBelowSideBar(volumeId);
            console.log(`Cut Value From Below Side Bar: ${cutValueFromBelowSideBar}`);
            console.log(`Fill Value From Below Side Bar: ${fillValueFromBelowSideBar}`);

            const totalValueFromBelowSideBar = await measurementPage.getVolumeValueFromBelowSideBar(volumeId);
            console.log(`Total Value From Below Side Bar: ${totalValueFromBelowSideBar}`);

            await pageManager.onMeasurementPage.hoverOverVolumeItemInMap(volumeTitle);

            const { cut: cutValueFromMap, fill: fillValueFromMap, total: totalValueFromMap } = await measurementPage.getCutFillTotalValueFromMap();
            console.log(`Cut Value From Map: ${cutValueFromMap}`);
            console.log(`Fill Value From Map: ${fillValueFromMap}`);
            console.log(`Total Value From Map: ${totalValueFromMap}`);



            expect(Number(cutValueFromBelowSideBar), 'Cut value from below side bar is equal to expected cut value').toBe(expectedCutValue);
            expect(Number(fillValueFromBelowSideBar), 'Fill value from below side bar is equal to expected fill value').toBe(expectedFillValue);
            expect(Number(totalValueFromBelowSideBar), 'Total value from below side bar is equal to expected total value').toBe(expectedTotalValue);


            expect(cleanedCutValueFromSideBar, 'Cut value from side bar is equal to expected cut value').toBe(expectedCutValue);
            expect(cleanedFillValueFromSideBar, 'Fill value from side bar is equal to expected fill value').toBe(expectedFillValue);


            expect(Number(cutValueFromMap), 'Cut value from map is equal to expected cut value').toBe(expectedCutValue);
            expect(Number(fillValueFromMap), 'Fill value from map is equal to expected fill value').toBe(expectedFillValue);
            expect(Number(totalValueFromMap), 'Total value from map is equal to expected total value').toBe(expectedTotalValue);

        }

        async function validateMeasurementContentVisibility(measurementPage: MeasurementPage, volumeId: string) {
            await measurementPage.validateMeasurementItemIsShownInMap(volumeId); //!Not working as data-state attribute value does not change
            await measurementPage.toggleShowHideLayer(volumeId);
            await measurementPage.validateMeasurementItemIsNotShownInMap(volumeId);
            await measurementPage.toggleShowHideLayer(volumeId);
            await measurementPage.validateMeasurementItemIsShownInMap(volumeId);
        }

        async function displayCutFillTotalValues(expectedCutValue: number, expectedFillValue: number, expectedTotalValue: number) {
            console.log(`Expected Cut Value: ${expectedCutValue}`);
            console.log(`Expected Fill Value: ${expectedFillValue}`);
            console.log(`Expected Total Value: ${expectedTotalValue}`);
        }

        test('Should validate data for 3d Design volume', async ({ }) => {
            groupId = await setupMeasurementGroup(measurementPage);
            // const { xStart, yStart } = await setupLocationCoordinates();

            await pageManager.onMapPage.clickOn3dDesignSurface();
            await pageManager.onMapPage.checkCalculateTheTotalCutFillVolumeOfTheDesign();
            await pageManager.onMapPage.clickOnCalculateButton();
            // await measurementPage.createNewVolume(xStart + randomX, yStart + randomY);
            const [volumeResponseData, volumeCalculationResponse] = await Promise.all([
                measurementPage.getMeasurementItemPostResponse(),
                measurementPage.get3DDesignSurfaceVolumeCalculationResponse()
            ]);
            volumeId = volumeResponseData.data.id;
            const volumeTitle = volumeResponseData.data.title;
            console.log(`Created Volume ID: ${volumeId}`);

            await helper.waitForNumberOfSeconds(2);

            let expectedCutValue = Math.abs(volumeCalculationResponse.cut);
            let expectedFillValue = Math.abs(volumeCalculationResponse.fill);
            let expectedTotalValue = Math.abs(volumeCalculationResponse.volume);

            await displayCutFillTotalValues(expectedCutValue, expectedFillValue, expectedTotalValue);
            await helper.waitForNumberOfSeconds(1);

            await validateCutFillValues(measurementPage, pageManager, volumeId, volumeTitle, expectedCutValue, expectedFillValue, expectedTotalValue);
            await validateMeasurementContentVisibility(measurementPage, volumeId);
            await measurementPage.renameMeasurementItem(volumeId, newName);
            await measurementPage.centerOnMap(volumeId);
            await measurementPage.toggleShowHideDetails(volumeId);
        });

        test('Should validate data for Compare Survey volume', async ({ }) => {

            groupId = await setupMeasurementGroup(measurementPage);
            const { xStart, yStart } = await setupLocationCoordinates();

            await pageManager.onMapPage.clickOnCompareSurvey();
            await measurementPage.createNewVolume(xStart + randomX, yStart + randomY);
            const [volumeResponseData, volumeCalculationResponse] = await Promise.all([
                measurementPage.getMeasurementItemPostResponse(),
                measurementPage.getCompareSurveyVolumeCalculationResponse()
            ]);
            volumeId = volumeResponseData.data.id;
            const volumeTitle = volumeResponseData.data.title;
            console.log(`Created Volume ID: ${volumeId}`);

            await helper.waitForNumberOfSeconds(1);
            let expectedCutValue = Math.abs(volumeCalculationResponse.cut);
            let expectedFillValue = Math.abs(volumeCalculationResponse.fill);
            let expectedTotalValue = Math.abs(volumeCalculationResponse.volume);

            await displayCutFillTotalValues(expectedCutValue, expectedFillValue, expectedTotalValue);
            await validateCutFillValues(measurementPage, pageManager, volumeId, volumeTitle, expectedCutValue, expectedFillValue, expectedTotalValue);
            await validateMeasurementContentVisibility(measurementPage, volumeId);
            await measurementPage.renameMeasurementItem(volumeId, newName);
            await measurementPage.centerOnMap(volumeId);
            await measurementPage.toggleShowHideDetails(volumeId);
        });

        test('Should create a group and volume under group and deleting group should delete both group and volume in the measurement page', async ({ }) => {
            await helper.waitForNumberOfSeconds(3);
            groupId = await setupMeasurementGroup(measurementPage);
            const { xStart, yStart } = await setupLocationCoordinates();
            await pageManager.onMapPage.clickOnBasicVolume();
            await measurementPage.createNewVolume(xStart + randomX, yStart + randomY);
            const volumeResponseData = await measurementPage.getMeasurementItemPostResponse();
            const volumeCalculationResponse = await measurementPage.getVolumeCalculationResponse();
            volumeId = volumeResponseData.data.id;
            const volumeTitle = volumeResponseData.data.title;
            console.log(`Created Volume ID: ${volumeId}`);
            await helper.waitForNumberOfSeconds(2);

            const expectedCutValue = Math.abs(volumeCalculationResponse.cut);
            const expectedFillValue = Math.abs(volumeCalculationResponse.fill);
            const expectedTotalValue = Math.abs(volumeCalculationResponse.volume);
            await helper.waitForNumberOfSeconds(1);

            await displayCutFillTotalValues(expectedCutValue, expectedFillValue, expectedTotalValue);
            await validateCutFillValues(measurementPage, pageManager, volumeId, volumeTitle, expectedCutValue, expectedFillValue, expectedTotalValue);

            await validateMeasurementContentVisibility(measurementPage, volumeId);
            await measurementPage.renameMeasurementItem(volumeId, newName);

            await measurementPage.centerOnMap(volumeId);
            await measurementPage.toggleShowHideDetails(volumeId);

        });

        test('Should validate data for all base plane in basic volume', async ({ }) => {
            groupId = await setupMeasurementGroup(measurementPage);
            const { xStart, yStart } = await setupLocationCoordinates();

            await pageManager.onMapPage.clickOnBasicVolume();
            await measurementPage.createNewVolume(xStart + randomX, yStart + randomY);
            const volumeResponseData = await measurementPage.getMeasurementItemPostResponse();
            let volumeCalculationResponse = await measurementPage.getVolumeCalculationResponse(15000);
            volumeId = volumeResponseData.data.id;
            const volumeTitle = volumeResponseData.data.title;
            console.log(`Created Volume ID: ${volumeId}`);

            const basePlaneOptions = ['Triangulation', 'Lowest Point', 'Highest Point', 'Average', 'Custom Elevation'];
            for (const option of basePlaneOptions) {
                await pageManager.onMeasurementPage.clickOnBasePlaneDropdown();
                // await helper.waitForNumberOfSeconds(1 / 5);
                await pageManager.onMeasurementPage.selectBasePlaneOption(option);
                if (option === 'Custom Elevation') {
                    await helper.waitForNumberOfSeconds(5);
                    await measurementPage.enterCustomLevel('10');
                    volumeCalculationResponse = await measurementPage.getVolumeCalculationResponse();
                } else {
                    volumeCalculationResponse = await measurementPage.getVolumeCalculationResponse();
                }

                await helper.waitForNumberOfSeconds(2);

                let expectedCutValue = Math.abs(volumeCalculationResponse.cut);
                let expectedFillValue = Math.abs(volumeCalculationResponse.fill);
                let expectedTotalValue = Math.abs(volumeCalculationResponse.volume);
                await displayCutFillTotalValues(expectedCutValue, expectedFillValue, expectedTotalValue);
                await helper.waitForNumberOfSeconds(1);

                await validateCutFillValues(measurementPage, pageManager, volumeId, volumeTitle, expectedCutValue, expectedFillValue, expectedTotalValue);

            }
            await validateMeasurementContentVisibility(measurementPage, volumeId);
            await measurementPage.renameMeasurementItem(volumeId, newName);
            await measurementPage.centerOnMap(volumeId);
            await measurementPage.toggleShowHideDetails(volumeId);
        });

       
    });
});
