import process from 'node:process';
import * as dotenv from 'dotenv';

dotenv.config();

export type Config = {
    discordToken: string;
    guildId: string;
    reminderChannelId: string;
    logChannelId: string;
    googleSheetId: string;
    googleSheetName: string;
    googleServiceAccountEmail: string;
    googlePrivateKey: string;
    reminderDayOfWeek: string;
    reminderHour: number;
    reminderMinute: number;
    hostToDiscordId: Record<string, string>;
};

function getRequiredEnv(name: string): string {
    const value = process.env[name];

    if (!value || value.trim() === '') {
        throw new Error(`Missing required environment variable: ${name}`);
    }

    return value;
}

export function loadConfig(): Config {
    const hostToDiscordIdRaw = getRequiredEnv('HOST_TO_DISCORD_ID');

    let hostToDiscordId: Record<string, string>;
    try {
        const parsed = JSON.parse(hostToDiscordIdRaw) as Record<string, string>;
        hostToDiscordId = Object.fromEntries(
            Object.entries(parsed).map(([name, value]) => [name.trim().toLowerCase(), String(value).trim()]),
        );
    } catch {
        throw new Error('HOST_TO_DISCORD_ID must be valid JSON object mapping names to Discord user IDs');
    }

    const reminderDayOfWeek = getRequiredEnv('REMINDER_DAY_OF_WEEK');
    const reminderHour = Number.parseInt(getRequiredEnv('REMINDER_RUN_HOUR'), 10);
    const reminderMinute = Number.parseInt(getRequiredEnv('REMINDER_RUN_MINUTE'), 10);

    if (Number.isNaN(reminderHour) || reminderHour < 0 || reminderHour > 23) {
        throw new Error('REMINDER_RUN_HOUR must be an integer between 0 and 23');
    }

    if (Number.isNaN(reminderMinute) || reminderMinute < 0 || reminderMinute > 59) {
        throw new Error('REMINDER_RUN_MINUTE must be an integer between 0 and 59');
    }

    return {
        discordToken: getRequiredEnv('DISCORD_TOKEN'),
        guildId: getRequiredEnv('DISCORD_GUILD_ID'),
        reminderChannelId: getRequiredEnv('DISCORD_REMINDER_CHANNEL_ID'),
        logChannelId: getRequiredEnv('DISCORD_LOG_CHANNEL_ID'),
        googleSheetId: getRequiredEnv('GOOGLE_SHEET_ID'),
        googleSheetName: getRequiredEnv('GOOGLE_SHEET_NAME'),
        googleServiceAccountEmail: getRequiredEnv('GOOGLE_SERVICE_ACCOUNT_EMAIL'),
        googlePrivateKey: getRequiredEnv('GOOGLE_PRIVATE_KEY').replace(/\\n/g, '\n'),
        reminderDayOfWeek,
        reminderHour,
        reminderMinute,
        hostToDiscordId,
    };
}
