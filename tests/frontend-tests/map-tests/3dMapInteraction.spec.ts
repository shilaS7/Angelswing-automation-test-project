import { HelperBase } from '../../../pages/HelperBase';
import { PageManager } from '../../../pages/PageManager';
import { test } from '../../../test-options';
import { BrowserContext, expect, Page } from '@playwright/test';

test.describe('3D Map Interaction test', () => {
    let pageManager: PageManager;
    let context: BrowserContext;
    let page: Page;
    let helper: HelperBase;

    test.beforeAll('Test setup for 2D Orthomosaic', async ({ browser }) => {
        context = await browser.newContext();
        page = await context.newPage();
        pageManager = new PageManager(page);
        helper = new HelperBase(pageManager.getPage);

        await pageManager.onLoginPage.openLoginPageAndWaitForPageToLoad();
        await pageManager.onDashboardPage.closeReadUserGuidePopUp();
        await pageManager.onDashboardPage.openProject();
        await pageManager.getPage.waitForTimeout(2000);
        await pageManager.onMapPage.verifyMapIsVisible();
        await pageManager.onMapPage.clickOn3D();
        await pageManager.on3DMap.verify3DMapIsVisible();
        await pageManager.getPage.waitForTimeout(2000);

    });

    test.afterAll(async () => {
        await context.close();
    });

    test.skip('should validate  3D map initial position', async () => {
        console.log('**** Starting 3D Map initial test ****');
        // await expect(pageManager.onMapPage.mapLocator).toHaveScreenshot('Initial-3D-Map.png');
    });
    test('should rotate  3D map', async () => {
        console.log('**** Starting 3D Map rotate test ****');
        //await pageManager.onMapPage.clickMapToCenter();
        const boundingBox = await pageManager.onMapPage.getMapBoundingBox();

        if (boundingBox) {
            const { xStart, yStart } = await pageManager.onMapPage.getStaringPosition(boundingBox, 3);

            await helper.waitForNumberOfSeconds(3);
            await pageManager.onMapPage.zoomInMap(250);
            await helper.waitForNumberOfSeconds(2);

            await pageManager.onMapPage.moveMouseToCenter(xStart, yStart);
            await pageManager.onMapPage.rightClickAndHoldMouse();

            const dragDistance = 150;
            // const steps = 40;
            await helper.waitForNumberOfSeconds(2);

            await pageManager.onMapPage.moveMouseUpward(xStart, yStart, dragDistance, 40);
            await pageManager.onMapPage.moveMouseRight(xStart, yStart, dragDistance, 40);
            await pageManager.onMapPage.moveMouseLeft(xStart, yStart, dragDistance, 40);

            // await expect(pageManager.onMapPage.mapLocator).toHaveScreenshot('rotate-upward-3d-map.png');

            await helper.waitForNumberOfSeconds(2);

            await pageManager.onMapPage.moveMouseDownward(xStart, yStart, dragDistance, 20);
            await pageManager.onMapPage.releaseRightClick();
            // await expect(pageManager.onMapPage.mapLocator).toHaveScreenshot('rotate-downward-3d-map.png');
        } else {
            console.error('Map element not found or bounding box unavailable.');
        }
    });

    test('should zoom in, zoom out using mouse wheel and compare images with the baseline', async () => {
        console.log('**** Starting 3D Map zoom in and zoom out test ****');
        //await pageManager.onMapPage.clickMapToCenter();
        await helper.waitForNumberOfSeconds(1);
        const boundingBox = await pageManager.onMapPage.getMapBoundingBox();

        if (boundingBox) {
            const { xStart, yStart } = await pageManager.onMapPage.getStaringPosition(boundingBox, 3);
            await pageManager.onMapPage.moveMouseToCenter(xStart, yStart);

            await helper.waitForNumberOfSeconds(2);
            await pageManager.onMapPage.zoomInMap(250);
            await helper.waitForNumberOfSeconds(1);
            await pageManager.onMapPage.zoomInMap(250);
            await helper.waitForNumberOfSeconds(2);
            // await expect(pageManager.onMapPage.mapLocator).toHaveScreenshot('zoom-in-3d-map.png');
            await helper.waitForNumberOfSeconds(3);

            await pageManager.onMapPage.zoomOutMap(250);
            // await expect(pageManager.onMapPage.mapLocator).toHaveScreenshot('zoom-out-3d-map.png');


        } else {
            console.error('Map element not found or bounding box unavailable.');
        }
    });

    test('should pan the map to the up, down, left and right directions', async () => {
        console.log('**** Starting 3D Map panning test ****');
        //await pageManager.onMapPage.clickMapToCenter();
        const boundingBox = await pageManager.onMapPage.getMapBoundingBox();

        if (boundingBox) {
            const { xStart, yStart } = await pageManager.onMapPage.getStaringPosition(boundingBox, 3);
            await pageManager.onMapPage.moveMouseToCenter(xStart, yStart);

            await helper.waitForNumberOfSeconds(2);
            await pageManager.onMapPage.zoomInMap(250);
            await helper.waitForNumberOfSeconds(2);
            await pageManager.onMapPage.zoomInMap(150);
            await helper.waitForNumberOfSeconds(2);

            // await pageManager.onMapPage.moveMouseToCenter(xStart, yStart);
            await pageManager.onMapPage.rightClickAndHoldMouse();

            const dragDistance = 200;
            // const steps = 40;
            await helper.waitForNumberOfSeconds(2);

            await pageManager.onMapPage.moveMouseUpward(xStart, yStart, dragDistance, 10);
            await pageManager.onMapPage.releaseRightClick();
            await pageManager.onMapPage.clickAndHoldOnMap();

            const steps = 60;

            // Pan up
            await pageManager.onMapPage.moveMouseUpward(xStart, yStart, dragDistance, steps);

            // Pan down
            await pageManager.onMapPage.moveMouseDownward(xStart, yStart, dragDistance, steps);

            // Pan Left
            await pageManager.onMapPage.moveMouseLeft(xStart, yStart, dragDistance, steps);

            // Pan right
            await pageManager.onMapPage.moveMouseRight(xStart, yStart, dragDistance, steps);

            await pageManager.onMapPage.releaseTheMouse();

            console.log('Map panned test completed');

        } else {
            console.error('Map element not found or bounding box unavailable.');
        }
    });
});

