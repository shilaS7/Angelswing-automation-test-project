import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class IssuePage extends BasePage {

    constructor(page: Page) {
        super(page);
    }


    async clickOnIssueButton() {
        await this.page.locator('[data-ddm-track-label="btn-create-issue_point-2d"]').click();
    }

    async getValueOfYCoordinate() {
        const yCoordinate = await this.page.locator('[id="marker-pinpointer-y-text"] > p').textContent();
        return yCoordinate;
    }

    async getValueOfXCoordinate() {
        const xCoordinate = await this.page.locator('[id="marker-pinpointer-x-text"] > p').textContent();
        return xCoordinate;
    }


    async createNewIssue(xStart: number, yStart: number) {
        await this.page.mouse.click(xStart, yStart);
        console.log(`Created new Issue at (${xStart}, ${yStart})`);
    }

    async getCreateNewIssuePostResponse(): Promise<any> {
        // const response = await this.page.waitForResponse(response =>
        //     response.url().includes(`/v2/projects/${process.env.PROJECT_ID}/issues`) && response.status() === 201 && response.request().method() === 'POST',
        //     { timeout: 10000 }
        // );
        // const status = response.status();
        // const body = await response.json();
        // // console.log(`Response: ${JSON.stringify(body)}`);
        // console.log(`Status: ${status}`);
        // return body;

        return await this.waitForPostResponse(`/v2/projects/${process.env.PROJECT_ID}/issues`);
    }

    async getIssueTitleFromSideBar(issueId: string, issueTitle: string) {
        const title = await this.page.locator(`[id="contentid-${issueId}"]`).locator(`div:text-is("${issueTitle}")`).textContent();
        return title;
    }

    async getIssueCreatedByValueFromSideBar(issueId: string) {
        const createdBy = await this.page.locator(`[id="contentid-${issueId}"]`).locator(`div:text-is("Created By") + div`).textContent();
        return createdBy;
    }

    async getIssueCreatedAtValueFromSideBar(issueId: string) {
        const createdAt = await this.page.locator(`[id="contentid-${issueId}"]`).locator(`div:text-is("Created Date") + div`).textContent();
        return createdAt;
    }

    async getIssueStatusValueFromSideBar(issueId: string) {
        const status = await this.page.locator(`[id="contentid-${issueId}"]`).locator(`div:text-is("Status") + div`).
            getByTestId(`dropdown-mainbutton`).textContent();
        return status;
    }

    //! Need to work on below methods once the issue is inspected using developer tools

    async hoverOverIssueOnMap(issueTitle: string) {
        await this.page.waitForTimeout(1000);
        await this.page.locator(`[type="issue"]`, { hasText: issueTitle }).hover({ force: true });
        await this.page.waitForTimeout(500);
    }

    async getIssueTitleFromMap() {
        const issueTitle = await this.page.locator(`[type="marker"]`).locator('div:text-is("Elev")').locator('+ div').textContent();
        return issueTitle?.trim();

    }

    async getIssueCreatedByValueFromMap() {
        const createdBy = await this.page.locator(`[type="marker"]`).locator('div:text-is("Elev")').locator('+ div').textContent();
        return createdBy?.trim();
    }

    async getIssueCreatedAtValueFromMap() {
        const createdAt = await this.page.locator(`[type="marker"]`).locator('div:text-is("Elev")').locator('+ div').textContent();
        return createdAt?.trim();

    }

}
