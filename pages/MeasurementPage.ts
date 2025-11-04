import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class MeasurementPage extends BasePage {

    constructor(page: Page) {
        super(page);
    }

    async createGroupSubGroup() {
        const openSpaceSection = this.page.locator('section[data-ctxsort="GroupedContentsListHeader"]').filter({ hasText: 'Open space' });
        await openSpaceSection.locator('[data-ddm-track-action="content-group"]').click();
    }

    async createGroup() {
        await this.createGroupSubGroup();
        console.log('Clicked on create content group');
    }

    async createSubGroup() {
        await this.createGroupSubGroup();
        console.log('Clicked on create content sub group');
    }

    async getGroupId(): Promise<string> {
        const response = await this.page.waitForResponse(`**/*/v2/projects/**/contents`);
        const responseBody = await response.json();
        return responseBody.data.id;
    }

    async clickOnGroupSubGroup(id: string) {
        await this.page.locator(`[data-testid="open-space-sub-group-${id}"]`).getByTestId('group-icon').click();
    }

    async clickOnGroup(groupId: string) {
        const newGroup = this.page.locator(`[data-testid="open-space-group-${groupId}"] > div`).nth(1);
        await newGroup.click();
        console.log('Clicked on Group');
    }

    async clickOnSubGroup(subGroupId: string) {
        await this.clickOnGroupSubGroup(subGroupId);
        console.log('Clicked on Sub Group');
    }

    // ! No attribute found for 'Show / Hide folder' -- Discuss with the developer

    async toggleShowHideGroupFolder(groupId: string) {
        await this.performRightClickAction(`[data-testid="open-space-group-${groupId}"]`, 'Show / Hide folder');
        console.log(`Toggled visibility for folder having Group ID: ${groupId}`);
    }


    async toggleShowHideSubGroupFolder(subGroupId: string) {
        await this.performRightClickAction(`[data-testid="open-space-sub-group-${subGroupId}"]`, 'Show / Hide folder');
        console.log(`Toggled visibility for folder having Sub Group ID: ${subGroupId}`);
    }

    async getGroupDataStateAttributeValue(groupId: string) {
        const group = this.page.locator(`[data-testid="open-space-group-${groupId}"]`);
        const dataStateAttributeValues = await group.getAttribute('data-state');
        return dataStateAttributeValues;
    }

    async getGroupDataSelectedAttributeValue(groupId: string) {
        const group = this.page.locator(`[data-testid="open-space-group-${groupId}"]`);
        const dataSelectedAttributeValues = await group.getAttribute('data-selected');
        return dataSelectedAttributeValues;
    }

    async getGroupDataPinnedAttributeValue(groupId: string) {
        const group = this.page.locator(`[data-testid="open-space-group-${groupId}"]`);
        const dataPinnedAttributeValues = await group.getAttribute('data-pinned');
        return dataPinnedAttributeValues;
    }

    async getSubGroupDataPinnedAttributeValue(subGroupId: string) {
        const subGroup = this.page.locator(`[data-testid="open-space-sub-group-${subGroupId}"]`);
        const dataPinnedAttributeValues = await subGroup.getAttribute('data-pinned');
        return dataPinnedAttributeValues;
    }

    async getSubGroupDataStateAttributeValue(subGroupId: string) {
        const subGroup = this.page.locator(`[data-testid="open-space-sub-group-${subGroupId}"]`);
        const dataStateAttributeValues = await subGroup.getAttribute('data-state');
        return dataStateAttributeValues;
    }

    async getSubGroupDataStateAttributeCount(subGroupId: string) {
        const subGroup = this.page.locator(`[data-testid="open-space-sub-group-${subGroupId}"]`);
        const detailsDataStateAttributeCount = await subGroup.count();
        return detailsDataStateAttributeCount;
    }


    async getSubGroupDataSelectedAttributeValue(subGroupId: string) {
        const subGroup = this.page.locator(`[data-testid="open-space-sub-group-${subGroupId}"]`);
        const dataSelectedAttributeValues = await subGroup.getAttribute('data-selected');
        return dataSelectedAttributeValues;
    }


    async deleteGroup(groupId: string) {
        const newGroup = this.page.locator(`[data-content="group-${groupId}"]`);
        await newGroup.click({ button: "right" });
        await this.page.getByRole('button', { name: 'Delete' }).click();
        await this.page.getByTestId('warning-button').filter({ hasText: 'Delete' }).click();
    }

    async deleteSubGroup(subGroupId: string) {
        const newGroup = this.page.locator(`[data-testid="open-space-sub-group-${subGroupId}"]`);;
        await newGroup.click({ button: "right" });
        await this.page.getByRole('button', { name: 'Delete' }).click();
        await this.page.getByTestId('warning-button').filter({ hasText: 'Delete' }).click();
    }

    async verifySubGroupDeleted(subGroupId: string) {
        const deleteSubGroupResponse = await this.waitForDeleteResponse(`/v2/contents/${subGroupId}`);
        const status = deleteSubGroupResponse.status();
        console.log(`Delete Sub Group response status: ${status}`);
        return status === 204;
    }

    async verifyGroupDeleted(groupId: string) {
        const deleteGroupResponse = await this.waitForDeleteResponse(`/v2/contents/${groupId}`);
        const status = deleteGroupResponse.status();
        console.log(`Delete Group response status: ${status}`);
        return status === 204;
    }

    private async waitForDeleteResponse(partialUrl: string): Promise<any> {
        const response = await this.page.waitForResponse(response =>
            response.url().includes(partialUrl) && response.request().method() === 'DELETE',
            { timeout: 5000 }
        );
        return response;
    }

    private async renameGroupSubGroup(groupId: string, newName: string) {
        const group = this.page.locator(`[data-content="group-${groupId}"]`);
        await this.performRightClickAction(`[data-content="group-${groupId}"]`, 'Rename');
        await group.getByRole('textbox').fill(newName);
        await group.getByRole('textbox').press('Enter');
        console.log(`Renamed Group ID ${groupId} to "${newName}"`);
        await expect(group.locator('p')).toHaveText(newName);
        console.log(`Verified: Group ID ${groupId} renamed to "${newName}"`);
    }

    async renameGroup(groupId: string, newName: string) {
        await this.renameGroupSubGroup(groupId, newName);
    }

    // ! No attribute found for Fold/Unfold -- Discuss with the developer

    async toggleGroupFoldUnfold(groupId: string) {
        await this.performRightClickAction(`[data-testid="open-space-group-${groupId}"]`, 'Fold / Unfold folder');
        console.log(`Toggled Fold visibility for Group Id ID: ${groupId}`);
    }

    async toggleGroupShowMapsForAllDatasets(groupId: string) {
        await this.performRightClickAction(`[data-testid="open-space-group-${groupId}"]`, 'Show on maps for all dates');
        console.log(`Toggled Show on maps for all datasets for Group Id ID: ${groupId}`);
    }


    async toggleSubGroupFoldUnfold(subGroupId: string) {
        await this.performRightClickAction(`[data-testid="open-space-sub-group-${subGroupId}"]`, 'Fold / Unfold folder');
        console.log(`Toggled Fold visibility for Sub Group Id ID: ${subGroupId}`);
    }

    async renameSubGroup(subGroupId: string, newName: string) {
        await this.renameGroupSubGroup(subGroupId, newName);
    }

    async validateGroupIsNotDisplayedInUI(groupId: string) {
        await expect(this.page.locator(`[data-content="group-${groupId}"]`)).toBeHidden();
        await expect(this.page.locator(`[data-content="group-${groupId}"]`)).toHaveCount(0);
        console.log(`Verified: Group ID ${groupId} is not displayed`);

    }

    async validateSubGroupIsNotDisplayedInUI(subGroupId: string) {
        await expect(this.page.locator(`[data-testid="open-space-sub-group-${subGroupId}"]`)).toBeHidden();
        await expect(this.page.locator(`[data-testid="open-space-sub-group-${subGroupId}"]`)).toHaveCount(0);
        console.log(`Verified: Sub Group ID ${subGroupId} is not displayed`);

    }

    async createNewMeasurementItem(xStart: number, yStart: number) {
        await this.page.mouse.click(xStart, yStart);
        console.log(`Created new Measurement Item at (${xStart}, ${yStart})`);
    }

    async getMeasurementItemPostResponse(): Promise<any> {
        return await this.waitForPostResponse(`/v2/projects/${process.env.PROJECT_ID}/contents`);
    }

    async deleteMeasurementItem(measurementItemId: string) {
        await this.performRightClickAction(`[data-ctxsort-key="${measurementItemId}"]`, 'Delete');
        await this.page.getByTestId('popup').getByRole('button', { name: 'Delete' }).click();
        console.log(`Deleted Measurement Item with ID: ${measurementItemId}`);
    }

    async verifyMeasurementItemDeleted(measurementItemId: string) {
        return await this.verifyDeletion(`/v2/contents/${measurementItemId}`);
    }

    async validateMeasurementItemIsNotDisplayedInUI(measurementItemId: string) {
        const newMeasurementItem = this.page.locator(`[data-ctxsort-key="${measurementItemId}"]`);
        await expect(newMeasurementItem).toBeHidden();
        await expect(this.page.locator(`[data-ctxsort-key="${measurementItemId}"]`)).toHaveCount(0);
    }

    async validateMeasurementItemIsShownInMap(measurementItemId: string) {
        const newMeasurementItem = this.page.locator(`[data-ctxsort-key="${measurementItemId}"]`);
        await expect(newMeasurementItem).toBeVisible();
        await expect(newMeasurementItem.locator(`[data-ddm-track-action="map-view"]`)).toHaveCount(0);
    }

    async toggleShowHideLayer(measurementItemId: string) {
        await this.performRightClickAction(`[data-ctxsort-key="${measurementItemId}"]`, 'Show / Hide layer');
        console.log(`Toggled visibility for measurement Item ID: ${measurementItemId}`);
    }

    async validateMeasurementItemIsNotShownInMap(measurementItemId: string) {
        const newMeasurementItem = this.page.locator(`[data-ctxsort-key="${measurementItemId}"]`);
        await expect(newMeasurementItem).toBeVisible();
        await expect(newMeasurementItem.locator(`[data-ddm-track-action="map-view"]`)).toHaveCount(1);
    }

    async renameMeasurementItem(measurementItemId: string, newName: string,) {
        const measurementItem = this.page.locator(`[data-ctxsort-key="${measurementItemId}"]`);
        await this.performRightClickAction(`[data-ctxsort-key="${measurementItemId}"]`, 'Rename');

        await measurementItem.getByRole('textbox').fill(newName);
        await measurementItem.getByRole('textbox').press('Enter');
        await expect(measurementItem.locator('p')).toHaveText(newName);

        console.log(`Renamed Measurement Item ID ${measurementItemId} to "${newName}"`);
    }

    async centerOnMap(measurementItemId: string) {
        await this.performRightClickAction(`[data-ctxsort-key="${measurementItemId}"]`, 'Center on map');
        console.log(`Centered on Measurement Item ID: ${measurementItemId}`);
    }

    // ! No attribute found for Center on Map -- Discuss with the developer

    async toggleShowHideDetails(measurementItemId: string) {
        await this.performRightClickAction(`[data-ctxsort-key="${measurementItemId}"]`, 'Show / Hide Details');
        console.log(`Toggled details visibility for measurement Item ID: ${measurementItemId}`);
    }

    async getMeasurementItemDetailsDataSelectedAttributeValue(measurementItemId: string) {
        const measurementItem = this.page.locator(`[id="contentid-${measurementItemId}"]`);
        const detailsDataSelectedAttributeValue = await measurementItem.getAttribute('data-selected');
        return detailsDataSelectedAttributeValue;
    }

    async getMeasurementItemDetailsDataStateAttributeValue(measurementItemId: string) {
        const measurementItem = this.page.locator(`[id="contentid-${measurementItemId}"]`);
        const detailsDataStateAttributeValue = await measurementItem.getAttribute('data-state');
        return detailsDataStateAttributeValue;
    }

    async getMeasurementItemDetailsDataStateAttributeCount(measurementItemId: string) {
        const measurementItem = this.page.locator(`[id="contentid-${measurementItemId}"]`);
        const detailsDataStateAttributeCount = await measurementItem.count();
        return detailsDataStateAttributeCount;
    }



    async getMeasurementItemDetailsDataPinnedAttributeValue(measurementItemId: string) {
        const measurementItem = this.page.locator(`[id="contentid-${measurementItemId}"]`);
        const detailsDataPinnedAttributeValue = await measurementItem.getAttribute('data-pinned');
        return detailsDataPinnedAttributeValue;
    }

    // ! No attribute found for Show Hide Details , although dynamic class is visible -- Discuss with the developer

    private async performRightClickAction(selector: string, actionName: string) {
        const element = this.page.locator(selector);
        await element.click({ button: "right" });
        await this.page.getByRole('button', { name: actionName }).click();
    }

    private async verifyDeletion(endpoint: string): Promise<boolean> {
        const response = await this.waitForDeleteResponse(endpoint);
        const isSuccess = response.status() === 204;
        console.log(`Deletion API Status: ${response.status()} (Success: ${isSuccess})`);
        return isSuccess;
    }


    async createNewLength(xStart: number, yStart: number) {
        await this.page.mouse.click(xStart + 120, yStart + 120);
        await this.page.mouse.click(xStart + 200, yStart + 200);
        await this.page.mouse.click(xStart + 200, yStart + 200);
        console.log(`Created new Length at (${xStart + 120}, ${yStart + 120}) and (${xStart + 200}, ${yStart + 200})`);
    }


    async getValueOfYCoordinate() {
        const yCoordinate = await this.page.locator('[id="marker-pinpointer-y-text"] > p').textContent();
        return yCoordinate;
    }

    async getValueOfXCoordinate() {
        const xCoordinate = await this.page.locator('[id="marker-pinpointer-x-text"] > p').textContent();
        return xCoordinate;
    }

    async getValueOfYFromSideBar(measurementItemId: string) {
        const yCoordinate = await this.page.locator(`li#contentid-${measurementItemId} p`).nth(1).textContent();
        return yCoordinate;
    }

    async getValueOfXFromSideBar(measurementItemId: string) {
        const xCoordinate = await this.page.locator(`li#contentid-${measurementItemId} p`).last().textContent();
        return xCoordinate;
    }

    async getElevationValueFromSideBar(measurementItemId: string) {
        const elevationValue = await this.page.locator(`li#contentid-${measurementItemId}`).locator('span:text-is("Elev.") + span').textContent();
        return elevationValue;
    }

    async hoverOverMeasurementItemInMap(measurementItemTitle: string) {
        await this.page.waitForTimeout(500);
        await this.page.locator(`[type="marker"]`, { hasText: measurementItemTitle }).hover({ force: true });
        await this.page.waitForTimeout(500);
    }

    async getYXValueFromMap() {
        const xyValue = await this.page.locator(`[type="marker"]`).locator('div:text-is("Y, X")').locator('+ div').textContent();
        if (!xyValue) throw new Error('XY Value not found');
        const [yCoordinate, xCoordinate] = xyValue!.split(',');
        return { y: yCoordinate.trim(), x: xCoordinate.trim() };
    }

    async getElevationValueFromMap() {
        const elevationValue = await this.page.locator(`[type="marker"]`).locator('div:text-is("Elev")').locator('+ div').textContent();
        if (!elevationValue) throw new Error('Elevation Value not found');
        return elevationValue.trim();
    }

    async validateLocationMarkerIsDisplayedOnMap(measurementItemTitle: string) {
        await expect(this.page.locator(`[type="marker"]`, { hasText: measurementItemTitle })).toBeVisible({ timeout: 5000 });
    }

    async validateLocationMarkerIsNotDisplayedOnMap(measurementItemTitle: string) {
        await expect(this.page.locator(`[type="marker"]`, { hasText: measurementItemTitle })).toBeHidden();
    }

    async deleteAllGroups() {
        const groupLocator = this.page.locator('[data-testid^="open-space-group"]');
        const totalGroups = await groupLocator.count();
        console.log(`Total Groups: ${totalGroups}`);

        for (let i = 0; i < totalGroups; i++) {
            console.log(`Deleting group ${i + 1} of ${totalGroups}`);
            const currentGroup = groupLocator.first(); // TODO: Check if the group is already selected
            await currentGroup.locator('> div').first().click();
            await currentGroup.click({ button: 'right' });
            try {
                await this.page.getByRole('button', { name: 'Delete' }).click({ timeout: 2000 });
            } catch (error) {
                if ((error as Error).name === 'TimeoutError') {
                    console.log('Delete button click timed out, trying to toggle show/hide folder and retry');
                    await this.page.getByRole('button', { name: 'Show / Hide folder' }).click();
                    await currentGroup.click({ button: 'right' });
                    await this.page.getByRole('button', { name: 'Delete' }).click();
                } else {
                    throw error;
                }
            }
            await this.page.getByTestId('warning-button').filter({ hasText: 'Delete' }).click();
            await this.page.waitForTimeout(1000);
        }
    }

    async validateNewGroupForOpenSpaceIsCreated() {
        const groupLocator = this.page.locator('[data-testid^="open-space-group"]');
        await expect(groupLocator).toHaveCount(1);
        console.log('One group created successfully');
    }


    async createNewVolume(xStart: number, yStart: number) {
        await this.page.mouse.click(xStart + 120, yStart + 120);
        await this.page.mouse.click(xStart + 200, yStart + 120);
        await this.page.mouse.click(xStart + 200, yStart + 200);
        await this.page.mouse.click(xStart + 120, yStart + 200);
        await this.page.mouse.click(xStart + 120, yStart + 200);
        console.log("Created new Volume");

    }

    async getVolumeCalculationResponse(timeout: number = 10000): Promise<any> {
        return await this.waitForPostResponse(`/vc/`, timeout);
    }

    async get3DDesignSurfaceVolumeCalculationResponse(): Promise<any> {
        return await this.waitForPostResponse(`/dbvc/`);
    }

    async getCompareSurveyVolumeCalculationResponse(): Promise<any> {
        return await this.waitForPostResponse(`/sbvc/`);
    }



    async getCutValueFromSideBar(measurementItemId: string) {
        const cutValue = await this.page.locator(`li#contentid-${measurementItemId} span`).nth(1).textContent();
        return cutValue;
    }

    async getFillValueFromSideBar(measurementItemId: string) {
        const fillValue = await this.page.locator(`li#contentid-${measurementItemId} span`).nth(2).textContent();
        return fillValue;
    }


    async getCutValueFromBelowSideBar(measurementItemId: string) {
        const cutValue = await this.page.locator(`[type="cut"]`).first().textContent();
        return cutValue;
    }

    async getFillValueFromBelowSideBar(measurementItemId: string) {
        const fillValue = await this.page.locator(`[type="fill"]`).first().textContent();
        return fillValue;
    }

    async getVolumeValueFromBelowSideBar(measurementItemId: string) {
        const volumeValue = await this.page.locator(`[type="total"]`).first().textContent();
        return volumeValue;
    }

    async hoverOverVolumeItemInMap(measurementItemTitle: string) {
        await this.page.waitForTimeout(500);
        await this.page.locator(`[type="volume"]`, { hasText: measurementItemTitle }).hover({ force: true, timeout: 10000 });
        await this.page.waitForTimeout(500);
    }


    async getCutFillTotalValueFromMap(timeout = 15000) {
        const volume = this.page.locator(`[type="volume"]`);

        await volume.locator(`[type="cut"]`).first().waitFor({ state: 'visible', timeout });
        await volume.locator(`[type="fill"]`).first().waitFor({ state: 'visible', timeout });
        await volume.locator(`[type="total"]`).first().waitFor({ state: 'visible', timeout });
        const cutValue = await volume.locator(`[type="cut"]`).first().textContent();
        const fillValue = await volume.locator(`[type="fill"]`).first().textContent();
        const totalValue = await volume.locator(`[type="total"]`).first().textContent();

        return { cut: cutValue, fill: fillValue, total: totalValue };
    }

    async clickOnContent(contentId: string) {
        await this.page.locator(`li#contentid-${contentId}`).click();
    }

    async clickOnBasePlaneDropdown() {
        await this.page.locator(`[data-testid="dropdown-mainbutton"]`).click();
    }

    async getAllBasePlaneOptions() {
        const basePlaneOptions = await this.page.locator('[data-testid="dropdown-item"]').allTextContents();
        return basePlaneOptions;
    }

    async selectBasePlaneOption(option: string) {
        await this.page.locator(`[data-testid="dropdown-item"]`, { hasText: option }).click();
    }

    async clickOnEachBasePlaneOption() {
        const optionSelector = '[data-testid="dropdown-item"]';
        const options = await this.page.locator(optionSelector).allTextContents();
        console.log(`Base Plane Options: ${options}`);
        for (const option of options) {
            await this.page.waitForSelector(optionSelector);
            await this.page.locator(optionSelector, { hasText: option }).click();
            await this.page.waitForTimeout(1000);
            await this.page.waitForTimeout(1000);
            await this.clickOnBasePlaneDropdown();

        }
    }

    async enterCustomLevel(level: string) {
        await this.page.locator('[type="string"]').clear();
        await this.page.locator('[type="string"]').fill(level);
        await this.page.getByRole('button', { name: 'Confirm' }).click();
    }
}
