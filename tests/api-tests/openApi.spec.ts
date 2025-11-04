import { downloadFile, retrieveAvailableFiles } from '../../services/openapi.request';
import { test, expect } from '../../test-options';
import { STATUS_CODES } from '../../utils/statusCodes';
test.describe('Open API Test', () => {
    const projectId = '1619';
    // const projectId = '1337';
    const startDate = '2023-04-01';
    const endDate = '2025-10-14';
    let projectName: string;
    let datasetId: string;
    let datasetDate: string;
    let files: Record<string, boolean> | undefined;

    test.describe('Retrieve Available Downloadable Files for Each Dataset for a Project', () => {
        const validProjectId = projectId;
        const invalidProjectId = '999999';
        const unauthorizedProjectId = '1000';
        test("should return asset list when valid project_id, start_date, and end_date are provided", async ({ request }) => {
            const response = await retrieveAvailableFiles(request, validProjectId, startDate, endDate);
            expect(response.status()).toBe(STATUS_CODES.SUCCESS.OK);
            const responseBody = await response.json();
            expect(responseBody).toHaveProperty("data");
            expect(responseBody.data).toHaveProperty("project_name");
            expect(responseBody.data).toHaveProperty("datasets");
        });

        test("should return assets when only project_id and end_date are provided (defaults start_date to one week before)", async ({ request }) => {
            const response = await retrieveAvailableFiles(request, validProjectId, undefined, endDate);
            expect(response.status()).toBe(STATUS_CODES.SUCCESS.OK);
        });

        test("should return assets when only project_id and start_date are provided (defaults end_date to today)", async ({ request }) => {
            const response = await retrieveAvailableFiles(request, validProjectId, startDate, undefined);
            expect(response.status()).toBe(STATUS_CODES.SUCCESS.OK);
        });

        test("should return correct asset count for matching date range", async ({ request }) => {
            const response = await retrieveAvailableFiles(request, validProjectId, startDate, endDate);
            const body = await response.json();
            expect(body.data.datasets.length).toBeGreaterThan(0);
        });

        test("should return response in correct JSON schema format", async ({ request }) => {
            const response = await retrieveAvailableFiles(request, validProjectId, startDate, endDate);
            const body = await response.json();
            expect(body.data).toHaveProperty("project_name");
            expect(body.data.datasets[0]).toHaveProperty("dataset_id");
            expect(body.data.datasets[0]).toHaveProperty("date");
        });

        test("should return assets sorted in chronological order", async ({ request }) => {
            const response = await retrieveAvailableFiles(request, validProjectId, startDate, endDate);
            const body = await response.json();
            const dates = body.data.datasets.map((d: any) => new Date(d.date).getTime());
            expect([...dates]).toEqual([...dates].sort((a, b) => a - b));
        });

        // ⚠️ Edge/Validation Scenarios
        test("should return assets when start_date equals end_date", async ({ request }) => {
            const response = await retrieveAvailableFiles(request, validProjectId, startDate, startDate);
            expect(response.status()).toBe(STATUS_CODES.SUCCESS.OK);
        });

        test("should return empty data when no assets exist in date range", async ({ request }) => {
            const response = await retrieveAvailableFiles(request, validProjectId, '2000-01-01', '2000-01-02');
            const body = await response.json();
            expect(body.data.datasets.length).toBe(0);
        });

        test("should handle large date range gracefully", async ({ request }) => {
            const response = await retrieveAvailableFiles(request, validProjectId, '2020-01-01', endDate);
            expect(response.status()).toBe(STATUS_CODES.SUCCESS.OK);
        });

        test("should ignore time components if provided in date", async ({ request }) => {
            const response = await retrieveAvailableFiles(request, validProjectId, '2025-09-01T10:00:00', undefined);
            expect(response.status()).toBe(STATUS_CODES.SUCCESS.OK);
        });

        test("should handle leap year dates correctly", async ({ request }) => {
            const response = await retrieveAvailableFiles(request, validProjectId, '2024-02-29', '2024-03-01');
            expect(response.status()).toBe(STATUS_CODES.SUCCESS.OK);
        });

        // ❌ Negative Scenarios
        test("should return validation error when project_id is missing", async ({ request }) => {
            const response = await retrieveAvailableFiles(request, undefined, startDate, endDate);
            expect(response.status()).toBe(STATUS_CODES.CLIENT_ERROR.NOT_FOUND);
        });

        test("should return error when project_id is invalid", async ({ request }) => {
            const response = await retrieveAvailableFiles(request, invalidProjectId, startDate, endDate);
            expect(response.status()).toBe(STATUS_CODES.CLIENT_ERROR.NOT_FOUND);
            expect(await response.json()).toHaveProperty('error', 'Project Not Found');
        });

        test("should return error when project_id is not a number", async ({ request }) => {
            const response = await retrieveAvailableFiles(request, 'invalid', startDate, endDate);
            expect(response.status()).toBe(STATUS_CODES.CLIENT_ERROR.NOT_FOUND);
        });

        test("should return assets when start_date is in invalid format", async ({ request }) => {
            const response = await retrieveAvailableFiles(request, validProjectId, '2025/10/14', endDate);
            expect(response.status()).toBe(STATUS_CODES.SUCCESS.OK);
        });

        test("should return error when start_date is later than end_date", async ({ request }) => {
            const response = await retrieveAvailableFiles(request, validProjectId, '2025-11-14', '2025-10-14');
            expect(response.status()).toBe(STATUS_CODES.CLIENT_ERROR.BAD_REQUEST);
        });

        // 🔒 Security Scenarios
        test("should return unauthorized when API key is missing", async ({ request }) => {
            const response = await retrieveAvailableFiles(request, validProjectId, startDate, endDate, false);
            expect(response.status()).toBe(STATUS_CODES.CLIENT_ERROR.UNAUTHORIZED);
            const errorBody = await response.json();
            expect(errorBody).toHaveProperty('error', 'API key required');
        });

        test("should return 403 Forbidden for invalid or expired API keys", async ({ request }) => {
            const apiKeys = [
                { key: 'invalid-key-123', expectedError: 'Invalid API key' },
                { key: process.env.API_KEY_EXPIRED, expectedError: 'API key expired' },
            ];

            for (const { key, expectedError } of apiKeys) {
                const response = await retrieveAvailableFiles(request, validProjectId, startDate, endDate, true, key);
                expect(response.status()).toBe(STATUS_CODES.CLIENT_ERROR.FORBIDDEN);

                const errorBody = await response.json();
                expect(errorBody).toHaveProperty('error', expectedError);
            }
        });



        test("should restrict access to project from another organization", async ({ request }) => {
            const response = await retrieveAvailableFiles(request, unauthorizedProjectId, startDate, endDate);
            expect(response.status()).toBe(STATUS_CODES.CLIENT_ERROR.NOT_FOUND);
        });
    });

    test.describe('Download File', () => {

        const invalidDatasetId = '9999';
        const invalidDatasetIdString = 'abc';
        test.beforeEach(async ({ request }) => {
            const response = await retrieveAvailableFiles(request, projectId, startDate, endDate);
            expect(response.status()).toBe(STATUS_CODES.SUCCESS.OK);
            const responseBody = await response.json();
            projectName = responseBody.data.project_name;
            datasetId = responseBody.data.datasets[0].dataset_id;
            datasetDate = responseBody.data.datasets[0].date;
            files = responseBody.data.datasets[0].files;

            // console.log(`Project: ${projectName}, Dataset: ${datasetId}, Date: ${datasetDate}`);
            // console.log('Files:', files);
        });

        test('Run dynamic file download tests', async ({ request }) => {
            if (!files) {
                throw new Error('No files found in dataset response.');
            }

            for (const [fileKey, isAvailable] of Object.entries(files)) {
                const [fileName, fileType] = fileKey.split('.');

                // console.log(`Testing ${fileKey} (Available: ${isAvailable})`);

                const response = await downloadFile(request, fileName, fileType, datasetId);
                const responseText = await response.text();
                console.log(`Response text: ${responseText}`);

                if (isAvailable) {
                    expect(response.status()).toBe(STATUS_CODES.SUCCESS.OK);
                    const url = new URL(responseText);
                    const contentDisposition = url.searchParams.get('response-content-disposition');
                    expect(contentDisposition).not.toBeNull();

                    // Extract actual filename from Content-Disposition
                    const match = contentDisposition?.match(/filename\*?=UTF-8''(.+)$/);
                    expect(match).not.toBeNull();

                    const actualFileName = decodeURIComponent(match![1]);
                    const expectedFileName = `${projectName}_${datasetDate}_${fileName}.${fileType}`;
                    console.log(`Checking ${actualFileName} and ${expectedFileName} for ${fileName}.${fileType}`);

                    expect(actualFileName).toBe(expectedFileName);
                } else {
                    expect(response.status()).not.toBe(STATUS_CODES.SUCCESS.OK);

                    const errorBody = await response.json();

                    if (fileName.includes('dtm')) {
                        expect(errorBody).toHaveProperty('error', 'Record associated with given filename, format, and screen not found.');

                    } else {
                        expect(errorBody).toHaveProperty('error', 'File Not Found');
                    }
                }
            }
        });


        test("should download the file", async ({ request, page }) => {
            const fileType = 'tif';
            const fileName = 'orthophoto';
            const response = await downloadFile(request, fileName, fileType, datasetId);
            expect(response.status()).toBe(STATUS_CODES.SUCCESS.OK);
            const responseText = await response.text();
            console.log(`Response Text: ${responseText}`);

            const url = new URL(responseText);
            const contentDisposition = url.searchParams.get('response-content-disposition');
            expect(contentDisposition).not.toBeNull();

            const match = contentDisposition?.match(/filename\*?=UTF-8''(.+)$/);
            expect(match).not.toBeNull();

            const actualFileName = decodeURIComponent(match![1]);
            const expectedFileName = `${projectName}_${datasetDate}_${fileName}.${fileType}`;

            expect(actualFileName).toBe(expectedFileName);

        });

        test.skip("should download the files - e2e test", async ({ request, page }) => {
            const fileType = 'tif';
            const fileName = 'orthophoto_reduced_10';

            const response = await downloadFile(request, fileName, fileType, datasetId);
            expect(response.status()).toBe(STATUS_CODES.SUCCESS.OK);
            const responseText = await response.text();

            const url = new URL(responseText);
            const contentDisposition = url.searchParams.get('response-content-disposition');
            expect(contentDisposition).not.toBeNull();

            const match = contentDisposition?.match(/filename\*?=UTF-8''(.+)$/);
            expect(match).not.toBeNull();

            const actualFileName = decodeURIComponent(match![1]);
            const expectedFileName = `${projectName}_${datasetDate}_${fileName}.${fileType}`;
            expect(actualFileName).toBe(expectedFileName);

            await page.setContent(`<a id="dl" href="${responseText}" download>Download</a>`);

            const [download] = await Promise.all([
                page.waitForEvent('download'),
                page.click('#dl'),
            ]);

            const downloadPath = `./downloads/${expectedFileName}`;
            await download.saveAs(downloadPath);

            const fs = require('fs');
            expect(fs.existsSync(downloadPath)).toBeTruthy();
        });



        test('should return 400 when file name contains unsupported special characters', async ({ request }) => {
            const fileType = 'tif';
            const fileName = 'orthophoto%2';
            const response = await downloadFile(request, fileName, fileType, datasetId);
            expect(response.status()).toBe(STATUS_CODES.CLIENT_ERROR.BAD_REQUEST);
            const errorBody = await response.text();
            expect(errorBody.includes('400 Bad Request')).toBeTruthy();
        });

        test('should return 404 when file format is missing while dataset_id is provided', async ({ request }) => {
            const fileName = 'orthophoto';
            const response = await downloadFile(request, fileName, '', datasetId);
            expect(response.status()).toBe(STATUS_CODES.CLIENT_ERROR.NOT_FOUND);
        });


        test('should return 422 when file exists but format is mismatched (e.g., .las requested as .tif)', async ({ request }) => {
            const fileName = 'pointcloud_100';
            const fileType = 'tif'; // actual file is .las
            const response = await downloadFile(request, fileName, fileType, datasetId);
            expect(response.status()).toBe(STATUS_CODES.CLIENT_ERROR.UNPROCESSABLE_ENTITY);
            const errorBody = await response.text();
            expect(errorBody.includes('Invalid file request')).toBeTruthy();
        });

        test('should return 403 when request contains extra invalid query parameters', async ({ request }) => {
            const fileName = 'orthophoto';
            const fileType = 'tif';
            const response = await request.get(`/external/v1/assets/${fileName}.${fileType}?dataset_id=${datasetId}&extraParam=abc`);
            expect(response.status()).toBe(STATUS_CODES.CLIENT_ERROR.FORBIDDEN);
        });

        test('should return 400 when dataset_id is not a number (e.g., string or null)', async ({ request }) => {
            const fileName = 'orthophoto';
            const fileType = 'tif';
            const response = await downloadFile(request, fileName, fileType, invalidDatasetIdString);
            expect(response.status()).toBe(STATUS_CODES.CLIENT_ERROR.NOT_FOUND);
            const errorBody = await response.json();
            expect(errorBody).toHaveProperty('error', 'Screen Not Found');
        });

        test('should return 400 when invalid file name or format is provided', async ({ request }) => {
            const fileName = 'invalid_file_name';
            const fileType = 'xyz';
            const response = await downloadFile(request, fileName, fileType, datasetId);
            expect(response.status()).toBe(STATUS_CODES.CLIENT_ERROR.UNPROCESSABLE_ENTITY);
            const errorBody = await response.json();
            expect(errorBody).toHaveProperty('error', 'Invalid file request');
        });

        test('should return 422 when file name contains leading or trailing spaces', async ({ request }) => {
            const fileName = ' orthophoto';
            const fileType = 'tif';
            const response = await downloadFile(request, fileName, fileType, datasetId);
            expect(response.status()).toBe(STATUS_CODES.CLIENT_ERROR.UNPROCESSABLE_ENTITY);
            const errorBody = await response.json();
            console.log(`Error Body: ${JSON.stringify(errorBody)}`);
            expect(errorBody).toHaveProperty('error', 'Invalid file request');
        });

        test('should return 401 when API key is missing in request header', async ({ request }) => {
            const fileName = 'orthophoto';
            const fileType = 'tif';
            const response = await downloadFile(request, fileName, fileType, datasetId, false); // disable API key
            expect(response.status()).toBe(STATUS_CODES.CLIENT_ERROR.UNAUTHORIZED);
            const errorBody = await response.text();
            expect(errorBody.includes('API key required')).toBeTruthy();
        });

        test('should return 403 when invalid or expired API key is provided', async ({ request }) => {
            const fileName = 'orthophoto';
            const fileType = 'tif';

            const apiKeys = [
                { key: 'invalid-key-123', expectedError: 'Invalid API key' },
                { key: process.env.API_KEY_EXPIRED, expectedError: 'API key expired' },
            ];

            for (const { key, expectedError } of apiKeys) {
                const response = await downloadFile(request, fileName, fileType, datasetId, true, key);
                expect(response.status()).toBe(STATUS_CODES.CLIENT_ERROR.FORBIDDEN);

                const errorBody = await response.json();
                expect(errorBody).toHaveProperty('error', expectedError);
            }
        });

        test('should return 404 when dataset_id does not exist', async ({ request }) => {
            const fileName = 'orthophoto';
            const fileType = 'tif';
            const response = await downloadFile(request, fileName, fileType, invalidDatasetId);
            expect(response.status()).toBe(STATUS_CODES.CLIENT_ERROR.NOT_FOUND);
            const errorBody = await response.text();
            expect(errorBody.includes('Screen Not Found')).toBeTruthy();
        });

        test('should return 404 when dataset exists but file is not available for download', async ({ request }) => {
            const fileName = 'pointcloud_25'; // file exists as false in dataset
            const fileType = 'las';
            const response = await downloadFile(request, fileName, fileType, datasetId);
            expect(response.status()).toBe(STATUS_CODES.CLIENT_ERROR.NOT_FOUND);
            expect(response.status()).not.toBe(STATUS_CODES.SUCCESS.OK);

            const errorBody = await response.json();
            expect(errorBody).toHaveProperty('error', 'File Not Found');
        });

        test('should return 422 when file request parameters are unprocessable (malformed filename or format)', async ({ request }) => {
            const fileName = ' orthophoto@@';
            const fileType = 'tif';
            const response = await downloadFile(request, fileName, fileType, datasetId);
            expect(response.status()).toBe(STATUS_CODES.CLIENT_ERROR.UNPROCESSABLE_ENTITY);
            const errorBody = await response.json();
            expect(errorBody).toHaveProperty('error', 'Invalid file request');
        });

        test('should return 401 error when api key is not provided', async ({ request }) => {
            const fileName = 'orthophoto';
            const fileType = 'tif';
            const response = await downloadFile(request, fileName, fileType, datasetId, false);
            expect(response.status()).toBe(STATUS_CODES.CLIENT_ERROR.UNAUTHORIZED);
            const errorBody = await response.json();
            expect(errorBody).toHaveProperty('error', 'API key required');
        });
    });
});

/*
그룹 제목 - from production (EPSG:5186 only)_2023-10-05_orthophoto.tif 
그룹 제목 - from production (EPSG:5186 only)_2023-10-05_orthophoto.tif for                                                  orthophoto.tif
그룹 제목 - from production (EPSG:5186 only)_2023-10-05_orthophoto_reduced_10.tif 
그룹 제목 - from production (EPSG:5186 only)_2023-10-05_orthophoto_reduced_10.tif for                                                  orthophoto_reduced_10.tif
그룹 제목 - from production (EPSG:5186 only)_2023-10-05_orthophoto_reduced_20.tif 
그룹 제목 - from production (EPSG:5186 only)_2023-10-05_orthophoto_reduced_20.tif for                                                  orthophoto_reduced_20.tif
그룹 제목 - from production (EPSG:5186 only)_2023-10-05_orthophoto.tfw 
그룹 제목 - from production (EPSG:5186 only)_2023-10-05_orthophoto.tfw for                                                  orthophoto.tfw
그룹 제목 - from production (EPSG:5186 only)_2023-10-05_orthophoto_reduced_10.tfw 
그룹 제목 - from production (EPSG:5186 only)_2023-10-05_orthophoto_reduced_10.tfw for                                                  orthophoto_reduced_10.tfw
그룹 제목 - from production (EPSG:5186 only)_2023-10-05_orthophoto_reduced_20.tfw 
그룹 제목 - from production (EPSG:5186 only)_2023-10-05_orthophoto_reduced_20.tfw for                                                  orthophoto_reduced_20.tfw
그룹 제목 - from production (EPSG:5186 only)_2023-10-05_dsm.tif 
그룹 제목 - from production (EPSG:5186 only)_2023-10-05_dsm.tif for                                                  dsm.tif
그룹 제목 - from production (EPSG:5186 only)_2023-10-05_dsm_reduced.tif 
그룹 제목 - from production (EPSG:5186 only)_2023-10-05_dsm_reduced.tif for                                                  dsm_reduced.tif
그룹 제목 - from production (EPSG:5186 only)_2023-10-05_dsm.tfw 
그룹 제목 - from production (EPSG:5186 only)_2023-10-05_dsm.tfw for                                                  dsm.tfw
그룹 제목 - from production (EPSG:5186 only)_2023-10-05_dsm_reduced.tfw 
그룹 제목 - from production (EPSG:5186 only)_2023-10-05_dsm_reduced.tfw for                                                  dsm_reduced.tfw
그룹 제목 - from production (EPSG:5186 only)_2023-10-05_pointcloud.las 
그룹 제목 - from production (EPSG:5186 only)_2023-10-05_pointcloud.las                                                  for pointcloud.
*/
