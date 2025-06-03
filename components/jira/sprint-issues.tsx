'use client'

import { useEffect, useState } from 'react'
import { useJira } from '@/lib/hooks/use-jira'
import type { JiraIssue } from '@/lib/services/jira/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface SprintIssuesProps {
  sprintId: number
}

export function SprintIssues({ sprintId }: SprintIssuesProps) {
  const { getSprintIssues, isLoading, error } = useJira()
  const [issues, setIssues] = useState<JiraIssue[]>([])

  useEffect(() => {
    async function loadIssues() {
      try {
        const sprintIssues = await getSprintIssues(sprintId)
        setIssues(sprintIssues)
      } catch (err) {
        console.error('Failed to load sprint issues:', err)
      }
    }

    loadIssues()
  }, [sprintId, getSprintIssues])

  if (error) {
    return (
      <Card>
        <CardContent className='p-6'>
          <p className='text-destructive'>Error loading sprint issues</p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className='h-6 w-[200px]' />
        </CardHeader>
        <CardContent className='space-y-4'>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className='space-y-2'>
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-[80%]' />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sprint Issues</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {issues.map((issue) => (
            <div
              key={issue.id}
              className='rounded-lg border p-4 hover:bg-accent'
            >
              <div className='flex items-center justify-between'>
                <h3 className='font-medium'>{issue.fields.summary}</h3>
                <span className='text-sm text-muted-foreground'>
                  {issue.key}
                </span>
              </div>
              <p className='mt-2 text-sm text-muted-foreground'>
                Status: {issue.fields.status.name}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
