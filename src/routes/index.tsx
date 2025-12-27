import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: DashboardPage })

function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        Welcome to your personal finance dashboard.
      </p>
    </div>
  )
}