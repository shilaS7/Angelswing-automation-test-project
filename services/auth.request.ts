import { expect, APIResponse } from '@playwright/test';
import { ENDPOINTS } from '../utils/endpoints';

export async function login(request: any, email: string, password: string): Promise<APIResponse> {

    const response = await request.post(ENDPOINTS.AUTH.LOGIN, {
        data: { email, password },
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return response;
}
