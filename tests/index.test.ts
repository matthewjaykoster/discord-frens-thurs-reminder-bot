import { describe, expect, it, vi } from 'vitest';

vi.mock('../src/bot/client.js', () => ({
    createDiscordClient: vi.fn(() => ({ on: vi.fn() })),
}));

vi.mock('../src/config/env.js', () => ({
    loadConfig: vi.fn(() => ({
        discordToken: 'token',
        guildId: 'guild',
        reminderChannelId: 'reminder',
        logChannelId: 'log',
        googleSheetId: 'sheet',
        googleSheetName: 'Sheet1',
        googleServiceAccountEmail: 'service@example.com',
        googlePrivateKey: 'key',
        hostToDiscordId: {},
    })),
}));

vi.mock('../src/scheduler/weekly.js', () => ({
    runReminderCheck: vi.fn(),
}));

describe('index bootstrap', () => {
    it('loads config and starts the scheduler when the client is ready', async () => {
        const { loadConfig } = await import('../src/config/env.js');
        const { createDiscordClient } = await import('../src/bot/client.js');
        const { runReminderCheck } = await import('../src/scheduler/weekly.js');

        const readyHandler = vi.fn();
        vi.mocked(createDiscordClient).mockReturnValue({
            on: vi.fn((event, handler) => {
                if (event === 'ready') {
                    readyHandler.mockImplementation(handler);
                }
            }),
        } as any);

        await import('../src/index.js');

        expect(loadConfig).toHaveBeenCalled();
        expect(createDiscordClient).toHaveBeenCalled();

        await readyHandler();
        expect(runReminderCheck).toHaveBeenCalled();
    });
});
