import { JiraService } from '@/app/services/jira'

export default async function Raw() {
  const jiraService = new JiraService(
    process.env.JIRA_URL || '',
    process.env.JIRA_USERNAME || '',
    process.env.JIRA_TOKEN || ''
  )

  const { data } = await jiraService.getIssues()

  return (
    <div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
