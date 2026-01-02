import { useMemo } from 'react'
import { FunnelSimple, X } from '@phosphor-icons/react'
import {
  TransactionTypeBadge,
  getAllTransactionTypes,
} from './transaction-type-badge'
import type {
  CryptoTransactionFilters,
  CryptoTransactionType,
} from '@/lib/crypto/types'
import { Button } from '@/components/ui/button'
import { DateInput } from '@/components/ui/date-input'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface TransactionFiltersProps {
  filters: CryptoTransactionFilters
  onFiltersChange: (filters: CryptoTransactionFilters) => void
}

export function TransactionFilters({
  filters,
  onFiltersChange,
}: TransactionFiltersProps) {
  const allTypes = getAllTransactionTypes()

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      (filters.types && filters.types.length > 0) ||
      filters.startDate ||
      filters.endDate
    )
  }, [filters])

  // Handle type filter change
  const handleTypeToggle = (type: CryptoTransactionType) => {
    const currentTypes = filters.types ?? []
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter((t) => t !== type)
      : [...currentTypes, type]

    onFiltersChange({
      ...filters,
      types: newTypes.length > 0 ? newTypes : undefined,
    })
  }

  // Handle start date change
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      startDate: e.target.value || undefined,
    })
  }

  // Handle end date change
  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      endDate: e.target.value || undefined,
    })
  }

  // Clear all filters
  const handleClearFilters = () => {
    onFiltersChange({})
  }

  // Get selected type count for label
  const selectedTypesCount = filters.types?.length ?? 0

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Type Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <FunnelSimple className="size-4" />
            Type
            {selectedTypesCount > 0 && (
              <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                {selectedTypesCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuLabel>Transaction Types</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {allTypes.map((type) => (
            <DropdownMenuCheckboxItem
              key={type}
              checked={filters.types?.includes(type) ?? false}
              onCheckedChange={() => handleTypeToggle(type)}
            >
              <TransactionTypeBadge type={type} className="scale-90" />
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Date Range Filters */}
      <div className="flex items-center gap-1">
        <DateInput
          value={filters.startDate ?? ''}
          onChange={handleStartDateChange}
          className={cn('w-36', filters.startDate && '[&>div]:border-primary')}
          placeholder="Start date"
        />
        <span className="text-muted-foreground">to</span>
        <DateInput
          value={filters.endDate ?? ''}
          onChange={handleEndDateChange}
          className={cn('w-36', filters.endDate && '[&>div]:border-primary')}
          placeholder="End date"
        />
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearFilters}
          className="gap-1 text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
          Clear
        </Button>
      )}

      {/* Active Type Badges (shown inline) */}
      {filters.types && filters.types.length > 0 && (
        <div className="flex flex-wrap gap-1 border-l border-border pl-2">
          {filters.types.map((type) => (
            <button
              key={type}
              onClick={() => handleTypeToggle(type)}
              className="group flex items-center gap-1"
            >
              <TransactionTypeBadge type={type} />
              <X className="size-3 opacity-50 group-hover:opacity-100" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
