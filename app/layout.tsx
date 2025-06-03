import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { siteConfig } from '@/config/site'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { AppNavbar } from '@/components/layout/app-navbar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { cookies } from 'next/headers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: ['developer metrics', 'analytics', 'performance'],
  authors: [
    {
      name: siteConfig.creator,
    },
  ],
  creator: siteConfig.creator,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: '@devmetrix',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true'
  return (
    <html lang='en'>
      <body className={inter.className + ' antialiased flex'}>
        <SidebarProvider defaultOpen={defaultOpen}>
          <AppSidebar />
          <main className='w-full'>
            <AppNavbar />
            <div className='p-4'>{children}</div>
          </main>
        </SidebarProvider>
      </body>
    </html>
  )
}
