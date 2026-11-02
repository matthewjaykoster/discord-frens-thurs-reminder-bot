import { google } from 'googleapis';
import type { Config } from '../config/env.js';
import type { RawPlanRow } from './types.js';

export async function fetchSheetRows(config: Config): Promise<RawPlanRow[]> {
    const auth = new google.auth.JWT({
        email: config.googleServiceAccountEmail,
        key: config.googlePrivateKey,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: config.googleSheetId,
        range: config.googleSheetName,
    });

    const rows = response.data.values ?? [];

    if (rows.length < 2) {
        return [];
    }

    const [, ...dataRows] = rows;
    const normalizedRows: RawPlanRow[] = dataRows.map((row) => {
        const [date, host, activity, notes] = row;

        return {
            date: typeof date === 'string' ? date : '',
            host: typeof host === 'string' ? host : '',
            activity: typeof activity === 'string' ? activity : '',
            notes: typeof notes === 'string' ? notes : '',
        };
    });

    return normalizedRows;
}
