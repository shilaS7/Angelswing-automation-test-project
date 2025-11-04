import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

const email: string = process.env.EMAIL || '';
const password: string = process.env.PASSWORD || '';


setup('authentication', async ({ page }) => {

    await page.goto('/');
    await page.locator('#sign-in-field-email').fill(email);
    await page.locator('#sign-in-field-password').fill(password);;
    await page.getByRole('button', { name: 'Continue with email' }).click();
    await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible();
    await expect(page).toHaveURL('/project/dashboard');
    // await page.waitForTimeout(3000);

    await page.context().storageState({ path: authFile });
});


