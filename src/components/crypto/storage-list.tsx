import {
  ArrowSquareOut,
  Buildings,
  DotsThree,
  PencilSimple,
  Trash,
  Wallet as WalletIcon,
} from '@phosphor-icons/react'
import type { CryptoStorage, CryptoStorageWithValue } from '@/lib/crypto/types'
import { formatCompact, formatCurrency } from '@/lib/currency'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

interface StorageListProps {
  storages: Array<CryptoStorageWithValue>
  selectedId: string | null
  onSelect: (id: string | null) => void
  onEdit?: (storage: CryptoStorage) => void
  onDelete?: (storage: CryptoStorage) => void
}

export function StorageList({
  storages,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
}: StorageListProps) {
  if (storages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
          <Buildings className="size-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">No storages added yet</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Add an exchange or wallet to get started
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {storages.map((storage) => (
        <div
          key={storage.id}
          role="button"
          tabIndex={0}
          onClick={() =>
            onSelect(selectedId === storage.id ? null : storage.id)
          }
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onSelect(selectedId === storage.id ? null : storage.id)
            }
          }}
          className={cn(
            'flex min-h-14 cursor-pointer items-center gap-3 rounded-lg border border-transparent p-3 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            selectedId === storage.id && 'border-primary bg-primary/5',
          )}
        >
          {/* Color indicator */}
          <div
            className="size-4 shrink-0 rounded"
            style={{ backgroundColor: storage.color }}
          />

          {/* Storage Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate font-medium">{storage.name}</span>
              {storage.type === 'cex' ? (
                <Buildings className="size-3.5 shrink-0 text-muted-foreground" />
              ) : (
                <WalletIcon className="size-3.5 shrink-0 text-muted-foreground" />
              )}
            </div>
            {storage.address && (
              <p className="truncate font-mono text-xs text-muted-foreground">
                {storage.address.slice(0, 6)}...{storage.address.slice(-4)}
              </p>
            )}
          </div>

          {/* Value and Percentage */}
          <div className="flex shrink-0 items-center gap-3">
            <span
              className="tooltip-fast font-semibold"
              data-tooltip={formatCurrency(storage.totalValueVnd)}
            >
              {formatCompact(storage.totalValueVnd)}
            </span>
            <span className="rounded border border-border bg-background px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {storage.percentage.toFixed(1)}%
            </span>
          </div>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="size-7 shrink-0 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <DotsThree className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {storage.explorerUrl && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    window.open(storage.explorerUrl!, '_blank', 'noopener')
                  }}
                  className="gap-2"
                >
                  <ArrowSquareOut className="size-4" />
                  Open Link
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(storage)
                  }}
                  className="gap-2"
                >
                  <PencilSimple className="size-4" />
                  Edit
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(storage)
                  }}
                  className="gap-2 text-destructive focus:text-destructive"
                >
                  <Trash className="size-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
    </div>
  )
}
