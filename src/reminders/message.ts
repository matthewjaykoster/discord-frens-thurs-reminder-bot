export function buildReminderMessage(ownerMention: string, planTitle: string, dueDate: Date): string {
    const dateLabel = dueDate.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        timeZone: 'America/New_York',
    });

    return `${ownerMention}, this is your reminder for your plan this week: ${planTitle}.\nDate: ${dateLabel}`;
}
