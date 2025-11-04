import { Locator, Page, expect } from '@playwright/test';

export class DashboardPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async closeReadUserGuidePopUp() {
        const popup = this.page.locator('section', { hasText: 'Read user guide' });

        if (!await popup.isVisible({ timeout: 2000 })) {
            return;
        }
        const desktopCloseButton = popup.locator('[data-testid="popup-close"]');
        const mobileCloseButton = this.page.locator('section:has-text("Read user guide") + button:has-text("Close")');

        if (await desktopCloseButton.isVisible({ timeout: 2000 })) {
            await desktopCloseButton.click({ force: true });
            return;
        }

        if (await mobileCloseButton.isVisible({ timeout: 2000 })) {
            await mobileCloseButton.click();
            return;
        }
        console.log('ReadUserGuide Popup not visible, skipping close.');
    }

    async openProject(projectId: string = process.env.PROJECT_ID || '1575') {
        await this.page.getByTestId(`project-list-card-${projectId}`).click();
    }

    async verifyLoadingBehavior() {
        const loading = this.page.getByTestId('loading-wrapper');
        const isVisible = await loading.isVisible({ timeout: 300 });
        expect(isVisible).toBe(true);
        await expect(loading).toBeHidden({ timeout: 10000 });
    }

    async isSignOutButtonVisible() {
        const signOutButton = this.page.getByRole('button', { name: 'Sign out' });
        const isVisible = await signOutButton.isVisible();
        return isVisible;
    }

    async clickOnProjectMenu() {
        await this.page.locator('p', { hasText: 'Menu' }).locator('..').getByText(' My Projects').click();
    }

    async getLoggedInUserResponse(): Promise<any> {
        const response = await this.page.waitForResponse(response =>
            response.url().includes(`/v2/auth/signin`) && response.status() === 201 && response.request().method() === 'POST',
            { timeout: 10000 }
        );
        const status = response.status();
        const body = await response.json();
        // console.log(`Response: ${JSON.stringify(body)}`);
        console.log(`Status: ${status}`);
        return body;
    }


    async clickOnUserName() {
        await this.page.getByTestId('user-profile-button').click();
    }

    async hoverOnUserName(name: string) {
        await this.page.locator(`div:text-is("${name}")`).hover();
    }

    async getTooltipText() {
        const tooltip = this.page.locator('[class="tippy-content"]').textContent();
        return tooltip;
    }

    async clickOnSignOutButton() {
        await this.page.getByRole('button', { name: 'Sign out' }).click();

    }

    async clickOnReleaseNotes() {
        await this.page.locator('[data-testid="dashboard-Release Note -0"]').click();
    }

    async clickOnUserGuide() {
        await this.page.locator('[data-testid="dashboard-User Guide-1"]').click();
    }

    async clickOnOfficialWebsite() {
        await this.page.locator('[data-testid="dashboard-Official Website-2"]').click();
    }

    async clickOnSupport() {
        await this.page.locator('div:text-is("Support")').click();
    }

    async validateURL(expectedUrl: string | RegExp): Promise<void> {
        await expect(this.page).toHaveURL(expectedUrl);
    }

    async validateHeaderText(content: string) {
        await expect(this.page.locator('h1, h2').first()).toContainText(content);
    }

    async clickOnViewProjectToCloseProjectSharedPopup(number: number = 0) {
        const popup = this.page.getByTestId('popup');
        await popup.waitFor({ state: 'visible' });
        await popup.getByRole('button', { name: 'View project' }).nth(number).click();
    }

    async getCountOfSharedProjects() {
        await this.page.waitForLoadState('networkidle');
        const sharedProjects = this.page.getByTestId('popup').getByRole('button', { name: 'View Project' });
        return await sharedProjects.count();
    }

    async scrollRecentProjectsSectionHorizontally() {
        const recentProjectsSection = this.page.locator('.no-scrollbar');
        await recentProjectsSection.hover();
        await recentProjectsSection.scrollIntoViewIfNeeded();
        await this.page.mouse.wheel(0, 100);

        // Optional wait or assertion to confirm scroll occurred
        await this.page.waitForTimeout(500);
        await this.page.mouse.wheel(0, -100);
        await this.page.waitForTimeout(500);
    }

    async collapseSidebar() {
        await this.expandCollapseSideBar();
    }

    async expandSidebar() {
        await this.expandCollapseSideBar();
    }

    async expandCollapseSideBar() {
        const collapseButton = this.page.getByTestId('project-sidebar-collapse-button').last();
        await collapseButton.click();
    }

    async getCollapseButtonText() {
        const collapseButton = this.page.getByTestId('project-sidebar-collapse-button');
        const collapseButtonText = await collapseButton.textContent();
        return collapseButtonText;
    }

    async clickLinkAndValidateHeaderOfLinkOnNewTab(
        clickFn: () => Promise<void>,
        expectedUrl: RegExp,
        expectedHeader: string
    ) {
        const [popup] = await Promise.all([
            this.page.waitForEvent('popup'),
            clickFn(),
        ]);
        // await page.waitForLoadState('domcontentloaded');
        await expect(popup).toHaveURL(expectedUrl);
        const header = popup.locator('h1, h2').first();
        await expect(header).toContainText(expectedHeader);
        await popup.close();
    }

    async clickOnOrganization() {
        await this.page.getByTestId('project-sidebar-menu-item-Organization').filter({ hasText: 'Organization' }).click();
    }

    async isOrganizationSideBarVisible() {
        const organizationSideBar = this.page.getByTestId('project-sidebar-menu-item-Organization');
        return await organizationSideBar.isVisible();
    }

    async clickOnOrganizationProject(projectName: string) {
        await this.page.getByText(`${projectName} Projects`).click();
        await this.page.waitForLoadState('networkidle');
    }

    async getAuthAndCurrentUserResponse(): Promise<{ signinBody: any, currentUserBody: any; }> {
        const [signinResponse, currentUserResponse] = await Promise.all([
            this.page.waitForResponse(response =>
                response.url().includes(`/v2/auth/signin`) && response.status() === 201 && response.request().method() === 'POST'
            ),
            this.page.waitForResponse(response =>
                response.url().includes(`/v2/organizations/current`) && response.status() === 200 && response.request().method() === 'GET'
            )
        ]);

        const signinBody = await signinResponse.json();
        const currentUserBody = await currentUserResponse.json();

        return { signinBody, currentUserBody };
    }
}
