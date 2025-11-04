import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class IndoorPage extends BasePage {

    constructor(page: Page) {
        super(page);
    }


    async getEmptyStateMessage() {
        // TODO: Implement this

        const emptyStateMessage = this.page.locator('[alt="no-floors"]').locator('..').locator('p');
        const emptyStateMessageTitle = await emptyStateMessage.first().textContent();
        const emptyStateMessageDescription = await emptyStateMessage.last().textContent();
        return { emptyStateMessageTitle, emptyStateMessageDescription };
    }

    async getCountOfFloors() {
        await expect(this.floorLoadingSkeleton()).toBeHidden();
        return await this.page.locator('div[data-testid^="indoor-floor-list-item-"]').count();
    }

    async getAllFloorNames() {
        await expect(this.floorLoadingSkeleton()).toBeHidden();
        const floorNames = await this.page.locator('div[data-testid^="indoor-floor-list-item-"]').locator(':scope > div:first-child').allTextContents();

        return floorNames.map(name => name.trim());
    }


    async getVideoCountOfFloor(floorName: string) {

        const videoCountElement = this.page.locator(`[data-testid^="${floorName}-videos-count-"]`);

        if (await videoCountElement.isVisible()) {
            const videoCount = await videoCountElement.textContent();
            return parseInt(videoCount || '0');
        }
        return 0;
    }

    newFloorButton() {
        return this.page.getByRole('button', { name: 'New Floor' });
    }

    floorLoadingSkeleton() {
        return this.page.getByTestId('indoor-floors-list-skeleton-loader');
    }

    async clickOnNewFloor() {
        await this.newFloorButton().click();
    }

    floorPopupHeader() {
        return this.page.locator('[data-testid="popup-title"]');
    }

    floorNameInput() {
        return this.page.locator('[data-testid^="vslam-floor-plan-name-input"]');
    }

    referenceAltitudeInput() {
        return this.page.getByPlaceholder(`Enter a numeric value for the floor's elevation.`);
    }

    async enterFloorName(floorName: string) {
        await this.page.getByRole('textbox', { name: 'Floor Name' }).fill(floorName);
    }

    async selectFloorPlan(floorPlan: string) {
        await this.page.getByText(floorPlan).first().click();
    }

    async enterReferenceAltitude(referenceAltitude: string) {
        const input = this.page.getByPlaceholder(`Enter a numeric value for the floor's elevation.`);
        await input.clear();
        await input.type(referenceAltitude);
    }

    async clickOnSave() {
        await this.page.getByRole('button', { name: 'Save' }).click();
    }

    cancelButton() {
        return this.page.getByRole('button', { name: 'Cancel' });
    }

    async clickOnCancel() {
        await this.cancelButton().click();
    }

    async checkStateOfSaveButton() {
        return await this.page.getByRole('button', { name: 'Save' }).isEnabled();
    }

    async clickOnXIcon() {
        const xIcon = this.page.locator('[data-testid="popup-close"]').last();
        if (await xIcon.isVisible()) {
            await xIcon.click();
        }
        else {
            console.error('X icon not found');
        }
    }

    successMessageText() {
        return this.page.locator('section>.Toastify__toast-container p').first();
    }

    async closeSuccessMessageToast() {
        await this.page.getByRole('button', { name: 'close' }).first().click();
    }

    async hoverOverFloorName(floorName: string) {
        await this.page.getByText(floorName).first().hover();
    }

    async hoverOverFloorNameAndClickOnIt(floorName: string) {
        const floorNameElement = this.page.getByText(floorName).first();
        await floorNameElement.hover();
        await floorNameElement.click();
    }

    moreOptionsButton(floorName: string) {
        return this.page.getByText(floorName).first().locator('+div').locator('[data-testid="dropdown-menu"]');
    }

    async clickOnMoreOptions(floorName: string) {
        const moreOptionsButton = this.moreOptionsButton(floorName);
        await moreOptionsButton.waitFor({ state: 'visible' });
        await moreOptionsButton.hover();
        await moreOptionsButton.click();
    }

    async clickOnEditFloor() {
        await this.page.getByRole('button', { name: 'Edit floor' }).click();
    }

    async clickOnDeleteFloor() {
        await this.page.getByRole('button', { name: 'Delete floor' }).click();
    }

    async clickOnAdd360Video() {
        await this.page.getByRole('button', { name: 'Add 360 video' }).click();
    }

    async getFloorPlanState() {
        return await this.page.getByRole('textbox', { name: 'Floor Plan' }).isDisabled();
    }

    async clickOnDelete() {
        await this.page.getByRole('button', { name: 'Delete' }).click();
    }

    async getDeleteFloorTitleAndDescription() {
        const deleteFloorElement = this.page.locator('[data-testid="indoor-floor-delete-popup-content"] p');
        const deleteFloorTitle = await deleteFloorElement.first().textContent();
        const deleteFloorDescription = await deleteFloorElement.last().textContent();
        return { deleteFloorTitle, deleteFloorDescription };
    }

    //select video popup

    floorNameInputForSelectVideo() {
        return this.page.getByRole('textbox', { name: 'Floor Name' });
    }

    nextButton() {
        return this.page.getByRole('button', { name: 'Next' });
    }

    async clickOnNext() {
        await this.nextButton().click();
    }

    async clickOnSetStartPosition() {
        await this.page.getByRole('button', { name: 'Set start position' }).click();
    }

    async clickOnSetEndPosition() {
        await this.page.getByRole('button', { name: 'Set end position' }).click();
    }

    async getMapBoundingBox() {
        const mapLocator = this.page.getByTestId('vslam-georeferencing-section');
        return await mapLocator.boundingBox();
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

    async clickOnMap(xStart: number, yStart: number) {
        await this.page.mouse.click(xStart, yStart);
    }

    async clickOnZoomIn() {
        await this.page.getByTestId('vslam-overlay-slider').locator('button').first().click();
    }

    async clickOnZoomOut() {
        await this.page.getByTestId('vslam-overlay-slider').locator('button').last().click();
    }

    // 360 video viewer

    async waitForLoading3DToComplete() {
        await this.page.getByTestId('loading-button').first().waitFor({ state: 'hidden', timeout: 10000 });
    }

    async waitForLoading360PhotoToComplete() {
        await this.page.getByTestId('loading-button').last().locator('+p', { hasText: 'Loading 360° Photo...' }).waitFor({ state: 'hidden', timeout: 10000 });
    }

    threeSixtyMiniMap() {
        return this.page.locator('[id="threesixty-ol-minimap"]');
    }

    async goToPreviousDay() {
        await this.page.getByRole('button', { name: 'Go to previous date' }).click();
    }

    async goToNextDay() {
        await this.page.getByRole('button', { name: 'Go to next date' }).click();
    }

    dateSelector() {
        return this.page.getByRole('button', { name: 'Select date' });
    }

    async clickOnDateSelector() {
        await this.dateSelector().click();
    }

    dateSelectorOptions() {
        return this.page.locator('[class="tippy-content"]').locator('span');
    }

    async getDateSelectorOptions() {
        return await this.dateSelectorOptions().allTextContents();
    }

    nextPhotoButton() {
        return this.page.getByRole('button', { name: 'Go to next photo' });
    }

    previousPhotoButton() {
        return this.page.getByRole('button', { name: 'Go to previous photo' });
    }

    firstPhotoButton() {
        return this.page.getByRole('button', { name: 'Go to first photo' });
    }

    lastPhotoButton() {
        return this.page.getByRole('button', { name: 'Go to last photo' });
    }

    async goToFirstPhoto() {
        await this.firstPhotoButton().click();
    }

    async goToLastPhoto() {
        await this.lastPhotoButton().click();
    }

    async goToPreviousPhoto() {
        await this.previousPhotoButton().click();
    }

    async goToNextPhoto() {
        await this.nextPhotoButton().click();
    }

    jumpToPhotoButton() {
        return this.page.getByRole('button', { name: `Jump to specific photo` });
    }

    async jumpToPhoto() {
        await this.jumpToPhotoButton().click();
    }

    async enterFrameNumber(frameNumber: number) {
        await this.page.getByPlaceholder('Enter the frame number').fill(frameNumber.toString());
    }
    async clickOnJumpButton() {
        await this.page.getByRole('button', { name: 'Jump' }).last().click();
    }

    async getCurrentFrameAndTotalFrames() {
        await this.page.waitForTimeout(200);
        const val = await this.jumpToPhotoButton().textContent();
        const currentFrame = val?.split('/')[0]?.trim();
        const totalFrames = val?.split('/')[1]?.trim();
        return { currentFrame, totalFrames };
    }

    async isIndoorSectionHeaderVisible() {
        return await this.page.getByTestId('indoor-vslam-wrapper').locator(':scope> div>div:first-child').isVisible();
    }

    // Floor validation methods
    async getFloorNameValidationError() {
        return await this.page.locator('[data-testid="vslam-floor-plan-name-input-error"]').textContent();
    }

    async isFloorNameValidationErrorVisible() {
        return await this.page.locator('[data-testid="vslam-floor-plan-name-input-error"]').isVisible();
    }

    async isReferenceAltitudeValidationErrorVisible() {
        return await this.page.locator('[data-testid="reference-altitude-error"]').isVisible();
    }

    // Floor plan dropdown methods
    async clickOnFloorPlanDropdown() {
        await this.page.getByRole('textbox', { name: 'Floor Plan' }).click();
    }

    async getFloorPlanOptions() {
        return await this.page.locator('[data-testid="floor-plan-option"]').allTextContents();
    }

    // Modal focus and keyboard methods
    async pressEscapeKey() {
        await this.page.keyboard.press('Escape');
    }

    async pressEnterKey() {
        await this.page.keyboard.press('Enter');
    }

    async pressTabKey() {
        await this.page.keyboard.press('Tab');
    }

    async getFocusedElement() {
        return await this.page.evaluate(() => document.activeElement?.tagName);
    }

    // Video selection modal methods
    async getVideoRows() {
        return await this.page.locator('[data-testid^="indoor-floor-select-video-table-row-"]').count();
    }

    async selectVideoRow(rowIndex: number) {
        await this.page.locator('[data-testid^="indoor-floor-select-video-table-row-"]').nth(rowIndex).click();
    }

    // Date Tab and Video Navigation methods

    selectDate() {
        return this.page.getByRole('button', { name: 'Select date' });
    }

    async clickOnSelectDate() {
        await this.selectDate().click();
    }

    async selectDateFromDropdown(date: string) {
        await this.page.getByText(date).first().click();
    }

    async clickOnMoreOptionsInSelectDateOption() {
        const videoOptionElement = this.page.locator('[class="tippy-content"] [data-testid="dropdown-menu"]').last();
        await videoOptionElement.waitFor({ state: 'visible' });
        await videoOptionElement.click();
    }

    async clickOnDeleteVideo() {
        await this.page.getByRole('button', { name: 'Delete video' }).click();
    }

    leftArrow() {
        return this.page.getByRole('button', { name: 'Go to previous date' });
    }

    rightArrow() {
        return this.page.getByRole('button', { name: 'Go to next date' });
    }

    async getStateOfFirstDateOptionInDropdown() {
        return await this.page.locator('[class="tippy-content"] span').first().locator('..').getAttribute('data-selected') === 'true';
    }

    // Add First Video modal methods
    addVideoButtonInModal() {
        return this.page.getByRole('button', { name: 'Add Video' });
    }

    async clickOnAddVideoFromModal() {
        await this.addVideoButtonInModal().click();
    }

    addFirstVideoPopupMessage() {
        return this.page.getByTestId('indoor-floor-delete-popup-content').locator(':scope > div:first-child');
    }

    // URL and deep link methods
    async getCurrentURL() {
        return this.page.url();
    }

    async navigateToFloorDeepLink(floorId: string) {
        await this.page.goto(`/indoor/${floorId}`);
    }

    // Toast and error message methods
    async getToastMessage() {
        return await this.page.locator('[data-testid="toast-message"]').textContent();
    }

    async isToastVisible() {
        return await this.page.locator('[data-testid="toast-message"]').isVisible();
    }

    // Validation methods for floor name constraints
    async clearFloorNameInput() {
        await this.floorNameInput().clear();
    }

    getFloorNameFromSidebar() {
        return this.page.locator('[data-testid^="indoor-floor-list-item-"]').first();
    }

    async enterFloorNameWithoutTrimming(floorName: string) {
        await this.floorNameInput().fill(floorName);
    }

    // Reference altitude validation methods
    async clearReferenceAltitudeInput() {
        await this.referenceAltitudeInput().clear();
    }

    async getReferenceAltitudeInputValue() {
        return await this.referenceAltitudeInput().inputValue();
    }

    // Video metadata methods
    async getVideoMetadata(rowIndex: number) {
        const row = this.page.locator('[data-testid^="indoor-floor-select-video-table-row-"]').nth(rowIndex);
        const fileName = await row.locator('div').nth(0).textContent();
        const processStatus = await row.locator('div').nth(1).textContent();
        const captureDate = await row.locator('div').nth(2).textContent();
        const uploadDate = await row.locator('div').nth(3).textContent();
        const uploadedBy = await row.locator('div').nth(4).textContent();
        return { fileName, processStatus, captureDate, uploadDate, uploadedBy };
    }

    async getSelectionStateOfFloor(floorName: string) {
        const floorNameElement = this.page.locator(`[data-testid="indoor-floor-list-item-${floorName}"]`).first();
        return await floorNameElement.getAttribute('data-selected');
    }

    async clickOnSingleScreen() {
        await this.page.getByTestId('indoor-progress-comparison-toolbar-NORMAL').click();
    }

    async clickOnDoubleScreen() {
        await this.page.getByTestId('indoor-progress-comparison-toolbar-COMPARISON2').click();
    }

    async clickOnFourScreen() {
        await this.page.getByTestId('indoor-progress-comparison-toolbar-COMPARISON4').click();
    }

    firstComparisonScreen() {
        return this.page.locator('[id="first-comparison-display-from-indoor"]');
    }

    secondComparisonScreen() {
        return this.page.locator('[id="second-comparison-display-from-indoor"]');
    }

    thirdComparisonScreen() {
        return this.page.locator('[id="third-comparison-display-from-indoor"]');
    }
}
