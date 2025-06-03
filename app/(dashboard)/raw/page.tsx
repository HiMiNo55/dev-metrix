import { JiraClient } from '@/lib/services/jira/client'
import { jiraConfig } from '@/config/jira'

export default async function Raw() {
  const jiraService = new JiraClient(jiraConfig)
  const { data } = await jiraService.getIssues()

  return (
    <div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
