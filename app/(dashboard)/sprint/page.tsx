import Link from 'next/link'

export default function Sprint() {
  return (
    <div className='container mx-auto py-10'>
      <h1 className='text-3xl font-bold mb-8'>Sprint</h1>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {[
          { num: 52, date: '4 Mar - 15 Mar 2024' },
          { num: 53, date: '18 Mar - 29 Mar 2024' },
          { num: 54, date: '1 Apr - 12 Apr 2024' },
          { num: 55, date: '15 Apr - 26 Apr 2024' },
          { num: 56, date: '29 Apr - 10 May 2024' },
          { num: 57, date: '13 May - 24 May 2024' },
          { num: 58, date: '27 May - 7 Jun 2024' },
          { num: 59, date: '10 Jun - 21 Jun 2024' },
          { num: 60, date: '19 May - 30 May 2025' },
          { num: 61, date: '2 Jun - 13 Jun 2025' },
          { num: 62, date: '16 Jun - 27 Jun 2025' },
          { num: 63, date: '30 Jun - 11 Jul 2025' },
          { num: 64, date: '14 Jul - 25 Jul 2025' },
          { num: 65, date: '28 Jul - 8 Aug 2025' },
          { num: 66, date: '11 Aug - 22 Aug 2025' },
          { num: 67, date: '25 Aug - 5 Sep 2025' },
          { num: 68, date: '8 Sep - 19 Sep 2025' },
          { num: 69, date: '22 Sep - 3 Oct 2025' },
          { num: 70, date: '6 Oct - 17 Oct 2025' },
          { num: 71, date: '20 Oct - 31 Oct 2025' },
          { num: 72, date: '3 Nov - 14 Nov 2025' },
          { num: 73, date: '17 Nov - 28 Nov 2025' },
          { num: 74, date: '1 Dec - 12 Dec 2025' },
          { num: 75, date: '15 Dec - 26 Dec 2025' },
        ].map((sprint) => (
          <Link
            key={sprint.num}
            href={`/sprint/${sprint.num}`}
            className='block bg-white rounded-lg p-4 shadow hover:shadow-md transition'
          >
            <h2 className='text-lg font-semibold mb-1'>{`Sprint ${sprint.num}`}</h2>
            <p className='text-sm text-muted-foreground'>{sprint.date}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
