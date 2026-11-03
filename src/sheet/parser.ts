import type { HostMentionTarget, PlanRecord, RawPlanRow } from './types.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const SIX_MONTH_WINDOW_MS = 6 * 30 * DAY_MS;

function normalizeText(value: unknown): string {
    if (typeof value !== 'string') {
        return '';
    }

    return value.trim();
}

function normalizeHostName(value: string): string {
    return normalizeText(value).toLowerCase();
}

function parseOwnerNames(hostValue: string): { ownerNames: string[]; mentionTarget: HostMentionTarget } {
    const normalized = normalizeText(hostValue);
    if (!normalized) {
        return { ownerNames: [], mentionTarget: 'single' };
    }

    const allMatch = /^all$/i.test(normalized);
    if (allMatch) {
        return { ownerNames: ['@everyone'], mentionTarget: 'all' };
    }

    const splitValues = normalized
        .split(/\s*and\s*|,|\n/gi)
        .map((entry) => entry.trim())
        .filter(Boolean);

    if (splitValues.length > 1) {
        return {
            ownerNames: splitValues.map((name) => name.trim()),
            mentionTarget: 'multiple',
        };
    }

    return {
        ownerNames: [normalized],
        mentionTarget: 'single',
    };
}

function computeAssumedYear(month: number, day: number, currentDate: Date): number {
    const currentYear = currentDate.getFullYear();
    const candidateYears = [currentYear - 1, currentYear, currentYear + 1];

    const candidates = candidateYears.map((year) => {
        const candidateDate = new Date(year, month - 1, day);
        return {
            year,
            candidateDate,
            diffMs: Math.abs(candidateDate.getTime() - currentDate.getTime()),
        };
    });

    const withinWindow = candidates.filter((candidate) => candidate.diffMs <= SIX_MONTH_WINDOW_MS);
    if (withinWindow.length > 0) {
        withinWindow.sort((left, right) => left.diffMs - right.diffMs);
        return withinWindow[0].year;
    }

    candidates.sort((left, right) => left.diffMs - right.diffMs);
    return candidates[0].year;
}

function parseDateValue(rawDate: string, currentDate: Date): { month: number; day: number; year?: number } | null {
    const dateMatch = /^([0-9]{1,2})-([0-9]{1,2})$/.exec(rawDate);
    if (dateMatch) {
        const month = Number.parseInt(dateMatch[1], 10);
        const day = Number.parseInt(dateMatch[2], 10);

        if (Number.isNaN(month) || Number.isNaN(day)) {
            return null;
        }

        if (month < 1 || month > 12 || day < 1 || day > 31) {
            return null;
        }

        return {
            month,
            day,
            year: computeAssumedYear(month, day, currentDate),
        };
    }

    const fullDateMatch = /^([0-9]{1,2})\/([0-9]{1,2})\/([0-9]{4})$/.exec(rawDate);
    if (fullDateMatch) {
        const month = Number.parseInt(fullDateMatch[1], 10);
        const day = Number.parseInt(fullDateMatch[2], 10);
        const year = Number.parseInt(fullDateMatch[3], 10);

        if (Number.isNaN(month) || Number.isNaN(day) || Number.isNaN(year)) {
            return null;
        }

        if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900) {
            return null;
        }

        return {
            month,
            day,
            year,
        };
    }

    return null;
}

export function parsePlanRow(row: RawPlanRow, currentDate: Date = new Date()): PlanRecord | null {
    const rawDate = normalizeText(row.date);
    const hostName = normalizeText(row.host);
    const activity = normalizeText(row.activity);
    const notes = normalizeText(row.notes);

    if (!rawDate || !hostName || !activity) {
        return null;
    }

    const parsedDate = parseDateValue(rawDate, currentDate);
    if (!parsedDate) {
        return null;
    }

    const { month, day, year } = parsedDate;
    const { ownerNames, mentionTarget } = parseOwnerNames(hostName);
    if (ownerNames.length === 0) {
        return null;
    }

    const dueDate = new Date(year ?? computeAssumedYear(month, day, currentDate), month - 1, day);

    return {
        ownerNames,
        mentionTarget,
        planTitle: activity,
        dueDate,
        notes,
        rawDate,
    };
}

export function getNormalizedHostKey(hostName: string): string {
    return normalizeHostName(hostName);
}
