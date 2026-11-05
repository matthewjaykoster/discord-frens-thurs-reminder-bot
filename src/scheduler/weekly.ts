import type { Client } from 'discord.js';
import type { Config } from '../config/env.js';
import { getNormalizedHostKey, parsePlanRow } from '../sheet/parser.js';
import { fetchSheetRows } from '../sheet/googleSheets.js';
import { sendLogMessage, sendReminderMessage } from '../bot/client.js';
import { buildReminderMessage } from '../reminders/message.js';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

function resolveOwnerMention(plan: { ownerNames: string[]; mentionTarget: 'all' | 'single' | 'multiple'; }, config: Config): string {
    if (plan.ownerNames.length === 0) {
        return 'Everyone (No host assigned)';
    }

    if (plan.mentionTarget === 'all') {
        return '@everyone';
    }

    if (plan.mentionTarget === 'multiple') {
        return plan.ownerNames
            .map((ownerName) => {
                const normalizedKey = getNormalizedHostKey(ownerName);
                const resolvedId = config.hostToDiscordId[normalizedKey] ?? config.hostToDiscordId[ownerName];
                return resolvedId ? `<@${resolvedId}>` : ownerName;
            })
            .join(' ');
    }

    const singleOwnerName = plan.ownerNames[0];
    if (!singleOwnerName) {
        throw new Error('Could not resolve host discord ID for reminder: missing owner name');
    }

    const normalizedHost = getNormalizedHostKey(singleOwnerName);
    const resolvedId = config.hostToDiscordId[normalizedHost] ?? config.hostToDiscordId[singleOwnerName];
    if (!resolvedId) {
        throw new Error(`Could not resolve host discord ID for reminder: ${singleOwnerName}`);
    }

    return `<@${resolvedId}>`;
}

function buildReminderStateKey(plan: { dueDate: Date; planTitle: string; ownerNames: string[] }): string {
    return `${plan.dueDate.toISOString().slice(0, 10)}:${plan.planTitle.trim()}:${plan.ownerNames.join('|')}`;
}

function loadReminderState(filePath: string | undefined): string | null {
    if (!filePath) {
        return null;
    }

    try {
        if (!existsSync(filePath)) {
            return null;
        }

        const contents = readFileSync(filePath, 'utf-8').trim();
        return contents || null;
    } catch {
        return null;
    }
}

function saveReminderState(filePath: string | undefined, value: string): void {
    if (!filePath) {
        return;
    }

    try {
        const directory = path.dirname(filePath);
        if (!existsSync(directory)) {
            mkdirSync(directory, { recursive: true });
        }

        writeFileSync(filePath, value, 'utf-8');
    } catch {
        // Ignore state persistence failures so reminder sending remains resilient.
    }
}

export async function runReminderCheck(client: Client, config: Config): Promise<void> {
    try {
        const rows = await fetchSheetRows(config);
        const currentDate = new Date();
        const today = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
        const plans = rows
            .map((row) => parsePlanRow(row, currentDate))
            .filter((plan): plan is NonNullable<typeof plan> => Boolean(plan))
            .filter((plan) => {
                const planDay = new Date(plan.dueDate.getFullYear(), plan.dueDate.getMonth(), plan.dueDate.getDate());
                return planDay.getTime() >= today.getTime();
            });

        if (plans.length === 0) {
            await sendLogMessage(client, config, 'No upcoming plans found in the Google Sheet for the current time window. Skipping reminder send.');
            return;
        }

        const matchingPlan = plans.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())[0];
        const reminderStateKey = buildReminderStateKey(matchingPlan);
        const previousState = loadReminderState(config.reminderStatePath);

        if (previousState === reminderStateKey) {
            await sendLogMessage(client, config, `Skipping duplicate reminder for ${matchingPlan.planTitle} (\`${matchingPlan.dueDate.toDateString()}\`).`);
            return;
        }

        const ownerMention = resolveOwnerMention(matchingPlan, config);
        const message = buildReminderMessage(ownerMention, matchingPlan.planTitle, matchingPlan.dueDate);
        await sendReminderMessage(client, config, message);
        saveReminderState(config.reminderStatePath, reminderStateKey);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        await sendLogMessage(client, config, `Reminder check failed: ${message}`);
    }
}
