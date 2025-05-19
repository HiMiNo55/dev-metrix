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
  }
}

export default async function Sprint({ params }: Props) {
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
  const { sprintNo } = await params
  const response = await jiraService.groupIssuesBySprint(Number(sprintNo))

  if (!response.data.length) {
    return (
      <div className='container mx-auto py-10'>
        <h1 className='text-3xl font-bold mb-8'>Sprint {sprintNo}</h1>
        <p>No data available for this sprint.</p>
      </div>
    )
  }

  return (
    <div className='container mx-auto py-10'>
      <h1 className='text-3xl font-bold mb-8'>Sprint {sprintNo}</h1>

      {response.data.map((squadData) => (
        <div key={squadData.squad + squadData.sprint} className='mb-8'>
          <h2 className='text-2xl font-semibold mb-4'>
            {squadData.squad} - {squadData.sprint}{' '}
            <span className='text-muted-foreground text-sm'>
              Completed: {Math.round(squadData.percentComplete)}%
            </span>
          </h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-1/2'>Developer</TableHead>
                <TableHead>Done/All</TableHead>
                <TableHead>Dev Points</TableHead>
                <TableHead>Design/IA Points</TableHead>
                <TableHead>Sum Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {squadData.developers.map((developer) => (
                <TableRow key={developer.name}>
                  <TableCell className='w-1/2 text-left'>
                    <Link
                      href={`/sprint/${sprintNo}/${developer.name}`}
                      className='text-primary hover:underline'
                    >
                      {developer.name}
                    </Link>
                  </TableCell>
                  <TableCell>{`${developer.done}/${developer.total}`}</TableCell>
                  <TableCell className='text-center'>
                    {developer.point}
                  </TableCell>
                  <TableCell className='text-center'>
                    {developer.design}
                  </TableCell>
                  <TableCell className='text-center'>
                    {developer.point + developer.design}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={4} className='text-right'>
                  Total
                </TableCell>
                <TableCell className='text-center'>
                  {squadData.developers.reduce(
                    (acc, dev) => acc + dev.point + dev.design,
                    0
                  )}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      ))}
    </div>
  )
}
