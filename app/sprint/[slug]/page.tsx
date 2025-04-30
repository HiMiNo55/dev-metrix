import { JiraService } from '@/app/services/jira'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type Props = {
  params: {
    slug: string
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
  const { slug } = await params
  const response = await jiraService.groupIssuesBySprint(Number(slug))

  if (!response.data.length) {
    return (
      <div className='container mx-auto py-10'>
        <h1 className='text-3xl font-bold mb-8'>Sprint {slug}</h1>
        <p>No data available for this sprint.</p>
      </div>
    )
  }

  return (
    <div className='container mx-auto py-10'>
      <h1 className='text-3xl font-bold mb-8'>Sprint {slug}</h1>

      {response.data.map((squadData) => (
        <div key={squadData.squad + squadData.sprint} className='mb-8'>
          <h2 className='text-2xl font-semibold mb-4'>{`${squadData.squad} - ${squadData.sprint}`}</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Developer</TableHead>
                <TableHead>Dev Points</TableHead>
                <TableHead>Design Points</TableHead>
                <TableHead>Sum Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {squadData.developers.map((developer) => (
                <TableRow key={developer.name}>
                  <TableCell>{developer.name}</TableCell>
                  <TableCell>{developer.point}</TableCell>
                  <TableCell>{developer.design}</TableCell>
                  <TableCell>{developer.point + developer.design}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  )
}
