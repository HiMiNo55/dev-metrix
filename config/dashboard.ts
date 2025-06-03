export const dashboardConfig = {
    mainNav: [
        {
            title: "Investigate",
            href: "/investigate",
        },
        {
            title: "Services",
            href: "/services",
        },
        {
            title: "Sprint",
            href: "/sprint",
        },
    ],
    features: {
        investigate: {
            enabled: true,
            title: "Investigation Tools",
            description: "Analyze and investigate development metrics",
        },
        services: {
            enabled: true,
            title: "Service Analytics",
            description: "Monitor and analyze service performance",
        },
        sprint: {
            enabled: true,
            title: "Sprint Management",
            description: "Track and manage sprint progress",
        },
    },
}

export type DashboardConfig = typeof dashboardConfig 