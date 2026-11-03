export type RawPlanRow = {
    date?: string;
    host?: string;
    activity?: string;
    notes?: string;
};

export type HostMentionTarget = 'all' | 'single' | 'multiple';

export type PlanRecord = {
    ownerNames: string[];
    mentionTarget: HostMentionTarget;
    planTitle: string;
    dueDate: Date;
    notes: string;
    rawDate: string;
};
