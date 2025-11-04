import { Page, expect } from '@playwright/test';
import { HelperBase } from './HelperBase';
import { BasePage } from './BasePage';


export class OrganizationPage extends BasePage {

    constructor(page: Page) {
        super(page);
    }

    async getHeaderText() {
        return await this.page.locator('section span').first().textContent();
    }

    async getOrganizationName() {
        return await this.page.getByTestId('organization-information-tab-name').locator('div:text-is(" Name") + div').textContent();
    }

    async getCountryName() {
        return await this.page.getByTestId('organization-information-tab-region-country').locator('div:text-is(" Region/Country") + div').textContent();
    }

    async getIndustryName() {
        return await this.page.getByTestId('organization-information-tab-industry').locator('div:text-is(" Industry") + div').textContent();
    }

    async clickOnAccountsTab() {
        await this.page.getByTestId('manage-organization-tabs-Accounts-tab').filter({ hasText: 'Accounts' }).click();
        await this.page.waitForLoadState('networkidle');
    }

    async clickOnPendingRequestsTab() {
        await this.page.waitForTimeout(700);
        await this.page.getByRole('button', { name: 'Pending Requests' }).click();
        await this.page.waitForTimeout(700);
        await this.page.waitForLoadState('networkidle');
        await this.page.locator('tbody tr td').first().waitFor({ state: 'visible', timeout: 5000 });

    }

    async clickOnDataStorageTab() {
        await this.page.getByTestId('manage-organization-tabs-Data Storage-tab').filter({ hasText: 'Data Storage' }).click();
    }

    async clickOnInformationTab() {
        await this.page.getByTestId('manage-organization-tabs-Information-tab').filter({ hasText: 'Information' }).click();
    }

    async clickOnProjects() {
        await this.page.locator('h3', { hasText: 'Projects' }).click();
    }

    async clickOnAccounts() {
        await this.page.locator('h3', { hasText: 'Accounts' }).click();
    }

    async isAccountsTabShownAsSelected() {
        return await this.isTabShownAsSelected('manage-organization-tabs-Accounts-tab');
    }

    async isDataStorageTabShownAsSelected() {
        return await this.isTabShownAsSelected('manage-organization-tabs-Data Storage-tab');
    }

    async isInformationTabShownAsSelected() {
        return await this.isTabShownAsSelected('manage-organization-tabs-Information-tab');
    }

    async isProjectsTabShownAsSelected() {
        return await this.isTabShownAsSelected('manage-organization-tabs-Projects-tab');
    }

    private async isTabShownAsSelected(tabName: string) {
        const isSelected = await this.page.getByTestId(`${tabName}`).getAttribute('data-selected');
        return isSelected === 'true';
    }

    async clickOnProcessing() {
        await this.page.locator('h3', { hasText: 'Processing' }).click();
    }

    async clickOnOrganizationName() {
        await this.page.getByTestId('organization-information-tab-name').locator('div:text-is(" Name") + div').click();
    }

    async clickOnCountry() {
        await this.page.getByTestId('organization-information-tab-region-country').locator('div:text-is(" Region/Country") + div').click();
    }

    async clickOnIndustry() {
        await this.page.getByTestId('organization-information-tab-industry').locator('div:text-is(" Industry") + div').click();
    }

    async getOrganizationPopupHeader() {
        return await this.getHeaderOfPopup();
    }

    async isApplyButtonEnabled() {
        return await this.checkIfApplyButtonIsEnabled();
    }

    async isApplyButtonDisabled() {
        return await this.checkIfApplyButtonIsDisabled();
    }

    async clickOnApply() {
        await this.clickOnApplyButton();
    }

    async clickOnCancel() {
        await this.clickOnCancelButton();
    }

    async clickOnPopUpClose() {
        await this.clickOnPopUpCloseButton();
    }

    async clickOnUpload() {
        await this.clickOnUploadButton();
    }

    async clickOnResetToDefault() {
        await this.clickOnResetToDefaultButton();
    }

    async isImageUploaded() {
        return await this.checkIfImageUploaded();
    }

    async isImageResetToDefault() {
        return await this.checkIfImageResetToDefault();
    }

    async isImageDisplayedOnProfilePage() {
        return await this.checkIfImageDisplayedOnProfilePage();
    }

    async enterOrganizationName(organizationName: string) {
        const organizationNameInput = this.page.getByPlaceholder('Organization Name');
        await organizationNameInput.clear();
        await organizationNameInput.pressSequentially(organizationName);
    }

    async enterCountry(country: string) {
        await this.selectCountry(country);
    }

    async enterIndustry(industry: string) {
        await this.selectPurpose(industry);
    }

    async enterValueInSearch(value: string) {
        const searchInputAccounts = this.page.getByPlaceholder('Search collaborators');
        const searchInputPendingRequests = this.page.getByPlaceholder('Search accounts');

        if (await searchInputAccounts.isVisible()) {
            await searchInputAccounts.clear();
            await searchInputAccounts.pressSequentially(value, { delay: 50 });
            return;
        }
        if (await searchInputPendingRequests.isVisible()) {
            await searchInputPendingRequests.clear();
            await searchInputPendingRequests.pressSequentially(value, { delay: 50 });
            return;
        }
    }


    async searchByValueAndValidateResult(searchTerm: string) {
        await this.enterValueInSearch(searchTerm);
        const rows = this.page.locator('tbody tr');
        await this.page.waitForLoadState('networkidle');
        const rowCount = await rows.count();

        if (rowCount === 0) {
            await this.assertEmptyStateMessage(`No collaborators found for "${searchTerm.trim()}"`);
        } else {
            for (const row of await rows.all()) {
                const cells = row.locator('td');
                const cellText = await cells.nth(1).textContent();
                console.log(`Row Cell Text: ${cellText}`);
                expect(cellText?.toLowerCase()).toContain(searchTerm.toLowerCase());
            }
        }
    }

    async searchByValueAndValidateResultInPendingRequests(searchTerm: string) {
        await this.enterAndWaitForSearchToComplete(searchTerm);
        const rows = this.page.locator('tbody tr');
        const dataRows = this.page.locator('tbody tr td');
        const rowCount = await dataRows.count();

        if (rowCount === 1) {
            await this.assertEmptyStateMessage(`No data available`);
        } else {
            for (const row of await rows.all()) {
                const cells = row.locator('td');
                const cellText = await cells.nth(2).textContent();
                console.log(`Row Cell Text: ${cellText}`);
                expect.soft(cellText?.toLowerCase()).toContain(searchTerm.toLowerCase());
            }
        }
    }

    async validateUserIsListedInAccounts(email: string) {
        await this.validateUserIsListed(email, 1);
    }

    async validateUserIsInvitedAndListedInPendingRequests(email: string) {
        await this.validateUserIsListed(email, 2);
    }

    async validateUserIsNotListedInAccounts(email: string) {
        await this.clickOnAccountsTab();
        await this.validateUserIsNotListed(email, `No collaborators found for "${email.trim()}"`);
    }

    async validateUserIsNotListedInPendingRequests(email: string) {
        await this.validateUserIsNotListed(email, `No data available`);
    }

    private async enterAndWaitForSearchToComplete(value: string) {
        console.log(`Searching for: ${value}`);
        await this.enterValueInSearch(value);
        await this.page.waitForLoadState('networkidle');
        // await this.page.waitForTimeout(1000);
        console.log(`Search completed`);
    }

    async getAccountTypeCellText(): Promise<string | null> {
        return await this.getFirstRowCellText(3);
    }

    private async assertEmptyStateMessage(expectedText: string) {
        const emptyStateMessage = this.page.locator('p', { hasText: expectedText });
        await expect(emptyStateMessage).toBeVisible();
        await expect(emptyStateMessage).toHaveText(expectedText);
        console.log(expectedText);
    }

    private async validateUserIsListed(email: string, columnIndex: number) {
        await this.enterAndWaitForSearchToComplete(email);
        const cellText = await this.getFirstRowCellText(columnIndex);
        console.log(`Row Cell Text: ${cellText}`);
        expect.soft(cellText?.toLowerCase()).toContain(email.toLowerCase());
    }

    private async validateUserIsNotListed(email: string, expectedEmptyText: string) {
        await this.enterAndWaitForSearchToComplete(email);
        await this.assertEmptyStateMessage(expectedEmptyText);
    }


    async clickOnDatePicker() {
        await this.page.getByRole('button', { name: 'Pick a period' }).click();
    }
    async clickOnStartYear() {
        await this.clickDatePickerButton('Start date', 'first');
    }

    async clickOnStartMonth() {
        await this.clickDatePickerButton('Start date', 'last');
    }

    async clickOnEndYear() {
        await this.clickDatePickerButton('End date', 'first');
    }

    async clickOnEndMonth() {
        await this.clickDatePickerButton('End date', 'last');
    }

    private async clickDatePickerButton(label: string, position: 'first' | 'last') {
        const buttonLocator = this.page.locator(`div:text-is("${label}") + div`).getByRole('button');
        await (position === 'first' ? buttonLocator.first() : buttonLocator.last()).click();
    }

    private async selectDropdownOption(optionValue: string) {
        await this.page.getByTestId('dropdown-item').filter({ hasText: optionValue }).click();
    }

    async selectStartYear(year: string) {
        await this.selectDropdownOption(year);
    }

    async selectStartMonth(month: string) {
        await this.selectDropdownOption(month);
    }

    async selectEndYear(year: string) {
        await this.selectDropdownOption(year);
    }

    async selectEndMonth(month: string) {
        await this.selectDropdownOption(month);
    }

    async selectStartDate(startDate: string) {
        await this.page.locator('[class="DayPicker-Day"]').filter({ hasText: '18' }).first().click();
    }

    async selectEndDate(endDate: string) {
        await this.page.locator('[class="DayPicker-Day"]').filter({ hasText: '18' }).last().click();
    }

    async clickOnSearchButton() {
        await this.page.getByRole('button', { name: 'Search' }).click();
    }

    async getOrganizationAccountCount() {
        const textContent = await this.page.locator('h2:text-is("Organization Accounts")  div').textContent();
        return textContent ? parseInt(textContent.trim(), 10) : 0;
    }

    async getOrganizationAccountCountFromTable() {
        const rows = this.page.locator('tbody tr');
        await this.page.waitForTimeout(1000);
        const rowCount = await rows.count();
        return rowCount;
    }

    async getSubscriptionPeriod() {
        return await this.page.locator('h3:text-is("Subscription Period")').locator('..').locator('+ p').textContent();
    }

    async getTotalQuota() {
        return await this.page.locator('h3:text-is("Total Quota")').locator('..').locator('+ p').textContent();
    }

    async getUsedCount() {
        return await this.page.locator('h3:text-is("Used Count")').locator('..').locator('+ span').textContent();
    }

    async getRemainingCount() {
        return await this.page.locator('h3:text-is("Remaining Count")').locator('..').locator('+ span').textContent();
    }

    async clickOnInviteButton() {
        await this.page.getByRole('button', { name: 'Invite' }).click();
    }

    async getInvitationPageHeader() {
        return await this.getHeaderOfPopup();
    }

    async clickOnSelectProjects() {
        await this.page.getByText('Select projects').click();
    }

    async clickOnXButton() {
        await this.page.locator('.react-select__indicators').first().click();
    }

    async selectProject(projectName: string) {
        await this.page.getByText(projectName).first().click();
    }

    async clickOnRoleDropdown() {
        const popup = this.page.getByTestId('popup');
        const roles = [
            'Select role',
            'Org Admin',
            'Project Admin',
            'Project Pilot',
            'Project Member',
            'Project Viewer',
        ];

        for (const name of roles) {
            const btn = popup.getByRole('button', { name }).first();
            if (await btn.isVisible({ timeout: 500 }).catch(() => false)) {
                await btn.click();
                return;
            }
        }
        throw new Error('None of the role buttons were visible');
    }

    async selectRole(role: string) {
        const popup = this.page.getByTestId('popup');
        await this.clickOnRoleDropdown();
        console.log(`Selecting role: ${role}`);
        const roleDropdown = popup.locator('button[data-testid="dropdown-mainbutton"]').first();
        await popup.getByText(`${role}`).first().click();
        await expect(roleDropdown).toHaveText(role);
    }

    async enterEmail(email: string) {
        console.log(`Entering email: ${email}`);
        await this.page.getByPlaceholder('Email').fill(email);
    }

    async getEmailInputValue() {
        return await this.page.getByPlaceholder('Email').inputValue();
    }

    async clickAddButton() {
        await this.page.getByRole('button', { name: 'Add' }).click();
    }

    async isAddButtonEnabled() {
        return await this.page.getByRole('button', { name: 'Add' }).isEnabled();
    }

    async isAddButtonDisabled() {
        return await this.page.getByRole('button', { name: 'Add' }).isDisabled();
    }

    async getCountOfInvitedAccounts(): Promise<number> {
        return await this.page.locator('[data-testid="inviting-collaborators-list"] > div').count();
    }

    async sendInvitation() {
        await this.page.getByRole('button', { name: 'Invite' }).last().click();
        const successMessage = await this.getInvitationSuccessMessage();
        console.log(`Invitation success message: ${successMessage}`);
        expect(successMessage).toContain('The invitations have been sent.');
    }


    async sendInvitationAndGetResponse(): Promise<Array<{ status: string; }>> {
        const [response] = await Promise.all([
            // 1) start waiting
            this.page.waitForResponse(r =>
                r.request().method() === 'POST' &&
                r.url().includes('/organization_users'),
                { timeout: 10_000 }
            ),
            // 2) click the button that triggers it
            this.sendInvitation()
        ]);
        if (response.status() < 200 || response.status() >= 300) {
            throw new Error(`Invitation API failed: ${response.status()}`);
        }
        return response.json();
    }


    async getInvitationSuccessMessage() {
        return await this.page.locator('section>.Toastify__toast-container').first().textContent();
    }

    async cancelInvitation() {
        await this.page.getByRole('button', { name: 'Cancel' }).click();
    }

    //Pending Requests
    async getPendingRequestsCount() {
        const textContent = await this.page.locator('h2:text-is("Organization Accounts")  +div').textContent();
        return textContent ? parseInt(textContent.trim(), 10) : 0;
    }

    async selectAccountOnPendingRequests(accountName: string) {
        await this.page.getByText(accountName).click();
    }




    async getOrganizationInviteResponse() {
        return await this.waitForPostResponse(`organization_users`);
    }

    private async selectTargetRow(email: string) {
        const targetRow = this.page.getByRole('row', { name: email }).locator('td').last();
        await targetRow.click();
    }
    async removeFromOrganization(email: string) {
        await this.selectTargetRow(email);
        await this.page.getByRole('button', { name: 'Remove from organization' }).click();
        await this.clickOnRemoveButton();
    }

    async clickOnRemoveButton() {
        await this.page.getByRole('button', { name: 'Remove' }).click();
    }

    async promoteToAdmin(email: string) {
        await this.selectTargetRow(email);
        await this.page.getByRole('button', { name: 'Promote to org admin' }).click();
        await this.clickOnApply();
    }

    async demoteFromAdmin(email: string) {
        await this.selectTargetRow(email);
        await this.page.getByRole('button', { name: 'Demote to member' }).click();
        await this.clickOnApply();
    }

    async changeRoles(email: string, role: string) {
        await this.page.getByRole('button', { name: 'Change Roles' }).click();
        await this.selectRole(role);
        await this.clickOnApply();
    }

    async bulkRemoveFromOrganization(multipleEmails: string[]) {
        for (const email of multipleEmails) {
            await this.selectTargetRowForBulkAction(email, 0);
        }
        await this.clickOnRemoveButton();
        // await this.clickOnApply();
    }

    async selectTargetRowForBulkAction(email: string, columnNumber: number = 0) {
        const targetRow = this.page.getByRole('row', { name: email }).locator('td').nth(columnNumber);
        await targetRow.click();
    }
}
