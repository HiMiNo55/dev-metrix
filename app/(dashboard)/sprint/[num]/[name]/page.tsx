import { JiraClient } from '@/lib/services/jira/client'
import { jiraConfig } from '@/config/jira'
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
    num: string
    name: string
  }
}

export default async function DeveloperSprint({ params }: Props) {
  const jiraService = new JiraClient(jiraConfig)
  const { num, name } = await params
  const decodedName = decodeURIComponent(name)
  const response = await jiraService.getDeveloperIssues(
    Number(num),
    decodedName
  )

  if (!response.data.length) {
    return (
      <div className='container mx-auto py-10'>
        <div className='flex items-center gap-4 mb-8'>
          <Link
            href={`/sprint/${num}`}
            className='text-sm text-muted-foreground hover:text-primary'
            prefetch={false}
          >
            ← Back to Sprint
          </Link>
          <h1 className='text-3xl font-bold'>
            {decodedName}&apos;s Issues - Sprint {num}
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
          href={`/sprint/${num}`}
          className='text-sm text-muted-foreground hover:text-primary'
        >
          ← Back to Sprint
        </Link>
        <h1 className='text-3xl font-bold'>
          {decodedName}&apos;s Issues - Sprint {num}
        </h1>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Squad</TableHead>
            <TableHead>Sprint</TableHead>
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
            <TableCell colSpan={6} className='text-right font-semibold'>
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
