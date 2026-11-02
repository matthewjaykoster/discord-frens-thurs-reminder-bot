import { describe, expect, it } from 'vitest';
import { buildReminderMessage } from '../src/reminders/message.js';

describe('buildReminderMessage', () => {
    it('builds a readable reminder string', () => {
        const dueDate = new Date('2026-11-09T12:00:00Z');
        const message = buildReminderMessage('<@123>', 'Movie night', dueDate);

        expect(message).toContain('<@123>');
        expect(message).toContain('Movie night');
        expect(message).toContain('Date:');
    });
});
