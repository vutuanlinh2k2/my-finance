import { Link, useRouterState } from '@tanstack/react-router'
import {
  ArrowsLeftRight,
  CalendarDots,
  CaretDown,
  ChartBar,
  Coin,
  Coins,
  House,
  Repeat,
  Vault,
  Wallet,
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { useAuth } from '@/lib/auth'

export function AppSidebar() {
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname
  const { user } = useAuth()

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
                      <Wallet weight="duotone" />
                      <span>Budget</span>
                      <CaretDown className="ml-auto size-3.5! text-muted-foreground transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          asChild
                          isActive={currentPath === '/budget/calendar'}
                        >
                          <Link to="/budget/calendar">
                            <CalendarDots weight="duotone" />
                            <span>Calendar</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          asChild
                          isActive={currentPath === '/budget/subscriptions'}
                        >
                          <Link to="/budget/subscriptions">
                            <Repeat weight="duotone" />
                            <span>Subscriptions</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          asChild
                          isActive={currentPath === '/budget/reports'}
                        >
                          <Link to="/budget/reports">
                            <ChartBar weight="duotone" />
                            <span>Reports</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              <Collapsible defaultOpen className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <Coin weight="duotone" />
                      <span>Crypto</span>
                      <CaretDown className="ml-auto size-3.5! text-muted-foreground transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          asChild
                          isActive={currentPath === '/crypto/assets'}
                        >
                          <Link to="/crypto/assets">
                            <Coins weight="duotone" />
                            <span>Assets</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          asChild
                          isActive={currentPath === '/crypto/storage'}
                        >
                          <Link to="/crypto/storage">
                            <Vault weight="duotone" />
                            <span>Storage</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          asChild
                          isActive={currentPath === '/crypto/transactions'}
                        >
                          <Link to="/crypto/transactions">
                            <ArrowsLeftRight weight="duotone" />
                            <span>Transactions</span>
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
        {user && (
          <div className="flex items-center gap-3 p-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
              <span className="text-xs font-medium text-muted-foreground">
                {user.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <p className="truncate text-sm">{user.email}</p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
