import { JiraService } from '../services/jira'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default async function Design() {
  if (
    !process.env.JIRA_URL ||
    !process.env.JIRA_USERNAME ||
    !process.env.JIRA_TOKEN
  ) {
    throw new Error(
      'Missing required environment variables for Jira configuration'
    )
  }

  const jiraService = new JiraService(
    process.env.JIRA_URL,
    process.env.JIRA_USERNAME,
    process.env.JIRA_TOKEN
  )
  const response = await jiraService.getIssueDesign()
  const startSprintAt = 52
  const endSprintAt = 58
  const totalSprints = endSprintAt - startSprintAt + 1
  let sum = 0
  return (
    <div className='container mx-auto py-10'>
      <Table>
        <TableCaption>Developer Performance Metrics</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Developer</TableHead>
            {Array.from({ length: totalSprints }, (_, i) => {
              const index = i + startSprintAt
              return (
                <TableHead key={index} className='text-center'>
                  Sprint {index}
                </TableHead>
              )
            })}
            <TableHead>Sum</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {response.data.map((developer) => (
            <TableRow key={developer.developer}>
              <TableCell className='font-medium'>
                {developer.developer}
              </TableCell>
              {Array.from({ length: totalSprints }, (_, i) => {
                sum = i === 0 ? 0 : sum
                const index = i + startSprintAt
                const sprintData = developer.sprints.find(
                  (sprint) => sprint.sprint === `${index}`
                )
                sum += sprintData?.design || 0
                return (
                  <TableCell key={index} className='text-center'>
                    <div>{sprintData?.design || 0}</div>
                  </TableCell>
                )
              })}
              <TableCell className='text-center'>
                <div>{sum.toFixed(2)}</div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
