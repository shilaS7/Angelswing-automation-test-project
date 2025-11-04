import { Page, Locator, expect } from '@playwright/test';

export class AdminApprovalPage{
    readonly page: Page;
    

    constructor(page: Page) {
        this.page = page;
    }
    async openAdminLoginPage()
    {
        const adminUrl = process.env.ADMIN_URL;
        await this.page.goto(`${adminUrl}/admins/sign_in`);
    }
    async openUserPage(userId: string) {
        const adminUrl = process.env.ADMIN_URL;
        await this.page.goto(`${adminUrl}/admin/v2~user/${userId}/update`);
    }

    async enterEmail(email: string) {
        await this.page.locator('#admin_email').fill(email);
    }

    async enterPassword(password: string) {
        await this.page.locator('#admin_password').fill(password);
    }

    async clickSignIn() {
        await this.page.getByRole('button', { name: 'Log in' }).click();
    }
   
    async adminlogin(email: string, password: string){
        await this.enterEmail(email);
        await this.enterPassword(password);
        await this.clickSignIn();
    }

    async selectApprovalOption() {
        await this.page.locator('#approval_status').click();
        await this.page.selectOption('select', { value: 'approved' });
    }

    async confirmation() {
        this.page.on('dialog', async dialog => {
                await dialog.accept();   
        })
    }
    
    async clickUpdateButton() {
        await this.page.locator('input[name="commit"][value="Update"]').click();
    }

    async verifyUserApprovedBanner(expectedMessage: string) {
        const userApprovedBanner = this.page.locator('.alert.alert-success').first();
        await expect(userApprovedBanner).toBeVisible();
        const actualText = (await userApprovedBanner.textContent())?.replace("×", "").trim();
        expect(actualText).toBe(expectedMessage);
        console.log(`User approved banner displayed: "${expectedMessage}"`);
    }

}