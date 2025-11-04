import { Page, Locator, expect } from '@playwright/test';

export class ThreeDMapPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async verify3DMapIsVisible() {
        await expect(this.page.locator('[id="as-3d-view-wrapper"] canvas[data-engine^="three"]')).toBeVisible({ timeout: 30000 });
    }

    async getMapAttributes() {
        const mapWrapper = this.page.locator('[id="as-3d-view-wrapper"]');
        const zoomLevel = await mapWrapper.getAttribute('data-zoom-level');
        const mapRotation = await mapWrapper.getAttribute('data-camera-rotation');
        const mapCameraPosition = await mapWrapper.getAttribute('data-camera-position');

        if (!zoomLevel || !mapRotation || !mapCameraPosition) {
            throw new Error('One or more map attributes are missing');
        }

        return {
            zoomLevel: parseFloat(zoomLevel),
            mapRotation: parseFloat(mapRotation),
            mapCameraPosition: mapCameraPosition.split(',').map(Number)
        };
    }


}
