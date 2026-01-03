import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Plus } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type {
  CreateSubscriptionInput,
  Subscription,
  UpdateSubscriptionInput,
} from '@/lib/subscriptions'
import {
  useCreateSubscription,
  useDeleteSubscription,
  useSubscriptions,
  useUpdateSubscription,
} from '@/lib/hooks/use-subscriptions'
import { useExchangeRateValue } from '@/lib/hooks/use-exchange-rate'
import { calculateSummaryTotals } from '@/lib/subscriptions'
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

export const Route = createFileRoute('/_authenticated/budget/subscriptions')({
  component: SubscriptionsPage,
})

function SubscriptionsPage() {
  // Subscriptions from Supabase
  const { data: subscriptions = [], isLoading } = useSubscriptions()

  // Exchange rate for USD to VND conversion
  const exchangeRate = useExchangeRateValue()

  // Mutations
  const createMutation = useCreateSubscription()
  const updateMutation = useUpdateSubscription()
  const deleteMutation = useDeleteSubscription()

  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingSubscription, setEditingSubscription] =
    useState<Subscription | null>(null)
  const [deletingSubscription, setDeletingSubscription] =
    useState<Subscription | null>(null)

  // Tags from Supabase
  const { data: tags = [] } = useTags()
  const expenseTags = tags.filter((t) => t.type === 'expense')

  // Calculate summary totals
  const summaryTotals = calculateSummaryTotals(subscriptions, exchangeRate.rate)

  // Check if any mutation is pending
  const isMutating =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending

  // Handlers
  const handleAddSubscription = async (input: CreateSubscriptionInput) => {
    try {
      await createMutation.mutateAsync(input)
      toast.success('Subscription added')
    } catch (error) {
      console.error('Failed to add subscription:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to add subscription',
      )
      throw error // Re-throw so modal knows it failed
    }
  }

  const handleUpdateSubscription = async (
    id: string,
    updates: UpdateSubscriptionInput,
  ) => {
    try {
      await updateMutation.mutateAsync({ id, updates })
      toast.success('Subscription updated')
    } catch (error) {
      console.error('Failed to update subscription:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to update subscription',
      )
      throw error
    }
  }

  const handleDeleteSubscription = async () => {
    if (!deletingSubscription) return

    try {
      await deleteMutation.mutateAsync(deletingSubscription.id)
      toast.success('Subscription deleted')
    } catch (error) {
      console.error('Failed to delete subscription:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to delete subscription',
      )
    } finally {
      setDeletingSubscription(null)
    }
  }

  const handleDeleteFromEditModal = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id)
      toast.success('Subscription deleted')
      setEditingSubscription(null)
    } catch (error) {
      console.error('Failed to delete subscription:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to delete subscription',
      )
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
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="gap-2"
          disabled={isMutating}
        >
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
        isSubmitting={createMutation.isPending}
      />

      {/* Edit Subscription Modal */}
      <EditSubscriptionModal
        open={editingSubscription !== null}
        onOpenChange={(open) => {
          if (!open) setEditingSubscription(null)
        }}
        subscription={editingSubscription}
        onUpdate={handleUpdateSubscription}
        onDelete={handleDeleteFromEditModal}
        isSubmitting={updateMutation.isPending || deleteMutation.isPending}
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
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSubscription}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
