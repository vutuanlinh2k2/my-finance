import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '@/lib/auth'

export const Route = createFileRoute('/_authenticated/')({
  component: DashboardPage,
})

function DashboardPage() {
  const { user } = useAuth()

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        Welcome to your personal finance dashboard.
      </p>
      <p className="mt-4 text-sm text-muted-foreground">
        Logged in as: {user?.email}
      </p>
    </div>
  )
}
