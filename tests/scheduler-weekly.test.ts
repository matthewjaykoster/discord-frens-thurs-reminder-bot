import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { runReminderCheck } from '../src/scheduler/weekly.js';
import { fetchSheetRows } from '../src/sheet/googleSheets.js';
import { sendLogMessage, sendReminderMessage } from '../src/bot/client.js';
import type { Config } from '../src/config/env.js';

vi.mock('../src/sheet/googleSheets.js', () => ({
    fetchSheetRows: vi.fn(),
}));

vi.mock('../src/bot/client.js', () => ({
    sendReminderMessage: vi.fn(),
    sendLogMessage: vi.fn(),
}));

describe('runReminderCheck', () => {
    const config: Config = {
        discordToken: 'token',
        guildId: 'guild',
        reminderChannelId: 'reminder',
        logChannelId: 'log',
        googleSheetId: 'sheet',
        googleSheetName: 'Sheet1',
        googleServiceAccountEmail: 'service@example.com',
        googlePrivateKey: 'key',
        hostToDiscordId: { alice: '123', jen: '456', hannah: '789' },
    };

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-11-05T12:00:00Z'));
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('sends a reminder when a matching plan exists', async () => {
        vi.mocked(fetchSheetRows).mockResolvedValue([
            { date: '11-12', host: 'Alice', activity: 'Movie night', notes: 'Bring snacks' },
        ]);

        const client = {} as any;
        await runReminderCheck(client, config);

        expect(sendReminderMessage).toHaveBeenCalledTimes(1);
        expect(sendReminderMessage).toHaveBeenCalledWith(client, config, expect.stringContaining('<@123>'));
        expect(sendLogMessage).not.toHaveBeenCalled();
    });

    it('mentions multiple people when the host list contains several names', async () => {
        vi.mocked(fetchSheetRows).mockResolvedValue([
            { date: '11-12', host: 'Jen AND Hannah', activity: 'Game night', notes: 'Bring snacks' },
        ]);

        const client = {} as any;
        await runReminderCheck(client, config);

        expect(sendReminderMessage).toHaveBeenCalledWith(client, config, expect.stringContaining('<@456> <@789>'));
    });

    it('mentions everyone for the All host value', async () => {
        vi.mocked(fetchSheetRows).mockResolvedValue([
            { date: '11-12', host: 'All', activity: 'Community hangout', notes: 'Open to everyone' },
        ]);

        const client = {} as any;
        await runReminderCheck(client, config);

        expect(sendReminderMessage).toHaveBeenCalledWith(client, config, expect.stringContaining('@everyone'));
    });

    it('logs a warning when host resolution fails', async () => {
        vi.mocked(fetchSheetRows).mockResolvedValue([
            { date: '11-12', host: 'Unknown', activity: 'Movie night', notes: 'Bring snacks' },
        ]);

        const client = {} as any;
        await runReminderCheck(client, config);

        expect(sendLogMessage).toHaveBeenCalledWith(client, config, expect.stringContaining('Could not resolve host'));
    });

    it('does not send a message when no plans match', async () => {
        vi.mocked(fetchSheetRows).mockResolvedValue([
            { date: '11-01', host: 'Alice', activity: 'Old plan', notes: 'Done' },
        ]);

        const client = {} as any;
        await runReminderCheck(client, config);

        expect(sendReminderMessage).not.toHaveBeenCalled();
    });

    it('logs an exception from a failing fetch', async () => {
        vi.mocked(fetchSheetRows).mockRejectedValue(new Error('Sheet failed'));

        const client = {} as any;
        await runReminderCheck(client, config);

        expect(sendLogMessage).toHaveBeenCalledWith(client, config, expect.stringContaining('Reminder check failed'));
    });
});
