import { describe, expect, it, vi } from 'vitest';
import { createDiscordClient, sendLogMessage, sendReminderMessage } from '../src/bot/client.js';
import type { Config } from '../src/config/env.js';

const config: Config = {
    discordToken: 'token',
    guildId: 'guild',
    reminderChannelId: 'reminder',
    logChannelId: 'log',
    googleSheetId: 'sheet',
    googleSheetName: 'Sheet1',
    googleServiceAccountEmail: 'service@example.com',
    googlePrivateKey: 'key',
    hostToDiscordId: {},
};

describe('Discord client helpers', () => {
    it('creates a client without crashing', () => {
        const client = createDiscordClient(config);
        expect(client).toBeTruthy();
    });

    it('sends a reminder message to an available channel', async () => {
        const send = vi.fn().mockResolvedValue(undefined);
        const client = {
            channels: {
                fetch: vi.fn().mockResolvedValue({ send }),
            },
        } as any;

        await sendReminderMessage(client, config, 'hello');
        expect(send).toHaveBeenCalledWith('hello');
    });

    it('handles missing reminder channel gracefully', async () => {
        const client = {
            channels: {
                fetch: vi.fn().mockResolvedValue(null),
            },
        } as any;

        await expect(sendReminderMessage(client, config, 'hello')).rejects.toThrow('Discord reminder channel not found or not sendable');
    });

    it('sends a log message successfully', async () => {
        const send = vi.fn().mockResolvedValue(undefined);
        const client = {
            channels: {
                fetch: vi.fn().mockResolvedValue({ send }),
            },
        } as any;

        await sendLogMessage(client, config, 'hello');
        expect(send).toHaveBeenCalledWith('hello');
    });

    it('handles missing log channel gracefully', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        const client = {
            channels: {
                fetch: vi.fn().mockResolvedValue(null),
            },
        } as any;

        await sendLogMessage(client, config, 'hello');
        expect(consoleSpy).toHaveBeenCalledWith('Failed to send log message: log channel missing or not sendable');
    });
});
