export function buildReminderMessage(ownerMention: string, planTitle: string, dueDate: Date, notes?: string): string {
    const dateLabel = dueDate.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        timeZone: 'America/New_York',
    });

    const message = `${ownerMention}, this is your reminder for your plan this week (${dateLabel}): ${planTitle}.`;
    if (!notes || notes.trim() === '') {
        return message;
    }

    return `${message}\nNotes: ${notes.trim()}`;
}
