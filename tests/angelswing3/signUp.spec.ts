import { test } from '../../test-options';
import { expect, request } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { countries, purpose, invalidEmails, invalidPasswords, mismatchedPasswords, invalidPhoneNumbers, sqlInjectionPayloads } from '../../test-data/signup-test-data';
import { MESSAGE } from '../../utils/message';
import MailosaurService from '../../services/mailosaur.request';
import { Message } from 'mailosaur/lib/models';
import { PageManager } from '../../pages/PageManager';
import { SignupPage } from '../../pages/SignupPage';
import { createTokenAndGetUuid, deleteToken, waitForEmailAndExtractLink } from '../../services/fetchEmail.requests';

test.use({ storageState: { cookies: [], origins: [] } });

let randomPurpose = purpose[Math.floor(Math.random() * purpose.length)];
let randomCountry = countries[Math.floor(Math.random() * countries.length)];
let token: string;
let updatedToken: string;

const firstName = faker.person.firstName();
const lastName = faker.person.lastName();
const updatedFirstName = faker.person.firstName();
const updatedLastName = faker.person.lastName();
// const email: string = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${process.env.EMAIL_DOMAIN}`;
let email: string = '';
// const updatedEmail: string = `${updatedFirstName.toLowerCase()}.${updatedLastName.toLowerCase()}@${process.env.EMAIL_DOMAIN}`;
let updatedEmail: string = '';
const yesterday = new Date(Date.now() - 48 * 60 * 60 * 1000);

const maxFirstLastName = 300;
const maxOrganization = 500;

const longFirstLastName = 'A'.repeat(maxFirstLastName + 10);
const longOrganization = 'B'.repeat(maxOrganization + 10);

const userDetails = {
    email: email,
    password: 'Test@12345',
    firstName: firstName,
    lastName: lastName,
    phone: faker.phone.number({ style: 'international' }),
    organization: faker.company.name(),
    country: randomCountry,
    purpose: randomPurpose,
    language: 'English',
};

const updatedUserDetails = {
    email: updatedEmail,
    password: 'Test@123456',
    firstName: updatedFirstName,
    lastName: updatedLastName,
    phone: faker.phone.number({ style: 'international' }),
    organization: faker.company.name(),
    country: randomCountry,
    purpose: randomPurpose,
    language: 'English',
};

test.use({ storageState: { cookies: [], origins: [] } });
test.describe('Sign Up Functionality', () => {
    let pageManager: PageManager;
    let signUpPage: SignupPage;
    test.beforeEach(async ({ page, request }) => {
        pageManager = new PageManager(page);
        signUpPage = pageManager.onSignupPage;

        // Navigate to homepage and go to signup page
        await pageManager.onLoginPage.openLoginPage();
        await pageManager.onLoginPage.goToSignupPage();
        token = await createTokenAndGetUuid(request);
        email = `${token}@${process.env.EMAIL_HOOK_URL}`;
        userDetails.email = email;
        await signUpPage.validateSingUpWithEmailIsDisplayed();
        await pageManager.getPage.waitForTimeout(300);
    });

    test.afterEach(async ({ request }) => {
        await deleteToken(request, token);
    });
    //mailosaur service is expired, so we are using fetchEmail.requests.ts to get the verification link
    // async function verifyEmail(userDetails: any) {
    //     const mailosaurService = new MailosaurService(process.env.MAILOSAUR_API_KEY || '', process.env.MAILOSAUR_SERVER_ID || '');

    //     const message: Message = await mailosaurService.getEmail(userDetails.email, yesterday);

    //     await mailosaurService.validateSenderNameAndEmail(message, 'ANGELSWING', 'no-reply@angelswing.io');

    //     await mailosaurService.verifyEmailSubject(message, '[Angelswing] Email Verification');
    //     await mailosaurService.verifyEmailBody(message, 'Please confirm your email address');

    //     await mailosaurService.validateEmailId(message, userDetails.email);
    //     await mailosaurService.verifyEmailButtonLink(message, 'confirm-email');
    //     await mailosaurService.validateGreeting(message, `Hello ${userDetails.firstName} ${userDetails.lastName}`);
    //     await mailosaurService.validateEmailId(message, userDetails.email);
    //     await mailosaurService.validateEmailFooter(message, 'Angelswing Inc.');
    //     await mailosaurService.validateEmailSupportContact(message, 'support@angelswing.io');

    //     return await mailosaurService.extractVerificationLink(message);
    // }
    async function enterEmailAndPassword(userDetails: any) {
        await signUpPage.enterEmail(userDetails.email);
        await signUpPage.enterPassword(userDetails.password);
        await signUpPage.enterConfirmPassword(userDetails.password);
    }

    async function enterMoreDetails(userDetails: any) {
        await signUpPage.enterFirstName(userDetails.firstName);
        await signUpPage.enterLastName(userDetails.lastName);
        await signUpPage.enterOrganization(userDetails.organization);
        await signUpPage.enterPhoneNumber(userDetails.phone);
        await signUpPage.selectPurpose(userDetails.purpose);
    }

    async function selectCountryAndLanguage(userDetails: any) {
        await signUpPage.selectCountry(userDetails.country);
        await signUpPage.selectLanguage(userDetails.language);
    }

    async function signUpWithValidDetails(userDetails: any) {

        await signUpPage.validateHeaderOfThePage('Set up your account with email');
        await signUpPage.validateNextButtonIsDisabled();
        await enterEmailAndPassword(userDetails);
        await signUpPage.validateNextButtonIsEnabled();
        await signUpPage.clickOnNextButton();

        await signUpPage.validateHeaderOfThePage('Tell us more about you');
        await enterMoreDetails(userDetails);
        await signUpPage.clickOnNextButton();

        await signUpPage.validateHeaderOfThePage('Set your preferences');
        await signUpPage.validateSignUpTellUsMoreSecondUIElements();
        await signUpPage.validateCreateAccountIsDisabled();
        await selectCountryAndLanguage(userDetails);
        await signUpPage.checkTermsAndConditions();
        await signUpPage.validateCreateAccountIsEnabled();

    }

    async function loginAndCheckApprovalStatus(userDetails: any) {
        await pageManager.onLoginPage.openLoginPage();
        await pageManager.onLoginPage.login(userDetails.email, userDetails.password);
        await signUpPage.validateSignUpEmailVerificationSuccessMessageAndUIElements(
            'Your account is pending approval from Angelswing.',
            'If you can’t login in the next business hour, please contact our support team. cs@angelswing.io'
        );

    }
    test("Should validate UI elements on the 'Sign up' page", async ({ }) => {

        console.log('test');
        await signUpPage.validateSignUpCreateAccountUIElements();
        await signUpPage.validateHeaderOfThePage('Create an account');
    });


    test("Should navigate back to the 'Login' page after clicking the Sign In link on the 'Create Account' page", async ({ }) => {
        await signUpPage.validateHeaderOfThePage('Create an account');
        await signUpPage.clickBackToSignInLink();
        await expect(pageManager.getPage).toHaveURL('/login');
    });


    test("Should validate UI elements on the 'Setup Account' page", async ({ }) => {
        await signUpPage.validateHeaderOfThePage('Create an account');
        await signUpPage.clickOnSignUpWithEmail();
        await signUpPage.validateHeaderOfThePage('Set up your account with email');
        await signUpPage.validateSignUpSetUpAccountUIElements();
    });

    test("Should navigate back to the 'Create Account' page after clicking Previous", async ({ }) => {
        await signUpPage.validateHeaderOfThePage('Create an account');
        await signUpPage.clickOnSignUpWithEmail();
        await signUpPage.validateHeaderOfThePage('Set up your account with email');
        await signUpPage.clickOnPreviousButton();
        await signUpPage.validateHeaderOfThePage('Create an account');

    });

    test("Should navigate to the next 'Tell Us More About You' page after entering valid details and clicking Next", async ({ }) => {
        await signUpPage.validateHeaderOfThePage('Create an account');
        await signUpPage.clickOnSignUpWithEmail();
        await signUpPage.validateHeaderOfThePage('Set up your account with email');
        await signUpPage.validateNextButtonIsDisabled();
        await signUpPage.enterEmail(userDetails.email);
        await signUpPage.enterPassword(userDetails.password);
        await signUpPage.enterConfirmPassword(userDetails.password);
        await signUpPage.validateNextButtonIsEnabled();
        await signUpPage.clickOnNextButton();
        await signUpPage.validateHeaderOfThePage('Tell us more about you');
        await signUpPage.validateSignUpTellUsMoreUIElements();

    });

    test("Should navigate back to the Setup page and retain previously entered values after clicking Previous on the 'Tell Us More' page", async ({ }) => {
        await signUpPage.validateHeaderOfThePage('Create an account');
        await signUpPage.clickOnSignUpWithEmail();
        await signUpPage.validateHeaderOfThePage('Set up your account with email');
        await signUpPage.validateNextButtonIsDisabled();
        await signUpPage.enterEmail(userDetails.email);
        await signUpPage.enterPassword(userDetails.password);
        await signUpPage.enterConfirmPassword(userDetails.password);
        await signUpPage.validateNextButtonIsEnabled();
        await signUpPage.clickOnNextButton();
        await signUpPage.validateHeaderOfThePage('Tell us more about you');
        await signUpPage.clickOnPreviousButton();
        await signUpPage.validateHeaderOfThePage('Set up your account with email');
        await signUpPage.validateNextButtonIsEnabled();
        await signUpPage.validateEmailValue(userDetails.email);
    });


    test("Should navigate back to the Setup page and retain all previously entered values after clicking Previous", async () => {
        await signUpPage.validateHeaderOfThePage('Create an account');
        await signUpPage.clickOnSignUpWithEmail();
        await signUpPage.validateHeaderOfThePage('Set up your account with email');
        await signUpPage.validateNextButtonIsDisabled();
        await signUpPage.enterEmail(userDetails.email);
        await signUpPage.enterPassword(userDetails.password);
        await signUpPage.enterConfirmPassword(userDetails.password);
        await signUpPage.validateNextButtonIsEnabled();
        await signUpPage.clickOnNextButton();
        await signUpPage.validateHeaderOfThePage('Tell us more about you');
        await signUpPage.clickOnPreviousButton();
        await signUpPage.validateHeaderOfThePage('Set up your account with email');
        await signUpPage.validateNextButtonIsEnabled();
        await signUpPage.validateEmailValue(userDetails.email);
        await signUpPage.clickOnPreviousButton();
        await signUpPage.validateHeaderOfThePage('Create an account');
        await signUpPage.clickOnSignUpWithEmail();
        await signUpPage.validateHeaderOfThePage('Set up your account with email');
        await signUpPage.validateNextButtonIsEnabled();
        await signUpPage.validateEmailValue(userDetails.email);

    });

    test("Should retain 'Tell Me More' values when navigating back to the page", async () => {
        await signUpPage.validateHeaderOfThePage('Create an account');
        await signUpPage.clickOnSignUpWithEmail();
        await signUpPage.validateHeaderOfThePage('Set up your account with email');
        await signUpPage.validateNextButtonIsDisabled();
        await signUpPage.enterEmail(userDetails.email);
        await signUpPage.enterPassword(userDetails.password);
        await signUpPage.enterConfirmPassword(userDetails.password);
        await signUpPage.validateNextButtonIsEnabled();
        await signUpPage.clickOnNextButton();
        await signUpPage.validateHeaderOfThePage('Tell us more about you');
        await signUpPage.enterFirstName(userDetails.firstName);
        await signUpPage.enterLastName(userDetails.lastName);
        await signUpPage.enterOrganization(userDetails.organization);
        await signUpPage.enterPhoneNumber(userDetails.phone);
        await signUpPage.selectPurpose(userDetails.purpose);
        await signUpPage.clickOnPreviousButton();
        await signUpPage.validateHeaderOfThePage('Set up your account with email');
        await signUpPage.clickOnNextButton();
        await signUpPage.validateHeaderOfThePage('Tell us more about you');
        await signUpPage.validateNextButtonIsEnabled();
        await signUpPage.validateFirstNameValue(userDetails.firstName);
        await signUpPage.validateLastNameValue(userDetails.lastName);
        await signUpPage.validateOrganizationValue(userDetails.organization);
        await signUpPage.validatePhoneNumberValue(userDetails.phone);
        await signUpPage.validatePurposeValue(userDetails.purpose);
        await signUpPage.validateNextButtonIsEnabled();
        await signUpPage.clickOnPreviousButton();
        await signUpPage.validateHeaderOfThePage('Set up your account with email');
        await signUpPage.validateNextButtonIsEnabled();
        await signUpPage.validateEmailValue(userDetails.email);
        await signUpPage.clickOnPreviousButton();
        await signUpPage.validateHeaderOfThePage('Create an account');
        await signUpPage.clickOnSignUpWithEmail();
        await signUpPage.validateHeaderOfThePage('Set up your account with email');
        await signUpPage.validateNextButtonIsEnabled();
        await signUpPage.validateEmailValue(userDetails.email);
        await signUpPage.clickOnNextButton();
        await signUpPage.validateHeaderOfThePage('Tell us more about you');
        await signUpPage.validateNextButtonIsEnabled();
        await signUpPage.validateFirstNameValue(userDetails.firstName);
        await signUpPage.validateLastNameValue(userDetails.lastName);
        await signUpPage.validateOrganizationValue(userDetails.organization);
        await signUpPage.validatePhoneNumberValue(userDetails.phone);
        await signUpPage.validatePurposeValue(userDetails.purpose);

    });


    test("Should navigate to the next 'Tell Us More' page after entering valid details and clicking Next", async () => {
        await signUpPage.validateHeaderOfThePage('Create an account');
        await signUpPage.clickOnSignUpWithEmail();
        await signUpPage.validateHeaderOfThePage('Set up your account with email');
        await signUpPage.validateNextButtonIsDisabled();
        await signUpPage.enterEmail(userDetails.email);
        await signUpPage.enterPassword(userDetails.password);
        await signUpPage.enterConfirmPassword(userDetails.password);
        await signUpPage.validateNextButtonIsEnabled();
        await signUpPage.clickOnNextButton();
        await signUpPage.validateHeaderOfThePage('Tell us more about you');
        await signUpPage.enterFirstName(userDetails.firstName);
        await signUpPage.enterLastName(userDetails.lastName);
        await signUpPage.enterOrganization(userDetails.organization);
        await signUpPage.enterPhoneNumber(userDetails.phone);
        await signUpPage.selectPurpose(userDetails.purpose);
        await signUpPage.clickOnNextButton();
        await signUpPage.validateHeaderOfThePage('Set your preferences');
        await signUpPage.validateSignUpTellUsMoreSecondUIElements();

    });


    test("Should retain values when navigating back and returning to the Set your preferences page", async ({ }) => {
        await signUpPage.validateHeaderOfThePage('Create an account');
        await signUpPage.clickOnSignUpWithEmail();
        await signUpPage.validateHeaderOfThePage('Set up your account with email');
        await signUpPage.validateNextButtonIsDisabled();
        await signUpPage.enterEmail(userDetails.email);
        await signUpPage.enterPassword(userDetails.password);
        await signUpPage.enterConfirmPassword(userDetails.password);
        await signUpPage.validateNextButtonIsEnabled();
        await signUpPage.clickOnNextButton();
        await signUpPage.validateHeaderOfThePage('Tell us more about you');
        await signUpPage.enterFirstName(userDetails.firstName);
        await signUpPage.enterLastName(userDetails.lastName);
        await signUpPage.enterOrganization(userDetails.organization);
        await signUpPage.enterPhoneNumber(userDetails.phone);
        await signUpPage.selectPurpose(userDetails.purpose);

        await signUpPage.clickOnNextButton();
        await signUpPage.validateHeaderOfThePage('Set your preferences');
        await signUpPage.validateSignUpTellUsMoreSecondUIElements();
        await signUpPage.validateCreateAccountIsDisabled();
        await signUpPage.selectCountry(userDetails.country);
        await signUpPage.selectLanguage(userDetails.language);
        await signUpPage.checkTermsAndConditions();
        await signUpPage.validateCreateAccountIsEnabled();

        await signUpPage.clickOnPreviousButton();
        await signUpPage.validateHeaderOfThePage('Tell us more about you');
        await signUpPage.validateNextButtonIsEnabled();
        await signUpPage.validateFirstNameValue(userDetails.firstName);
        await signUpPage.validateLastNameValue(userDetails.lastName);
        await signUpPage.validateOrganizationValue(userDetails.organization);
        await signUpPage.validatePhoneNumberValue(userDetails.phone);
        await signUpPage.validatePurposeValue(userDetails.purpose);
        await signUpPage.validateNextButtonIsEnabled();
        await signUpPage.clickOnPreviousButton();
        await signUpPage.validateHeaderOfThePage('Set up your account with email');
        await signUpPage.validateNextButtonIsEnabled();
        await signUpPage.validateEmailValue(userDetails.email);
        await signUpPage.clickOnPreviousButton();
        await signUpPage.validateHeaderOfThePage('Create an account');
        await signUpPage.clickOnSignUpWithEmail();
        await signUpPage.validateHeaderOfThePage('Set up your account with email');
        await signUpPage.validateNextButtonIsEnabled();
        await signUpPage.validateEmailValue(userDetails.email);
        await signUpPage.clickOnNextButton();
        await signUpPage.validateHeaderOfThePage('Tell us more about you');
        await signUpPage.validateNextButtonIsEnabled();
        await signUpPage.validateFirstNameValue(userDetails.firstName);
        await signUpPage.validateLastNameValue(userDetails.lastName);
        await signUpPage.validateOrganizationValue(userDetails.organization);
        await signUpPage.validatePhoneNumberValue(userDetails.phone);
        await signUpPage.validatePurposeValue(userDetails.purpose);

    });

    test('Should show account approval pending page after signing up, verifying email, and logging in @smoke', async ({ request }) => {
        await signUpPage.validateHeaderOfThePage('Create an account');
        await signUpPage.clickOnSignUpWithEmail();
        await signUpWithValidDetails(userDetails);
        await signUpPage.clickOnCreateAccount();

        await signUpPage.validateSignUpEmailVerificationSuccessMessageAndUIElements(
            'Your email verification is pending.',
            'Please check your inbox for email verification.'
        );

        const verificationLink = await waitForEmailAndExtractLink(request, token, 'verify');
        expect(verificationLink).toContain('confirm-email');
        await pageManager.getPage.goto(verificationLink);

        await signUpPage.verifySuccessfulEmailVerification(MESSAGE.EMAIL_VERIFICATION.SUCCESS_TITLE, MESSAGE.EMAIL_VERIFICATION.SUCCESS_MESSAGE, email);
        console.log(`Verification email test completed`);

        await loginAndCheckApprovalStatus(userDetails);

    });

    test('Should sign in with new user once approved by admin @smoke', async ({ request }) => {
        await signUpPage.validateHeaderOfThePage('Create an account');
        await signUpPage.clickOnSignUpWithEmail();
        await signUpWithValidDetails(userDetails);
        await signUpPage.clickOnCreateAccount();
        const userId = await signUpPage.getUserId();


        await signUpPage.validateSignUpEmailVerificationSuccessMessageAndUIElements(
            'Your email verification is pending.',
            'Please check your inbox for email verification.'
        );

        const verificationLink = await waitForEmailAndExtractLink(request, token, 'verify');
        expect(verificationLink).toContain('confirm-email');
        await pageManager.getPage.goto(verificationLink);

        await signUpPage.verifySuccessfulEmailVerification(MESSAGE.EMAIL_VERIFICATION.SUCCESS_TITLE, MESSAGE.EMAIL_VERIFICATION.SUCCESS_MESSAGE, email);

        console.log(`Email verification completed`);

        await pageManager.onAdminPage.openAdminLoginPage();
        const adminEmail: string = process.env.ADMINEMAIL || '';
        const adminPassword: string = process.env.ADMINPASSWORD || '';
        await pageManager.onAdminPage.adminlogin(adminEmail, adminPassword);
        await pageManager.onAdminPage.openUserPage(userId);
        await pageManager.onAdminPage.confirmation();
        await pageManager.onAdminPage.selectApprovalOption();
        await pageManager.onAdminPage.clickUpdateButton();
        await pageManager.onAdminPage.verifyUserApprovedBanner(`User ${userId} approval status has been updated to approved!`);

        //Login with new user
        await pageManager.onLoginPage.openLoginPage();
        await pageManager.onLoginPage.login(userDetails.email, userDetails.password);
        await expect(pageManager.getPage).toHaveURL('/project/dashboard');


    });

    test('Should allow user to go back, update all values, and complete the signup process', async ({ request }) => {

        updatedToken = await createTokenAndGetUuid(request);
        updatedEmail = `${updatedToken}@${process.env.EMAIL_HOOK_URL}`;
        updatedUserDetails.email = updatedEmail;

        await signUpPage.validateHeaderOfThePage('Create an account');
        await signUpPage.clickOnSignUpWithEmail();
        await signUpWithValidDetails(userDetails);
        await signUpPage.clickOnPreviousButton();
        await signUpPage.clickOnPreviousButton();
        await signUpPage.clickOnPreviousButton();
        await signUpPage.clickOnSignUpWithEmail();

        await enterEmailAndPassword(updatedUserDetails);
        await signUpPage.clickOnNextButton();
        await enterMoreDetails(updatedUserDetails);
        await signUpPage.clickOnNextButton();
        await selectCountryAndLanguage(updatedUserDetails);

        await signUpPage.clickOnCreateAccount();

        await signUpPage.validateSignUpEmailVerificationSuccessMessageAndUIElements(
            'Your email verification is pending.',
            'Please check your inbox for email verification.'
        );

        const verificationLink = await waitForEmailAndExtractLink(request, updatedToken, 'verify');
        expect(verificationLink).toContain('confirm-email');
        await pageManager.getPage.goto(verificationLink);

        await signUpPage.verifySuccessfulEmailVerification(MESSAGE.EMAIL_VERIFICATION.SUCCESS_TITLE, MESSAGE.EMAIL_VERIFICATION.SUCCESS_MESSAGE, updatedUserDetails.email);
        console.log(`Verification email test completed`);

        await loginAndCheckApprovalStatus(updatedUserDetails);
        await deleteToken(request, updatedToken);
    });

    test.describe('Email Validation Tests', () => {
        test('Verify email validation with invalid formats', async ({ }) => {

            await signUpPage.validateHeaderOfThePage('Create an account');
            await signUpPage.clickOnSignUpWithEmail();
            const expectedErrorMessage = "* Please try again with a correct email address.";
            for (const invalidEmail of invalidEmails) {
                console.log(`Testing with email: ${invalidEmail}`);
                await signUpPage.enterEmail(invalidEmail);

                await signUpPage.verifyEmailError(expectedErrorMessage);
            }
        });

        test('Verify the behavior when submitting the form with an already registered email.', async ({ }) => {
            await signUpPage.validateHeaderOfThePage('Create an account');
            await signUpPage.clickOnSignUpWithEmail();

            const registeredEmail: string = process.env.EMAIL || '';
            const expectedErrorMessage = '* The account already exists.';

            await signUpPage.enterEmail(registeredEmail);

            await signUpPage.verifyEmailError(expectedErrorMessage);

        });
    });

    test.describe('Password Validation Tests', () => {
        test('Verify password validation with invalid formats', async ({ }) => {

            await signUpPage.validateHeaderOfThePage('Create an account');
            await signUpPage.clickOnSignUpWithEmail();
            await signUpPage.enterEmail(userDetails.email);
            for (const { password, expectedMessage } of invalidPasswords) {
                console.log(`Testing with password: "${password}"`);
                await signUpPage.enterPassword(password);
                await signUpPage.enterConfirmPassword(password);
                await signUpPage.validateNextButtonIsDisabled();
                await signUpPage.verifyPasswordError(expectedMessage);
            }
        });
    });

    test.describe('Confirm Password Validation Tests', () => {
        test('Verify Confirm Password field requires the same value as Password', async ({ }) => {
            await signUpPage.clickOnSignUpWithEmail();

            for (const { password, confirmPassword, expectedMessage } of mismatchedPasswords) {
                console.log(`Testing with Password: "${password}" & Confirm Password: "${confirmPassword}"`);

                await signUpPage.enterPassword(password);
                await signUpPage.enterConfirmPassword(confirmPassword);
                await signUpPage.validateNextButtonIsDisabled();
                await signUpPage.verifyConfirmPasswordError(expectedMessage);
            }
        });
    });

    test.describe('Terms & Conditions Validation Tests', () => {
        test('SHould not enable Create Account button without checking terms and conditions', async ({ }) => {
            await signUpPage.validateHeaderOfThePage('Create an account');
            await signUpPage.clickOnSignUpWithEmail();
            await signUpPage.validateHeaderOfThePage('Set up your account with email');
            await signUpPage.validateNextButtonIsDisabled();
            await signUpPage.enterEmail(userDetails.email);
            await signUpPage.enterPassword(userDetails.password);
            await signUpPage.enterConfirmPassword(userDetails.password);
            await signUpPage.validateNextButtonIsEnabled();
            await signUpPage.clickOnNextButton();
            await signUpPage.validateHeaderOfThePage('Tell us more about you');
            await signUpPage.enterFirstName(userDetails.firstName);
            await signUpPage.enterLastName(userDetails.lastName);
            await signUpPage.enterOrganization(userDetails.organization);
            await signUpPage.enterPhoneNumber(userDetails.phone);
            await signUpPage.selectPurpose(userDetails.purpose);

            await signUpPage.clickOnNextButton();
            await signUpPage.validateHeaderOfThePage('Set your preferences');
            await signUpPage.validateSignUpTellUsMoreSecondUIElements();
            await signUpPage.validateCreateAccountIsDisabled();
            await signUpPage.selectCountry(userDetails.country);
            await signUpPage.selectLanguage(userDetails.language);
            await signUpPage.validateCreateAccountIsDisabled();
            await signUpPage.checkTermsAndConditions();
            await signUpPage.validateCreateAccountIsEnabled();

        });
    });

    test.describe('Phone Number Validation Tests', () => {
        test.fixme('Verify that entering a phone number with letters or special characters (other than + or -) is not allowed', async ({ }) => {
            await signUpPage.clickOnSignUpWithEmail();
            await signUpPage.validateHeaderOfThePage('Set up your account with email');
            await signUpPage.validateNextButtonIsDisabled();
            await signUpPage.enterEmail(userDetails.email);
            await signUpPage.enterPassword(userDetails.password);
            await signUpPage.enterConfirmPassword(userDetails.password);
            await signUpPage.validateNextButtonIsEnabled();
            await signUpPage.clickOnNextButton();
            await signUpPage.validateHeaderOfThePage('Tell us more about you');
            await signUpPage.enterFirstName(userDetails.firstName);
            await signUpPage.enterLastName(userDetails.lastName);
            await signUpPage.enterOrganization(userDetails.organization);
            await signUpPage.enterPhoneNumber(userDetails.phone);

            for (const { phoneNumber, expectedMessage } of invalidPhoneNumbers) {
                console.log(`Testing with Phone Number: "${phoneNumber}"`);

                await signUpPage.enterPhoneNumber(phoneNumber);
                await signUpPage.verifyPhoneNumberError(expectedMessage);
            }
        });
    });

    test.describe('Max Length Validation Tests', () => {
        test('Verify that First Name, Last Name, and Organization fields do not accept more than the max length', async ({ }) => {

            console.log(`Testing max length for First/Last Name: ${maxFirstLastName} chars`);
            console.log(`Testing max length for Organization: ${maxOrganization} chars`);


            await signUpPage.validateHeaderOfThePage('Create an account');
            await signUpPage.clickOnSignUpWithEmail();
            await signUpPage.validateHeaderOfThePage('Set up your account with email');
            await signUpPage.validateNextButtonIsDisabled();
            await signUpPage.enterEmail(userDetails.email);
            await signUpPage.enterPassword(userDetails.password);
            await signUpPage.enterConfirmPassword(userDetails.password);
            await signUpPage.validateNextButtonIsEnabled();
            await signUpPage.clickOnNextButton();
            await signUpPage.validateHeaderOfThePage('Tell us more about you');
            await signUpPage.enterFirstName(longFirstLastName);
            await signUpPage.enterLastName(longFirstLastName);
            await signUpPage.enterOrganization(longOrganization);

            await signUpPage.enterPhoneNumber(userDetails.phone);
            await signUpPage.selectPurpose(userDetails.purpose);
            await signUpPage.validateNextButtonIsDisabled();
        });
    });

    test('Verify Next button is not enabled when mandatory fields are not filled', async ({ }) => {
        await signUpPage.validateHeaderOfThePage('Create an account');
        await signUpPage.clickOnSignUpWithEmail();
        await signUpPage.validateHeaderOfThePage('Set up your account with email');

        await signUpPage.enterEmail(userDetails.email);
        await signUpPage.enterPassword(userDetails.password);
        await signUpPage.enterConfirmPassword(userDetails.password);
        await signUpPage.validateNextButtonIsEnabled();

        await signUpPage.clickOnNextButton();
        await signUpPage.validateHeaderOfThePage('Tell us more about you');

        await signUpPage.enterFirstName('');
        await signUpPage.enterLastName('');
        await signUpPage.enterOrganization('');
        await signUpPage.enterPhoneNumber(userDetails.phone);
        await signUpPage.validateNextButtonIsDisabled();

        await signUpPage.enterFirstName(userDetails.firstName);
        await signUpPage.validateNextButtonIsDisabled();

        await signUpPage.enterLastName(userDetails.lastName);
        await signUpPage.validateNextButtonIsDisabled();

        await signUpPage.enterOrganization(userDetails.organization);
        await signUpPage.validateNextButtonIsDisabled();

        await signUpPage.enterPhoneNumber(userDetails.phone);
        await signUpPage.validateNextButtonIsDisabled();

        await signUpPage.selectPurpose(userDetails.purpose);

        await signUpPage.validateNextButtonIsEnabled();
    });

    test('Verify that First Name, Last Name, and Organization fields do not accept white spaces', async ({ }) => {
        await signUpPage.validateHeaderOfThePage('Create an account');
        await signUpPage.clickOnSignUpWithEmail();
        await signUpPage.validateHeaderOfThePage('Set up your account with email');
        await signUpPage.validateNextButtonIsDisabled();
        await signUpPage.enterEmail(userDetails.email);
        await signUpPage.enterPassword(userDetails.password);
        await signUpPage.enterConfirmPassword(userDetails.password);
        await signUpPage.validateNextButtonIsEnabled();
        await signUpPage.clickOnNextButton();
        await signUpPage.validateHeaderOfThePage('Tell us more about you');
        await signUpPage.enterFirstName(' ');
        await signUpPage.enterLastName(' ');
        await signUpPage.enterOrganization(' ');

        await signUpPage.enterPhoneNumber(userDetails.phone);
        await signUpPage.selectPurpose(userDetails.purpose);
        await signUpPage.validateNextButtonIsDisabled();
    });

    test.describe('SQL Injection Prevention Test', () => {
        test('Verify that SQL injection attempts in the sign-up form: Email, password and confirm password are blocked', async ({ }) => {
            await signUpPage.validateHeaderOfThePage('Create an account');
            await signUpPage.clickOnSignUpWithEmail();

            console.log('Attempting SQL Injection in form fields...');

            for (const sqlPayload of sqlInjectionPayloads) {
                console.log(`Testing with SQL Payload: "${sqlPayload}"`);
                await signUpPage.validateHeaderOfThePage('Set up your account with email');
                await signUpPage.validateNextButtonIsDisabled();
                await signUpPage.enterEmail(sqlPayload);
                await signUpPage.enterPassword(sqlPayload);
                await signUpPage.enterConfirmPassword(sqlPayload);
                await signUpPage.validateNextButtonIsDisabled();

            }
            console.log('SQL Injection test completed successfully. No vulnerabilities found.');
        });

        test('Verify that SQL injection attempts in the sign-up form: First Name, Last Name, phone number and organization are blocked', async ({ }) => {

            await signUpPage.validateHeaderOfThePage('Create an account');
            await signUpPage.clickOnSignUpWithEmail();
            await signUpPage.validateHeaderOfThePage('Set up your account with email');
            await signUpPage.validateNextButtonIsDisabled();
            await signUpPage.enterEmail(userDetails.email);
            await signUpPage.enterPassword(userDetails.password);
            await signUpPage.enterConfirmPassword(userDetails.password);
            await signUpPage.validateNextButtonIsEnabled();
            await signUpPage.clickOnNextButton();

            console.log('Attempting SQL Injection in form fields...');

            for (const sqlPayload of sqlInjectionPayloads) {
                console.log(`Testing with SQL Payload: "${sqlPayload}"`);
                await signUpPage.validateHeaderOfThePage('Tell us more about you');
                await signUpPage.enterFirstName(sqlPayload);
                await signUpPage.enterLastName(sqlPayload);
                await signUpPage.enterPhoneNumber(sqlPayload);
                await signUpPage.enterOrganization(sqlPayload);
                await signUpPage.validateNextButtonIsDisabled();


            }
            console.log('SQL Injection test completed successfully. No vulnerabilities found.');
        });
    });


    test.describe.skip('UI validations ', () => {
        test('should compare sign up - Create an Account page with figma', async () => {
            await expect(pageManager.getPage).toHaveScreenshot('signup-create-an-account-figma-baseline.png');
        });

        test('should compare sign up - Set up your account page with email page with figma', async () => {
            await signUpPage.clickOnSignUpWithEmail();
            await expect(pageManager.getPage).toHaveScreenshot('signup-setup-with-account-figma-baseline.png');
        });

        test('should compare sign up - Tell us more page with figma', async () => {
            await signUpPage.clickOnSignUpWithEmail();
            await enterEmailAndPassword(userDetails);
            await signUpPage.clickOnNextButton();
            await pageManager.getPage.waitForTimeout(300);
            await expect(pageManager.getPage).toHaveScreenshot('signup-tell-us-more-figma-baseline.png');
        });

        test('should compare sign up - Set your preference page with figma', async () => {
            await signUpPage.clickOnSignUpWithEmail();
            await enterEmailAndPassword(userDetails);
            await signUpPage.clickOnNextButton();
            await enterMoreDetails(userDetails);
            await signUpPage.clickOnNextButton();
            await expect(pageManager.getPage).toHaveScreenshot('signup-set-preference-figma-baseline.png');
        });

        test('should compare sign up - Pending email verification page with figma', async () => {

            await signUpPage.clickOnSignUpWithEmail();
            await enterEmailAndPassword(userDetails);
            await signUpPage.clickOnNextButton();
            await enterMoreDetails(userDetails);
            await signUpPage.clickOnNextButton();
            await selectCountryAndLanguage(userDetails);
            await signUpPage.checkTermsAndConditions();
            await signUpPage.clickOnCreateAccount();
            await expect(pageManager.getPage).toHaveScreenshot('signup-pending-email-verification-figma-baseline.png');
        });

        test('should compare sign up - Pending Admin approval page with figma', async ({ request }) => {

            await signUpPage.validateHeaderOfThePage('Create an account');
            await signUpPage.clickOnSignUpWithEmail();

            await signUpWithValidDetails(userDetails);
            await signUpPage.clickOnCreateAccount();

            await signUpPage.validateSignUpEmailVerificationSuccessMessageAndUIElements(
                'Your email verification is pending.',
                'Please check your inbox for email verification.'
            );

            await pageManager.getPage.waitForTimeout(10000);

            const verificationLink = await waitForEmailAndExtractLink(request, token, 'verify');
            expect(verificationLink).toContain('confirm-email');

            await pageManager.getPage.goto(verificationLink);

            await signUpPage.verifySuccessfulEmailVerification(MESSAGE.EMAIL_VERIFICATION.SUCCESS_TITLE, MESSAGE.EMAIL_VERIFICATION.SUCCESS_MESSAGE, userDetails.email);
            await pageManager.getPage.waitForTimeout(1000);
            console.log(`Verification email test completed`);

            await loginAndCheckApprovalStatus(userDetails);

            await expect(pageManager.getPage).toHaveScreenshot('signup-pending-admin-approval-figma-baseline.png');
        });

        test('should compare sign up - with microsoft page with figma', async () => {
            await signUpPage.clickOnSignUpWithMicrosoft();
            await expect(pageManager.getPage).toHaveScreenshot('signup-with-microsoft-figma-baseline.png');
        });

    });
});
