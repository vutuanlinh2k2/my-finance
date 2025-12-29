import * as React from 'react'

type Theme = 'light' | 'dark' | 'system'

type ThemeProviderContextProps = {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'light' | 'dark'
  mounted: boolean
}

const ThemeProviderContext =
  React.createContext<ThemeProviderContextProps | null>(null)

const THEME_STORAGE_KEY = 'theme'

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system'
  const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null
  if (stored && ['light', 'dark', 'system'].includes(stored)) {
    return stored
  }
  return 'system'
}

function getResolvedTheme(theme: Theme): 'light' | 'dark' {
  return theme === 'system' ? getSystemTheme() : theme
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  const resolvedTheme = getResolvedTheme(theme)

  root.classList.remove('light', 'dark')
  root.classList.add(resolvedTheme)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>('system')
  const [resolvedTheme, setResolvedTheme] = React.useState<'light' | 'dark'>(
    'light',
  )
  const [mounted, setMounted] = React.useState(false)

  // Sync with localStorage after mount to avoid hydration mismatch
  React.useEffect(() => {
    const stored = getStoredTheme()
    setThemeState(stored)
    setResolvedTheme(getResolvedTheme(stored))
    setMounted(true)
  }, [])

  // Handle theme changes (skip on initial mount since inline script already applied it)
  React.useEffect(() => {
    if (!mounted) return
    const resolved = getResolvedTheme(theme)
    setResolvedTheme(resolved)
    applyTheme(theme)
  }, [theme, mounted])

  // Listen for system theme changes
  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = () => {
      if (theme === 'system') {
        const resolved = getSystemTheme()
        setResolvedTheme(resolved)
        applyTheme('system')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  const setTheme = React.useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem(THEME_STORAGE_KEY, newTheme)
  }, [])

  const value = React.useMemo(
    () => ({ theme, setTheme, resolvedTheme, mounted }),
    [theme, setTheme, resolvedTheme, mounted],
  )

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export function useTheme() {
  const context = React.useContext(ThemeProviderContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
