import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  CreateTagInput,
  Tag,
  TagType,
  UpdateTagInput,
} from '@/lib/api/tags'
import { queryKeys } from '@/lib/query-keys'
import {
  createTag,
  deleteTag,
  ensureDefaultTags,
  fetchTags,
  fetchTagsByType,
  updateTag,
} from '@/lib/api/tags'

/**
 * Hook to fetch all tags for the current user
 */
export function useTags() {
  return useQuery({
    queryKey: queryKeys.tags.all,
    queryFn: async () => {
      // Ensure default tags exist for the user
      await ensureDefaultTags()
      return fetchTags()
    },
  })
}

/**
 * Hook to fetch tags filtered by type
 */
export function useTagsByType(type: TagType) {
  return useQuery({
    queryKey: queryKeys.tags.byType(type),
    queryFn: () => fetchTagsByType(type),
  })
}

/**
 * Hook to create a new tag
 */
export function useCreateTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateTagInput) => createTag(input),
    onSuccess: () => {
      // Invalidate all tag queries
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.all })
    },
  })
}

/**
 * Hook to update an existing tag
 */
export function useUpdateTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateTagInput }) =>
      updateTag(id, updates),
    onSuccess: () => {
      // Invalidate all tag queries
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.all })
    },
  })
}

/**
 * Hook to delete a tag
 */
export function useDeleteTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteTag(id),
    onSuccess: () => {
      // Invalidate all tag queries
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.all })
    },
  })
}

// Re-export types for convenience
export type { Tag, TagType, CreateTagInput, UpdateTagInput }
