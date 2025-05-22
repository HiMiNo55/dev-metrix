export interface JiraConfig {
    url: string;
    username: string;
    password: string;
}

export const getJiraConfig = (): JiraConfig => {
    const url = process.env.JIRA_URL;
    const username = process.env.JIRA_USERNAME;
    const password = process.env.JIRA_TOKEN;

    if (!url || !username || !password) {
        throw new Error('Missing required Jira environment variables');
    }

    return { url, username, password };
}

export const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds
export const MAX_RESULTS_PER_PAGE = 100;

export { WHITELISTED_DEVELOPERS } from '../../data/whitelist';
