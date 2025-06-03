import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import Link from 'next/link'
import Image from 'next/image'
import { ChartColumn, CircleHelp, Gauge, Home, LogOut } from 'lucide-react'

// Menu items.
const items = [
  {
    title: 'Home',
    url: '/',
    icon: Home,
  },
  {
    title: 'Score',
    url: '/score',
    icon: ChartColumn,
  },
  {
    title: 'Sprint',
    url: '/sprint',
    icon: Gauge,
  },
  {
    title: 'Investigate',
    url: '/investigate',
    icon: CircleHelp,
  },
]

export function AppSidebar() {
  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader className='py-3 px-0'>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Link href='/'></Link>
              <Image src='/logo.svg' alt='logo' width={20} height={20} />
              <span className='font-bold'>Dev Metrix</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarSeparator className='mx-0' />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href='/'>
                <LogOut />
                Logout
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
