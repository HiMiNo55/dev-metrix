'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

interface BreadcrumbItem {
  label: string
  href: string
}

const breadcrumbMap: Record<string, BreadcrumbItem[]> = {
  '/': [{ label: 'Dashboard', href: '/' }],
  '/score': [{ label: 'Score', href: '/score' }],
  '/sprint': [{ label: 'Sprint', href: '/sprint' }],
  '/investigate': [{ label: 'Investigate', href: '/investigate' }],
}

export function BreadcrumbNav() {
  const pathname = usePathname()

  const getBreadcrumbItems = () => {
    const decodedPathname = decodeURIComponent(pathname)

    // Handle dynamic sprint routes with dev name (e.g., /sprint/60/devname)
    if (decodedPathname.match(/^\/sprint\/\d+\/[^/]+$/)) {
      const [, , sprintId, devName] = decodedPathname.split('/')
      return [
        { label: 'Sprint', href: '/sprint' },
        { label: `Sprint ${sprintId}`, href: `/sprint/${sprintId}` },
        { label: devName, href: decodedPathname },
      ]
    }

    // Handle dynamic sprint routes (e.g., /sprint/60)
    if (decodedPathname.match(/^\/sprint\/\d+$/)) {
      const sprintId = decodedPathname.split('/').pop()
      return [
        { label: 'Sprint', href: '/sprint' },
        { label: `Sprint ${sprintId}`, href: decodedPathname },
      ]
    }

    // Handle other routes
    return breadcrumbMap[decodedPathname] || []
  }

  const breadcrumbItems = getBreadcrumbItems()

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={item.href}>
            <BreadcrumbItem>
              {index === breadcrumbItems.length - 1 ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < breadcrumbItems.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
