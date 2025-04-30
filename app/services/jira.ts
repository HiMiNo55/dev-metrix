import axios from 'axios';
import { JiraIssue, JiraApiIssue, JiraApiResponse } from '../types/jira';

export class JiraService {
    private readonly jiraUrl: string;
    private readonly username: string;
    private readonly password: string;
    private static cache: { data: JiraIssue[]; timestamp: number } | null = null;
    private static readonly CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

    constructor(jiraUrl: string, username: string, password: string) {
        this.jiraUrl = jiraUrl;
        this.username = username;
        this.password = password;
    }

    private readonly whitelist = [
        'ANUCHA PIPIT',
        'Apinat Sanghiran',
        'BURAPOL BUBPHADET',
        'Bussarakorn Uabenjakul',
        'Chayaporn Chachotikawong (CC)',
        'Chayaporn Kaewin',
        'Jittra Kerdmongkol',
        'kajornsak.sookbantuang',
        'Kanon Limprapaipong',
        'Mongkhon Samanya',
        'NATAPATCHARA ANUROJE',
        'Nuttapon Jittachotisak',
        'NUTTASAK MUNHADEE',
        'Pacawat Kangwanwisit',
        'Pansakorn Phothidaen',
        'PEERAPHAT TOPRASERT',
        'PHIPHAT SAETENG',
        'PHUDIT HUNGSPRUKE',
        '(Migrated) pathomphong charoenwichianchay',
        'pongpat.jantanon',
        '(Migrated) pongsathit poolsawat',
        'PREMMAST SUWANNIKOM',
        'RACHATAPON PONGANANTAYOTIN',
        'Roj Wilai',
        'RUNGTIWA KITTACHAROENCHAI',
        'SIRIWAT BUNMEES',
        'SUCHAT INYAM',
        'Supakorn Namkeatsakul',
        'Suthipong Khattiya',
        'Tanakan Pramot',
        'Thanadon Lamsan',
        'Thanaphat Suwannikornkul',
        'thanapat khumprom',
        'THAMMASAK JUKCHAN',
        'THANATHEP SADEEWONG',
        'Thanawat Sritonchai',
        'Thanut Suwannawong',
        'tospon sriyaphai',
        'Wijai Ruengtaweekun',
        "NATHAPOT PORNPITAKPAN",
        "Sarik Kumpan",
        "Thawatchai Phuchana"
    ];

    async getIssues(): Promise<{ data: JiraIssue[] }> {
        // Check if cache exists and is still valid
        if (JiraService.cache && (Date.now() - JiraService.cache.timestamp) < JiraService.CACHE_DURATION) {
            console.log('Returning cached Jira issues');
            return { data: JiraService.cache.data };
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
                    jql: `project = LPS AND type IN ("Technical Story", Task, Design) AND status NOT IN (Cancelled) AND "Squad[Dropdown]" IN ("DBM SQ1", "RTL SQ1", "RTL SQ2", "MGL SQ1", "CPL SQ1") AND created >= startOfYear() ORDER BY "Squad[Dropdown]" DESC`,
                    fields: 'id,key,summary,customfield_10949, customfield_10028, customfield_10909, customfield_10910, customfield_10020, customfield_10239, issuetype, labels',
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
            sprint: issue.fields.customfield_10020?.[0]?.name || 'No Sprint',
            squad: issue.fields.customfield_10239?.value || 'No Squad',
            type: issue.fields.issuetype?.name || 'Unknown',
            labels: issue.fields.labels || []
        }));

        // Update cache with new data
        JiraService.cache = {
            data: mappedIssues,
            timestamp: Date.now()
        };

        return { data: mappedIssues };
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

    groupIssuesBySprint = async (sprint?: number): Promise<{ data: { squad: string, sprint: string, developers: { name: string, point: number, design: number }[] }[] }> => {
        const { data } = await this.getIssues();
        const filteredData = data.filter(item => this.whitelist.includes(item.developer) && item.sprint.includes(sprint?.toString() || ''));
        const groupedData = filteredData.reduce<{ [key: string]: { squad: string, sprint: string, developers: { name: string, point: number, design: number }[] } }>((acc, curr) => {
            const key = `${curr.squad}-${curr.sprint}`;
            if (!acc[key]) {
                acc[key] = { squad: curr.squad, sprint: curr.sprint, developers: [] };
            }
            const existingDeveloper = acc[key].developers.find(dev => dev.name === curr.developer);
            if (existingDeveloper) {
                existingDeveloper.point += curr.feStoryPoint + curr.beStoryPoint;
                if (curr.type === 'Design') {
                    existingDeveloper.design += curr.storyPoint;
                }
            } else {
                acc[key].developers.push({ name: curr.developer, point: curr.feStoryPoint + curr.beStoryPoint, design: curr.type === 'Design' ? curr.storyPoint : 0 });
            }
            return acc;
        }, {});

        return {
            data: Object.values(groupedData)
        };
    }


    groupIssuesByDeveloper = async (): Promise<{ data: { developer: string, sprints: { sprint: string, point: number, design: number }[] }[] }> => {
        const { data } = await this.getIssues();
        const filteredData = data.filter(item => this.whitelist.includes(item.developer));
        const groupedData = filteredData.reduce<{ [key: string]: { developer: string, sprints: { sprint: string, point: number, design: number }[] } }>((acc, curr) => {
            const key = curr.developer;
            if (!acc[key]) {
                acc[key] = { developer: curr.developer, sprints: [] };
            }

            const existingSprint = acc[key].sprints.find(sprint => sprint.sprint.includes(curr.sprint.slice(-2)));
            if (existingSprint) {
                existingSprint.point += curr.feStoryPoint + curr.beStoryPoint;
                if (curr.type === 'Design' || curr.labels?.includes('dev-design')) {
                    existingSprint.design = (existingSprint.design || 0) + curr.storyPoint;
                }
            } else {
                acc[key].sprints.push({ sprint: curr.sprint.slice(-2), point: curr.feStoryPoint + curr.beStoryPoint, design: curr.type === 'Design' || curr.labels?.includes('dev-design') ? curr.storyPoint : 0 });
            }
            return acc;
        }, {});

        return { data: Object.values(groupedData).sort((a, b) => a.developer.localeCompare(b.developer)) };
    }

    getIssueDesign = async (): Promise<{ data: { developer: string, sprints: { sprint: string, design: number }[] }[] }> => {
        const { data } = await this.getIssues();
        const filteredData = data.filter(item => this.whitelist.includes(item.developer) && (item.type === 'Design' || item.labels?.includes('dev-design')));
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
}



