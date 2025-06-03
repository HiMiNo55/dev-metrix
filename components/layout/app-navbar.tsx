import * as React from 'react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { BreadcrumbNav } from './breadcrumb-nav'

export function AppNavbar() {
  return (
    <nav className='p-4 flex items-center justify-between'>
      {/* LEFT */}
      <div className='flex items-center gap-2'>
        <SidebarTrigger />
        <div className='flex items-center gap-2'>
          <BreadcrumbNav />
        </div>
      </div>
      {/* RIGHT */}
      <div className='flex items-center gap-4'>
        <Avatar>
          <AvatarImage src='https://github.com/shadcn.png' />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </div>
    </nav>
  )
}
