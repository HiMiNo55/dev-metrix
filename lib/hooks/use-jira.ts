'use client'

import { useState, useCallback } from 'react'
import { JiraClient } from '@/lib/services/jira/client'
import { jiraConfig } from '@/config/jira'
import type { JiraIssue, JiraSprint, JiraBoard } from '@/lib/services/jira/types'

export function useJira() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const client = new JiraClient(jiraConfig)

    const getIssue = useCallback(async (issueKey: string) => {
        try {
            setIsLoading(true)
            setError(null)
            return await client.getIssue(issueKey)
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch Jira issue'))
            throw err
        } finally {
            setIsLoading(false)
        }
    }, [])

    const getSprintIssues = useCallback(async (sprintId: number) => {
        try {
            setIsLoading(true)
            setError(null)
            return await client.getSprintIssues(sprintId)
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch sprint issues'))
            throw err
        } finally {
            setIsLoading(false)
        }
    }, [])

    const getSprints = useCallback(async (boardId: number) => {
        try {
            setIsLoading(true)
            setError(null)
            return await client.getSprints(boardId)
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch sprints'))
            throw err
        } finally {
            setIsLoading(false)
        }
    }, [])

    const getBoards = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)
            return await client.getBoards()
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch boards'))
            throw err
        } finally {
            setIsLoading(false)
        }
    }, [])

    return {
        isLoading,
        error,
        getIssue,
        getSprintIssues,
        getSprints,
        getBoards,
    }
} 