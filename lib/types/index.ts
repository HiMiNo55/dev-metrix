export interface User {
    id: string
    name: string
    email: string
    image?: string
}

export interface Metric {
    id: string
    name: string
    value: number
    unit: string
    timestamp: Date
}

export interface Service {
    id: string
    name: string
    status: 'healthy' | 'degraded' | 'down'
    metrics: Metric[]
}

export interface Sprint {
    id: string
    name: string
    startDate: Date
    endDate: Date
    status: 'planning' | 'active' | 'completed'
    metrics: Metric[]
}

export interface NavItem {
    title: string
    href: string
    icon?: string
    children?: NavItem[]
} 