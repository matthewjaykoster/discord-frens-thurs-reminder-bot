import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockGet } = vi.hoisted(() => ({
    mockGet: vi.fn(),
}));

vi.mock('googleapis', () => ({
    google: {
        auth: {
            JWT: vi.fn().mockImplementation(() => ({ type: 'jwt' })),
        },
        sheets: vi.fn().mockReturnValue({
            spreadsheets: {
                values: {
                    get: mockGet,
                },
            },
        }),
    },
}));

import { fetchSheetRows } from '../src/sheet/googleSheets.js';
import type { Config } from '../src/config/env.js';

const config: Config = {
    discordToken: 'token',
    guildId: 'guild',
    reminderChannelId: 'reminder',
    logChannelId: 'log',
    googleSheetId: 'sheet-id',
    googleSheetName: 'Sheet1',
    googleServiceAccountEmail: 'service@example.com',
    googlePrivateKey: 'private-key',
    reminderDayOfWeek: 'Thursday',
    reminderHour: 9,
    reminderMinute: 0,
    hostToDiscordId: { alice: '123' },
};

describe('fetchSheetRows', () => {
    beforeEach(() => {
        mockGet.mockReset();
    });

    it('returns parsed rows from the sheet', async () => {
        mockGet.mockResolvedValue({
            data: {
                values: [
                    ['Date', 'Host', 'Activity', 'Notes'],
                    ['11-12', 'Alice', 'Movie night', 'Bring snacks'],
                    ['11-19', 'Bob', 'Board games', ''],
                ],
            },
        });

        const rows = await fetchSheetRows(config);

        expect(rows).toHaveLength(2);
        expect(rows[0]).toMatchObject({
            date: '11-12',
            host: 'Alice',
            activity: 'Movie night',
            notes: 'Bring snacks',
        });
    });

    it('returns an empty array when the sheet has no values', async () => {
        mockGet.mockResolvedValue({ data: { values: [] } });

        const rows = await fetchSheetRows(config);
        expect(rows).toEqual([]);
    });

    it('normalizes non-string cells to empty strings', async () => {
        mockGet.mockResolvedValue({
            data: {
                values: [
                    ['Date', 'Host', 'Activity', 'Notes'],
                    [null, 42, { bad: true }, ['not', 'a', 'string']],
                ],
            },
        });

        const rows = await fetchSheetRows(config);
        expect(rows).toEqual([{ date: '', host: '', activity: '', notes: '' }]);
    });
});
