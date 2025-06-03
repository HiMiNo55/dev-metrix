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
  }
}

export default async function Sprint({ params }: Props) {
  const jiraService = new JiraClient(jiraConfig)
  const { num } = await params
  const response = await jiraService.groupIssuesBySprint(Number(num))

  if (!response.data.length) {
    return (
      <div className='container mx-auto py-10'>
        <h1 className='text-3xl font-bold mb-8'>Sprint {num}</h1>
        <p>No data available for this sprint.</p>
      </div>
    )
  }

  return (
    <div className='container mx-auto py-10'>
      <h1 className='text-xl font-bold mb-8'>Sprint {num}</h1>

      {response.data.map((squadData) => (
        <div key={squadData.squad + squadData.sprint} className='mb-8'>
          <h2 className='text-lg font-semibold mb-4'>
            {`[${squadData.squad}]`} - {squadData.sprint}{' '}
            <span className='text-muted-foreground text-sm'>
              Completed: {Math.round(squadData.percentComplete)}%
            </span>
          </h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-1/3'>Developer</TableHead>
                <TableHead>Ticket no.</TableHead>
                <TableHead>Story</TableHead>
                <TableHead>Dev</TableHead>
                <TableHead>Design/IA</TableHead>
                <TableHead>Dev+Design</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {squadData.developers.map((developer) => (
                <TableRow key={developer.name}>
                  <TableCell className='text-left'>
                    <Link
                      href={`/sprint/${num}/${developer.name}`}
                      className='text-primary hover:underline'
                    >
                      {developer.name}
                    </Link>
                  </TableCell>
                  <TableCell>{`${developer.done}/${developer.total}`}</TableCell>
                  <TableCell className='text-center'>
                    {developer.story}
                  </TableCell>
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
                <TableCell colSpan={5} className='text-right'>
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
