import { faker } from '@faker-js/faker';
import { HelperBase } from '../../../pages/HelperBase';
import { MapPage } from '../../../pages/MapPage';
import { PageManager } from '../../../pages/PageManager';
import { test, expect } from '../../../test-options';
import { BrowserContext } from '@playwright/test';
import { Page } from '@playwright/test';

test.describe('Basic Map Operation @smoke', () => {
    let pm: PageManager;
    let helper: HelperBase;
    let mapPage: MapPage;
    let context: BrowserContext;
    let page: Page;

    test.beforeAll(async ({ browser }) => {
        context = await browser.newContext();
        page = await context.newPage();

        pm = new PageManager(page);
        mapPage = pm.onMapPage;
        helper = new HelperBase(pm.getPage);
        await pm.onLoginPage.openLoginPageAndWaitForPageToLoad();
        await pm.onDashboardPage.closeReadUserGuidePopUp();
        await pm.onDashboardPage.openProject();
    });

    test.afterAll(async () => {
        await context.close();
    });

    test('Should switch between 2D and 3D map views and validate selected map layers and visibility', async () => {
        console.log(`Starting test: ${test.info().title}`);
        console.log('Should verify background is not displayed');
        // await mapPage.ensureBackgroundIsNotDisplayed();

        console.log(`Clicking and validating Map Layer : 3D Mesh Model`);
        await mapPage.clickOn3D();
        await mapPage.expectMapViewToBe('3D');
        await mapPage.validateMapLayerIsChecked('3D Mesh Model');

        console.log(`Clicking and validating Map Layer : 2D Orthomosaic`);
        await mapPage.clickOn2D();
        await mapPage.expectMapViewToBe('2D');
        await mapPage.validateMapLayerIsChecked('2D Orthomosaic');

        console.log(`Ending test: ${test.info().title}`);
    });

    test('Should verify 2d map is visible and validate map attributes after zooming in, panning and rotating', async () => {
        await mapPage.verify2DMapIsVisible();

        const mapAttributes = await mapPage.getMapAttributes();
        console.log(`Map attributes: ${JSON.stringify(mapAttributes)}`);

        const zoomLevel = mapAttributes.zoomLevel;
        const mapRotation = mapAttributes.mapRotation;
        const mapCameraPositionX = mapAttributes.mapCameraPosition[0];
        const mapCameraPositionY = mapAttributes.mapCameraPosition[1];

        console.log(`Map rotation: ${mapRotation}`);
        console.log(`Map camera position: ${mapCameraPositionX}, ${mapCameraPositionY}`);
        console.log(`Zoom level: ${zoomLevel}`);

        expect(mapRotation).toBeDefined();
        expect(mapCameraPositionX).toBeDefined();
        expect(mapCameraPositionY).toBeDefined();
        expect(zoomLevel).toBeDefined();

        // Zooming IN
        await mapPage.clickOnZoomInButton(faker.number.int({ min: 600, max: 1000 }));
        await helper.waitForNumberOfSeconds(1);

        // Rotate
        const boundingBox = await pm.onMapPage.getMapBoundingBox();

        if (!boundingBox) {
            console.error('Map element not found or bounding box unavailable.');
        }
        const { xStart, yStart } = await pm.onMapPage.getStaringPosition(boundingBox, 2);
        await pm.onMapPage.moveMouseToCenter(xStart, yStart);
        await pm.onMapPage.rightClickAndHoldMouse();
        const dragDistance = 2000;
        // const steps = 40;
        await pm.onMapPage.moveMouseUpward(xStart, yStart, dragDistance, 40);
        await pm.onMapPage.moveMouseDownward(xStart, yStart, dragDistance, 20);
        await pm.onMapPage.releaseRightClick();

        await helper.waitForNumberOfSeconds(1);
        // Panning
        await pm.onMapPage.moveMouseToCenter(xStart, yStart);
        await pm.onMapPage.clickAndHoldOnMap();
        const dragDistanceForPan = 500;
        const stepsForPan = 60;

        // Pan up
        await pm.onMapPage.moveMouseUpward(xStart, yStart, dragDistanceForPan, stepsForPan);
        // Pan down
        await pm.onMapPage.moveMouseDownward(xStart, yStart, dragDistanceForPan, stepsForPan);
        // Pan Left
        await pm.onMapPage.moveMouseLeft(xStart, yStart, dragDistanceForPan, stepsForPan);
        // Pan right
        await pm.onMapPage.moveMouseRight(xStart, yStart, dragDistanceForPan, stepsForPan);
        await pm.onMapPage.releaseTheMouse();

        await helper.waitForNumberOfSeconds(1);

        const mapAttributesAfterZoomIn = await mapPage.getMapAttributes();
        console.log(`Map attributes after zoom in: ${JSON.stringify(mapAttributesAfterZoomIn)}`);
        expect(mapAttributesAfterZoomIn.zoomLevel).toBeGreaterThan(zoomLevel);
        expect(mapAttributesAfterZoomIn.mapRotation).not.toEqual(mapRotation);
        expect(mapAttributesAfterZoomIn.mapRotation).toBeGreaterThan(mapRotation);
        expect(mapAttributesAfterZoomIn.mapCameraPosition).not.toStrictEqual([mapCameraPositionX, mapCameraPositionY]);

    });

    test('Should verify 3d map is visible and validate map attributes after zooming in, panning and rotating', async () => {
        const threeDMapPage = pm.on3DMap;
        await mapPage.clickOn3D();
        await helper.waitForNumberOfSeconds(3);
        await mapPage.clickMapToCenter();
        await threeDMapPage.verify3DMapIsVisible();


        const mapAttributes = await threeDMapPage.getMapAttributes();
        console.log(`Map attributes: ${JSON.stringify(mapAttributes)}`);

        const zoomLevel = mapAttributes.zoomLevel;
        const mapRotation = mapAttributes.mapRotation;
        const mapCameraPositionX = mapAttributes.mapCameraPosition[0];
        const mapCameraPositionY = mapAttributes.mapCameraPosition[1];

        console.log(`Map rotation: ${mapRotation}`);
        console.log(`Map camera position: ${mapCameraPositionX}, ${mapCameraPositionY}`);
        console.log(`Zoom level: ${zoomLevel}`);

        expect(mapRotation).toBeDefined();
        expect(mapCameraPositionX).toBeDefined();
        expect(mapCameraPositionY).toBeDefined();
        expect(zoomLevel).toBeDefined();

        // Zooming IN
        await mapPage.clickOnZoomInButton(faker.number.int({ min: 100, max: 300 }));
        await helper.waitForNumberOfSeconds(1);

        // Rotate
        const boundingBox = await pm.onMapPage.getMapBoundingBox();

        if (!boundingBox) {
            console.error('Map element not found or bounding box unavailable.');
        }
        const { xStart, yStart } = await pm.onMapPage.getStaringPosition(boundingBox, 2);
        await pm.onMapPage.moveMouseToCenter(xStart, yStart);
        await pm.onMapPage.rightClickAndHoldMouse();
        const dragDistance = 200;
        // const steps = 40;
        await pm.onMapPage.moveMouseUpward(xStart, yStart, dragDistance, 20);
        await pm.onMapPage.moveMouseRight(xStart, yStart, dragDistance, 10);
        await pm.onMapPage.moveMouseUpward(xStart, yStart, dragDistance, 10);
        await pm.onMapPage.releaseRightClick();

        await helper.waitForNumberOfSeconds(1);
        // Panning
        await pm.onMapPage.moveMouseToCenter(xStart, yStart);
        await pm.onMapPage.clickAndHoldOnMap();
        const dragDistanceForPan = 500;
        const stepsForPan = 60;

        // Pan up
        await pm.onMapPage.moveMouseUpward(xStart, yStart, dragDistanceForPan, stepsForPan);
        // Pan down
        await pm.onMapPage.moveMouseDownward(xStart, yStart, dragDistanceForPan, stepsForPan);
        // Pan Left
        await pm.onMapPage.moveMouseLeft(xStart, yStart, dragDistanceForPan, stepsForPan);
        // Pan right
        await pm.onMapPage.moveMouseRight(xStart, yStart, dragDistanceForPan, stepsForPan);
        await pm.onMapPage.releaseTheMouse();

        await helper.waitForNumberOfSeconds(1);

        const mapAttributesAfterZoomIn = await threeDMapPage.getMapAttributes();
        console.log(`Map attributes after zoom in: ${JSON.stringify(mapAttributesAfterZoomIn)}`);
        expect(mapAttributesAfterZoomIn.zoomLevel).toBeLessThan(zoomLevel); //! Failing
        expect(mapAttributesAfterZoomIn.mapRotation).not.toEqual(mapRotation);
        expect(mapAttributesAfterZoomIn.mapRotation).toBeGreaterThan(mapRotation);
        expect(mapAttributesAfterZoomIn.mapCameraPosition).not.toStrictEqual([mapCameraPositionX, mapCameraPositionY]);



    });

    test('Should retain zoom level and camera position when switching between 2D and 3D map views', async () => {

        await mapPage.verify2DMapIsVisible();

        const initialTwoDMapAttributes = await mapPage.getMapAttributes();
        console.log(`Map attributes: ${JSON.stringify(initialTwoDMapAttributes)}`);

        const initial2DZoomLevelValue = initialTwoDMapAttributes.zoomLevel;
        const initial2DMapCameraPositionXValue = initialTwoDMapAttributes.mapCameraPosition[0];
        const initial2DMapCameraPositionYValue = initialTwoDMapAttributes.mapCameraPosition[1];

        console.log(`Map camera position: ${initial2DMapCameraPositionXValue}, ${initial2DMapCameraPositionYValue}`);
        console.log(`Zoom level: ${initial2DZoomLevelValue}`);

        expect(initial2DMapCameraPositionXValue).toBeDefined();
        expect(initial2DMapCameraPositionYValue).toBeDefined();
        expect(initial2DZoomLevelValue).toBeDefined();

        await mapPage.clickOn3D();
        await helper.waitForNumberOfSeconds(3);
        await mapPage.clickMapToCenter();
        const threeDMapPage = pm.on3DMap;
        await threeDMapPage.verify3DMapIsVisible();

        const initial3DMapAttributesAfterSwitchingTo3D = await threeDMapPage.getMapAttributes();
        console.log(`Map attributes after switching to 3D: ${JSON.stringify(initial3DMapAttributesAfterSwitchingTo3D)}`);

        const initial3DZoomLevelValue = initial3DMapAttributesAfterSwitchingTo3D.zoomLevel;
        const initial3DMapCameraPositionXValue = initial3DMapAttributesAfterSwitchingTo3D.mapCameraPosition[0];
        const initial3DMapCameraPositionYValue = initial3DMapAttributesAfterSwitchingTo3D.mapCameraPosition[1];

        expect(initial3DMapCameraPositionXValue).toBeDefined();
        expect(initial3DMapCameraPositionYValue).toBeDefined();
        expect(initial3DZoomLevelValue).toBeDefined();

        // Zooming IN
        await mapPage.clickOnZoomInButton(faker.number.int({ min: 100, max: 300 }));
        await helper.waitForNumberOfSeconds(3);

        const boundingBox = await pm.onMapPage.getMapBoundingBox();
        if (!boundingBox) {
            console.error('Map element not found or bounding box unavailable.');
        }
        const { xStart, yStart } = await pm.onMapPage.getStaringPosition(boundingBox, 2);

        // rotate
        await pm.onMapPage.moveMouseToCenter(xStart, yStart);
        await pm.onMapPage.rightClickAndHoldMouse();
        const dragDistance = 200;
        // const steps = 40;
        await pm.onMapPage.moveMouseUpward(xStart, yStart, dragDistance, 20);
        await pm.onMapPage.moveMouseRight(xStart, yStart, dragDistance, 10);
        await pm.onMapPage.moveMouseUpward(xStart, yStart, dragDistance, 10);
        await pm.onMapPage.releaseRightClick();

        await helper.waitForNumberOfSeconds(1);

        // Panning
        await pm.onMapPage.moveMouseToCenter(xStart, yStart);
        await pm.onMapPage.clickAndHoldOnMap();
        const dragDistanceForPan = 500;
        const stepsForPan = 60;

        await pm.onMapPage.moveMouseUpward(xStart, yStart, dragDistanceForPan, stepsForPan);
        await pm.onMapPage.moveMouseLeft(xStart, yStart, dragDistanceForPan, stepsForPan);
        await pm.onMapPage.releaseTheMouse();

        await helper.waitForNumberOfSeconds(1);

        const threeDMapAttributesAfterZoomInAndPan = await threeDMapPage.getMapAttributes();
        console.log(`Map attributes after zoom in and pan: ${JSON.stringify(threeDMapAttributesAfterZoomInAndPan)}`);

        const threeDZoomLevelAfterZoomInAndPan = threeDMapAttributesAfterZoomInAndPan.zoomLevel;
        const threeDMapCameraPositionXAfterZoomInAndPan = threeDMapAttributesAfterZoomInAndPan.mapCameraPosition[0];
        const threeDMapCameraPositionYAfterZoomInAndPan = threeDMapAttributesAfterZoomInAndPan.mapCameraPosition[1];

        expect(threeDZoomLevelAfterZoomInAndPan).toBeLessThan(initial3DZoomLevelValue);
        expect(threeDMapCameraPositionXAfterZoomInAndPan).not.toStrictEqual(initial3DMapCameraPositionXValue);
        expect(threeDMapCameraPositionYAfterZoomInAndPan).not.toStrictEqual(initial3DMapCameraPositionYValue);

        await mapPage.clickOn2D();
        await helper.waitForNumberOfSeconds(3);
        await mapPage.expectMapViewToBe('2D');

        const twoDMapAttributesAfterSwitchingTo2DFrom3D = await mapPage.getMapAttributes();
        console.log(`Map attributes after switching to 2D: ${JSON.stringify(twoDMapAttributesAfterSwitchingTo2DFrom3D)}`);

        const twoDZoomLevelAfterSwitchingTo2DFrom3D = twoDMapAttributesAfterSwitchingTo2DFrom3D.zoomLevel;
        expect(twoDZoomLevelAfterSwitchingTo2DFrom3D).not.toBe(initial2DZoomLevelValue);
        expect(twoDMapAttributesAfterSwitchingTo2DFrom3D.mapCameraPosition).not.toStrictEqual([initial2DMapCameraPositionXValue, initial2DMapCameraPositionYValue]);

        // Zooming IN
        await mapPage.clickOnZoomInButton(faker.number.int({ min: 100, max: 300 }));
        await helper.waitForNumberOfSeconds(1);

        const twoDMapAttributesAfterZoomIn = await mapPage.getMapAttributes();
        console.log(`Map attributes after zoom in 2d map: ${JSON.stringify(twoDMapAttributesAfterZoomIn)}`);

        await mapPage.clickOn3D();
        await helper.waitForNumberOfSeconds(3);
        await mapPage.expectMapViewToBe('3D');

        const threeDMapAttributesAfterZoomIn2D = await threeDMapPage.getMapAttributes();
        console.log(`Map attributes after switching to 3d map: ${JSON.stringify(threeDMapAttributesAfterZoomIn2D)}`);

        expect(threeDMapAttributesAfterZoomIn2D.zoomLevel).not.toBe(initial3DZoomLevelValue);
        expect(threeDMapAttributesAfterZoomIn2D.mapCameraPosition).not.toStrictEqual([initial3DMapCameraPositionXValue, initial3DMapCameraPositionYValue]);


        await mapPage.clickOn2D();
        await helper.waitForNumberOfSeconds(3);
        await mapPage.expectMapViewToBe('2D');

        await mapPage.clickOn3D();
        await helper.waitForNumberOfSeconds(3);
        await mapPage.expectMapViewToBe('3D');

        const threeDMapAttributesAfterSwitchingTo3DFrom2D = await threeDMapPage.getMapAttributes();
        console.log(`Map attributes after switching to 3d map second time: ${JSON.stringify(threeDMapAttributesAfterSwitchingTo3DFrom2D)}`);

        expect(threeDMapAttributesAfterSwitchingTo3DFrom2D.zoomLevel).not.toBe(initial3DZoomLevelValue);
        expect(threeDMapAttributesAfterSwitchingTo3DFrom2D.mapCameraPosition).not.toStrictEqual([initial3DMapCameraPositionXValue, initial3DMapCameraPositionYValue]);

        const zoomLevelDifference = Math.abs(threeDMapAttributesAfterSwitchingTo3DFrom2D.zoomLevel - threeDMapAttributesAfterZoomIn2D.zoomLevel);
        console.log(`Zoom level difference: ${zoomLevelDifference}`);
        expect(zoomLevelDifference).toBeLessThanOrEqual(200);
        expect(Math.abs(threeDMapAttributesAfterSwitchingTo3DFrom2D.zoomLevel - threeDMapAttributesAfterZoomIn2D.zoomLevel)).toBeLessThanOrEqual(200);


    });

    test.fixme('Should retain orientation when switching between 2D and 3D map views', async () => {
        ``;
    });
});
