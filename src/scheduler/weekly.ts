import type { Client } from 'discord.js';
import type { Config } from '../config/env.js';
import { getNormalizedHostKey, parsePlanRow } from '../sheet/parser.js';
import { fetchSheetRows } from '../sheet/googleSheets.js';
import { sendLogMessage, sendReminderMessage } from '../bot/client.js';
import { buildReminderMessage } from '../reminders/message.js';

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

export async function runReminderCheck(client: Client, config: Config): Promise<void> {
    try {
        const rows = await fetchSheetRows(config);
        const currentDate = new Date();
        const plans = rows
            .map((row) => parsePlanRow(row, currentDate))
            .filter((plan): plan is NonNullable<typeof plan> => Boolean(plan))
            .filter((plan) => plan.dueDate.getTime() >= currentDate.getTime());

        if (plans.length === 0) {
            await sendLogMessage(client, config, 'No upcoming plans found in the Google Sheet for the current time window. Skipping reminder send.');
            return;
        }

        const matchingPlan = plans.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())[0];
        const ownerMention = resolveOwnerMention(matchingPlan, config);
        const message = buildReminderMessage(ownerMention, matchingPlan.planTitle, matchingPlan.dueDate);
        await sendReminderMessage(client, config, message);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        await sendLogMessage(client, config, `Reminder check failed: ${message}`);
    }
}
