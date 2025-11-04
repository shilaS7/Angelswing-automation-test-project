import { test, expect } from '@playwright/test';
import { login } from '../../services/auth.request';
import { MESSAGE } from '../../utils/message';
import { STATUS_CODES } from '../../utils/statusCodes';

test(`should return 201 and created for valid login `, async ({ request }) => {

    const email: string = process.env.EMAIL || '';
    const password: string = process.env.PASSWORD || '';

    const loginResponse = await login(request, email, password);
    // console.log(`Response: ${JSON.stringify(loginResponse)}`);
    expect(loginResponse.status()).toBe(STATUS_CODES.SUCCESS.CREATED);
    expect(loginResponse.statusText()).toBe(MESSAGE.AUTH.STATUS_TEXT.CREATED);
    const loginResponseBody = await loginResponse.json();
    // console.log(`Response: ${JSON.stringify(loginResponseBody)}`);
    expect(loginResponseBody.data.attributes).toHaveProperty('email');
    expect(loginResponseBody.data.attributes).toHaveProperty('email', email);
    expect(loginResponseBody.data.attributes.token).toBeDefined();
    expect(loginResponseBody.data.attributes.token).toBe(loginResponseBody.data.attributes.token);
    const token = loginResponseBody.data.attributes.token;
    console.log(`Token: ${token}`);
    

    


});


