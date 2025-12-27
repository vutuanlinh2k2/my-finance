import { useNavigate } from '@tanstack/react-router'
import { Sun, Moon, Monitor, SignOut } from '@phosphor-icons/react'
import { useTheme } from '@/components/theme-provider'
import { useAuth } from '@/lib/auth'
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

export function HeaderActions() {
  const { theme, setTheme, resolvedTheme, mounted } = useTheme()
  const { signOut } = useAuth()
  const navigate = useNavigate()

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

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" disabled={!mounted}>
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
          <Button variant="outline" size="icon" onClick={handleSignOut}>
            <SignOut weight="duotone" className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Sign out</TooltipContent>
      </Tooltip>
    </div>
  )
}
