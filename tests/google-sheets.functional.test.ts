import { describe, expect, it } from 'vitest';
import { loadConfig } from '../src/config/env.js';
import { fetchSheetRows } from '../src/sheet/googleSheets.js';

// Functional test: this should only be used with a real service-account setup.
describe.skipIf(!process.env.GOOGLE_SHEET_ID || !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !process.env.HOST_TO_DISCORD_ID)('Google Sheets functional read', () => {
    it('reads rows from the configured spreadsheet', async () => {
        const config = loadConfig();

        const rows = await fetchSheetRows(config);

        expect(Array.isArray(rows)).toBe(true);
        expect(rows.length).toBeGreaterThanOrEqual(1);
        expect(rows[0]).toMatchObject({
            date: expect.any(String),
            host: expect.any(String),
            activity: expect.any(String),
        });
    }, 120000);
});
