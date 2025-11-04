import { Page, Locator, expect } from '@playwright/test';

export class ProjectSidebarPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async expandSidebar() {
        await this.expandCollapseSidebar();
    }

    async collapseSidebar() {
        await this.expandCollapseSidebar();
    }

    async clickOnMap() {
        await this.page.getByTestId('tab-btn-map').click();
    }

    async clickOnCadOverlay() {
        await this.page.getByTestId('tab-btn-overlay').click();
    }

    async clickOnMeasurement() {
        await this.page.getByTestId('tab-btn-measurement').click();
    }

    async clickOnIssue() {
        await this.page.getByTestId('tab-btn-issue').click();
    }

    async clickOnPhotoAlbum() {
        await this.page.getByTestId('tab-btn-photo').click();
    }

    async clickOnSiteLogistics() {
        await this.page.getByTestId('tab-btn-safety').click();
    }

    async clickOnViewPoint() {
        await this.page.getByTestId('tab-btn-viewpoint-capture').click();
    }

    async clickOnWorkspace() {
        await this.page.locator('section[data-test-id="content-page-logo-tab"]').click({ force: true });
        await this.page.getByText('Back to Workspace').click({ force: true });
    }

    async indoorPage() {
        await this.page.getByTestId('tab-btn-indoor').click();
    }

    expandCollapseElement() {
        return this.page.locator('[data-testid="sidebar-toggle-button"]').last();
    }

    private async expandCollapseSidebar() {
        await this.expandCollapseElement().last().click();
    }

    async isSidebarCollapsed() {
        const element = this.page.locator('[data-state="collapsed"]');
        return element.isVisible();
    }

    async isSidebarExpanded() {
        const element = this.page.locator('[data-state="expanded"]');
        return element.isVisible();
    }

    
}
