import { APIResponse, APIRequestContext } from '@playwright/test';

const BASE_URL = process.env.BACKEND_URL;
const API_KEY = process.env.API_KEY;

async function apiGet(
    request: APIRequestContext,
    endpoint: string,
    useApiKey: boolean = true,
    customApiKey?: string
): Promise<APIResponse> {

    return request.get(`${BASE_URL}${endpoint}`, {
        headers: {
            ...(useApiKey
                ? { 'X-API-KEY': customApiKey ?? API_KEY }
                : {}
            )
        },
    });
}

export function retrieveAvailableFiles(
    request: APIRequestContext,
    projectId?: string,
    startDate?: string,
    endDate?: string,
    useApiKey: boolean = true,
    customApiKey?: string
): Promise<APIResponse> {
    return apiGet(
        request,
        `/external/v1/assets?project_id=${projectId}&start_date=${startDate}&end_date=${endDate}`,
        useApiKey,
        customApiKey
    );
}

export function downloadFile(
    request: APIRequestContext,
    fileName: string,
    fileFormat: string,
    datasetId: string,
    useApiKey: boolean = true,
    customApiKey?: string
): Promise<APIResponse> {
    return apiGet(
        request,
        `/external/v1/assets/${fileName}.${fileFormat}?dataset_id=${datasetId}`,
        useApiKey,
        customApiKey
    );
}
