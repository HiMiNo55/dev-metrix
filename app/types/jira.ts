export interface JiraCustomField {
    value?: string;
    displayName?: string;
    name?: string;
}

export interface JiraSprint {
    name: string;
    state: string;
    startDate: string;
    endDate: string;
}

export interface JiraFields {
    summary: string;
    customfield_10949?: JiraCustomField;  // Developer
    customfield_10028?: number;          // Story Point
    customfield_10909?: number;          // FE Story Point
    customfield_10910?: number;          // BE Story Point
    customfield_10020?: JiraSprint[];    // Sprint
    customfield_10239?: JiraCustomField; // Squad
    issuetype?: JiraCustomField;         // Type
    labels?: string[];
    assignee?: JiraCustomField;
    status?: JiraCustomField;
}

export interface JiraApiIssue {
    id: string;
    key: string;
    fields: JiraFields;
}

export interface JiraIssue {
    id: string;
    key: string;
    summary: string;
    developer: string;
    storyPoint: number;
    feStoryPoint: number;
    beStoryPoint: number;
    sprint: string;
    squad: string;
    type: string;
    labels?: string[];
    assignee: string;
    status: string;
}

export interface JiraApiResponse {
    issues: JiraApiIssue[];
    total: number;
    maxResults: number;
    startAt: number;
}

export interface DeveloperMetrics {
    name: string;
    storyPoint: number;
    feStoryPoint: number;
    beStoryPoint: number;
}

export interface SprintMetrics {
    sprint: string;
    developers: DeveloperMetrics[];
}

export interface SquadMetrics {
    squad: string;
    sprints: SprintMetrics[];
}

export interface DeveloperSprintMetrics {
    name: string;
    point: number;
    design: number;
}

export interface SprintGroupMetrics {
    squad: string;
    sprint: string;
    developers: DeveloperSprintMetrics[];
}

export interface DeveloperPerformanceMetrics {
    developer: string;
    sprints: {
        sprint: string;
        point: number;
        design: number;
    }[];
}
