import { Page, expect } from '@playwright/test';

export class BasePage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async getHeaderOfPopup() {
        return await this.page.getByTestId('popup-title').textContent();
    }

    async checkIfApplyButtonIsEnabled(text = 'Apply') {
        return await this.page.getByRole('button', { name: text }).isEnabled();
    }

    async checkIfApplyButtonIsDisabled(text = 'Apply') {
        return await this.page.getByRole('button', { name: text }).isDisabled();
    }

    async clickOnApplyButton(text = 'Apply') {
        await this.page.getByRole('button', { name: text }).click();
        await this.page.waitForTimeout(1000);
    }

    async clickOnCancelButton() {
        return await this.page.getByRole('button', { name: 'Cancel' }).click();
    }

    async clickOnPopUpCloseButton() {
        return await this.page.getByTestId('popup').locator('header div svg').click();
    }

    async clickOnUploadButton() {
        return await this.page.getByRole('button', { name: 'Upload' }).click();
    }

    async clickOnResetToDefaultButton() {
        return await this.page.getByRole('button', { name: 'Reset to Default' }).click();
    }

    async checkIfImageUploaded() {
        return await this.page.getByTestId('change-profile-image').locator('img').isVisible();
    }

    async checkIfImageResetToDefault() {
        return await this.page.getByTestId('change-profile-image').locator('img').isHidden();
    }

    async checkIfImageDisplayedOnProfilePage() {
        return await this.page.getByTestId('my-page-account-profile-title-container').locator('img').isVisible();
    }

    async selectCountry(country: any) {
        console.log(`Selecting country: ${country}`);
        const countryDropdown = this.page.locator('button[data-testid="dropdown-mainbutton"]').nth(0);
        await countryDropdown.click();
        await this.page.locator(`text=${country.trim()}`).first().click();
        await expect(countryDropdown).toHaveText(country);
    }

    async selectPurpose(purpose: string,) {
        console.log(`Selecting purpose: ${purpose}`);
        const purposeDropdown = this.page.locator('button[data-testid="dropdown-mainbutton"]');
        await purposeDropdown.click();
        await this.page.locator(`text=${purpose}`).last().click();
        await expect(purposeDropdown).toHaveText(purpose);
    }


    async waitForPostResponse(partialUrl: string, timeout: number = 10000): Promise<any> {
        const response = await this.page.waitForResponse(response =>
            response.url().includes(partialUrl) && response.request().method() === 'POST',
            { timeout: timeout }
        );
        const status = response.status();
        console.log(`Status: ${status}, URL: ${response.url()}`);

        if (status >= 200 && status < 300) {
            const body = await response.json();
            // console.log(`Response: ${JSON.stringify(body)}`);
            return body;
        } else {
            const text = await response.text();
            console.error(`Non-JSON response body:\n${text}`);
            throw new Error(`Expected JSON response but got: ${status}`);
        }
    }

    async getProjectCount() {
        const projectCount = await this.page.locator('[data-testid="organization-project-list"] >div').count();
        return projectCount;
    }

    async getFirstRowCellText(columnIndex: number): Promise<string | null> {
        const row = this.page.locator('tbody tr').first();
        const cells = row.locator('td');
        return await cells.nth(columnIndex).textContent();
    }

    async handleFileChooserWithImages(fileChooser: any, folderPath: string) {
        const { readdirSync } = await import('fs');
        const { join } = await import('path');

        const imageExtensions = ['.png', '.jpg', '.jpeg'];
        const allFiles = readdirSync(folderPath);
        const imageFiles = allFiles.filter((file: string) =>
            imageExtensions.some(ext => file.toLowerCase().endsWith(ext))
        );
        const imagePaths = imageFiles.map((file: string) => join(folderPath, file));

        await fileChooser.setFiles(imagePaths);
    }
}
