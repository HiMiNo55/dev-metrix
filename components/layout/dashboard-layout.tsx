'use client'

import { ReactNode } from 'react'
import { dashboardConfig } from '@/config/dashboard'
import { NavItem } from '@/lib/types'

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className='flex min-h-screen flex-col'>
      <header className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
        <div className='container flex h-14 items-center'>
          <nav className='flex items-center space-x-6 text-sm font-medium'>
            {dashboardConfig.mainNav.map((item: NavItem) => (
              <a
                key={item.href}
                href={item.href}
                className='transition-colors hover:text-foreground/80'
              >
                {item.title}
              </a>
            ))}
          </nav>
        </div>
      </header>
      <main className='flex-1'>
        <div className='container py-6'>{children}</div>
      </main>
    </div>
  )
}
