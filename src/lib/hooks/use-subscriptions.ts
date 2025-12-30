import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  CreateSubscriptionInput,
  Subscription,
  UpdateSubscriptionInput,
} from '@/lib/api/subscriptions'
import { queryKeys } from '@/lib/query-keys'
import {
  createSubscription,
  deleteSubscription,
  fetchSubscriptions,
  updateSubscription,
} from '@/lib/api/subscriptions'

/**
 * Hook to fetch all subscriptions for the current user
 */
export function useSubscriptions() {
  return useQuery({
    queryKey: queryKeys.subscriptions.all,
    queryFn: fetchSubscriptions,
  })
}

/**
 * Hook to create a new subscription
 */
export function useCreateSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateSubscriptionInput) => createSubscription(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.subscriptions.all,
      })
    },
  })
}

/**
 * Hook to update an existing subscription
 */
export function useUpdateSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string
      updates: UpdateSubscriptionInput
    }) => updateSubscription(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.subscriptions.all,
      })
    },
  })
}

/**
 * Hook to delete a subscription
 */
export function useDeleteSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteSubscription(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.subscriptions.all,
      })
    },
  })
}

// Re-export types for convenience
export type { Subscription, CreateSubscriptionInput, UpdateSubscriptionInput }
