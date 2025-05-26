import axios from 'axios';
import { JiraIssue, JiraApiIssue, JiraApiResponse } from '../types/jira';
import { promises as fs } from 'fs';
import path from 'path';
import { WHITELISTED_DEVELOPERS, WhitelistedDeveloper } from '../../data/whitelist';

export class JiraService {
    private readonly jiraUrl: string;
    private readonly username: string;
    private readonly password: string;
    private readonly cacheDir: string;
    private readonly MAX_CACHE_DAYS = 3;

    constructor(jiraUrl: string, username: string, password: string) {
        this.jiraUrl = jiraUrl;
        this.username = username;
        this.password = password;
        this.cacheDir = path.join(process.cwd(), 'data', 'jira-cache');
    }

    private getCacheFilePath(date: Date): string {
        const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
        return path.join(this.cacheDir, `jira-cache-${dateStr}.json`);
    }

    private async cleanupOldCache(): Promise<void> {
        try {
            const files = await fs.readdir(this.cacheDir);

            // Get all cache files and their dates
            const cacheFiles = await Promise.all(
                files
                    .filter(file => file.startsWith('jira-cache-') && file.endsWith('.json'))
                    .map(async file => {
                        const filePath = path.join(this.cacheDir, file);
                        const stats = await fs.stat(filePath);
                        return {
                            file,
                            date: new Date(file.replace('jira-cache-', '').replace('.json', '')),
                            stats
                        };
                    })
            );

            // Sort by date descending
            cacheFiles.sort((a, b) => b.date.getTime() - a.date.getTime());

            // Delete files older than MAX_CACHE_DAYS
            for (let i = this.MAX_CACHE_DAYS; i < cacheFiles.length; i++) {
                const filePath = path.join(this.cacheDir, cacheFiles[i].file);
                await fs.unlink(filePath);
                console.log(`Deleted old cache file: ${filePath}`);
            }
        } catch (error) {
            console.error('Error cleaning up old cache:', error);
        }
    }

    async getIssues(): Promise<{ data: JiraIssue[] }> {
        try {
            const today = new Date();
            const cacheFilePath = this.getCacheFilePath(today);

            // Try to read from today's cache file
            const fileCache = await this.readFileCache(cacheFilePath);
            const THREE_HOURS_IN_MS = 1000 * 60 * 60 * 3;
            if (fileCache && fileCache.timestamp > Date.now() - THREE_HOURS_IN_MS) {
                console.log('Returning cached Jira issues from file');
                return { data: fileCache.data };
            }

            console.log('Fetching fresh Jira issues');
            const auth = Buffer.from(`${this.username}:${this.password}`).toString('base64');
            const maxResults = 100;
            let startAt = 0;
            let allIssues: JiraApiIssue[] = [];
            let totalIssues: number | null = null;

            do {
                const response = await axios.get<JiraApiResponse>(`${this.jiraUrl}/rest/api/3/search`, {
                    params: {
                        jql: `project = LPS AND type IN ("Technical Story", Task, Design, IA) AND status NOT IN (Cancelled) AND "Squad[Dropdown]" IN ("DBM SQ1", "RTL SQ1", "RTL SQ2", "MGL SQ1", "CPL SQ1") AND created >= startOfYear() ORDER BY "Squad[Dropdown]" DESC`,
                        fields: 'id,key,summary,customfield_10949, customfield_10028, customfield_10909, customfield_10910, customfield_10020, customfield_10239, issuetype, labels, assignee, status',
                        maxResults,
                        startAt,
                    },
                    headers: {
                        Authorization: `Basic ${auth}`,
                    },
                });

                const { issues, total } = response.data;
                if (totalIssues === null) {
                    totalIssues = total;
                }

                allIssues = [...allIssues, ...issues];
                startAt += maxResults;

                console.log(`Fetched ${allIssues.length} of ${totalIssues} issues`);
            } while (startAt < totalIssues!);

            const mappedIssues = allIssues.map((issue: JiraApiIssue) => ({
                id: issue.id,
                key: issue.key,
                summary: issue.fields.summary,
                developer: issue.fields.customfield_10949?.displayName || 'Unassigned',
                storyPoint: issue.fields.customfield_10028 || 0,
                feStoryPoint: issue.fields.customfield_10909 || 0,
                beStoryPoint: issue.fields.customfield_10910 || 0,
                sprint: (() => {
                    const sprints = issue.fields.customfield_10020
                    if (!sprints || sprints.length === 0) return 'No Sprint'
                    const sorted = [...sprints].sort((a, b) => {
                        const aDate = a.endDate ? new Date(a.endDate).getTime() : 0
                        const bDate = b.endDate ? new Date(b.endDate).getTime() : 0
                        if (aDate !== bDate) return aDate - bDate
                        return a.name.localeCompare(b.name)
                    })
                    return sorted[sorted.length - 1].name
                })(),
                squad: issue.fields.customfield_10239?.value || 'No Squad',
                type: issue.fields.issuetype?.name || 'Unknown',
                labels: issue.fields.labels || [],
                assignee: issue.fields.assignee?.displayName || 'Unassigned',
                status: issue.fields.status?.name || 'Unknown'
            }));

            // Update file cache
            const cacheData = {
                data: mappedIssues,
                timestamp: Date.now()
            };
            await this.writeFileCache(cacheFilePath, cacheData);
            await this.cleanupOldCache();

            return { data: mappedIssues };
        } catch (error) {
            console.error('Error in getIssues:', error);
            throw error;
        }
    }

    private async readFileCache(filePath: string): Promise<{ data: JiraIssue[]; timestamp: number } | null> {
        try {
            await fs.mkdir(path.dirname(filePath), { recursive: true });
            const fileContent = await fs.readFile(filePath, 'utf-8');
            return JSON.parse(fileContent);
        } catch {
            return null;
        }
    }

    private async writeFileCache(filePath: string, cacheData: { data: JiraIssue[]; timestamp: number }): Promise<void> {
        try {
            await fs.mkdir(path.dirname(filePath), { recursive: true });
            await fs.writeFile(filePath, JSON.stringify(cacheData, null, 2));
        } catch (error) {
            console.error('Error writing cache file:', error);
        }
    }

    groupIssuesByDeveloperAndSprint = async (): Promise<{ data: { developer: string, squad: string, sprint: string, storyPoint: number, feStoryPoint: number, beStoryPoint: number }[] }> => {
        const { data } = await this.getIssues();
        const groupedData = data.reduce<{ [key: string]: { developer: string, squad: string, sprint: string, storyPoint: number, feStoryPoint: number, beStoryPoint: number } }>((acc, curr) => {
            const key = `${curr.developer}-${curr.sprint}`;
            if (!acc[key]) {
                acc[key] = { developer: curr.developer, squad: curr.squad, sprint: curr.sprint, storyPoint: 0, feStoryPoint: 0, beStoryPoint: 0 };
            }
            acc[key].storyPoint += curr.storyPoint;
            acc[key].feStoryPoint += curr.feStoryPoint;
            acc[key].beStoryPoint += curr.beStoryPoint;
            return acc;
        }, {});
        console.log(groupedData);
        return { data: Object.values(groupedData) };
    }

    groupIssuesBySquadAndSprint = async (): Promise<{ data: { squad: string, sprints: { sprint: string, developers: { name: string, storyPoint: number, feStoryPoint: number, beStoryPoint: number }[] }[] }[] }> => {
        const { data } = await this.getIssues();
        const groupedData = data.reduce<{ [key: string]: { squad: string, sprints: { sprint: string, developers: { name: string, storyPoint: number, feStoryPoint: number, beStoryPoint: number }[] }[] } }>((acc, curr) => {
            const key = curr.squad;
            if (!acc[key]) {
                acc[key] = { squad: curr.squad, sprints: [] };
            }
            const existingSprint = acc[key].sprints.find(sprint => sprint.sprint === curr.sprint);
            if (existingSprint) {
                const existingDeveloper = existingSprint.developers.find(dev => dev.name === curr.developer);
                if (existingDeveloper) {
                    existingDeveloper.storyPoint += curr.storyPoint;
                    existingDeveloper.feStoryPoint += curr.feStoryPoint;
                    existingDeveloper.beStoryPoint += curr.beStoryPoint;
                } else {
                    existingSprint.developers.push({ name: curr.developer, storyPoint: curr.storyPoint, feStoryPoint: curr.feStoryPoint, beStoryPoint: curr.beStoryPoint });
                }
            } else {
                acc[key].sprints.push({ sprint: curr.sprint, developers: [{ name: curr.developer, storyPoint: curr.storyPoint, feStoryPoint: curr.feStoryPoint, beStoryPoint: curr.beStoryPoint }] });
            }
            return acc;
        }, {});
        return { data: Object.values(groupedData) };
    }

    groupIssuesBySprint = async (sprint?: number): Promise<{ data: { squad: string, sprint: string, percentComplete: number, developers: { name: string, story: number, point: number, design: number, total: number, done: number }[] }[] }> => {
        const { data } = await this.getIssues();
        const filteredData = data.filter(item => (WHITELISTED_DEVELOPERS.includes(item.developer as WhitelistedDeveloper) || WHITELISTED_DEVELOPERS.includes(item.assignee as WhitelistedDeveloper)) && item.sprint.includes(sprint?.toString() || ''));
        const groupedData = filteredData.reduce<{ [key: string]: { squad: string, sprint: string, developers: { name: string, story: number, point: number, design: number, total: number, done: number, status: string }[] } }>((acc, curr) => {
            const key = `${curr.squad}-${curr.sprint}`;
            if (!acc[key]) {
                acc[key] = { squad: curr.squad, sprint: curr.sprint, developers: [] };
            }
            const existingDeveloper = acc[key].developers.find(dev => dev.name === curr.developer || (curr.developer === 'Unassigned' && dev.name === curr.assignee));
            if (existingDeveloper) {
                existingDeveloper.story += curr.storyPoint;
                existingDeveloper.point += curr.feStoryPoint + curr.beStoryPoint;
                existingDeveloper.total++;
                existingDeveloper.done += ['DONE', 'DoD complete', 'Design Done', 'IA Done'].includes(curr.status) ? 1 : 0;
                if (curr.type === 'Design' || curr.type === 'IA' || curr.labels?.includes('dev-design')) {
                    existingDeveloper.design += curr.storyPoint;
                }
            } else {
                acc[key].developers.push({
                    name: (curr.developer !== 'Unassigned') ? curr.developer : curr.assignee,
                    story: curr.storyPoint,
                    point: curr.feStoryPoint + curr.beStoryPoint,
                    design: curr.type === 'Design' || curr.type === 'IA' || curr.labels?.includes('dev-design') ? curr.storyPoint : 0,
                    total: 1,
                    done: ['DONE', 'DoD complete', 'Design Done', 'IA Done'].includes(curr.status) ? 1 : 0,
                    status: curr.status
                });
            }
            return acc;
        }, {});

        return {
            data: Object.values(groupedData).map(squadData => ({
                ...squadData,
                percentComplete: squadData.developers.reduce((acc, dev) => acc + dev.done, 0) / squadData.developers.reduce((acc, dev) => acc + dev.total, 0) * 100
            }))
                .sort((a, b) => a.squad.localeCompare(b.squad))
                .map(squadData => ({
                    ...squadData,
                    developers: squadData.developers.sort((a, b) => a.name.localeCompare(b.name))
                }))
        };
    }


    groupIssuesByDeveloper = async (): Promise<{ data: { developer: string, sprints: { sprint: string, point: number, design: number }[] }[] }> => {
        const { data } = await this.getIssues();
        const filteredData = data.filter(item => WHITELISTED_DEVELOPERS.includes(item.developer as WhitelistedDeveloper));
        const groupedData = filteredData.reduce<{ [key: string]: { developer: string, sprints: { sprint: string, point: number, design: number }[] } }>((acc, curr) => {
            const key = curr.developer;
            if (!acc[key]) {
                acc[key] = { developer: curr.developer, sprints: [] };
            }

            const existingSprint = acc[key].sprints.find(sprint => sprint.sprint.includes(curr.sprint.slice(-2)));
            if (existingSprint) {
                existingSprint.point += curr.feStoryPoint + curr.beStoryPoint;
                if (curr.type === 'Design' || curr.type === 'IA' || curr.labels?.includes('dev-design')) {
                    existingSprint.design = (existingSprint.design || 0) + curr.storyPoint;
                }
            } else {
                acc[key].sprints.push({ sprint: curr.sprint.slice(-2), point: curr.feStoryPoint + curr.beStoryPoint, design: curr.type === 'Design' || curr.type === 'IA' || curr.labels?.includes('dev-design') ? curr.storyPoint : 0 });
            }
            return acc;
        }, {});

        return { data: Object.values(groupedData).sort((a, b) => a.developer.localeCompare(b.developer)) };
    }

    getIssueDesign = async (): Promise<{ data: { developer: string, sprints: { sprint: string, design: number }[] }[] }> => {
        const { data } = await this.getIssues();
        const filteredData = data.filter(item => WHITELISTED_DEVELOPERS.includes(item.developer as WhitelistedDeveloper) && (item.type === 'Design' || item.type === 'IA' || item.labels?.includes('dev-design')));
        const groupedData = filteredData.reduce<{ [key: string]: { developer: string, sprints: { sprint: string, design: number }[] } }>((acc, curr) => {
            const key = curr.developer;
            if (!acc[key]) {
                acc[key] = { developer: curr.developer, sprints: [] };
            }

            const existingSprint = acc[key].sprints.find(sprint => sprint.sprint.includes(curr.sprint.slice(-2)));
            if (existingSprint) {
                existingSprint.design += curr.storyPoint;
            } else {
                acc[key].sprints.push({ sprint: curr.sprint.slice(-2), design: curr.storyPoint });
            }
            return acc;
        }, {});

        return { data: Object.values(groupedData).sort((a, b) => a.developer.localeCompare(b.developer)) };
    }

    async getDeveloperIssues(sprint: number, developer: string): Promise<{ data: JiraIssue[] }> {
        const { data } = await this.getIssues();
        const filteredData = data.filter(
            item =>
                (item.developer === developer || item.assignee === developer) &&
                item.sprint.includes(sprint.toString())
        );
        return { data: filteredData };
    }

    async getIssueShouldInvestigate(): Promise<{ data: JiraIssue[] }> {
        const { data } = await this.getIssues();
        const filteredData = data.filter(item => WHITELISTED_DEVELOPERS.includes(item.developer as WhitelistedDeveloper) && (item.type === 'Technical Story' && (item.storyPoint < item.feStoryPoint + item.beStoryPoint || (item.feStoryPoint + item.beStoryPoint === 0 && item.storyPoint > 0))));
        return { data: filteredData.sort((a, b) => b.sprint.localeCompare(a.sprint)) };
    }
}