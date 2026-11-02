export type RawPlanRow = {
    date?: string;
    host?: string;
    activity?: string;
    notes?: string;
};

export type HostMentionTarget = 'all' | 'single' | 'multiple';

export type PlanRecord = {
    ownerName: string;
    ownerNames: string[];
    mentionTarget: HostMentionTarget;
    planTitle: string;
    dueDate: Date;
    notes: string;
    rawDate: string;
};
