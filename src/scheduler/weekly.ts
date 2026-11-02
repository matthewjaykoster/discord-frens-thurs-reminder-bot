import type { Client } from 'discord.js';
import type { Config } from '../config/env.js';
import { getNormalizedHostKey, parsePlanRow } from '../sheet/parser.js';
import { fetchSheetRows } from '../sheet/googleSheets.js';
import { sendLogMessage, sendReminderMessage } from '../bot/client.js';
import { buildReminderMessage } from '../reminders/message.js';

function resolveOwnerMention(plan: { ownerName: string; ownerNames: string[]; mentionTarget: 'all' | 'single' | 'multiple'; }, config: Config): string {
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

    const normalizedHost = getNormalizedHostKey(plan.ownerName);
    const resolvedId = config.hostToDiscordId[normalizedHost] ?? config.hostToDiscordId[plan.ownerName];
    if (!resolvedId) {
        throw new Error(`Could not resolve host for reminder: ${plan.ownerName}`);
    }

    return `<@${resolvedId}>`;
}

export async function runReminderCheck(client: Client, config: Config): Promise<void> {
    try {
        const rows = await fetchSheetRows(config);
        const currentDate = new Date();
        const plans = rows
            .map((row) => parsePlanRow(row, currentDate))
            .filter((plan): plan is NonNullable<typeof plan> => Boolean(plan));

        if (plans.length === 0) {
            return;
        }

        const matchingPlan = plans.find((plan) => {
            const normalizedPlanDay = plan.dueDate.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'America/New_York' });
            return normalizedPlanDay === config.reminderDayOfWeek && plan.dueDate.getTime() >= currentDate.getTime();
        }) ?? plans.find((plan) => plan.dueDate.getTime() >= currentDate.getTime());

        if (!matchingPlan) {
            return;
        }

        const ownerMention = resolveOwnerMention(matchingPlan, config);
        const message = buildReminderMessage(ownerMention, matchingPlan.planTitle, matchingPlan.dueDate);
        await sendReminderMessage(client, config, message);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        await sendLogMessage(client, config, `Reminder check failed: ${message}`);
    }
}
