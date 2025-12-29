import { Outlet, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { PageLoading } from '@/components/page-loading'

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const location = Route.useMatch()

  useEffect(() => {
    if (!loading && !user) {
      navigate({
        to: '/login',
        search: {
          redirect: location.pathname,
        },
      })
    }
  }, [user, loading, navigate, location.pathname])

  // Show loading while checking auth
  if (loading || !user) {
    return <PageLoading />
  }

  return <Outlet />
}
