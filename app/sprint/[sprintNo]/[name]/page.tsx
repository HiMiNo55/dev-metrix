import { JiraService } from '@/app/services/jira'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import Link from 'next/link'

type Props = {
  params: {
    sprintNo: string
    name: string
  }
}

export default async function DeveloperSprint({ params }: Props) {
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
  const { sprintNo, name } = await params
  const decodedName = decodeURIComponent(name)
  const response = await jiraService.getDeveloperIssues(
    Number(sprintNo),
    decodedName
  )

  if (!response.data.length) {
    return (
      <div className='container mx-auto py-10'>
        <div className='flex items-center gap-4 mb-8'>
          <Link
            href={`/sprint/${sprintNo}`}
            className='text-sm text-muted-foreground hover:text-primary'
          >
            ← Back to Sprint
          </Link>
          <h1 className='text-3xl font-bold'>
            {decodedName}&apos;s Issues - Sprint {sprintNo}
          </h1>
        </div>
        <p>No issues found for this developer in this sprint.</p>
      </div>
    )
  }

  return (
    <div className='container mx-auto py-10'>
      <div className='flex items-center gap-4 mb-8'>
        <Link
          href={`/sprint/${sprintNo}`}
          className='text-sm text-muted-foreground hover:text-primary'
        >
          ← Back to Sprint
        </Link>
        <h1 className='text-3xl font-bold'>
          {decodedName}&apos;s Issues - Sprint {sprintNo}
        </h1>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Squad</TableHead>
            <TableHead>Issue Key</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Summary</TableHead>
            <TableHead>Story Points</TableHead>
            <TableHead>FE Story Points</TableHead>
            <TableHead>BE Story Points</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {response.data.map((issue) => (
            <TableRow key={issue.key}>
              <TableCell>{issue.squad}</TableCell>
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
              <TableCell>{issue.type}</TableCell>
              <TableCell>{issue.status}</TableCell>
              <TableCell className='text-left'>{issue.summary}</TableCell>
              <TableCell className='text-center'>
                {issue.storyPoint || 0}
              </TableCell>
              <TableCell className='text-center'>
                {issue.feStoryPoint || 0}
              </TableCell>
              <TableCell className='text-center'>
                {issue.beStoryPoint || 0}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={5} className='text-right font-semibold'>
              Total
            </TableCell>
            <TableCell className='text-center font-semibold'>
              {response.data.reduce(
                (acc, issue) => acc + (issue.storyPoint || 0),
                0
              )}
            </TableCell>
            <TableCell className='text-center font-semibold'>
              {response.data.reduce(
                (acc, issue) => acc + (issue.feStoryPoint || 0),
                0
              )}
            </TableCell>
            <TableCell className='text-center font-semibold'>
              {response.data.reduce(
                (acc, issue) => acc + (issue.beStoryPoint || 0),
                0
              )}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  )
}
