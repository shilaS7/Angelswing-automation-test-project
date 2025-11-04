import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class MapPage extends BasePage {
    readonly page: Page;
    readonly mapLocator: Locator;

    constructor(page: Page) {
        super(page);
        this.page = page;
        this.mapLocator = page.locator('[data-testid="sidebar-wrapper"] + div + div');
    }

    async verifyMapIsVisible() {
        await expect(this.mapLocator).toBeVisible({ timeout: 30000 });
    }

    async getMapBoundingBox() {
        return await this.mapLocator.boundingBox();
    }

    async getStaringPosition(boundingBox: any, value: number) {
        if (!boundingBox) {
            throw new Error('Bounding box is undefined');
        }

        const startX = boundingBox.x + boundingBox.width / value;
        const startY = boundingBox.y + boundingBox.height / value;

        return { xStart: startX, yStart: startY };

    }
    async moveMouseToCenter(xStart: number, yStart: number) {
        await this.page.mouse.move(xStart, yStart);
    }

    async clickOnCenterOfMap(xStart: number, yStart: number) {
        await this.page.mouse.click(xStart, yStart);
    }

    async clickAndHoldOnMap() {
        await this.page.mouse.down();
    }

    async releaseTheMouse() {
        await this.page.mouse.up();
    }

    async rightClickAndHoldMouse() {
        await this.page.mouse.down({ button: 'right' });
    }

    async moveMouseUpward(xStart: number, yStart: number, dragDistance: number, steps = 100) {
        await this.page.mouse.move(xStart, yStart - dragDistance, { steps });
    }

    async moveMouseDownward(xStart: number, yStart: number, dragDistance: number, steps = 100) {
        await this.page.mouse.move(xStart, yStart + dragDistance, { steps });
    }

    async moveMouseLeft(xStart: number, yStart: number, dragDistance: number, steps = 100) {
        await this.page.mouse.move(xStart - dragDistance, yStart, { steps });
    }

    async moveMouseRight(xStart: number, yStart: number, dragDistance: number, steps = 100) {
        await this.page.mouse.move(xStart + dragDistance, yStart, { steps });
    }

    async releaseRightClick() {
        await this.page.mouse.up({ button: 'right' });
    }


    async zoomInMap(pixel: number) {
        this.zoomMap(true, pixel);
    }

    async zoomOutMap(pixel: number) {
        this.zoomMap(false, pixel);
    }

    async open3DMap() {
        await this.page.getByTestId('wrapperhoverable-target').locator('span', { hasText: '3D' }).click();
    }

    async clickMapToCenter() {
        await this.page.getByTestId('map-center-btn').click();
    }

    async clickOnDefaultButton() {
        await this.page.locator('[data-ddm-track-label="btn-2d-view-normal"]').click();
    }

    /**
     *  clicking map-center-btn works, but clicking map-zoom-in-btn does nothing, Does map-zoom-in-btn does  have a direct click handler, like the map-center-btn does.
     */
    async clickOnZoomInButton(timeout: number = 500) {
        await this.page.getByTestId('map-zoom-in-btn').hover();
        await this.clickAndHoldOnMap();
        await this.page.waitForTimeout(timeout);
        await this.releaseTheMouse();
    }

    async clickOnZoomOutButton(timeout: number = 500) {
        await this.page.getByTestId('map-zoom-out-btn').hover();
        await this.clickAndHoldOnMap();
        await this.page.waitForTimeout(timeout);
        await this.releaseTheMouse();
    }

    private async zoomMap(zoomIn: boolean, pixel: number) {
        const zoomValue = zoomIn ? -pixel : pixel;
        await this.page.mouse.wheel(0, zoomValue);
    }

    async selectMapLayer(mapLayer: string) {
        await this.page.getByTestId('content-selection-box').filter({ hasText: mapLayer }).click();
    }

    async selectTerrainView() {
        await this.selectMapLayer('Terrain');
    }

    async select3DMeshModelView() {
        await this.selectMapLayer('3D Mesh Model');
    }

    async get2DOrthomosaicIsSelectionState() {
        const orthoCheckbox = this.page.getByTestId('content-checkbox-orthophoto');
        const isSelected = await orthoCheckbox.getAttribute('data-state');
        return isSelected;
    }

    async toggleHillshade() {
        const toggleButton = this.page.getByTestId('btn-toggle-hillshade');
        await toggleButton.click();
        console.log('✅ Hillshade toggle button clicked.');
    }

    async getHillshadeToggleAttributeValue() {
        const toggleButton = this.page.getByTestId('btn-toggle-hillshade');
        return await toggleButton.getAttribute('data-selected');
    }

    async clickOnDefault() {
        await this.page.locator('[data-ddm-track-label="btn-2d-view-normal"]').click();
    }

    async clickOnTwoScreen() {
        await this.page.locator('[data-ddm-track-label="btn-2d-view-comparison2"]').click();
        const screenPickers = this.page.locator('[data-testid="comparisontwodisplay-screen-picker-wrapper"]');
        await expect(screenPickers).toHaveCount(2);
    }

    async clickOnFourScreen() {
        await this.page.locator('[data-ddm-track-label="btn-2d-view-comparison4"]').click();
    }

    async clickOnSlider() {
        await this.page.locator('[data-ddm-track-label="btn-2d-view-slider"]').click();
    }

    async clickOnScreenCapture() {
        await this.page.locator('[data-testid="map-screen-capture-btn"]').click();
    }

    async getDataSetTitle() {
        const dataSetTitle = this.page.getByTestId('sidebar-wrapper').locator('+ div').locator('p');
        return await dataSetTitle.textContent();
    }

    async ensureBackgroundIsNotDisplayed() {
        const toggle = this.page.getByTestId('basemap-toggle-button');
        const currentState = await toggle.getAttribute('data-ddm-track-label');
        if (currentState !== 'btn-toggle-basemap-off') {
            await toggle.click();
        }
    }

    async clickOn3D() {
        await this.switchMapView('3D');
    }
    async clickOn2D() {
        await this.switchMapView('2D');
    }

    private async switchMapView(view: string) {
        await this.page.locator('[id="2d-3d-toggle-button"]').locator('span', { hasText: `${view}` }).first().click();
    }

    async expectMapViewToBe(mode: string) {
        const expectedLabel = mode === '2D' ? 'btn-toggle-display-3d' : 'btn-toggle-display-2d';
        await expect(this.page.locator('[id="2d-3d-toggle-button"]').first()).toHaveAttribute('data-ddm-track-label', expectedLabel);
    }

    async getMapLayerCheckboxState(mapLayer: string): Promise<string> {
        const mapLayerElement = this.page.getByTestId('content-selection-box').filter({ hasText: mapLayer });
        await mapLayerElement.waitFor({ state: 'visible' });
        await mapLayerElement.scrollIntoViewIfNeeded();
        const checkboxState = await mapLayerElement.locator('div[data-ddm-track-label*="btn-contents-list-checkbox"]').getAttribute('data-state');
        if (checkboxState === null) {
            throw new Error(`Checkbox state attribute not found for map layer: ${mapLayer}`);
        }
        return checkboxState;
    }

    async validateMapLayerIsChecked(mapLayer: string): Promise<void> {
        const checkboxState = await this.getMapLayerCheckboxState(mapLayer);
        console.log(`✅ Validating checkbox state for "${mapLayer}": ${checkboxState}`);
        expect(checkboxState).toBe('checked');
    }

    async selectAndVerifyMapLayer(mapLayer: string, shouldClick = true): Promise<void> {
        const mapLayerElement = this.page.getByTestId('content-selection-box').filter({ hasText: mapLayer });
        await mapLayerElement.waitFor({ state: 'visible' });
        await mapLayerElement.scrollIntoViewIfNeeded();
        if (shouldClick) {
            await mapLayerElement.click();
        }
        const checkboxState = await this.getMapLayerCheckboxState(mapLayer);
        console.log(`✅ Verifying checkbox state for "${mapLayer}": ${checkboxState}`);
        expect(checkboxState).toBe('checked');
        if (mapLayer === 'Terrain' && shouldClick) {
            await mapLayerElement.click();
        }
    }

    async clickOnLocationMarker() {
        await this.page.locator('[data-ddm-track-label="btn-create-marker-2d"]').click();
    }
    async clickOnLength() {
        await this.page.locator('[data-ddm-track-label="btn-create-length-2d"]').click();
    }

    async clickOnBasicVolume() {
        await this.clickOnVolumeOption('Basic Volume');
    }

    async clickOn3dDesignSurface() {
        await this.clickOnVolumeOption('3D Design Surface');
    }

    async clickOnCompareSurvey() {
        await this.clickOnVolumeOption('Compare Survey');
    }

    private async clickOnVolumeOption(optionText: string) {
        const volumeIcon = this.page.locator('ul._cancellable li').nth(4);
        const option = this.page.getByText(optionText);

        await volumeIcon.hover();
        await option.click();
    }

    async checkCalculateTheTotalCutFillVolumeOfTheDesign() {
        await this.page.getByText('Calculate the total cut/fill volume of the design.').click();
    }

    async clickOnCalculateButton() {
        await this.page.getByRole('button', { name: 'Calculate' }).click();
    }

    async clickOn2DOrthomosaicCheckbox() {
        const orthoCheckbox = this.page.getByTestId('content-checkbox-orthophoto');
        await orthoCheckbox.click();
    }

    async get2DOrthomosaicCheckboxState() {
        const orthoCheckbox = this.page.getByTestId('content-checkbox-orthophoto');
        return await orthoCheckbox.getAttribute('data-state');
    }

    async clickOnTerrainCheckbox() {
        const terrainCheckbox = this.page.getByTestId('content-checkbox-dsm');
        await terrainCheckbox.click();
    }

    async getTerrainCheckboxState() {
        const terrainCheckbox = this.page.getByTestId('content-checkbox-dsm');
        return await terrainCheckbox.getAttribute('data-state');
    }

    async clickOn3dOrthomosaicCheckbox() {
        const orthoCheckbox = this.page.getByTestId('content-checkbox-terrain');
        await orthoCheckbox.click();
    }

    async get3dOrthomosaicCheckboxState() {
        const orthoCheckbox = this.page.getByTestId('content-checkbox-terrain');
        await orthoCheckbox.scrollIntoViewIfNeeded();
        return await orthoCheckbox.getAttribute('data-state');
    }

    async clickOnPointCloudCheckbox() {
        const pointCloudCheckbox = this.page.getByTestId('content-checkbox-las');
        await pointCloudCheckbox.click();
    }

    async getPointCloudCheckboxState() {
        const pointCloudCheckbox = this.page.getByTestId('content-checkbox-las');
        await pointCloudCheckbox.scrollIntoViewIfNeeded();
        return await pointCloudCheckbox.getAttribute('data-state');
    }

    async clickOn3dMeshModelCheckbox() {
        const meshModelCheckbox = this.page.getByTestId('content-checkbox-tiled_model');
        await meshModelCheckbox.click();
    }

    async get3dMeshModelCheckboxState() {
        const meshModelCheckbox = this.page.getByTestId('content-checkbox-tiled_model');
        await meshModelCheckbox.scrollIntoViewIfNeeded();
        return await meshModelCheckbox.getAttribute('data-state');
    }

    async clickOn2DOrthomosaic() {
        await this.page.locator('[data-ddm-track-label="btn-contents-list-2d"]').click();
    }

    async clickOnTerrain() {
        await this.page.locator('[data-ddm-track-label="btn-contents-list-dsm"]').click();
    }

    async clickOn3DOrthomosaic() {
        await this.page.locator('[data-ddm-track-label="btn-contents-list-3d-ortho"]').click();
    }

    async clickOnPointCloud() {
        await this.page.locator('[data-ddm-track-label="btn-contents-list-3d-pointcloud"]').click();
    }

    async clickOn3dMeshModel() {
        await this.page.locator('[data-ddm-track-label="btn-contents-list-3d-mesh"]').click();
    }

    async isDatasetTitleIsDisplayed() {
        const datasetTitle = this.page.getByTestId('top-bar-screen-title-root');
        return await datasetTitle.isVisible();
    }

    async isDownloadButtonIsDisplayed() {
        const downloadButton = this.page.locator('[data-ddm-track-label="btn-download"]');
        return await downloadButton.isVisible();
    }

    async isRequestToPrintButtonIsDisplayed() {
        const requestToPrintButton = this.page.locator('[data-ddm-track-label="btn-print"]');
        return await requestToPrintButton.isVisible();
    }

    async isShareButtonIsDisplayed() {
        const shareButton = this.page.locator('[data-ddm-track-label="btn-share"]');
        return await shareButton.isVisible();
    }

    async isInviteButtonIsDisplayed() {
        const inviteButton = this.page.locator('[data-ddm-track-label="btn-invite"]');
        return await inviteButton.isVisible();
    }

    async isHistoryButtonIsDisplayed() {
        const historyButton = this.page.locator('[data-ddm-track-label="btn-history"]');
        return await historyButton.isVisible();
    }

    async isNotificationButtonIsDisplayed() {
        const notificationButton = this.page.locator('[data-testid="wrapperhoverable-target"] button').nth(7);
        return await notificationButton.isVisible();
    }

    async isSelectPointerDisplayed(mapView: string = '2d') {
        const selectPointer = this.page.locator(`[data-ddm-track-label="btn-create-pointer-${mapView}"]`);
        return await selectPointer.isVisible();
    }

    async isMarkerIsDisplayed(mapView: string = '2d') {
        const marker = this.page.locator(`[data-ddm-track-label="btn-create-marker-${mapView}"]`);
        return await marker.isVisible();
    }

    async isLengthIsDisplayed() {
        const length = this.page.locator('[data-ddm-track-label="btn-create-length-2d"]');
        return await length.isVisible();
    }

    async isLengthDisplayedIn3DMap() {
        const length = this.page.locator('[data-ddm-track-label="btn-create-three_length-3d"]');
        return await length.isVisible();
    }

    async isAreaIsDisplayed() {
        const area = this.page.locator('[data-ddm-track-label="btn-create-area-2d"]');
        return await area.isVisible();
    }

    async isAreaDisplayedIn3DMap() {
        const area = this.page.locator('[data-ddm-track-label="btn-create-three_area-3d"]');
        return await area.isVisible();
    }

    async isBasicVolumeIsDisplayed() {
        const volumeIcon = this.page.locator('ul._cancellable li').nth(4);
        const basicVolume = this.page.getByText('Basic Volume');

        await volumeIcon.hover();
        return await basicVolume.isVisible();
    }

    async isHideIconIsDisplayed() {
        const hideIcon = this.page.locator('ul._cancellable li').nth(5);
        return await hideIcon.isVisible();
    }

    async isDefaultIconIsDisplayed() {
        const defaultIcon = this.page.locator('[data-ddm-track-label="btn-2d-view-normal"]');
        return await defaultIcon.isVisible();
    }

    async isTwoScreenIconIsDisplayed() {
        const twoScreenIcon = this.page.locator('[data-ddm-track-label="btn-2d-view-comparison2"]');
        return await twoScreenIcon.isVisible();
    }

    async isFourScreenIconIsDisplayed() {
        const fourScreenIcon = this.page.locator('[data-ddm-track-label="btn-2d-view-comparison4"]');
        return await fourScreenIcon.isVisible();
    }

    async isSliderIconIsDisplayed() {
        const sliderIcon = this.page.locator('[data-ddm-track-label="btn-2d-view-slider"]');
        return await sliderIcon.isVisible();
    }

    async isScreenCaptureIconIsDisplayed() {
        const screenCaptureIcon = this.page.locator('[data-testid="map-screen-capture-btn"]');
        return await screenCaptureIcon.isVisible();
    }

    async isMapCenterButtonDisplayed() {
        const mapCenterButton = this.page.locator('[data-testid="map-center-btn"]');
        return await mapCenterButton.isVisible();
    }

    async isMapZoomInButtonDisplayed() {
        const mapZoomInButton = this.page.locator('[data-testid="map-zoom-in-btn"]');
        return await mapZoomInButton.isVisible();
    }

    async isMapZoomOutButtonDisplayed() {
        const mapZoomOutButton = this.page.locator('[data-testid="map-zoom-out-btn"]');
        return await mapZoomOutButton.isVisible();
    }

    async isCurrentLocationButtonDisplayed() {
        const currentLocationButton = this.page.locator('[data-ddm-track-label="btn-geolocation"]');
        return await currentLocationButton.isVisible();
    }
    async isShowCoordinatesButtonDisplayed() {
        const showCoordinatesButton = this.page.locator('button [data-testid="wrapperhoverable-target"]');
        return await showCoordinatesButton.isVisible();
    }


    async isPresentationModeIsDisplayed() {
        const presentationMode = this.page.locator('[data-testid="horizontal-tab-toggle-button"]', { hasText: 'Presentation' }).last();
        return await presentationMode.isVisible();
    }

    async isBackgroundToggleButtonIsDisplayed() {
        const backgroundToggleButton = this.page.locator('[data-testid="basemap-toggle-button"]').last();
        return await backgroundToggleButton.isVisible();
    }

    async isTwoDThreeDToggleButtonIsDisplayed() {
        const twoDThreeDToggleButton = this.page.locator('[id="2d-3d-toggle-button"]').last();
        return await twoDThreeDToggleButton.isVisible();
    }

    async checkIfPresentationModeIsChecked() {
        const presentationMode = this.page.locator('[data-ddm-track-label="btn-presentation-mode"]');
        return await presentationMode.getAttribute('data-state');
    }

    async clickOnInviteButton() {
        await this.page.locator('[data-ddm-track-label="btn-invite"]').click();
    }

    async enterValueInSearchCollaborators(value: string) {
        const searchCollaborators = this.page.getByRole('textbox', { name: 'Search collaborators' });
        await searchCollaborators.pressSequentially(value, { delay: 10 });
    }

    async getRoleCellText(): Promise<string | null> {
        return await this.getFirstRowCellText(2);
    }

    async closeProjectTeamPopup() {
        const popup = this.page.locator('section', { hasText: 'Project Team' });
        const closeButton = popup.locator('[data-testid="popup-close"]');
        await closeButton.click();
    }

    async getHeaderTextOfShareProjectPopup() {
        const popup = this.page.locator('section', { hasText: 'Authority Required' });
        const header = popup.locator('[data-testid="popup-title"]');
        return await header.textContent();
    }

    async closeAuthorityRequiredPopup() {
        const popup = this.page.locator('section', { hasText: 'Authority Required' });
        const closeButton = popup.locator('[data-testid="popup-close"]');
        await closeButton.click();
    }


    // Two screen page functions

    async getScreenPickerCountForTwoScreen() {
        return this.page.locator('[data-testid="comparisontwodisplay-screen-picker-wrapper"]');
    }

    async getDataSetTitleFromTwoScreen() {
        const fullText = await this.page.locator('[data-testid="comparisontwodisplay-screen-picker-wrapper"]').locator('span').locator('..').first().textContent();
        if (!fullText) return null;
        return fullText.replace(/^\d{2}\.\s\d{2}\.\s\d{2}\s*/, '').trim();
    }

    async getMessageFromSecondDatasetSelectScreen() {
        const message = await this.page
            .locator('[data-testid="comparisontwodisplay-screen-picker-wrapper"] div>div>div').nth(2).textContent();
        return message;
    }

    async getDataSelectedAttribute(screenIndex: number, layer: 'Ortho' | 'DSM' | 'DTM') {
        return this.page.locator(`button:text-is("${layer}")`).nth(screenIndex).getAttribute('data-selected');
    }

    async getDataStateAttribute(screenIndex: number, layer: 'Ortho' | 'DSM' | 'DTM') {
        return this.page.locator(`button:text-is("${layer}")`).nth(screenIndex).getAttribute('data-state');
    }

    async getFirstScreenOrthoDataSelectAttributeValue() { return this.getDataSelectedAttribute(0, 'Ortho'); }
    async getFirstScreenDsmDataSelectAttributeValue() { return this.getDataSelectedAttribute(0, 'DSM'); }
    async getFirstScreenDtmDataSelectAttributeValue() { return this.getDataSelectedAttribute(0, 'DTM'); }
    async getSecondScreenDataSelectOrthoAttributeValue() { return this.getDataSelectedAttribute(1, 'Ortho'); }
    async getSecondScreenDataSelectDsmAttributeValue() { return this.getDataSelectedAttribute(1, 'DSM'); }
    async getSecondScreenDataSelectDtmAttributeValue() { return this.getDataSelectedAttribute(1, 'DTM'); }

    async getFirstScreenOrthoDataStateAttributeValue() { return this.getDataStateAttribute(0, 'Ortho'); }
    async getFirstScreenDsmDataStateAttributeValue() { return this.getDataStateAttribute(0, 'DSM'); }
    async getFirstScreenDtmDataStateAttributeValue() { return this.getDataStateAttribute(0, 'DTM'); }
    async getSecondScreenOrthoDataStateAttributeValue() { return this.getDataStateAttribute(1, 'Ortho'); }
    async getSecondScreenDsmDataStateAttributeValue() { return this.getDataStateAttribute(1, 'DSM'); }
    async getSecondScreenDtmDataStateAttributeValue() { return this.getDataStateAttribute(1, 'DTM'); }

    async validateOrthoIsSelectedByDefaultOnFirstScreen() {
        expect(await this.getFirstScreenOrthoDataSelectAttributeValue()).toEqual('true');
        expect(await this.getFirstScreenDsmDataSelectAttributeValue()).toEqual('false');
        expect(await this.getFirstScreenDtmDataSelectAttributeValue()).toEqual('false');
        console.log('✅ Verified Ortho is selected by default on first screen');
    }

    async clickAndSelectDataSetOnSecondScreen(datasetName: string) {
        await this.page.locator('[data-testid="comparisontwodisplay-screen-picker-wrapper"] div>div>div').nth(2).click();
        await this.page.locator(`div:text-is("${datasetName}")`).last().click();
        expect(await this.getSecondScreenDataSelectOrthoAttributeValue()).toEqual('true');
        expect(await this.getSecondScreenDataSelectDsmAttributeValue()).toEqual('false');
        expect(await this.getSecondScreenDataSelectDtmAttributeValue()).toEqual('false');

        expect(await this.getSecondScreenOrthoDataStateAttributeValue()).toEqual('enabled');
        expect(await this.getSecondScreenDsmDataStateAttributeValue()).toEqual('enabled');
        expect(await this.getSecondScreenDtmDataStateAttributeValue()).toEqual('enabled');

        console.log('✅ Verified Ortho, DSM, and DTM are enabled in second screen');
    }

    // Four screen page functions

    async getScreenPickerCountForFourScreen() {
        return this.page.locator('[data-testid="comparisonfourdisplay-screen-picker-wrapper"]');
    }

    async getDataSetTitleFromFourScreen() {
        const fullText = await this.page.locator('[data-testid="comparisonfourdisplay-screen-picker-wrapper"]').locator('span').locator('..').textContent();

        if (!fullText) return null;

        return fullText.replace(/^\d{2}\.\s\d{2}\.\s\d{2}\s*/, '').trim();
    }

    async getDatasetSelectionMessage(screenIndex: number) {
        return this.page
            .locator('[data-testid="comparisonfourdisplay-screen-picker-wrapper"] div>div>div')
            .nth(screenIndex)
            .textContent();
    }

    async getMessageFromSecondDatasetSelectScreenOfFourScreen() {
        return this.getDatasetSelectionMessage(2);
    }

    async getMessageFromThirdDatasetSelectScreen() {
        return this.getDatasetSelectionMessage(4);
    }

    async getMessageFromFourthDatasetSelectScreen() {
        return this.getDatasetSelectionMessage(6);
    }

    async getThirdScreenDataSelectOrthoAttributeValue() { return this.getDataSelectedAttribute(2, 'Ortho'); }
    async getThirdScreenDataSelectDsmAttributeValue() { return this.getDataSelectedAttribute(2, 'DSM'); }
    async getThirdScreenDataSelectDtmAttributeValue() { return this.getDataSelectedAttribute(2, 'DTM'); }
    async getFourthScreenDataSelectOrthoAttributeValue() { return this.getDataSelectedAttribute(3, 'Ortho'); }
    async getFourthScreenDataSelectDsmAttributeValue() { return this.getDataSelectedAttribute(3, 'DSM'); }
    async getFourthScreenDataSelectDtmAttributeValue() { return this.getDataSelectedAttribute(3, 'DTM'); }

    async getThirdScreenOrthoDataStateAttributeValue() { return this.getDataStateAttribute(2, 'Ortho'); }
    async getThirdScreenDsmDataStateAttributeValue() { return this.getDataStateAttribute(2, 'DSM'); }
    async getThirdScreenDtmDataStateAttributeValue() { return this.getDataStateAttribute(2, 'DTM'); }
    async getFourthScreenOrthoDataStateAttributeValue() { return this.getDataStateAttribute(3, 'Ortho'); }
    async getFourthScreenDsmDataStateAttributeValue() { return this.getDataStateAttribute(3, 'DSM'); }
    async getFourthScreenDtmDataStateAttributeValue() { return this.getDataStateAttribute(3, 'DTM'); }

    async validateDsmAndDtmIsClickableInFirstScreen() {
        const dsmButton = this.page.locator('button:text-is("DSM")').first();
        const dtmButton = this.page.locator('button:text-is("DTM")').first();

        await expect(dsmButton).toBeEnabled();
        await expect(dtmButton).toBeEnabled();

        console.log('✅ Verified DSM and DTM are clickable in the first screen');
    }

    async validateOrthoDsmDtmAreDisabled(screenIndex: number) {
        const orthoClass = await this.getDataStateAttribute(screenIndex, 'Ortho');
        const dsmClass = await this.getDataStateAttribute(screenIndex, 'DSM');
        const dtmClass = await this.getDataStateAttribute(screenIndex, 'DTM');

        expect(orthoClass).toEqual('disabled');
        expect(dsmClass).toEqual('disabled');
        expect(dtmClass).toEqual('disabled');

        console.log(`✅ Verified Ortho, DSM, and DTM are disabled on screen ${screenIndex + 1}`);
    }

    async validateOrthoDsmDtmAreDisabledInSecondScreen() { await this.validateOrthoDsmDtmAreDisabled(1); }
    async validateOrthoDsmDtmAreDisabledInThirdScreen() { await this.validateOrthoDsmDtmAreDisabled(2); }
    async validateOrthoDsmDtmAreDisabledInFourthScreen() { await this.validateOrthoDsmDtmAreDisabled(3); }

    async clickAndSelectDataSetOnFourthScreen(datasetName: string) {
        await this.page.locator('[data-testid="comparisonfourdisplay-screen-picker-wrapper"] div>div>div').nth(6).click();
        await this.page.locator(`div:text-is("${datasetName}")`).last().click();

        const orthoClass = await this.getFourthScreenOrthoDataStateAttributeValue();
        const dsmClass = await this.getFourthScreenDsmDataStateAttributeValue();
        const dtmClass = await this.getFourthScreenDtmDataStateAttributeValue();

        expect(orthoClass).toEqual('enabled');
        expect(dsmClass).toEqual('enabled');
        expect(dtmClass).toEqual('enabled');

        console.log('✅ Verified Ortho, DSM, and DTM are enabled in the fourth screen');
    }


    //Slider page functions
    async isSliderVisible() {
        const slider = this.page.getByTestId('OlTwoDSlider-SliderSvgWrapper');
        return await slider.isVisible();
    }

    async getScreenPickerCountForSliderScreen() {
        return this.page.locator('[data-testid="OlTwoDSlider-SliderBar"]');
    }

    async getDataSetTitleFromSliderScreen() {
        const fullText = await this.page.locator('[data-testid="OlTwoDSlider-SliderBar"]').locator('span').locator('..').first().textContent();
        if (!fullText) return null;
        return fullText.replace(/^\d{2}\.\s\d{2}\.\s\d{2}\s*/, '').trim();
    }

    async clickAndSelectDataSetOnSecondScreenOfSliderScreen(datasetName: string) {
        await this.page.locator('[data-testid="OlTwoDSlider-SliderBar"] div>div>div').nth(4).click();
        await this.page.getByTestId('popup-split_view-BOTTOM_RIGHT').filter({ hasText: datasetName }).click();
    }

    async hoverMouseAndClickOnSlider() {
        const slider = this.page.getByTestId('OlTwoDSlider-SliderSvgWrapper');
        await slider.hover();
        await slider.click();
    }


    // 2D Map page functions

    async verify2DMapIsVisible() {
        await expect(this.page.locator('[class="ol-layer"] canvas')).toBeVisible({ timeout: 30000 });
    }

    async getMapAttributes() {
        const mapWrapper = this.page.locator('[data-testid="map-wrapper"]');
        const zoomLevel = await mapWrapper.getAttribute('data-zoom-level');
        const mapRotation = await mapWrapper.getAttribute('data-map-rotation');
        const mapCameraPosition = await mapWrapper.getAttribute('data-map-camera-position');

        if (!zoomLevel || !mapRotation || !mapCameraPosition) {
            throw new Error('One or more map attributes are missing');
        }

        return {
            zoomLevel: parseFloat(zoomLevel),
            mapRotation: parseFloat(mapRotation),
            mapCameraPosition: mapCameraPosition.split(',').map(Number)
        };
    }


    async show2dOrthomosaicDetails() {
        const twoDMapLayerElement = this.page.getByTestId('content-selection-box').filter({ has: this.page.locator('[data-ddm-track-label="btn-contents-list-2d"]') });
        await twoDMapLayerElement.click();
    }

    async getOpacityValue() {
        const opacityValue = await this.page.locator('[data-ddm-track-label="btn-contents-list-2d"] + div div +div').nth(3).textContent();
        return opacityValue?.replace('%', '') || '';
    }

    async changeOpacityValue(opacityValue: number) {
        const opacityValueInput = this.page.locator('[data-ddm-track-label="btn-contents-list-2d"] +div').locator('[type="range"]');

        const boundingBox = await opacityValueInput.boundingBox();
        const x = (boundingBox?.x || 0) + (boundingBox?.width || 0) / 2;
        const y = (boundingBox?.y || 0) + (boundingBox?.height || 0) / 2;
        await this.page.mouse.move(x, y);
        await this.page.mouse.down();
        await this.page.mouse.move(x + opacityValue, y);
        await this.page.mouse.move(x - opacityValue + 1, y);
        await this.page.mouse.up();
    }
}
