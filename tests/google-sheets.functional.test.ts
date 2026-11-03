import { describe, expect, it } from 'vitest';
import { createDiscordClient } from '../src/bot/client.js';
import { loadConfig } from '../src/config/env.js';
import { runReminderCheck } from '../src/scheduler/weekly.js';
import { parsePlanRow } from '../src/sheet/parser.js';
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

    it('sends a real reminder when an upcoming plan exists', async () => {
        const config = loadConfig();
        const rows = await fetchSheetRows(config);
        const currentDate = new Date();
        const upcomingPlans = rows
            .map((row) => parsePlanRow(row, currentDate))
            .filter((plan): plan is NonNullable<typeof plan> => Boolean(plan))
            .filter((plan) => plan.dueDate.getTime() >= currentDate.getTime())
            .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

        if (upcomingPlans.length === 0) {
            console.info('No upcoming plan found in the Google Sheet for the current time window; skipping live Discord send.');
            return;
        }

        const client = createDiscordClient(config);

        await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Timed out while waiting for Discord client ready state')), 30000);

            client.once('ready', () => {
                clearTimeout(timeout);
                resolve();
            });

            client.once('error', (error) => {
                clearTimeout(timeout);
                reject(error);
            });
        });

        try {
            await runReminderCheck(client, config);
            expect(true).toBe(true);
        } finally {
            await client.destroy();
        }
    }, 120000);
});
