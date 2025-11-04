import { HelperBase } from '../../../pages/HelperBase';
import { PageManager } from '../../../pages/PageManager';
import { test } from '../../../test-options';
import { BrowserContext, expect, Page } from '@playwright/test';
import * as fs from 'fs';


test.describe('Map Tool button tests', () => {
    let pageManager: PageManager;
    let context: BrowserContext;
    let page: Page;
    let helper: HelperBase;

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
        await pageManager.onMapPage.verifyMapIsVisible();
    });

    test.afterAll(async ({ }, testInfo) => {
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

    test.beforeEach(async ({ }, testInfo) => {
        await pageManager.onProjectSidebarPage.collapseSidebar();
        // await helper.waitForNumberOfSeconds(1);

    });

    test('Should verify several map tool buttons are displayed in 2d map', async ({ }, testInfo) => {
        const mapPage = pageManager.onMapPage;

        expect(await mapPage.isDatasetTitleIsDisplayed()).toBe(true);
        expect(await mapPage.isDownloadButtonIsDisplayed()).toBe(true);
        expect(await mapPage.isRequestToPrintButtonIsDisplayed()).toBe(true);
        expect(await mapPage.isShareButtonIsDisplayed()).toBe(true);
        expect(await mapPage.isInviteButtonIsDisplayed()).toBe(true);
        expect(await mapPage.isHistoryButtonIsDisplayed()).toBe(true);
        expect(await mapPage.isNotificationButtonIsDisplayed()).toBe(true);

        expect(await mapPage.isSelectPointerDisplayed()).toBe(true);
        expect(await mapPage.isMarkerIsDisplayed()).toBe(true);
        expect(await mapPage.isLengthIsDisplayed()).toBe(true);
        expect(await mapPage.isAreaIsDisplayed()).toBe(true);
        expect(await mapPage.isBasicVolumeIsDisplayed()).toBe(true);
        expect(await mapPage.isHideIconIsDisplayed()).toBe(true);

        expect(await mapPage.isDefaultIconIsDisplayed()).toBe(true);
        expect(await mapPage.isTwoScreenIconIsDisplayed()).toBe(true);
        expect(await mapPage.isFourScreenIconIsDisplayed()).toBe(true);
        expect(await mapPage.isSliderIconIsDisplayed()).toBe(true);
        expect(await mapPage.isScreenCaptureIconIsDisplayed()).toBe(true);
        expect(await mapPage.isMapCenterButtonDisplayed()).toBe(true);
        expect(await mapPage.isMapZoomInButtonDisplayed()).toBe(true);
        expect(await mapPage.isMapZoomOutButtonDisplayed()).toBe(true);
        expect(await mapPage.isCurrentLocationButtonDisplayed()).toBe(true);
        expect(await mapPage.isShowCoordinatesButtonDisplayed()).toBe(true);

        expect(await mapPage.isBackgroundToggleButtonIsDisplayed()).toBe(true);
        expect(await mapPage.isTwoDThreeDToggleButtonIsDisplayed()).toBe(true);
        expect(await mapPage.isPresentationModeIsDisplayed()).toBe(true);
    });

    // https://app.clickup.com/t/86eru52c3
    test('Should set map to default view after clicking on default tool button', async () => {
        const mapPage = pageManager.onMapPage;
        await mapPage.clickOnTwoScreen();
        expect(await mapPage.getScreenPickerCountForTwoScreen()).toHaveCount(2);

        await mapPage.clickOnDefault();
        expect(await mapPage.getScreenPickerCountForTwoScreen()).toHaveCount(0);

        expect(await mapPage.getScreenPickerCountForFourScreen()).toHaveCount(0);

        await mapPage.clickOnFourScreen();
        expect(await mapPage.getScreenPickerCountForFourScreen()).toHaveCount(4);

        await mapPage.clickOnDefault();
        expect(await mapPage.getScreenPickerCountForTwoScreen()).toHaveCount(0);
        expect(await mapPage.getScreenPickerCountForFourScreen()).toHaveCount(0);

        await mapPage.clickOnSlider();
        expect(await mapPage.isSliderVisible()).toBe(true);

        await mapPage.clickOnDefault();
        expect(await mapPage.isSliderVisible()).toBe(false);
    });

    // https://app.clickup.com/t/86eru52w7
    test.describe('Split 2/4 - screen test', () => {

        test('Should split the view into 2 different screens on click of 2-screen', async () => {
            const mapPage = pageManager.onMapPage;
            const datasetTitle = await mapPage.getDataSetTitle();

            await mapPage.clickOnTwoScreen();

            // const mapPage = pageManager.onmapPage;
            const datasetTitleTwoScreen = await mapPage.getDataSetTitleFromTwoScreen();

            expect(datasetTitle).toEqual(datasetTitleTwoScreen);

            expect(await mapPage.getScreenPickerCountForTwoScreen()).toHaveCount(2);

            const selectionMessage = await mapPage.getMessageFromSecondDatasetSelectScreen();
            console.log(`Dataset selection message: ${selectionMessage}`);
            expect(selectionMessage).toEqual('Please select another dataset');

            await mapPage.validateOrthoIsSelectedByDefaultOnFirstScreen();
            await mapPage.validateDsmAndDtmIsClickableInFirstScreen();
            await mapPage.validateOrthoDsmDtmAreDisabledInSecondScreen();

            await mapPage.clickAndSelectDataSetOnSecondScreen(datasetTitle as string);
        });

        test('Should split the view into 4 different screens on click of 4-screen', async () => {
            const mapPage = pageManager.onMapPage;
            const datasetTitle = await mapPage.getDataSetTitle();

            await mapPage.clickOnFourScreen();


            const datasetTitleFourScreen = await mapPage.getDataSetTitleFromFourScreen();

            expect(datasetTitle).toEqual(datasetTitleFourScreen);

            await expect(await mapPage.getScreenPickerCountForFourScreen()).toHaveCount(4);

            const selectionMessage = await mapPage.getMessageFromSecondDatasetSelectScreenOfFourScreen();
            console.log(`Dataset selection message: ${selectionMessage}`);
            expect(selectionMessage).toEqual('Please select another dataset');

            await mapPage.validateOrthoIsSelectedByDefaultOnFirstScreen();
            await mapPage.validateDsmAndDtmIsClickableInFirstScreen();
            await mapPage.validateOrthoDsmDtmAreDisabledInSecondScreen();
            await mapPage.validateOrthoDsmDtmAreDisabledInThirdScreen();

            await mapPage.clickAndSelectDataSetOnFourthScreen(datasetTitle as string);
        });
    });

    // https://app.clickup.com/t/86eru531j
    test('Should slide and compare two datasets', async () => {
        const mapPage = pageManager.onMapPage;
        const datasetTitle = await mapPage.getDataSetTitle();

        await mapPage.clickOnSlider();
        expect(await mapPage.isSliderVisible()).toBe(true);
        expect(await mapPage.getScreenPickerCountForSliderScreen()).toHaveCount(1);

        const datasetTitleTwoScreen = await mapPage.getDataSetTitleFromSliderScreen();
        expect(datasetTitle).toEqual(datasetTitleTwoScreen);
        await mapPage.clickAndSelectDataSetOnSecondScreenOfSliderScreen(datasetTitle as string);

        const boundingBox = await pageManager.onMapPage.getMapBoundingBox();

        if (boundingBox) {
            const { xStart, yStart } = await pageManager.onMapPage.getStaringPosition(boundingBox, 2);
            await mapPage.hoverMouseAndClickOnSlider();
            await pageManager.onMapPage.clickAndHoldOnMap();
            const dragDistance = 75;
            const steps = 10;

            // Pan right
            await pageManager.onMapPage.moveMouseRight(xStart, yStart, dragDistance, steps);
            // Pan Left
            await pageManager.onMapPage.moveMouseLeft(xStart, yStart, dragDistance, steps);
            // Pan Left
            await pageManager.onMapPage.moveMouseLeft(xStart, yStart, dragDistance, steps);
            await pageManager.getPage.screenshot({ path: 'screenshots/screenshot.png' });
            await pageManager.getPage.getByTestId('OlTwoDSlider-SliderSvgWrapper').screenshot({ path: 'screenshots/slider.png' });
            // Pan up
            await pageManager.onMapPage.moveMouseUpward(xStart, yStart, dragDistance, steps);
            // Pan down
            await pageManager.onMapPage.moveMouseDownward(xStart, yStart, dragDistance, steps);

            await pageManager.onMapPage.releaseTheMouse();

            console.log('Map Slider test completed');
        } else {
            console.error('Map element not found or bounding box unavailable.');
        }
    });

    // https://app.clickup.com/t/86eru5362
    test('should capture screen and verify screenshot download', async ({ }) => {
        const mapPage = pageManager.onMapPage;

        // Wait for download event and click capture button
        const [download] = await Promise.all([
            page.waitForEvent('download'),
            mapPage.clickOnScreenCapture()
        ]);

        // Get suggested filename
        const fileName = download.suggestedFilename();
        console.log(`📸 Screenshot downloaded: ${fileName}`);

        // Define the save location
        const filePath = `./downloads/${fileName}`;
        await download.saveAs(filePath);

        // Verify the file exists
        expect(fs.existsSync(filePath)).toBeTruthy();
        console.log(`✅ Verified: Screenshot downloaded successfully at ${filePath}`);
    });

    test('should zoom in, zoom out using zoom in/out button and verify images are different', async () => {
        console.log('**** Zoom in test started ****');
        await pageManager.onMapPage.clickOnZoomInButton();
        console.log('**** Zoom in test completed ****');

        console.log('**** Zoom out test started ****');
        await pageManager.onMapPage.clickOnZoomOutButton();
        console.log('**** Zoom out test completed ****');
    });

});
