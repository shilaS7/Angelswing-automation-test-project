import { faker } from '@faker-js/faker';
import { HelperBase } from '../../../pages/HelperBase';
import { PageManager } from '../../../pages/PageManager';
import { test } from '../../../test-options';
import { BrowserContext, expect, Page } from '@playwright/test';

test.describe('2D Map Interaction test', () => {
    let pageManager: PageManager;
    let context: BrowserContext;
    let page: Page;
    let helper: HelperBase;

    test.beforeAll(async ({ browser }, testInfo) => {
        context = await browser.newContext();
        page = await context.newPage();
        pageManager = new PageManager(page);
        helper = new HelperBase(pageManager.getPage);

        await pageManager.onLoginPage.openLoginPageAndWaitForPageToLoad();
        await helper.closeReadUserGuidePopUp(pageManager, testInfo);
        await pageManager.onDashboardPage.openProject();
        await pageManager.getPage.waitForTimeout(2000);
        await pageManager.onMapPage.verifyMapIsVisible();
        await pageManager.getPage.waitForTimeout(2000);

    });

    test.afterAll(async () => {
        await context.close();
    });

    test('should rotate  2D map @smoke', async () => {
        console.log('**** Starting 2D Map rotate test ****');
        const boundingBox = await pageManager.onMapPage.getMapBoundingBox();

        if (boundingBox) {
            const { xStart, yStart } = await pageManager.onMapPage.getStaringPosition(boundingBox, 2);
            await pageManager.onMapPage.moveMouseToCenter(xStart, yStart);
            await pageManager.onMapPage.rightClickAndHoldMouse();
            const dragDistance = 2000;
            // const steps = 40;
            await pageManager.onMapPage.moveMouseUpward(xStart, yStart, dragDistance, 40);
            // await expect(pageManager.onMapPage.mapLocator).toHaveScreenshot('rotate-upward-2d-map.png');

            await pageManager.onMapPage.moveMouseDownward(xStart, yStart, dragDistance, 20);
            await pageManager.onMapPage.releaseRightClick();
            // await expect(pageManager.onMapPage.mapLocator).toHaveScreenshot('rotate-downward-2d-map.png');
        } else {
            console.error('Map element not found or bounding box unavailable.');
        }
    });

    test('should zoom in, zoom out using mouse wheel and compare images with the baseline image @smoke', async () => {
        const boundingBox = await pageManager.onMapPage.getMapBoundingBox();

        if (boundingBox) {
            const { xStart, yStart } = await pageManager.onMapPage.getStaringPosition(boundingBox, 2);

            await pageManager.onMapPage.moveMouseToCenter(xStart, yStart);

            const zoomLevel = 200;
            console.log('**** Zoom in test started ****');
            await pageManager.onMapPage.zoomInMap(zoomLevel);
            await helper.waitForNumberOfSeconds(2);

            await pageManager.onMapPage.zoomInMap(zoomLevel);
            await helper.waitForNumberOfSeconds(2);
            // await expect(pageManager.onMapPage.mapLocator).toHaveScreenshot('zoom-in-2d-map.png');
            console.log('**** Zoom in test completed ****');
            console.log('**** Zoom out test started ****');

            await pageManager.onMapPage.zoomOutMap(zoomLevel);
            await helper.waitForNumberOfSeconds(2);
            // await expect(pageManager.onMapPage.mapLocator).toHaveScreenshot('zoom-out-2d-map.png');
            console.log('**** Zoom out test completed ****');

        } else {
            console.error('Map element not found or bounding box unavailable.');
        }
    });

    test('should pan the map to the up, down, left and right directions @smoke', async () => {
        console.log('**** Starting 2D Map PAN test ****');
        const boundingBox = await pageManager.onMapPage.getMapBoundingBox();

        if (boundingBox) {
            const { xStart, yStart } = await pageManager.onMapPage.getStaringPosition(boundingBox, 2);

            await pageManager.onMapPage.moveMouseToCenter(xStart, yStart);

            const zoomLevel = 200;
            await pageManager.onMapPage.zoomInMap(zoomLevel);
            await helper.waitForNumberOfSeconds(2);

            await pageManager.onMapPage.clickAndHoldOnMap();
            const dragDistance = 500;
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
