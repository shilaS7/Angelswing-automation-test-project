import { BrowserContext, Page } from '@playwright/test';
import { HelperBase } from '../../../pages/HelperBase';
import { PageManager } from '../../../pages/PageManager';
import { test, expect } from '../../../test-options';
import { faker } from '@faker-js/faker';


test.describe('Map Sidebar test @smoke', () => {
    let pm: PageManager;
    let helper: HelperBase;
    let context: BrowserContext;
    let page: Page;

    test.beforeAll(async ({ browser }, testInfo) => {
        context = await browser.newContext();
        page = await context.newPage();
        pm = new PageManager(page);
        helper = new HelperBase(pm.getPage);
        await pm.onLoginPage.openLoginPageAndWaitForPageToLoad();
        await helper.closeReadUserGuidePopUp(pm, testInfo);
        await pm.onDashboardPage.openProject();
        await pm.onMapPage.verifyMapIsVisible();
    });

    test.afterAll(async () => {
        await context.close();
    });

    test.beforeEach(async ({ }, testInfo) => {

        await helper.collapseSidebarAndVerifyMapIsVisible(pm, testInfo);
        // await helper.waitForNumberOfSeconds(1);

    });

    test.afterEach(async ({ }, testInfo) => {
        const shouldSkip =
            testInfo.title.includes('[skip-after-each]');
        if (shouldSkip) {
            console.log(`Skipping afterEach for: ${testInfo.title} in project: ${testInfo.project.name}`);
            return;
        }

        //     // if (await helper.isSmartDevice(testInfo)) {
        //     //     await pm.onSidebarPage.expandSidebar();
        //     // }
    });

    //https://app.clickup.com/t/86erh8uan
    test('Should verify 2D Orthomosaic is selected by default', async ({ }, testInfo) => {

        const isSelected = await pm.onMapPage.get2DOrthomosaicIsSelectionState();
        expect(isSelected).not.toBeNull();
        expect(isSelected).toEqual('checked');
    });

    test('should show 2D Orthomosaic details', async () => {
        await pm.onMapPage.show2dOrthomosaicDetails();
        const opacityValueBefore = await pm.onMapPage.getOpacityValue();
        console.log('Opacity value before: ', opacityValueBefore);
        let opacityValueNumber = faker.number.int({ min: -100, max: 100, multipleOf: 5 });
        console.log('Opacity value number: ', opacityValueNumber);
        await pm.onMapPage.changeOpacityValue(opacityValueNumber);
        const opacityValueAfter = await pm.onMapPage.getOpacityValue();
        console.log('Opacity value after: ', opacityValueAfter);
        expect.soft(opacityValueAfter).not.toBe(opacityValueBefore);
    });

    test('Should select and verify map selection using checkbox', async ({ }, testInfo) => {
        const mapPage = pm.onMapPage;

        if (await mapPage.getTerrainCheckboxState() === 'checked') {
            expect(await mapPage.get2DOrthomosaicCheckboxState()).toBe('checked');
            await mapPage.clickOnTerrainCheckbox();
            expect(await mapPage.get2DOrthomosaicCheckboxState()).toBe('checked');
            expect(await mapPage.getTerrainCheckboxState()).toBe('unchecked');
            expect(await mapPage.get3dMeshModelCheckboxState()).toBe('unchecked');
            expect(await mapPage.getPointCloudCheckboxState()).toBe('unchecked');
            expect(await mapPage.get3dOrthomosaicCheckboxState()).toBe('unchecked');
        }

        await mapPage.clickOnTerrainCheckbox();
        expect(await mapPage.getTerrainCheckboxState()).toBe('checked');
        expect(await mapPage.get2DOrthomosaicCheckboxState()).toBe('checked');
        expect(await mapPage.get3dMeshModelCheckboxState()).toBe('unchecked');
        expect(await mapPage.getPointCloudCheckboxState()).toBe('unchecked');
        expect(await mapPage.get3dOrthomosaicCheckboxState()).toBe('unchecked');

        await mapPage.clickOn3dOrthomosaicCheckbox();
        expect(await mapPage.get3dOrthomosaicCheckboxState()).toBe('checked');
        expect(await mapPage.get2DOrthomosaicCheckboxState()).toBe('unchecked');
        expect(await mapPage.getTerrainCheckboxState()).toBe('unchecked');
        expect(await mapPage.get3dMeshModelCheckboxState()).toBe('unchecked');
        expect(await mapPage.getPointCloudCheckboxState()).toBe('unchecked');

        await mapPage.clickOnPointCloudCheckbox();
        expect(await mapPage.getPointCloudCheckboxState()).toBe('checked');
        expect(await mapPage.get2DOrthomosaicCheckboxState()).toBe('unchecked');
        expect(await mapPage.getTerrainCheckboxState()).toBe('unchecked');
        expect(await mapPage.get3dOrthomosaicCheckboxState()).toBe('unchecked');
        expect(await mapPage.get3dMeshModelCheckboxState()).toBe('unchecked');

        await mapPage.clickOn3dMeshModelCheckbox();
        expect(await mapPage.get3dMeshModelCheckboxState()).toBe('checked');
        expect(await mapPage.get2DOrthomosaicCheckboxState()).toBe('unchecked');
        expect(await mapPage.getTerrainCheckboxState()).toBe('unchecked');
        expect(await mapPage.get3dOrthomosaicCheckboxState()).toBe('unchecked');
        expect(await mapPage.getPointCloudCheckboxState()).toBe('unchecked');

        await mapPage.clickOn2DOrthomosaicCheckbox();
        expect(await mapPage.get2DOrthomosaicCheckboxState()).toBe('checked');
        expect(await mapPage.getTerrainCheckboxState()).toBe('unchecked');
        expect(await mapPage.get3dOrthomosaicCheckboxState()).toBe('unchecked');
        expect(await mapPage.get3dMeshModelCheckboxState()).toBe('unchecked');
        expect(await mapPage.getPointCloudCheckboxState()).toBe('unchecked');
    });

    test('Should select and verify map selection using Map Name', async ({ }, testInfo) => {
        const mapPage = pm.onMapPage;

        if (await mapPage.getTerrainCheckboxState() === 'checked') {
            expect(await mapPage.get2DOrthomosaicCheckboxState()).toBe('checked');
            await mapPage.clickOnTerrainCheckbox();
            expect(await mapPage.get2DOrthomosaicCheckboxState()).toBe('checked');
            expect(await mapPage.getTerrainCheckboxState()).toBe('unchecked');
            expect(await mapPage.get3dMeshModelCheckboxState()).toBe('unchecked');
            expect(await mapPage.getPointCloudCheckboxState()).toBe('unchecked');
            expect(await mapPage.get3dOrthomosaicCheckboxState()).toBe('unchecked');
        }

        await mapPage.clickOnTerrain();
        expect(await mapPage.getTerrainCheckboxState()).toBe('checked');
        expect(await mapPage.get2DOrthomosaicCheckboxState()).toBe('checked');
        await mapPage.clickOnTerrain();
        expect(await mapPage.get3dMeshModelCheckboxState()).toBe('unchecked');
        expect(await mapPage.getPointCloudCheckboxState()).toBe('unchecked');
        expect(await mapPage.get3dOrthomosaicCheckboxState()).toBe('unchecked');

        await mapPage.clickOn3DOrthomosaic();
        expect(await mapPage.get3dOrthomosaicCheckboxState()).toBe('checked');
        expect(await mapPage.get2DOrthomosaicCheckboxState()).toBe('unchecked');
        expect(await mapPage.getTerrainCheckboxState()).toBe('unchecked');
        expect(await mapPage.get3dMeshModelCheckboxState()).toBe('unchecked');
        expect(await mapPage.getPointCloudCheckboxState()).toBe('unchecked');

        await mapPage.clickOnPointCloud();
        expect(await mapPage.getPointCloudCheckboxState()).toBe('checked');
        expect(await mapPage.get2DOrthomosaicCheckboxState()).toBe('unchecked');
        expect(await mapPage.getTerrainCheckboxState()).toBe('unchecked');
        expect(await mapPage.get3dOrthomosaicCheckboxState()).toBe('unchecked');
        expect(await mapPage.get3dMeshModelCheckboxState()).toBe('unchecked');

        await mapPage.clickOn3dMeshModel();
        await mapPage.clickOn3dMeshModel();
        expect(await mapPage.get3dMeshModelCheckboxState()).toBe('checked');
        expect(await mapPage.get2DOrthomosaicCheckboxState()).toBe('unchecked');
        expect(await mapPage.getTerrainCheckboxState()).toBe('unchecked');
        expect(await mapPage.get3dOrthomosaicCheckboxState()).toBe('unchecked');
        expect(await mapPage.getPointCloudCheckboxState()).toBe('unchecked');

        await mapPage.clickOn2DOrthomosaic();
        expect(await mapPage.get2DOrthomosaicCheckboxState()).toBe('checked');
        expect(await mapPage.getTerrainCheckboxState()).toBe('unchecked');
        expect(await mapPage.get3dOrthomosaicCheckboxState()).toBe('unchecked');
        expect(await mapPage.get3dMeshModelCheckboxState()).toBe('unchecked');
        expect(await mapPage.getPointCloudCheckboxState()).toBe('unchecked');
    });


    test.describe('Terrain Map test', () => {

        // https://app.clickup.com/t/86erh8x3d
        test('Should verify DSM is selected by default on Terrain selection', async () => {
            await pm.onMapPage.selectTerrainView();
            await pm.onMapPage.verifyMapIsVisible();
            await helper.waitForNumberOfSeconds(1);
            const defaultDsmClassAttribute = await pm.onMapSidebarPage.getTerrainDsmAttribute();
            console.log(`Checking the value of DSM default ${defaultDsmClassAttribute}`);
            expect(defaultDsmClassAttribute).toEqual('true');
            expect(await pm.onMapSidebarPage.getTerrainDtmAttribute()).toContain('false');
        });

        // https://app.clickup.com/t/86erh8x4t
        test('Should enable/disable Hillshade in terrain view', async () => {
            await helper.waitForNumberOfSeconds(1);
            await pm.onMapPage.selectTerrainView();
            await pm.onMapPage.verifyMapIsVisible();
            await helper.waitForNumberOfSeconds(1);
            await pm.onMapPage.toggleHillshade();
            console.log(`Hillshade is enabled`);
            // Add assertion to verify the toggle action
            const toggleClassAfterEnable = await pm.onMapPage.getHillshadeToggleAttributeValue();
            console.log(`Checking the value of toggle class after enable: ${toggleClassAfterEnable}`);
            expect(toggleClassAfterEnable).toEqual('true');
            await pm.onMapPage.toggleHillshade();
            console.log(`Hillshade is disabled`);
            const toggleClassAfterDisable = await pm.onMapPage.getHillshadeToggleAttributeValue();
            console.log(`Checking the value of toggle class after disable: ${toggleClassAfterDisable}`);
            expect(toggleClassAfterDisable).toEqual('false');
        });


        test('Should select DTM and verify DTM is selected', async ({ }, testInfo) => {
            await pm.onMapPage.selectTerrainView();
            await helper.collapseSidebarAndVerifyMapIsVisible(pm, testInfo);

            const onTerrain = pm.onMapSidebarPage;

            await onTerrain.clickOnDsm();
            const dsmMinValue = await onTerrain.getElevationMinValue();
            const dsmMaxValue = await onTerrain.getElevationMaxValue();
            console.log(`Checking the value of DSM default ${dsmMinValue} ${dsmMaxValue}`);

            await onTerrain.clickOnDtm();
            const dtmClassAttribute = await pm.onMapSidebarPage.getTerrainDtmAttribute();
            console.log(`Checking the value of DTM default ${dtmClassAttribute}`);
            expect(dtmClassAttribute).toEqual('true');
            expect(await pm.onMapSidebarPage.getTerrainDsmAttribute()).toEqual('false');

            const dtmMinValue = await onTerrain.getElevationMinValue();
            const dtmMaxValue = await onTerrain.getElevationMaxValue();
            console.log(`Checking the value of DTM default ${dtmMinValue} ${dtmMaxValue}`);
            expect(dsmMinValue).not.toEqual(dtmMinValue);
            expect(dsmMaxValue).not.toEqual(dtmMaxValue);
        });

        test('Should validate opacity update on DSM', async ({ }, testInfo) => {
            await pm.onMapPage.selectTerrainView();
            await helper.collapseSidebarAndVerifyMapIsVisible(pm, testInfo);

            const onTerrain = pm.onMapSidebarPage;

            const opacityValue = await onTerrain.getOpacityValue();
            console.log(`Checking the value of opacity default ${opacityValue}`);
            await helper.waitForNumberOfSeconds(1 / 2);
            await onTerrain.setOpacityValue(faker.number.int({ min: -20, max: 100, multipleOf: 10 }));
            const opacityValueAfter = await onTerrain.getOpacityValue();
            console.log(`Checking the value of opacity default ${opacityValueAfter}`);
            expect(opacityValue).not.toEqual(opacityValueAfter);
        });

        //! Flaky test- need to fix this
        test.fixme('Should validate min and max elevation update on DTM', async ({ }, testInfo) => {
            await pm.onMapPage.selectTerrainView();
            await helper.collapseSidebarAndVerifyMapIsVisible(pm, testInfo);

            const onTerrain = pm.onMapSidebarPage;

            const minElevationValue = await onTerrain.getMinElevationValue();
            const maxElevationValue = await onTerrain.getMaxElevationValue();
            console.log(`Checking the value of min and max elevation default ${minElevationValue} and ${maxElevationValue}`);

            let minElevationValueToSet = faker.number.float({ min: 48.00, max: 70.00, fractionDigits: 2 });
            let maxElevationValueToSet = faker.number.float({ min: 70.01, max: 108.00, fractionDigits: 2 });
            await onTerrain.setMinElevationValue(minElevationValueToSet);
            await onTerrain.setMaxElevationValue(maxElevationValueToSet);

            const minElevationValueAfter = await onTerrain.getMinElevationValue();
            const maxElevationValueAfter = await onTerrain.getMaxElevationValue();

            console.log(`
            minElevationValue: ${minElevationValue}
            minElevationValueToSet: ${minElevationValueToSet}
            minElevationValueAfter: ${minElevationValueAfter}
            maxElevationValue: ${maxElevationValue}
            maxElevationValueToSet: ${maxElevationValueToSet}
            maxElevationValueAfter: ${maxElevationValueAfter}
        `);
            console.log(`Checking the value of min and max elevation default ${minElevationValueAfter} and ${maxElevationValueAfter}`);
            expect.soft(minElevationValue).not.toEqual(minElevationValueAfter);
            expect.soft(maxElevationValue).not.toEqual(maxElevationValueAfter);
        });

        test.afterAll(async () => {
            await pm.onMapPage.clickOnTerrain();
        });
    });

    test.describe('Point Cloud test', () => {

        test('should change the point size of the point cloud and verify the point size and number of points are updated', async () => {
            await pm.onMapPage.selectAndVerifyMapLayer('Point Cloud');
            console.log('**** Point Cloud layer selected ****');
            const pointSizeBefore = await pm.onMapSidebarPage.getPointSizeValue();
            console.log('Point size before: ', pointSizeBefore);

            const numberOfPointsBefore = await pm.onMapSidebarPage.getNumberOfPoints();
            console.log('Number of points before: ', numberOfPointsBefore);

            const pointSizeNumber = faker.number.int({ min: 1, max: 100, multipleOf: 5 });
            console.log('Point size number: ', pointSizeNumber);
            await pm.onMapSidebarPage.changePointSize(pointSizeNumber);
            const pointSizeAfter = await pm.onMapSidebarPage.getPointSizeValue();
            console.log('Point size after: ', pointSizeAfter);

            const numberOfPointsNumber = faker.number.int({ min: 1, max: 100, multipleOf: 5 });

            console.log('Number of points number: ', numberOfPointsNumber);
            await pm.onMapSidebarPage.changeNumberOfPoints(numberOfPointsNumber);
            const numberOfPointsAfter = await pm.onMapSidebarPage.getNumberOfPoints();
            console.log('Number of points after: ', numberOfPointsAfter);

            expect(pointSizeAfter).not.toBe(pointSizeBefore);
            expect(numberOfPointsAfter).not.toBe(numberOfPointsBefore);
        });

        test.afterAll(async () => {
            await pm.onMapPage.clickOn2DOrthomosaic();
        });
    });

    // TODO: Move this test to 3d map interaction test
    test('Should verify several map tool buttons are displayed in 3d map', async ({ }, testInfo) => {
        const mapPage = pm.onMapPage;
        await mapPage.clickOn3D();
        await pm.on3DMap.verify3DMapIsVisible();
        await pm.getPage.waitForTimeout(2000);

        expect(await mapPage.isDatasetTitleIsDisplayed()).toBe(true);
        expect(await mapPage.isDownloadButtonIsDisplayed()).toBe(true);
        expect(await mapPage.isRequestToPrintButtonIsDisplayed()).toBe(true);
        expect(await mapPage.isShareButtonIsDisplayed()).toBe(true);
        expect(await mapPage.isInviteButtonIsDisplayed()).toBe(true);
        expect(await mapPage.isHistoryButtonIsDisplayed()).toBe(true);
        expect(await mapPage.isNotificationButtonIsDisplayed()).toBe(true);

        expect(await mapPage.isSelectPointerDisplayed('3d')).toBe(true);
        expect(await mapPage.isMarkerIsDisplayed('3d')).toBe(true);
        expect(await mapPage.isLengthDisplayedIn3DMap()).toBe(true);
        expect(await mapPage.isAreaDisplayedIn3DMap()).toBe(true);
        expect(await mapPage.isBasicVolumeIsDisplayed()).toBe(true);
        expect(await mapPage.isHideIconIsDisplayed()).toBe(true);

        // expect(await mapPage.isDefaultIconIsDisplayed()).toBe(true);
        // expect(await mapPage.isTwoScreenIconIsDisplayed()).toBe(true);
        // expect(await mapPage.isFourScreenIconIsDisplayed()).toBe(true);
        // expect(await mapPage.isSliderIconIsDisplayed()).toBe(true);
        expect(await mapPage.isScreenCaptureIconIsDisplayed()).toBe(true);
        expect(await mapPage.isMapCenterButtonDisplayed()).toBe(true);
        expect(await mapPage.isMapZoomInButtonDisplayed()).toBe(true);
        expect(await mapPage.isMapZoomOutButtonDisplayed()).toBe(true);
        // expect(await mapPage.isCurrentLocationButtonDisplayed()).toBe(true);
        expect(await mapPage.isShowCoordinatesButtonDisplayed()).toBe(true);

        expect(await mapPage.isBackgroundToggleButtonIsDisplayed()).toBe(true);
        expect(await mapPage.isTwoDThreeDToggleButtonIsDisplayed()).toBe(true);
        expect(await mapPage.isPresentationModeIsDisplayed()).toBe(true);
    });
});
