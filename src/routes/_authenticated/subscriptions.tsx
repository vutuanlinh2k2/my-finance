import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Plus } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type {
  CreateSubscriptionInput,
  Subscription,
  UpdateSubscriptionInput,
} from '@/lib/subscriptions'
import {
  MOCK_EXCHANGE_RATE,
  addSubscription,
  calculateSummaryTotals,
  deleteSubscription,
  getSubscriptions,
  updateSubscription,
} from '@/lib/subscriptions'
import { useTags } from '@/lib/hooks/use-tags'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  AddSubscriptionModal,
  EditSubscriptionModal,
  SubscriptionSummaryCards,
  SubscriptionsEmptyState,
  SubscriptionsTable,
} from '@/components/subscriptions'

export const Route = createFileRoute('/_authenticated/subscriptions')({
  component: SubscriptionsPage,
})

function SubscriptionsPage() {
  // Subscriptions state (localStorage)
  const [subscriptions, setSubscriptions] = useState<Array<Subscription>>([])
  const [isLoading, setIsLoading] = useState(true)

  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingSubscription, setEditingSubscription] =
    useState<Subscription | null>(null)
  const [deletingSubscription, setDeletingSubscription] =
    useState<Subscription | null>(null)

  // Tags from Supabase
  const { data: tags = [] } = useTags()
  const expenseTags = tags.filter((t) => t.type === 'expense')

  // Load subscriptions from localStorage on mount
  useEffect(() => {
    const loadSubscriptions = () => {
      try {
        const stored = getSubscriptions()
        setSubscriptions(stored)
      } catch (error) {
        console.error('Failed to load subscriptions:', error)
        toast.error('Failed to load subscriptions')
      } finally {
        setIsLoading(false)
      }
    }

    loadSubscriptions()
  }, [])

  // Calculate summary totals
  const summaryTotals = calculateSummaryTotals(
    subscriptions,
    MOCK_EXCHANGE_RATE,
  )

  // Handlers
  const handleAddSubscription = (input: CreateSubscriptionInput) => {
    try {
      const newSubscription = addSubscription(input)
      setSubscriptions((prev) => [...prev, newSubscription])
    } catch (error) {
      console.error('Failed to add subscription:', error)
      toast.error('Failed to add subscription')
    }
  }

  const handleUpdateSubscription = (
    id: string,
    updates: UpdateSubscriptionInput,
  ) => {
    try {
      const updated = updateSubscription(id, updates)
      if (updated) {
        setSubscriptions((prev) => prev.map((s) => (s.id === id ? updated : s)))
      }
    } catch (error) {
      console.error('Failed to update subscription:', error)
      toast.error('Failed to update subscription')
    }
  }

  const handleDeleteSubscription = () => {
    if (!deletingSubscription) return

    try {
      const success = deleteSubscription(deletingSubscription.id)
      if (success) {
        setSubscriptions((prev) =>
          prev.filter((s) => s.id !== deletingSubscription.id),
        )
        toast.success('Subscription deleted')
      }
    } catch (error) {
      console.error('Failed to delete subscription:', error)
      toast.error('Failed to delete subscription')
    } finally {
      setDeletingSubscription(null)
    }
  }

  const handleEditClick = (subscription: Subscription) => {
    setEditingSubscription(subscription)
  }

  const handleDeleteClick = (subscription: Subscription) => {
    setDeletingSubscription(subscription)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Subscriptions</h1>
          <p className="text-muted-foreground">
            Manage your recurring payments and services
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
          <Plus weight="bold" className="size-4" />
          Add Subscription
        </Button>
      </div>

      {/* Summary Cards */}
      <SubscriptionSummaryCards
        avgMonthly={summaryTotals.avgMonthly}
        totalMonthly={summaryTotals.totalMonthly}
        totalYearly={summaryTotals.totalYearly}
        isLoading={isLoading}
      />

      {/* Table or Empty State */}
      {isLoading ? (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-border bg-background p-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
        </div>
      ) : subscriptions.length === 0 ? (
        <SubscriptionsEmptyState onAddClick={() => setIsAddModalOpen(true)} />
      ) : (
        <SubscriptionsTable
          subscriptions={subscriptions}
          tags={expenseTags}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
      )}

      {/* Add Subscription Modal */}
      <AddSubscriptionModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSubmit={handleAddSubscription}
      />

      {/* Edit Subscription Modal */}
      <EditSubscriptionModal
        open={editingSubscription !== null}
        onOpenChange={(open) => {
          if (!open) setEditingSubscription(null)
        }}
        subscription={editingSubscription}
        onUpdate={handleUpdateSubscription}
        onDelete={(id) => {
          // Edit modal already showed confirmation, so directly delete
          deleteSubscription(id)
          setSubscriptions((prev) => prev.filter((s) => s.id !== id))
          setEditingSubscription(null)
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deletingSubscription !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingSubscription(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Subscription</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingSubscription?.title}"?
              This action cannot be undone. Previously created expense
              transactions will be preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSubscription}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
