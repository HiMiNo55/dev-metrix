import axios from 'axios'
import { promises as fs } from 'fs'
import path from 'path'
import {
    JiraConfig,
    JiraIssue,
    JiraApiIssue,
    JiraApiResponse,
    DeveloperPerformanceMetrics,
} from './types'
import { WHITELISTED_DEVELOPERS, WhitelistedDeveloper } from '@/data/whitelist'

export class JiraClient {
    private readonly jiraUrl: string
    private readonly username: string
    private readonly password: string
    private readonly cacheDir: string
    private readonly MAX_CACHE_DAYS = 3

    constructor(config: JiraConfig) {
        this.jiraUrl = config.baseUrl
        this.username = config.username
        this.password = config.password
        this.cacheDir = path.join(process.cwd(), 'data', 'jira-cache')
    }

    private getCacheFilePath(date: Date): string {
        const dateStr = date.toISOString().split('T')[0] // YYYY-MM-DD format
        return path.join(this.cacheDir, `jira-cache-${dateStr}.json`)
    }

    private async cleanupOldCache(): Promise<void> {
        try {
            const files = await fs.readdir(this.cacheDir)

            // Get all cache files and their dates
            const cacheFiles = await Promise.all(
                files
                    .filter(file => file.startsWith('jira-cache-') && file.endsWith('.json'))
                    .map(async file => {
                        const filePath = path.join(this.cacheDir, file)
                        const stats = await fs.stat(filePath)
                        return {
                            file,
                            date: new Date(file.replace('jira-cache-', '').replace('.json', '')),
                            stats
                        }
                    })
            )

            // Sort by date descending
            cacheFiles.sort((a, b) => b.date.getTime() - a.date.getTime())

            // Delete files older than MAX_CACHE_DAYS
            for (let i = this.MAX_CACHE_DAYS; i < cacheFiles.length; i++) {
                const filePath = path.join(this.cacheDir, cacheFiles[i].file)
                await fs.unlink(filePath)
                console.log(`Deleted old cache file: ${filePath}`)
            }
        } catch (error) {
            console.error('Error cleaning up old cache:', error)
        }
    }

    async getIssues(): Promise<{ data: JiraIssue[] }> {
        try {
            const today = new Date()
            const cacheFilePath = this.getCacheFilePath(today)

            // Try to read from today's cache file
            const fileCache = await this.readFileCache(cacheFilePath)
            const THREE_HOURS_IN_MS = 1000 * 60 * 60 * 3
            if (fileCache && fileCache.timestamp > Date.now() - THREE_HOURS_IN_MS) {
                console.log('Returning cached Jira issues from file')
                return { data: fileCache.data }
            }

            console.log('Fetching fresh Jira issues')
            const auth = Buffer.from(`${this.username}:${this.password}`).toString('base64')
            const maxResults = 100
            let startAt = 0
            let allIssues: JiraApiIssue[] = []
            let totalIssues: number | null = null

            do {
                const response = await axios.get<JiraApiResponse>(`${this.jiraUrl}/rest/api/3/search`, {
                    params: {
                        jql: `project = LPS AND type IN ("Technical Story", Task, Design, IA) AND status NOT IN (Cancelled) AND "Squad[Dropdown]" IN ("DBM SQ1", "RTL SQ1", "RTL SQ2", "MGL SQ1", "CPL SQ1", "CPL SQ2") AND created >= startOfYear() ORDER BY "Squad[Dropdown]" DESC`,
                        fields: 'id,key,summary,customfield_10949, customfield_10028, customfield_10909, customfield_10910, customfield_10020, customfield_10239, issuetype, labels, assignee, status, created',
                        maxResults,
                        startAt,
                    },
                    headers: {
                        Authorization: `Basic ${auth}`,
                    },
                })

                const { issues, total } = response.data
                if (totalIssues === null) {
                    totalIssues = total
                }

                allIssues = [...allIssues, ...issues]
                startAt += maxResults

                console.log(`Fetched ${allIssues.length} of ${totalIssues} issues`)
            } while (startAt < totalIssues!)

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
                status: issue.fields.status?.name || 'Unknown',
                created: issue.fields.created || ''
            }))

            // Update file cache
            const cacheData = {
                data: mappedIssues,
                timestamp: Date.now()
            }
            await this.writeFileCache(cacheFilePath, cacheData)
            await this.cleanupOldCache()

            return { data: mappedIssues }
        } catch (error) {
            console.error('Error in getIssues:', error)
            throw error
        }
    }

    private async readFileCache(filePath: string): Promise<{ data: JiraIssue[]; timestamp: number } | null> {
        try {
            await fs.mkdir(path.dirname(filePath), { recursive: true })
            const fileContent = await fs.readFile(filePath, 'utf-8')
            return JSON.parse(fileContent)
        } catch {
            return null
        }
    }

    private async writeFileCache(filePath: string, cacheData: { data: JiraIssue[]; timestamp: number }): Promise<void> {
        try {
            await fs.mkdir(path.dirname(filePath), { recursive: true })
            await fs.writeFile(filePath, JSON.stringify(cacheData, null, 2))
        } catch (error) {
            console.error('Error writing cache file:', error)
        }
    }

    async groupIssuesByDeveloper(): Promise<{ data: DeveloperPerformanceMetrics[] }> {
        const { data } = await this.getIssues()
        // Only include issues where the developer is whitelisted
        const filteredData = data.filter(item =>
            WHITELISTED_DEVELOPERS.includes(item.developer as WhitelistedDeveloper)
        )

        // Group by developer, then by sprint (last 2 digits)
        const groupedData = filteredData.reduce<Record<string, DeveloperPerformanceMetrics>>((acc, curr) => {
            const key = curr.developer
            if (!acc[key]) acc[key] = { developer: key, sprints: [] }

            // Use last 2 digits of sprint for grouping, as in previous function
            const sprintKey = curr.sprint.slice(-2)
            const sprintData = acc[key].sprints.find(s => s.sprint === sprintKey)

            if (sprintData) {
                if (curr.type === 'Design' || curr.type === 'IA' || curr.labels?.includes('dev-design')) {
                    sprintData.design += curr.storyPoint
                } else {
                    sprintData.point += curr.feStoryPoint + curr.beStoryPoint
                }
            } else {
                acc[key].sprints.push({
                    sprint: sprintKey,
                    point: (curr.type === 'Design' || curr.type === 'IA' || curr.labels?.includes('dev-design'))
                        ? 0
                        : curr.feStoryPoint + curr.beStoryPoint,
                    design: (curr.type === 'Design' || curr.type === 'IA' || curr.labels?.includes('dev-design'))
                        ? curr.storyPoint
                        : 0
                })
            }
            return acc
        }, {})

        // Sort developers and sprints for consistent output
        const sorted = Object.values(groupedData)
            .sort((a, b) => a.developer.localeCompare(b.developer))
            .map(dev => ({
                ...dev,
                sprints: dev.sprints.sort((a, b) => a.sprint.localeCompare(b.sprint))
            }))

        return { data: sorted }
    }

    groupIssuesBySprint = async (sprint?: number): Promise<{ data: { squad: string, sprint: string, percentComplete: number, developers: { name: string, story: number, point: number, design: number, total: number, done: number, sumPoint: number }[] }[] }> => {
        const { data } = await this.getIssues();
        const filteredData = data.filter(item => (WHITELISTED_DEVELOPERS.includes(item.developer as WhitelistedDeveloper) || WHITELISTED_DEVELOPERS.includes(item.assignee as WhitelistedDeveloper)) && item.sprint.includes(sprint?.toString() || ''));
        const groupedData = filteredData.reduce<{ [key: string]: { squad: string, sprint: string, developers: { name: string, story: number, point: number, design: number, total: number, done: number, status: string, sumPoint: number }[] } }>((acc, curr) => {
            const key = `${curr.squad}-${curr.sprint}`;
            if (!acc[key]) {
                acc[key] = { squad: curr.squad, sprint: curr.sprint, developers: [] };
            }
            const existingDeveloper = acc[key].developers.find(dev => dev.name === curr.developer || (curr.developer === 'Unassigned' && dev.name === curr.assignee));
            if (existingDeveloper) {
                existingDeveloper.story += curr.storyPoint;
                existingDeveloper.total++;
                existingDeveloper.done += ['DONE', 'DoD complete', 'Design Done', 'IA Done'].includes(curr.status) ? 1 : 0;
                if (curr.type === 'Design' || curr.type === 'IA' || curr.labels?.includes('dev-design')) {
                    existingDeveloper.design += curr.storyPoint;
                    existingDeveloper.sumPoint += curr.storyPoint;
                } else {
                    existingDeveloper.point += curr.feStoryPoint + curr.beStoryPoint;
                    existingDeveloper.sumPoint += curr.feStoryPoint + curr.beStoryPoint;
                }
            } else {
                acc[key].developers.push({
                    name: curr.developer !== 'Unassigned' ? curr.developer : curr.assignee,
                    story: curr.storyPoint,
                    point: (curr.type === 'Design' || curr.type === 'IA' || curr.labels?.includes('dev-design'))
                        ? 0
                        : curr.feStoryPoint + curr.beStoryPoint,
                    design: (curr.type === 'Design' || curr.type === 'IA' || curr.labels?.includes('dev-design'))
                        ? curr.storyPoint
                        : 0,
                    total: 1,
                    done: ['DONE', 'DoD complete', 'Design Done', 'IA Done'].includes(curr.status) ? 1 : 0,
                    status: curr.status,
                    sumPoint: curr.type === 'Design' || curr.type === 'IA' || curr.labels?.includes('dev-design') ? curr.storyPoint : curr.feStoryPoint + curr.beStoryPoint
                });
            }
            return acc;
        }, {});

        return {
            data: Object.values(groupedData).map(squadData => ({
                ...squadData,
                percentComplete: squadData.developers.reduce((acc, dev) => acc + dev.done, 0) / squadData.developers.reduce((acc, dev) => acc + dev.total, 0) * 100
            }))
        };
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
        return { data: filteredData.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()) };
    }

} 