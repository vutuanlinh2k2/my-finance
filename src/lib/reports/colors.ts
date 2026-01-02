/**
 * Color palette for chart segments
 * Designed to be visually distinct and work well together
 */
export const CHART_COLORS = [
  '#EAB308', // yellow-500 (primary)
  '#1C1917', // stone-900 (dark)
  '#78716C', // stone-500
  '#A8A29E', // stone-400 (medium)
  '#F59E0B', // amber-500
  '#84CC16', // lime-500
  '#06B6D4', // cyan-500
  '#8B5CF6', // violet-500
  '#EC4899', // pink-500
  '#F97316', // orange-500
] as const

/**
 * Color for untagged transactions
 */
export const UNTAGGED_COLOR = '#9CA3AF' // gray-400

/**
 * Get a consistent color for a tag based on its ID
 * Uses a simple hash to map tag IDs to colors deterministically
 */
export function getTagColor(tagId: string | null, index?: number): string {
  if (tagId === null) {
    return UNTAGGED_COLOR
  }

  // If index is provided, use it directly
  if (index !== undefined) {
    return CHART_COLORS[index % CHART_COLORS.length]
  }

  // Otherwise, hash the tag ID for consistent coloring
  let hash = 0
  for (let i = 0; i < tagId.length; i++) {
    const char = tagId.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }

  return CHART_COLORS[Math.abs(hash) % CHART_COLORS.length]
}
