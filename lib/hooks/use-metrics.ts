'use client'

import { useState, useEffect } from 'react'
import { Metric } from '../types'

interface UseMetricsOptions {
    serviceId?: string
    sprintId?: string
    timeRange?: {
        start: Date
        end: Date
    }
}

export function useMetrics(options: UseMetricsOptions = {}) {
    const [metrics, setMetrics] = useState<Metric[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        async function fetchMetrics() {
            try {
                setIsLoading(true)
                // TODO: Implement actual API call
                const response = await fetch('/api/metrics')
                const data = await response.json()
                setMetrics(data)
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to fetch metrics'))
            } finally {
                setIsLoading(false)
            }
        }

        fetchMetrics()
    }, [options.serviceId, options.sprintId, options.timeRange])

    return {
        metrics,
        isLoading,
        error,
    }
} 