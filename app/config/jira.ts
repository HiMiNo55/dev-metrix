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

export const WHITELISTED_DEVELOPERS = [
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
    'Wijai Ruengtaweekun'
] as const;
