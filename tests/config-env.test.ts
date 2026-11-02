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
        process.env.REMINDER_DAY_OF_WEEK = 'Thursday';
        process.env.REMINDER_RUN_HOUR = '9';
        process.env.REMINDER_RUN_MINUTE = '15';
        process.env.HOST_TO_DISCORD_ID = JSON.stringify({ alice: '123', bob: '456' });

        const config = loadConfig();

        expect(config.reminderHour).toBe(9);
        expect(config.reminderMinute).toBe(15);
        expect(config.hostToDiscordId.alice).toBe('123');
        expect(config.googlePrivateKey).toContain('abc');
    });

    it('throws when a required variable is missing', () => {
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
        process.env.REMINDER_DAY_OF_WEEK = 'Thursday';
        process.env.REMINDER_RUN_HOUR = '9';
        process.env.REMINDER_RUN_MINUTE = '15';
        process.env.HOST_TO_DISCORD_ID = '{not valid json';

        expect(() => loadConfig()).toThrow('HOST_TO_DISCORD_ID must be valid JSON');
    });

    it('throws for invalid reminder hour and minute ranges', () => {
        process.env.DISCORD_TOKEN = 'token';
        process.env.DISCORD_GUILD_ID = 'guild';
        process.env.DISCORD_REMINDER_CHANNEL_ID = 'reminder';
        process.env.DISCORD_LOG_CHANNEL_ID = 'log';
        process.env.GOOGLE_SHEET_ID = 'sheet';
        process.env.GOOGLE_SHEET_NAME = 'Sheet1';
        process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = 'service@example.com';
        process.env.GOOGLE_PRIVATE_KEY = 'key';
        process.env.REMINDER_DAY_OF_WEEK = 'Thursday';
        process.env.REMINDER_RUN_HOUR = '99';
        process.env.REMINDER_RUN_MINUTE = '15';
        process.env.HOST_TO_DISCORD_ID = '{}';

        expect(() => loadConfig()).toThrow('REMINDER_RUN_HOUR must be an integer between 0 and 23');

        process.env.REMINDER_RUN_HOUR = '10';
        process.env.REMINDER_RUN_MINUTE = '99';
        expect(() => loadConfig()).toThrow('REMINDER_RUN_MINUTE must be an integer between 0 and 59');
    });
});
