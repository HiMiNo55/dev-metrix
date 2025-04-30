import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function Loading() {
  return (
    <div className="container mx-auto py-10">
      <Table>
        <TableCaption>Loading performance metrics...</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Loading...</TableHead>
            <TableHead className="text-center">Loading...</TableHead>
            <TableHead>Loading...</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[1, 2, 3].map((i) => (
            <TableRow key={i}>
              <TableCell className="font-medium">
                <div className="h-4 w-24 animate-pulse bg-gray-200 rounded"></div>
              </TableCell>
              <TableCell className="text-center">
                <div className="h-4 w-16 mx-auto animate-pulse bg-gray-200 rounded"></div>
              </TableCell>
              <TableCell className="text-center">
                <div className="h-4 w-20 mx-auto animate-pulse bg-gray-200 rounded"></div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
