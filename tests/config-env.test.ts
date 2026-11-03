import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadConfig } from '../src/config/env.js';

describe('loadConfig', () => {
    const originalEnv = { ...process.env };

    afterEach(() => {
        process.env = { ...originalEnv };
    });

    it('loads valid config values', () => {
        process.env.DISCORD_TOKEN = 'token';
        process.env.DISCORD_GUILD_ID = 'guild';
        process.env.DISCORD_REMINDER_CHANNEL_ID = 'reminder';
        process.env.DISCORD_LOG_CHANNEL_ID = 'log';
        process.env.GOOGLE_SHEET_ID = 'sheet';
        process.env.GOOGLE_SHEET_NAME = 'Sheet1';
        process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = 'service@example.com';
        process.env.GOOGLE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\\nabc\\n-----END PRIVATE KEY-----\\n';
        process.env.HOST_TO_DISCORD_ID = JSON.stringify({ alice: '123', bob: '456' });

        const config = loadConfig();

        expect(config.hostToDiscordId.alice).toBe('123');
        expect(config.googlePrivateKey).toContain('abc');
    });

    it('throws when a required variable is missing', () => {
        delete process.env.DISCORD_TOKEN;
        delete process.env.DISCORD_GUILD_ID;
        delete process.env.DISCORD_REMINDER_CHANNEL_ID;
        delete process.env.DISCORD_LOG_CHANNEL_ID;
        delete process.env.GOOGLE_SHEET_ID;
        delete process.env.GOOGLE_SHEET_NAME;
        delete process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
        delete process.env.GOOGLE_PRIVATE_KEY;
        delete process.env.HOST_TO_DISCORD_ID;

        expect(() => loadConfig()).toThrow('Missing required environment variable');
    });

    it('throws when HOST_TO_DISCORD_ID is invalid JSON', () => {
        process.env.DISCORD_TOKEN = 'token';
        process.env.DISCORD_GUILD_ID = 'guild';
        process.env.DISCORD_REMINDER_CHANNEL_ID = 'reminder';
        process.env.DISCORD_LOG_CHANNEL_ID = 'log';
        process.env.GOOGLE_SHEET_ID = 'sheet';
        process.env.GOOGLE_SHEET_NAME = 'Sheet1';
        process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = 'service@example.com';
        process.env.GOOGLE_PRIVATE_KEY = 'key';
        process.env.HOST_TO_DISCORD_ID = '{not valid json';

        expect(() => loadConfig()).toThrow('HOST_TO_DISCORD_ID must be valid JSON');
    });
});
