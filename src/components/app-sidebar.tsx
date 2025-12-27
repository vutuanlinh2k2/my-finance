import { Link, useRouterState } from '@tanstack/react-router'
import {
  CalendarDots,
  CaretDown,
  ChartBar,
  CurrencyCircleDollar,
  House,
} from '@phosphor-icons/react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

export function AppSidebar() {
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <span className="text-xl font-semibold">My Finance</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={currentPath === '/'}>
                  <Link to="/">
                    <House weight="duotone" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <Collapsible defaultOpen className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <CurrencyCircleDollar weight="duotone" />
                      <span>Earnings/Spendings</span>
                      <CaretDown className="ml-auto size-3.5! text-muted-foreground transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          asChild
                          isActive={currentPath === '/calendar'}
                        >
                          <Link to="/calendar">
                            <CalendarDots weight="duotone" />
                            <span>Calendar</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          asChild
                          isActive={currentPath === '/reports'}
                        >
                          <Link to="/reports">
                            <ChartBar weight="duotone" />
                            <span>Reports</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <ThemeToggle />
      </SidebarFooter>
    </Sidebar>
  )
}
