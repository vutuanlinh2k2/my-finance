import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  CreateSubscriptionInput,
  Subscription,
  UpdateSubscriptionInput,
} from '@/lib/subscriptions'
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
    queryFn: async (): Promise<Array<Subscription>> => {
      const data = await fetchSubscriptions()
      // Cast database response to stricter Subscription type
      // The database enforces currency IN ('VND', 'USD') and type IN ('monthly', 'yearly')
      return data as Array<Subscription>
    },
  })
}

/**
 * Hook to create a new subscription
 */
export function useCreateSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      input: CreateSubscriptionInput,
    ): Promise<Subscription> => {
      const data = await createSubscription(input)
      return data as Subscription
    },
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
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string
      updates: UpdateSubscriptionInput
    }): Promise<Subscription> => {
      const data = await updateSubscription(id, updates)
      return data as Subscription
    },
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
