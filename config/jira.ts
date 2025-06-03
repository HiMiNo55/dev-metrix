import { JiraConfig } from '@/lib/services/jira/types'

export const jiraConfig: JiraConfig = {
    baseUrl: process.env.JIRA_URL || '',
    username: process.env.JIRA_USERNAME || '',
    password: process.env.JIRA_TOKEN || '',
}

// Validate required environment variables
const requiredEnvVars = ['JIRA_URL', 'JIRA_USERNAME', 'JIRA_TOKEN']
const missingEnvVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
)

if (missingEnvVars.length > 0) {
    console.warn(
        `Missing required environment variables for Jira configuration: ${missingEnvVars.join(
            ', '
        )}`
    )
} 