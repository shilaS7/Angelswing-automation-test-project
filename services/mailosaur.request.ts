import MailosaurClient from 'mailosaur';
import { expect } from '@playwright/test';
import { Message } from 'mailosaur/lib/models';

class MailosaurService {
    private mailosaurClient: MailosaurClient;
    private serverId: string;

    constructor(apiKey: string, serverId: string) {
        this.mailosaurClient = new MailosaurClient(apiKey);
        this.serverId = serverId;
    }

    async getEmail(testEmail: string, receivedAfter?: Date) {
        try {
            const message = await this.mailosaurClient.messages.get(this.serverId, {
                sentTo: testEmail,
            }, {
                receivedAfter,
            });
            return message;
        } catch (error) {
            console.error('Error fetching email:', error);
            throw new Error('Unable to fetch email from Mailosaur');
        }
    }

    async validateSenderNameAndEmail(message: Message, expectedName: string, expectedEmail: string) {
        if (!message.from || message.from.length === 0) {
            throw new Error('No sender information found in the email');
        }
        expect(message.from[0].name).toEqual(expectedName);
        expect(message.from[0].email).toEqual(expectedEmail);
    }

    async verifyEmailSubject(message: any, expectedSubject: string) {
        expect(message.subject).toContain(expectedSubject);
    }

    async verifyEmailButtonLink(message: Message, expectedText: string) {
        const verificationLink = message.text?.links?.[0]?.href;
        expect(verificationLink).toContain(expectedText);
    }

    async verifyEmailBody(message: any, expectedText: string) {
        expect(message.text.body).toContain(expectedText);
    }

    async validateGreeting(message: Message, expectedGreeting: string) {
        expect(message.text?.body).toContain(expectedGreeting);
    }

    async validateEmailId(message: Message, expectedEmail: string) {
        expect(message.text?.body).toContain(expectedEmail);
    }

    async validateEmailFooter(message: Message, expectedFooter: string) {
        expect(message.text?.body).toContain(expectedFooter);
    }

    async validateEmailSupportContact(message: Message, expectedSupportContact: string) {
        expect(message.text?.body).toContain(expectedSupportContact);
    }

    async extractVerificationLink(message: any): Promise<string> {
        const verificationLink = message.text.links[0]?.href || message.html.links[0]?.href;
        if (!verificationLink) {
            throw new Error('No verification link found in the email');
        }
        return verificationLink;
    }

    async extractResetPasswordLink(message: any): Promise<string> {
        const verificationLink = message.text.links[1]?.href || message.html.links[1]?.href;
        if (!verificationLink) {
            throw new Error('No Reset Password link found in the email');
        }
        return verificationLink;
    }
}

export default MailosaurService;
