import { BrowserContext, Page } from '@playwright/test';
import { HelperBase } from '../../pages/HelperBase';
import { PageManager } from '../../pages/PageManager';
import { test, expect } from '../../test-options';
import { faker } from '@faker-js/faker';
import { IssuePage } from '../../pages/IssuePage';

test.describe('Issue Page Test', () => {

    let pageManager: PageManager;
    let context: BrowserContext;
    let page: Page;
    let issuePage: IssuePage;
    let xStart: number;
    let yStart: number;
    let helper: HelperBase;



    test.beforeAll(async ({ browser }, testInfo) => {
        context = await browser.newContext({
            recordVideo: {
                dir: testInfo.outputPath('videos'),
                size: {
                    width: 1920,
                    height: 1080
                }
            }
        });
        page = await context.newPage();
        pageManager = new PageManager(page);
        helper = new HelperBase(pageManager.getPage);
        await pageManager.onLoginPage.openLoginPageAndWaitForPageToLoad();
        await helper.closeReadUserGuidePopUp(pageManager, testInfo);
        await pageManager.onDashboardPage.openProject();
        await pageManager.onDashboardPage.verifyLoadingBehavior();
        await pageManager.onProjectSidebarPage.clickOnIssue();
        await expect(pageManager.getPage).toHaveURL(/.*issue*/);

        issuePage = pageManager.onIssuePage;
    });

    test.beforeEach(async () => {
        ({ xStart, yStart } = await setupLocationCoordinates());
    });

    // test.afterAll(async ({ }, testInfo) => {
    //     const videoPath = testInfo.outputPath('my-video.webm');
    //     await Promise.all([
    //         page.video()?.saveAs(videoPath),
    //         page.close()
    //     ]);
    //     testInfo.attachments.push({
    //         name: 'video',
    //         path: videoPath,
    //         contentType: 'video/webm'
    //     });
    //     await context.close();
    // });

    async function getExpectedCreatedAt(createdAtFromResponse: string) {
        const expectedCreatedAt = new Date(createdAtFromResponse).toLocaleDateString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
        });
        return expectedCreatedAt;
    }
    async function setupLocationCoordinates() {
        const mapPage = pageManager.onMapPage;
        const boundingBox = await mapPage.getMapBoundingBox();
        if (!boundingBox) throw new Error('Bounding box not found');
        const { xStart, yStart } = await mapPage.getStaringPosition(boundingBox, 3);
        await mapPage.clickOnZoomInButton(faker.number.int({ min: 500, max: 800 }));
        return { xStart, yStart };
    }

    async function markIssueOnMap(issuePage: IssuePage, xStart: number, yStart: number) {
        const value = { min: 1, max: 200 };
        const randomX = Math.floor(faker.number.int({ min: value.min, max: value.max }) / 5) * 5;
        const randomY = Math.floor(faker.number.int({ min: value.min, max: value.max }) / 5) * 5;
        await pageManager.onMapPage.moveMouseToCenter(xStart + randomX, yStart + randomY);
        await helper.waitForNumberOfSeconds(1);
        await pageManager.onMapPage.moveMouseToCenter(xStart + randomX, yStart + randomY);

        const expectedYCoordinate = await issuePage.getValueOfYCoordinate();
        const expectedXCoordinate = await issuePage.getValueOfXCoordinate();

        await issuePage.createNewIssue(xStart + randomX, yStart + randomY);
        return { expectedYCoordinate, expectedXCoordinate };
    }

    test.describe('Issue Test', () => {

        test('should create a group and validate issue data from sidebar matches API response', async () => {
            await issuePage.clickOnIssueButton();

            await markIssueOnMap(issuePage, xStart, yStart);

            const response = await issuePage.getCreateNewIssuePostResponse();
            const issueId = response.data.id;
            const issueTitle = response.data.title;
            const createdByFromResponse = response.data.createdBy.name;
            const createdAtFromResponse = response.data.createdAt;
            const statusFromResponse = response.data.issueStatus.label;

            const issueTitleFromSidebar = await issuePage.getIssueTitleFromSideBar(issueId, issueTitle);
            const createdByFromSidebar = await issuePage.getIssueCreatedByValueFromSideBar(issueId);
            const createdAtFromSidebar = await issuePage.getIssueCreatedAtValueFromSideBar(issueId);
            const statusFromSidebar = await issuePage.getIssueStatusValueFromSideBar(issueId);

            expect(issueTitleFromSidebar).toBe(issueTitle);
            expect(createdByFromSidebar).toBe(createdByFromResponse);

            const expectedCreatedAt = await getExpectedCreatedAt(createdAtFromResponse);
            expect(createdAtFromSidebar).toContain(expectedCreatedAt);

            const normalizedStatus = statusFromResponse.replace('-', ' ');
            expect(statusFromSidebar?.toLowerCase()).toBe(normalizedStatus.toLowerCase());
        });


    });
});
