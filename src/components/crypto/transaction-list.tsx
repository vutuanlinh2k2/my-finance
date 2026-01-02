import { useMemo } from 'react'
import {
  ArrowRight,
  ArrowSquareOut,
  CaretLeft,
  CaretRight,
  Copy,
  Minus,
  Pencil,
  Trash,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { TransactionTypeBadge } from './transaction-type-badge'
import type {
  CryptoTransactionWithDetails,
  PaginatedResponse,
} from '@/lib/crypto/types'
import { formatCryptoAmount, truncateAddress } from '@/lib/crypto/utils'
import { formatCompact, formatCurrency } from '@/lib/currency'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

interface TransactionListProps {
  data?: PaginatedResponse<CryptoTransactionWithDetails>
  isLoading?: boolean
  onEdit?: (transaction: CryptoTransactionWithDetails) => void
  onDelete?: (transaction: CryptoTransactionWithDetails) => void
  onPageChange?: (page: number) => void
}

export function TransactionList({
  data,
  isLoading,
  onEdit,
  onDelete,
  onPageChange,
}: TransactionListProps) {
  // Generate pagination page numbers
  const pageNumbers = useMemo(() => {
    if (!data) return []

    const pages: Array<number | 'ellipsis'> = []
    const totalPages = data.totalPages
    const currentPage = data.page

    if (totalPages <= 7) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Show first, last, and surrounding pages
      pages.push(1)

      if (currentPage > 3) {
        pages.push('ellipsis')
      }

      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (currentPage < totalPages - 2) {
        pages.push('ellipsis')
      }

      pages.push(totalPages)
    }

    return pages
  }, [data])

  // Copy TX ID to clipboard
  const handleCopyTxId = async (txId: string) => {
    await navigator.clipboard.writeText(txId)
    toast.success('TX ID copied to clipboard')
  }

  // Render transaction details based on type
  const renderDetails = (tx: CryptoTransactionWithDetails) => {
    switch (tx.type) {
      case 'buy':
        return (
          <div className="flex items-center gap-2">
            <span>
              Bought{' '}
              <span className="font-medium">
                {formatCryptoAmount(tx.amount ?? 0, tx.asset?.symbol)}
              </span>
            </span>
            {tx.fiatAmount && (
              <>
                <span className="text-muted-foreground">for</span>
                <span
                  className="tooltip-fast font-medium"
                  data-tooltip={formatCurrency(tx.fiatAmount)}
                >
                  {formatCompact(tx.fiatAmount)}
                </span>
              </>
            )}
            {tx.storage && (
              <span className="text-muted-foreground">[{tx.storage.name}]</span>
            )}
          </div>
        )

      case 'sell':
        return (
          <div className="flex items-center gap-2">
            <span>
              Sold{' '}
              <span className="font-medium">
                {formatCryptoAmount(tx.amount ?? 0, tx.asset?.symbol)}
              </span>
            </span>
            {tx.fiatAmount && (
              <>
                <span className="text-muted-foreground">for</span>
                <span
                  className="tooltip-fast font-medium"
                  data-tooltip={formatCurrency(tx.fiatAmount)}
                >
                  {formatCompact(tx.fiatAmount)}
                </span>
              </>
            )}
            {tx.storage && (
              <span className="text-muted-foreground">[{tx.storage.name}]</span>
            )}
          </div>
        )

      case 'transfer_between':
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {formatCryptoAmount(tx.amount ?? 0, tx.asset?.symbol)}
            </span>
            <span className="text-muted-foreground">:</span>
            <span>{tx.fromStorage?.name ?? 'Unknown'}</span>
            <ArrowRight className="size-4 text-muted-foreground" />
            <span>{tx.toStorage?.name ?? 'Unknown'}</span>
          </div>
        )

      case 'swap':
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {formatCryptoAmount(tx.fromAmount ?? 0, tx.fromAsset?.symbol)}
            </span>
            <ArrowRight className="size-4 text-muted-foreground" />
            <span className="font-medium">
              {formatCryptoAmount(tx.toAmount ?? 0, tx.toAsset?.symbol)}
            </span>
            {tx.storage && (
              <span className="text-muted-foreground">[{tx.storage.name}]</span>
            )}
          </div>
        )

      case 'transfer_in':
        return (
          <div className="flex items-center gap-2">
            <span>
              Received{' '}
              <span className="font-medium">
                {formatCryptoAmount(tx.amount ?? 0, tx.asset?.symbol)}
              </span>
            </span>
            {tx.storage && (
              <span className="text-muted-foreground">[{tx.storage.name}]</span>
            )}
          </div>
        )

      case 'transfer_out':
        return (
          <div className="flex items-center gap-2">
            <span>
              Sent{' '}
              <span className="font-medium">
                {formatCryptoAmount(tx.amount ?? 0, tx.asset?.symbol)}
              </span>
            </span>
            {tx.storage && (
              <span className="text-muted-foreground">[{tx.storage.name}]</span>
            )}
          </div>
        )

      default:
        return null
    }
  }

  // Render TX ID/Link column
  const renderTxLink = (tx: CryptoTransactionWithDetails) => {
    if (tx.txExplorerUrl) {
      return (
        <a
          href={tx.txExplorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
        >
          <ArrowSquareOut className="size-4" />
          <span className="sr-only">View on explorer</span>
        </a>
      )
    }

    if (tx.txId) {
      return (
        <button
          onClick={() => handleCopyTxId(tx.txId!)}
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
          title={tx.txId}
        >
          <span className="font-mono text-xs">
            {truncateAddress(tx.txId, 6)}
          </span>
          <Copy className="size-3" />
        </button>
      )
    }

    return <Minus className="size-4 text-muted-foreground" />
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="w-28 px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Date
                </th>
                <th className="w-24 px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Details
                </th>
                <th className="w-24 px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  TX
                </th>
                <th className="w-24 px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-20" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-6 w-16" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-48" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-12" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-8 w-16" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // Empty state
  if (!data || data.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
        <p className="text-muted-foreground">No transactions found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Add your first crypto transaction to get started
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Transaction Table */}
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full">
          <thead className="border-b border-border bg-muted/50">
            <tr>
              <th className="w-28 px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Date
              </th>
              <th className="w-24 px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Type
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Details
              </th>
              <th className="w-24 px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                TX
              </th>
              <th className="w-24 px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.data.map((tx) => (
              <tr key={tx.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 text-sm font-medium">
                  {new Date(tx.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </td>
                <td className="px-4 py-3">
                  <TransactionTypeBadge type={tx.type} />
                </td>
                <td className="px-4 py-3 text-sm">{renderDetails(tx)}</td>
                <td className="px-4 py-3">{renderTxLink(tx)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => onEdit(tx)}
                      >
                        <Pencil className="size-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => onDelete(tx)}
                      >
                        <Trash className="size-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(data.page - 1) * data.pageSize + 1} to{' '}
            {Math.min(data.page * data.pageSize, data.total)} of {data.total}{' '}
            transactions
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(data.page - 1)}
              disabled={data.page === 1}
              className="gap-1"
            >
              <CaretLeft className="size-4" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {pageNumbers.map((page, i) =>
                page === 'ellipsis' ? (
                  <span
                    key={`ellipsis-${i}`}
                    className="px-2 text-muted-foreground"
                  >
                    ...
                  </span>
                ) : (
                  <Button
                    key={page}
                    variant={page === data.page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onPageChange?.(page)}
                    className={cn(
                      'min-w-8',
                      page === data.page && 'pointer-events-none',
                    )}
                  >
                    {page}
                  </Button>
                ),
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(data.page + 1)}
              disabled={data.page === data.totalPages}
              className="gap-1"
            >
              Next
              <CaretRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
