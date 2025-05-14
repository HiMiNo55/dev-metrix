import { JiraService } from '@/app/services/jira'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default async function Investigate() {
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

  const response = await jiraService.getIssueShouldInvestigate()

  if (!response.data.length) {
    return (
      <div className='container mx-auto py-10'>
        <h1 className='text-3xl font-bold mb-8'>Investigate</h1>
        <p>No data available for this sprint.</p>
      </div>
    )
  }

  return (
    <div className='container mx-auto py-10'>
      <h1 className='text-3xl font-bold mb-8'>Investigate</h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sprint</TableHead>
            <TableHead>Issue Key</TableHead>
            <TableHead>Developer</TableHead>
            <TableHead>Story Points</TableHead>
            <TableHead>FE point</TableHead>
            <TableHead>BE Points</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {response.data.map((issue) => (
            <TableRow key={issue.key}>
              <TableCell>{issue.sprint}</TableCell>
              <TableCell>
                <a
                  href={`${process.env.JIRA_URL}/browse/${issue.key}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-primary hover:underline'
                >
                  {issue.key}
                </a>
              </TableCell>
              <TableCell className='text-left w-1/2'>
                {issue.developer}
              </TableCell>
              <TableCell className='text-center'>{issue.storyPoint}</TableCell>
              <TableCell className='text-center'>
                {issue.feStoryPoint}
              </TableCell>
              <TableCell className='text-center'>
                {issue.beStoryPoint}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
