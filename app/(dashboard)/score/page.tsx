import { JiraClient } from '@/lib/services/jira/client'
import { jiraConfig } from '@/config/jira'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default async function Score() {
  const jiraService = new JiraClient(jiraConfig)
  const response = await jiraService.groupIssuesByDeveloper()
  const startSprintAt = 52
  const endSprintAt = 69
  const totalSprints = endSprintAt - startSprintAt + 1

  return (
    <div className='container mx-auto py-10'>
      <h1 className='text-3xl font-bold mb-8'>Score</h1>
      <div className='overflow-x-auto'>
        <Table className='min-w-[1200px]'>
          <TableCaption>Developer Performance Metrics</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className='sticky left-0 z-20 bg-background'>
                Developer
              </TableHead>
              {Array.from({ length: totalSprints }, (_, i) => {
                const index = i + startSprintAt
                return (
                  <TableHead key={`${index}`} className='text-center'>
                    {`${index}`}
                  </TableHead>
                )
              })}
              <TableHead>Sum</TableHead>
              <TableHead>Avg</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {response.data.map((developer) => {
              let sum = 0
              return (
                <TableRow key={developer.developer}>
                  <TableCell className='sticky left-0 z-10 bg-background font-medium text-left'>
                    {developer.developer}
                  </TableCell>
                  {Array.from({ length: totalSprints }, (_, i) => {
                    const index = i + startSprintAt
                    const sprintData = developer.sprints.find(
                      (sprint) => sprint.sprint === `${index}`
                    )
                    const sprintSum =
                      (sprintData?.point || 0) + (sprintData?.design || 0)
                    sum += sprintSum
                    return (
                      <TableCell key={`${index}`} className='text-center'>
                        {`${sprintSum.toFixed(2)}`}
                      </TableCell>
                    )
                  })}
                  <TableCell className='text-center'>
                    <div>{sum.toFixed(2)}</div>
                  </TableCell>
                  <TableCell className='text-center'>
                    {(sum / totalSprints).toFixed(2)}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
