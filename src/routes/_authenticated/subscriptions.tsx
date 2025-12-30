import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/subscriptions')({
  component: SubscriptionsPage,
})

function SubscriptionsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Subscriptions</h1>
      <p className="mt-2 text-muted-foreground">
        Manage your recurring subscriptions.
      </p>
    </div>
  )
}
