import { expect, APIRequestContext } from '@playwright/test';

const DEFAULT_RETRY = 5;

export async function createTokenAndGetUuid(request: APIRequestContext): Promise<string> {
    const response = await request.post(`${process.env.WEBHOOK_URL}/token`, {
        data: {
            default_status: 200,
            default_content: 'Hello Testing Suraj!',
            default_content_type: 'text/html',
            timeout: 0,
            cors: false,
            expiry: 604800,
            alias: `webhook-${Date.now()}`,
            actions: true,
        },
    });

    expect(response.status(), 'Failed to create webhook token').toBe(201);

    const { uuid } = await response.json();
    console.log('✅ Token created with UUID:', uuid);
    return uuid;
}

export async function waitForEmailAndExtractLinkLegacy(
    request: APIRequestContext,
    uuid: string,
    linkType: 'signup' | 'verify',
    timeoutMs: number = 15000
): Promise<string> {
    const maxRetries = DEFAULT_RETRY;
    const interval = timeoutMs / maxRetries;
    const regexMap = {
        signup: /https:\/\/(?:[a-z]+\.)?angelswing\.io\/signup\?email=[^\s)]+/i,
        verify: /\(https:\/\/(?:[a-z0-9.-]+)?angelswing\.io\/v2\/confirm-email\/[a-zA-Z0-9_-]+\?email=[^()\s]+/i,
    };
    const regex = regexMap[linkType];

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        console.log(`🔄 [${linkType.toUpperCase()}] Checking inbox (Attempt ${attempt + 1}/${maxRetries})...`);
        const response = await request.get(`${process.env.WEBHOOK_URL}/token/${uuid}/requests`);
        expect(response.status(), 'Failed to fetch webhook requests').toBe(200);
        const emails = (await response.json())?.data ?? [];
        console.log(emails.length);

        if (emails.length > 0) {
            const emailText = emails[0]?.content?.text || emails[0]?.text_content;
            const match = emailText?.match(regex);
            if (match) {
                const link = match[0].replace(/^\(/, '').replace(/\)$/, '');
                console.log(`✅ ${linkType === 'signup' ? 'Signup' : 'Verify'} link found:`, link);
                return link;
            } else {
                console.log(`❌ No ${linkType} link matched in email.`);
            }
        } else {
            console.log('❌ No email received yet.');
        }
        await new Promise((res) => setTimeout(res, interval));
    }
    throw new Error(`❌ ${linkType === 'signup' ? 'Signup' : 'Verify'} link not found in any email requests.`);
}

export async function waitForEmailAndExtractLink(
    request: APIRequestContext,
    uuid: string,
    linkType: 'signup' | 'verify' | 'reset',
    timeoutMs: number = 10000
): Promise<string> {
    const maxRetries = DEFAULT_RETRY;
    const interval = timeoutMs / maxRetries;
    const regexMap = {
        signup: /https:\/\/[a-z0-9.-]+\/signup\?email=[^()\s]+/i,
        verify: /(\()?https:\/\/[a-z0-9.-]+\/v2\/confirm-email\/(?:[A-Za-z0-9_-]+\/?)?\?email=[^()\s]+/i,
        reset: /https:\/\/[a-z0-9.-]+\/reset_password\/[A-Za-z0-9_-]+/i,
    };
    const regex = regexMap[linkType];
    if (!regex) throw new Error(`Unsupported linkType: ${linkType}`);

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        console.log(`🔄 [${linkType.toUpperCase()}] Checking inbox (Attempt ${attempt + 1}/${maxRetries})...`);
        const response = await request.get(`${process.env.WEBHOOK_URL}/token/${uuid}/requests?sorting=newest`);
        expect(response.status(), 'Failed to fetch webhook requests').toBe(200);

        const emails = (await response.json())?.data ?? [];
        console.log(`Fetched ${emails.length} emails`);

        for (let i = 0; i < emails.length; i++) {
            const emailText = emails[i]?.text_content;
            if (!emailText) continue;
            // console.log(`emailText:${i}\n${emailText}`);

            const match = emailText.match(regex);
            // console.log(`match:${match}`);
            if (match) {
                const link = match[0].replace(/^\(/, '').replace(/\)$/, '');
                console.log(`✅ ${linkType.charAt(0).toUpperCase() + linkType.slice(1)} link found in email #${i + 1}:`, link);

                return link;
            }
        }
        console.log(`❌ No ${linkType} link found in any email. Retrying...`);
        await new Promise((res) => setTimeout(res, interval));
    }
    throw new Error(`❌ ${linkType.charAt(0).toUpperCase() + linkType.slice(1)} link not found in any email requests after ${maxRetries} attempts.`);
};

export async function deleteToken(request: APIRequestContext, uuid: string): Promise<void> {
    const response = await request.delete(`${process.env.WEBHOOK_URL}/token/${uuid}`);
    expect(response.status(), 'Failed to delete webhook token').toBe(204);
    console.log(`🗑️  Token ${uuid} deleted successfully`);
}

export async function deleteRequest(request: APIRequestContext, uuid: string): Promise<void> {
    const response = await request.delete(`${process.env.WEBHOOK_URL}/token/${uuid}/request`);
    expect(response.status(), 'Failed to delete request token').toBe(200);
    console.log(`🗑️  All Requests for Token ${uuid} deleted successfully`);
}
