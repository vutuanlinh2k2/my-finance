import { useNavigate } from '@tanstack/react-router'
import { CurrencyDollar, Monitor, Moon, SignOut, Sun } from '@phosphor-icons/react'
import { useTheme } from '@/components/theme-provider'
import { useAuth } from '@/lib/auth'
import { useExchangeRateValue } from '@/lib/hooks/use-exchange-rate'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

function formatLastUpdated(date: Date | null): string {
  if (!date) return 'Never'
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

  if (diffHours < 1) {
    const diffMins = Math.floor(diffMs / (1000 * 60))
    return diffMins <= 1 ? 'Just now' : `${diffMins} mins ago`
  }
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}

export function HeaderActions() {
  const { theme, setTheme, resolvedTheme, mounted } = useTheme()
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const exchangeRate = useExchangeRateValue()

  const handleSignOut = async () => {
    try {
      await signOut()
    } finally {
      // Always navigate to login, even if signOut fails
      navigate({ to: '/login' })
    }
  }

  const getIcon = () => {
    if (theme === 'system') {
      return <Monitor weight="duotone" className="size-4" />
    }
    return resolvedTheme === 'dark' ? (
      <Moon weight="duotone" className="size-4" />
    ) : (
      <Sun weight="duotone" className="size-4" />
    )
  }

  const isOffline =
    exchangeRate.source === 'fallback' || exchangeRate.source === 'default'

  return (
    <div className="flex items-center gap-2">
      {/* USD Rate Display */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5 rounded-md border border-border bg-white px-2.5 py-1.5 dark:bg-input/30">
            <CurrencyDollar weight="duotone" className="size-4 text-blue-500" />
            {exchangeRate.isLoading ? (
              <div className="h-4 w-12 animate-pulse rounded bg-muted" />
            ) : (
              <span className="text-sm font-medium tabular-nums">
                {exchangeRate.rate.toLocaleString('en-US')}
              </span>
            )}
            {isOffline && !exchangeRate.isLoading && (
              <span className="rounded bg-amber-100 px-1 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                Offline
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-center">
          <p className="font-medium">USD → VND</p>
          <p className="text-xs text-muted-foreground">
            Updated: {formatLastUpdated(exchangeRate.lastUpdated)}
          </p>
        </TooltipContent>
      </Tooltip>

      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                disabled={!mounted}
                className="bg-white dark:bg-input/30"
              >
                {mounted ? (
                  getIcon()
                ) : (
                  <Monitor weight="duotone" className="size-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>Theme</TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setTheme('light')}>
            <Sun weight="duotone" />
            <span>Light</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme('dark')}>
            <Moon weight="duotone" />
            <span>Dark</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme('system')}>
            <Monitor weight="duotone" />
            <span>System</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={handleSignOut}
            className="bg-white dark:bg-input/30"
          >
            <SignOut weight="duotone" className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Sign out</TooltipContent>
      </Tooltip>
    </div>
  )
}
