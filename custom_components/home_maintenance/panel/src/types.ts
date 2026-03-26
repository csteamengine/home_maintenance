import { localize } from '../localize/localize'

export type IntervalType = "days" | "weeks" | "months" | "years";

export const INTERVAL_TYPES: IntervalType[] = ["days", "weeks", "months", "years"];

export function getIntervalTypeLabels(lang: string): Record<IntervalType, string> {
    return {
        days: localize("intervals.days", lang),
        weeks: localize("intervals.weeks", lang),
        months: localize("intervals.months", lang),
        years: localize("intervals.years", lang),
    };
}

export interface IntegrationConfig {
    data: Record<string, any>;
    options: Record<string, any>;
}

export interface Label {
    label_id: string;
    name: string;
    color?: string;
    icon?: string;
}

export interface Tag {
    id: string;
    name?: string;
}

export interface EntityRegistryEntry {
    entity_id: string;
    unique_id: string;
    platform: string;
    device_id?: string;
    disabled_by?: string | null;
    area_id?: string | null;
    original_name?: string;
    icon?: string;
    labels: string[];
}

export interface Task {
    id: string;
    title: string;
    interval_value: number;
    interval_type: IntervalType;
    last_performed: string;
    tag_id?: string;
    icon?: string;
    notes?: string;
    completion_history?: CompletionRecord[];
    assigned_to?: string;
    schedule_type?: "interval" | "fixed_date";
    next_due_date?: string;
    annual_recurrence?: boolean;
    calendar_entity?: string;
    calendar_keyword?: string;
    dst_trigger?: boolean;
}

export interface CompletionRecord {
    timestamp: string;
    completed_by?: string | null;
    note?: string | null;
}