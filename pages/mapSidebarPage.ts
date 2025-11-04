import { Page, Locator, expect } from '@playwright/test';

export class MapSidebarPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async getTerrainDsmAttribute() {
        return await this.page.locator('button:text-is("DSM")').getAttribute('data-selected');
    }

    async getTerrainDtmAttribute() {
        return await this.page.locator('button:text-is("DTM")').getAttribute('data-selected');
    }

    async getElevationMinValue() {
        return await this.page.locator('div:text-is("Elevation")').locator('..').locator('input')
            .first()
            .inputValue();
    }

    async getElevationMaxValue() {
        return await this.page.locator('div:text-is("Elevation")').locator('..').locator('input')
            .last()
            .inputValue();
    }

    async clickOnDtm() {
        await this.page.locator('button:text-is("DTM")').click();
    }

    async clickOnDsm() {
        await this.page.locator('button:text-is("DSM")').click();
    }

    async getOpacityValue() {
        return await this.page.locator('div:text-is("Opacity")').locator('..').locator('+ div input')
            .inputValue();
    }

    async setOpacityValue(value: number) {
        const opacitySliderElement = this.page.locator('div:text-is("Opacity")').locator('..').locator('+ div input');
        const boundingBox = await opacitySliderElement.boundingBox();
        if (!boundingBox) {
            throw new Error('Opacity slider element not found');
        }
        const sliderWidth = boundingBox.width;
        const sliderHeight = boundingBox.height;
        const sliderX = boundingBox.x;
        const sliderY = boundingBox.y;
        const sliderCenterX = sliderX + sliderWidth / 2;
        const sliderCenterY = sliderY + sliderHeight / 2;

        await this.page.mouse.move(sliderCenterX + value, sliderCenterY);
        await this.page.mouse.down();
        await this.page.mouse.move(sliderCenterX + value, sliderCenterY);
        await this.page.mouse.up();
    }

    async getMinElevationValue() {
        return await this.page.locator('div:text-is("Elevation")').locator('..').locator('input')
            .first()
            .inputValue();
    }

    async getMaxElevationValue() {
        return await this.page.locator('div:text-is("Elevation")').locator('..').locator('input')
            .last()
            .inputValue();
    }

    async setMinElevationValue(value: number) {
        const minElevationInput = this.page.locator('div:text-is("Elevation")').locator('..').locator('input')
            .first();
        await minElevationInput.fill(value.toString());
        await minElevationInput.press('Tab');
    }

    async setMaxElevationValue(value: number) {
        const maxElevationInput = this.page.locator('div:text-is("Elevation")').locator('..').locator('input')
            .last();
        await maxElevationInput.fill(value.toString());
        await maxElevationInput.press('Tab');
    }

    async getPointSizeValue() {
        const pointSizeValue = await this.page.locator('[data-testid="sizeofpoints-label"]').first().getAttribute('value');
        return pointSizeValue;
    }

    async changePointSize(pointSize: number) {
        const opacityValueInput = this.page.locator('[type="range"]').first();

        const boundingBox = await opacityValueInput.boundingBox();
        const x = (boundingBox?.x || 0) + (boundingBox?.width || 0) / 2;
        const y = (boundingBox?.y || 0) + (boundingBox?.height || 0) / 2;
        await this.page.mouse.move(x, y);
        await this.page.mouse.down();
        await this.page.mouse.move(x + pointSize, y);
        await this.page.mouse.move(x - pointSize + 1, y);
        await this.page.mouse.up();
    }

    async getNumberOfPoints() {
        const numberOfPoints = await this.page.locator('[data-testid="sizeofpoints-label"]').last().getAttribute('value');
        return numberOfPoints;
    }

    async changeNumberOfPoints(numberOfPoints: number) {
        const numberOfPointsInput = this.page.locator('[type="range"]').last();
        const boundingBox = await numberOfPointsInput.boundingBox();
        const x = (boundingBox?.x || 0) + (boundingBox?.width || 0) / 2;
        const y = (boundingBox?.y || 0) + (boundingBox?.height || 0) / 2;
        await this.page.mouse.move(x, y);
        await this.page.mouse.down();
        await this.page.mouse.move(x + numberOfPoints, y);
        await this.page.mouse.move(x - numberOfPoints + 1, y);
        await this.page.mouse.up();
    }


}

