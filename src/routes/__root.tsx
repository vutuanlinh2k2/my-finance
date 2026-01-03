import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
  useMatch,
} from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import appCss from '../styles.css?url'
import type React from 'react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/lib/auth'
import { HeaderActions } from '@/components/header-actions'
import { queryClient } from '@/lib/query-client'

const themeScript = `
  (function() {
    const theme = localStorage.getItem('theme') || 'system';
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const resolved = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;
    document.documentElement.classList.add(resolved);
  })();
`

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: "TLinh's Finance",
      },
    ],
    links: [
      { rel: 'icon', type: 'image/png', href: '/favicon.png' },
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
    scripts: [
      {
        children: themeScript,
      },
    ],
  }),

  shellComponent: RootDocument,
  component: RootComponent,
})

function RootComponent() {
  const loginMatch = useMatch({ from: '/login', shouldThrow: false })
  const isLoginPage = !!loginMatch

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <TooltipProvider>
            {isLoginPage ? (
              <Outlet />
            ) : (
              <SidebarProvider>
                <AppSidebar />
                <SidebarInset className="min-w-0">
                  <header className="flex h-12 shrink-0 items-center justify-between border-b px-4">
                    <SidebarTrigger className="-ml-1" />
                    <HeaderActions />
                  </header>
                  <main className="min-w-0 flex-1 overflow-x-hidden p-4">
                    <Outlet />
                  </main>
                </SidebarInset>
              </SidebarProvider>
            )}
          </TooltipProvider>
          <Toaster position="top-right" />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
