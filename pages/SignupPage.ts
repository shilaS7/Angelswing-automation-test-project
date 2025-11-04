import { Page, expect } from '@playwright/test';

export class SignupPage {
    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async enterEmail(email: string) {
        console.log(`Entering Email: ${email}`);
        await this.enterTextByLabel('Email', email);
    }

    async enterPassword(password: string) {
        console.log(`Entering Password: ${password}`);
        const passwordInput = this.page.locator('label:text-is("Password")').locator('..').locator('input');
        await passwordInput.press('Control+A');
        await passwordInput.press('Backspace');
        await passwordInput.fill(password);
        await passwordInput.press('Tab');
    }

    async enterConfirmPassword(confirmPassword: string) {
        console.log(`Entering Confirm Password: ${confirmPassword}`);
        const confirmPasswordInput = this.page.locator('label:text-is("Confirm Password")').last().locator('..').locator('input');
        await confirmPasswordInput.press('Control+A');
        await confirmPasswordInput.press('Backspace');
        await confirmPasswordInput.fill(confirmPassword);
        await confirmPasswordInput.press('Tab');
    }

    async enterFirstName(firstName: string) {
        console.log(`Entering First Name: ${firstName}`);
        await this.enterTextByLabel('First Name', firstName);
    }

    async enterLastName(lastName: string) {
        console.log(`Entering Last Name: ${lastName}`);
        await this.enterTextByLabel('Last Name', lastName);
    }

    async enterPhoneNumber(phone: string) {
        console.log(`Entering Phone Number: ${phone}`);
        const phoneInput = this.page.locator('input[name="contactNumber"]');
        await phoneInput.press('Control+A');
        await phoneInput.press('Backspace');
        await phoneInput.fill(phone);
        await phoneInput.press('Tab');
    }

    async enterOrganization(organization: string, isEmployee: boolean = true) {
        console.log(`Selecting Organization: ${organization}`);
        const organizationInput = this.page.locator('input[placeholder="Your organization"]');
        if (isEmployee) {
            await organizationInput.fill(organization);
            const enteredValue = await organizationInput.inputValue();
            expect(enteredValue).toBe(organization);
            console.log(`Organization input validated: "${enteredValue}"`);
        } else {
            expect(organizationInput).toBeDisabled();
        }
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

    async selectLanguage(language: string) {
        console.log(`Selecting language: ${language}`);
        const languageDropdown = this.page.locator('button[data-testid="dropdown-mainbutton"]').last();
        await languageDropdown.click();
        await this.page.locator(`text=${language}`).last().click();
        await expect(languageDropdown).toHaveText(language);
    }

    async agreeToTerms() {
        await this.page.locator('[data-testid="ddmcheckbox-root"] i').click();
    }

    async submitSignUpForm() {
        await this.page.locator('button[data-testid="signup-button"]').click();
    }

    async verifySuccessfulSignup(title: string, message: string, expectedEmail: string) {
        const verificationTitle = this.page.getByTestId('simple-title-template-description').locator('h3');
        const verificationMessage = this.page.getByTestId('simple-title-template-description').locator('p');

        await expect(verificationTitle).toHaveText(title);
        await expect(verificationMessage).toHaveText(message);

        const currentURL = this.page.url();
        const encodedEmail = encodeURIComponent(expectedEmail);

        console.log(`Current URL: ${currentURL}`);
        console.log(`Expected Email in URL: ${encodedEmail}`);

        await expect(this.page).toHaveURL(`signup?email=${encodedEmail}`);
    }

    async verifySuccessfulEmailVerification(title: string, message: string, expectedEmail: string) {
        const verificationTitle = this.page.locator('p').first();
        const verificationMessage = this.page.locator('p').last();

        await expect(verificationTitle).toHaveText(title);
        await expect(verificationMessage).toHaveText(message);

        const currentURL = this.page.url();
        const encodedEmail = encodeURIComponent(expectedEmail);

        console.log(`Current URL: ${currentURL}`);
        console.log(`Expected Email in URL: ${encodedEmail}`);

        expect(currentURL).toContain(`?email=${encodedEmail}`);
        // await expect(this.page).toHaveURL(`?email=${encodedEmail}`);
    }

    async getAllCountry() {
        const countryDropdown = this.page.locator('button[data-testid="dropdown-mainbutton"]').nth(0);
        await countryDropdown.click();
        const countries = await this.page.getByTestId('dropdown-item').locator('div').all();

        for (const c of countries) {
            const countryName = await c.textContent();
            console.log(countryName?.trim());
        }
    }

    async verifyEmailError(expectedMessage: string) {
        const emailErrorMessage = this.page.locator('div:has(label:text-is("Email"))>p[data-testid="sign-up-input-field-error"]').first();
        await expect(emailErrorMessage).toHaveText(expectedMessage);
        console.log(`Email validation error displayed: "${expectedMessage}"`);
    }

    async verifyPasswordError(expectedMessage: string) {
        const passwordErrorMessage = this.page.locator('div:has(label:text-is("Password"))>p[data-testid="sign-up-input-field-error"]').first();
        await expect(passwordErrorMessage).toHaveText(expectedMessage);
        console.log(`Password validation error displayed: "${expectedMessage}"`);
    }

    async verifyConfirmPasswordError(expectedMessage: string) {
        const confirmPasswordErrorMessage = this.page.locator('div:has(label:text-is("Confirm Password"))>p[data-testid="sign-up-input-field-error"]').first();
        await expect(confirmPasswordErrorMessage).toHaveText(expectedMessage);
        console.log(`Confirm Password validation error displayed: "${expectedMessage}"`);
    }


    async verifyFirstNameError(expectedMessage: string) {
        const firstNameErrorMessage = this.page.locator('div:has(label:text-is("First Name"))>p[data-testid="sign-up-input-field-error"]').first();
        await expect(firstNameErrorMessage).toHaveText(expectedMessage);
        console.log(`First Name validation error displayed: "${expectedMessage}"`);
    }

    async verifyLastNameError(expectedMessage: string) {
        const lastNameErrorMessage = this.page.locator('div:has(label:text-is("Last Name"))>p[data-testid="sign-up-input-field-error"]').first();
        await expect(lastNameErrorMessage).toHaveText(expectedMessage);
        console.log(`Last Name validation error displayed: "${expectedMessage}"`);
    }

    async verifyOrganizationError(expectedMessage: string) {
        const organizationErrorMessage = this.page.locator('div:has(label:text-is("Organization"))>p[data-testid="sign-up-input-field-error"]').first();
        await expect(organizationErrorMessage).toHaveText(expectedMessage);
        console.log(`Organization validation error displayed: "${expectedMessage}"`);
    }

    async verifyPurposeError(expectedMessage: string) {
        const purposeErrorMessage = this.page.locator('div:has(label:text-is("Purpose"))>p').first();
        await expect(purposeErrorMessage).toHaveText(expectedMessage);
        console.log(`Purpose validation error displayed: "${expectedMessage}"`);
    }

    async verifyPhoneNumberError(expectedMessage: string) {
        const phoneNumberErrorMessage = this.page.locator('div:has(input[placeholder="Enter your phone number"])>p[data-testid="sign-up-input-field-error"]');
        await expect(phoneNumberErrorMessage).toHaveText(expectedMessage);
        console.log(`Phone number validation error displayed: "${expectedMessage}"`);
    }


    async verifyTermsErrorMessage(expectedMessage: string) {
        const termsErrorMessage = this.page.locator('p:text-is("* Please agree with Terms and Conditions & Privacy Policy")');
        await expect(termsErrorMessage).toHaveText(expectedMessage);
        console.log(`Terms & Conditions validation error displayed: "${expectedMessage}"`);
    }



    //Angelswing 3.0

    async validateSignUpCreateAccountUIElements() {
        await this.page.getByRole('link', { name: 'Back to Sign in' }).isVisible();
        await this.page.locator('a + div').isVisible();
        await this.page.getByRole('button', { name: 'Sign up with Email' }).isVisible();
        await this.page.getByRole('button', { name: 'Sign up with Microsoft' }).isVisible();
    }

    async clickBackToSignInLink() {
        await this.page.getByRole('link', { name: 'Back to Sign in' }).click();
    }

    async validateHeaderOfThePage(headerText: string) {
        await expect(this.page.locator('a + div')).toHaveText(headerText);
    }


    async clickOnSignUpWithEmail() {
        await this.page.getByRole('button', { name: 'Sign up with Email' }).click();
    }

    async clickOnSignUpWithMicrosoft() {
        await this.page.getByRole('button', { name: 'Sign up with Microsoft' }).click();
    }

    async clickOnNextButton() {
        await this.page.getByRole('button', { name: 'Next' }).click();
    }

    async clickOnPreviousButton() {
        await this.page.getByRole('button', { name: 'Prev' }).click();
    }

    async validateSignUpSetUpAccountUIElements() {
        await this.validateBackToSignInLinkIsVisible();
        await this.validatePageHeaderIsVisible();
        await this.validateEmailIsVisible();
        await this.validatePasswordIsVisible();
        await this.validateConfirmPasswordIsVisible();
        await this.validateNextButtonIsVisible();
        await this.validatePreviousButtonIsVisible();
        await this.validateNextButtonIsDisabled();
        await this.validatePreviousButtonIsEnabled();

    }


    async validateSignUpTellUsMoreUIElements() {
        await this.validateBackToSignInLinkIsVisible();
        await this.validatePageHeaderIsVisible();
        await this.validateFirstNameIsVisible();
        await this.validateLastNameIsVisible();
        await this.validateOrganizationIsVisible();
        await this.validatePhoneNumberIsVisible();
        await this.validatePurposeIsVisible();

        await this.validatePreviousButtonIsVisible();
        await this.validateNextButtonIsVisible();
        await this.validatePreviousButtonIsEnabled();
        await this.validateNextButtonIsDisabled();

    }


    async validateSignUpTellUsMoreSecondUIElements() {
        await this.validateBackToSignInLinkIsVisible();
        await this.validatePageHeaderIsVisible();

        await this.validateCountryIsVisible();
        await this.validateLanguageIsVisible();
        await this.validateTermsAndConditionsIsVisible();


        await this.validatePreviousButtonIsVisible();
        await this.validatePreviousButtonIsEnabled();
        await this.validateCreateAccountIsVisible();
        await this.validateCreateAccountIsDisabled();

    }


    async validateSignUpEmailVerificationSuccessMessageAndUIElements(successHeaderText: string, successMessage: string) {
        await this.validateBackToSignInLinkIsVisible();
        await this.validateSuccessHeader(successHeaderText);
        await this.validateSuccessMessage(successMessage);
        await this.validateGoToHomepageButtonIsVisible();

    }

    async validateSuccessHeader(expectedText: string) {
        expect(this.page.locator('p').first()).toBeVisible();
        await expect(this.page.locator('p').first()).toHaveText(expectedText);
    }

    async validateSuccessMessage(expectedText: string) {
        expect(this.page.locator('p').last()).toBeVisible();
        await expect(this.page.locator('p').last()).toHaveText(expectedText);
    }


    async validateGoToHomepageButtonIsVisible() {
        await expect(this.page.getByRole('button', { name: 'Go to Homepage' })).toBeVisible();
    }

    async clickOnGoToHomepage() {
        await this.page.getByRole('button', { name: 'Go to Homepage' }).click();
    }


    async validateBackToSignInLinkIsVisible() {
        await expect(this.page.getByRole('link', { name: 'Back to Sign in' })).toBeVisible();
    }

    async validatePageHeaderIsVisible() {
        await expect(this.page.locator('a + div')).toBeVisible();
    }

    async validateNextButtonIsEnabled() {
        await expect(this.page.getByRole('button', { name: 'Next' })).toBeEnabled();
    }

    async validateNextButtonIsDisabled() {
        await expect(this.page.getByRole('button', { name: 'Next' })).toBeDisabled();
    }

    async validatePreviousButtonIsEnabled() {
        await expect(this.page.getByRole('button', { name: 'Prev' })).toBeEnabled();
    }

    async validateNextButtonIsVisible() {
        await expect(this.page.getByRole('button', { name: 'Next' })).toBeVisible();
    }

    async validatePreviousButtonIsVisible() {
        await expect(this.page.getByRole('button', { name: 'Prev' })).toBeVisible();
    }

    async validateCreateAccountIsVisible() {
        await expect(this.page.getByRole('button', { name: 'Create Account' })).toBeVisible();
    }

    async validateCreateAccountIsDisabled() {
        await expect(this.page.getByRole('button', { name: 'Create Account' })).toBeDisabled();
    }

    async validateCreateAccountIsEnabled() {
        await expect(this.page.getByRole('button', { name: 'Create Account' })).toBeEnabled();
    }

    async clickOnCreateAccount() {
        await this.page.getByRole('button', { name: 'Create Account' }).click();
    }

    async validateSingUpWithEmailIsDisplayed() {
        await expect(this.page.getByRole('button', { name: 'Sign up with Email' })).toBeVisible();
    }

    async validateEmailIsVisible() {
        await expect(this.page.locator('input[placeholder="email@site.com"]')).toBeVisible();
        // await this.checkIfFieldsByLabelIsVisible('Email');
    }

    async validatePasswordIsVisible() {
        // await expect(this.page.locator('input[placeholder="Enter a new password"]')).toBeVisible();
        await this.checkIfFieldsByLabelIsVisible('Password');
    }

    async validateConfirmPasswordIsVisible() {
        // await expect(this.page.locator('input[placeholder="Re-enter your password"]')).toBeVisible();
        await this.checkIfFieldsByLabelIsVisible('Confirm Password');
    }

    async validateFirstNameIsVisible() {
        await expect(this.page.locator('input[placeholder="First Name"]')).toBeVisible();
    }

    async validateLastNameIsVisible() {
        await expect(this.page.locator('input[placeholder="Last Name"]')).toBeVisible();
    }

    async validateOrganizationIsVisible() {
        await expect(this.page.locator('input[placeholder="Your organization"]')).toBeVisible();
    }

    async validatePhoneNumberIsVisible() {
        await expect(this.page.locator('input[name="contactNumber"]')).toBeVisible();
    }

    async validatePurposeIsVisible() {
        await expect(this.page.locator('button[data-testid="dropdown-mainbutton"]')).toBeVisible();
    }

    async validateCountryIsVisible() {
        await expect(this.page.locator('button[data-testid="dropdown-mainbutton"]').first()).toBeVisible();
    }

    async validateLanguageIsVisible() {
        await expect(this.page.locator('button[data-testid="dropdown-mainbutton"]').last()).toBeVisible();
    }

    async validateTermsAndConditionsIsVisible() {

        await expect(this.page.locator('input[type="checkbox"]').locator('..')).toBeVisible();
        await expect(this.page.locator('div:text("By signing up, I agree to the")')).toBeVisible();
        await expect(this.page.locator('a[href="https://angelswing.io/en/terms"]')).toBeVisible();

        await expect(this.page.locator('a[href="https://angelswing.io/en/privacy"]')).toBeVisible();
    }

    // async checkTermsAndConditions() {
    //     await this.page.locator('div:has(input[type="checkbox"])').click();
    // }

    async checkTermsAndConditions() {
        await this.page.evaluate(() => {
            (document.querySelector('input[type="checkbox"]') as HTMLElement)?.click();
        });
    }


    async validateEmailValue(email: string) {
        const emailInput = this.page.locator('input[placeholder="email@site.com"]');
        await expect(emailInput).toHaveValue(email);
    }

    async validateFirstNameValue(firstName: string) {
        const firstNameInput = this.page.locator('input[placeholder="First Name"]');
        await expect(firstNameInput).toHaveValue(firstName);
    }

    async validateLastNameValue(lastName: string) {
        const lastNameInput = this.page.locator('input[placeholder="Last Name"]');
        await expect(lastNameInput).toHaveValue(lastName);
    }

    async validateOrganizationValue(organization: string) {
        const organizationInput = this.page.locator('input[placeholder="Your organization"]');
        await expect(organizationInput).toHaveValue(organization);
    }

    async validatePhoneNumberValue(phoneNumber: string) {
        const phoneInput = this.page.locator('input[name="contactNumber"]');
        await expect(phoneInput).toHaveValue(phoneNumber);
    }

    async validatePurposeValue(purpose: string) {
        const purposeDropdown = this.page.locator('button[data-testid="dropdown-mainbutton"]');
        await expect(purposeDropdown).toHaveText(purpose);
    }


    private async enterTextByLabel(labelText: string, inputValue: string) {
        const label = this.page.locator(`label:text-is("${labelText}")`);
        const inputField = label.locator('..').locator('input');
        await inputField.fill(inputValue);
        await inputField.press('Tab');
    }

    private async checkIfFieldsByLabelIsVisible(labelText: string) {
        const label = this.page.locator(`label:text-is("${labelText}")`);
        await expect(label).toBeVisible();
    }

    async getUserId(): Promise<string> {
        const response = await this.page.waitForResponse(response =>
            response.url().includes(`auth/signup`) && response.status() === 201 && response.request().method() === 'POST');
        return (await response.json()).data.id;
    }
}
