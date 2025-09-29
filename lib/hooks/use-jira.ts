'use client'

import { useState, useCallback, useMemo } from 'react'
import { JiraClient } from '@/lib/services/jira/client'
import { jiraConfig } from '@/config/jira'

export function useJira() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const client = useMemo(() => new JiraClient(jiraConfig), [])

    const getIssues = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)
            return await client.getIssues()
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch Jira issues'))
            throw err
        } finally {
            setIsLoading(false)
        }
    }, [client])

    const groupIssuesByDeveloper = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)
            return await client.groupIssuesByDeveloper()
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to group issues by developer'))
            throw err
        } finally {
            setIsLoading(false)
        }
    }, [client])

    const groupIssuesBySprint = useCallback(async (sprint?: number) => {
        try {
            setIsLoading(true)
            setError(null)
            return await client.groupIssuesBySprint(sprint)
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to group issues by sprint'))
            throw err
        } finally {
            setIsLoading(false)
        }
    }, [client])

    const getDeveloperIssues = useCallback(async (sprint: number, developer: string) => {
        try {
            setIsLoading(true)
            setError(null)
            return await client.getDeveloperIssues(sprint, developer)
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch developer issues'))
            throw err
        } finally {
            setIsLoading(false)
        }
    }, [client])

    const getIssueShouldInvestigate = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)
            return await client.getIssueShouldInvestigate()
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch issues to investigate'))
            throw err
        } finally {
            setIsLoading(false)
        }
    }, [client])

    return {
        isLoading,
        error,
        getIssues,
        groupIssuesByDeveloper,
        groupIssuesBySprint,
        getDeveloperIssues,
        getIssueShouldInvestigate,
    }
} 