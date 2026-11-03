import { describe, expect, it } from 'vitest';
import { parsePlanRow, getNormalizedHostKey } from '../src/sheet/parser.js';

describe('parsePlanRow', () => {
    it('parses a valid row into a normalized plan record', () => {
        const row = {
            date: '11-02',
            host: ' Alice ',
            activity: 'Movie night',
            notes: 'Bring snacks',
        };

        const currentDate = new Date('2026-11-01T12:00:00Z');
        const result = parsePlanRow(row, currentDate);

        expect(result).not.toBeNull();
        expect(result?.ownerNames).toEqual(['Alice']);
        expect(result?.mentionTarget).toBe('single');
        expect(result?.planTitle).toBe('Movie night');
        expect(result?.notes).toBe('Bring snacks');
        expect(result?.dueDate.getFullYear()).toBe(2026);
    });

    it('uses the nearest valid year within the rolling window when the date is late in the year', () => {
        const row = { date: '12-31', host: 'Alice', activity: 'Year end planning' };
        const currentDate = new Date('2026-01-10T12:00:00Z');
        const result = parsePlanRow(row, currentDate);

        expect(result?.dueDate.getFullYear()).toBe(2025);
    });

    it('uses the next year for early-year dates when the current date is late in the year', () => {
        const row = { date: '01-15', host: 'Alice', activity: 'New year planning' };
        const currentDate = new Date('2026-12-20T12:00:00Z');
        const result = parsePlanRow(row, currentDate);

        expect(result?.dueDate.getFullYear()).toBe(2027);
    });

    it('keeps the same year when the date is within the 6-month rolling window', () => {
        const row = { date: '07-15', host: 'Alice', activity: 'Summertime plan' };
        const currentDate = new Date('2026-01-20T12:00:00Z');
        const result = parsePlanRow(row, currentDate);

        expect(result?.dueDate.getFullYear()).toBe(2026);
    });

    it('prefers the closest year at the year-boundary edge rather than blindly assuming the current year', () => {
        const row = { date: '12-31', host: 'Alice', activity: 'Year edge planning' };
        const currentDate = new Date('2026-06-15T12:00:00Z');
        const result = parsePlanRow(row, currentDate);

        expect(result?.dueDate.getFullYear()).toBe(2025);
    });

    it('handles multiple owners separated by and or commas', () => {
        const row = {
            date: '11-09',
            host: 'Jen AND Hannah',
            activity: 'Board games',
        };

        const result = parsePlanRow(row, new Date('2026-11-01T12:00:00Z'));

        expect(result?.mentionTarget).toBe('multiple');
        expect(result?.ownerNames).toEqual(['Jen', 'Hannah']);
    });

    it('handles the special All host value', () => {
        const row = {
            date: '11-16',
            host: 'All',
            activity: 'Community hangout',
        };

        const result = parsePlanRow(row, new Date('2026-11-01T12:00:00Z'));

        expect(result?.mentionTarget).toBe('all');
        expect(result?.ownerNames).toEqual(['@everyone']);
    });

    it('skips malformed values', () => {
        const result = parsePlanRow({ date: 'bad', host: 'Alice', activity: 'Movie night' });
        expect(result).toBeNull();

        const invalidDate = parsePlanRow({ date: '99-99', host: 'Alice', activity: 'Movie night' });
        expect(invalidDate).toBeNull();

        const missingData = parsePlanRow({ date: '', host: '', activity: '' });
        expect(missingData).toBeNull();
    });

    it('accepts full dates in mm/dd/yyyy format when the year is explicit', () => {
        const row = { date: '12/17/2026', host: 'Alice', activity: 'Full date plan' };
        const result = parsePlanRow(row, new Date('2026-11-01T12:00:00Z'));

        expect(result).not.toBeNull();
        expect(result?.dueDate.getFullYear()).toBe(2026);
        expect(result?.dueDate.getMonth()).toBe(11);
        expect(result?.dueDate.getDate()).toBe(17);
    });

    it('rejects malformed full dates', () => {
        const result = parsePlanRow({ date: '12/17/26', host: 'Alice', activity: 'Bad full date' });
        expect(result).toBeNull();

        const invalidDay = parsePlanRow({ date: '99/17/2026', host: 'Alice', activity: 'Bad full date' });
        expect(invalidDay).toBeNull();
    });
});

describe('getNormalizedHostKey', () => {
    it('normalizes host names consistently', () => {
        expect(getNormalizedHostKey(' Alice ')).toBe('alice');
        expect(getNormalizedHostKey('BOB')).toBe('bob');
    });
});
