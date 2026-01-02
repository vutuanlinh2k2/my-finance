import { useState } from 'react'
import type { Transaction } from '@/lib/api/transactions'
import type { Tag } from '@/lib/api/tags'
import { cn } from '@/lib/utils'
import { formatCompact, formatCurrency } from '@/lib/currency'
import { EditTransactionModal } from '@/components/edit-transaction-modal'

interface TransactionListPanelProps {
  transactions: Array<Transaction>
  tags: Array<Tag>
  selectedTagName?: string
}

export function TransactionListPanel({
  transactions,
  tags,
  selectedTagName,
}: TransactionListPanelProps) {
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null)

  // Get tag emoji for a transaction
  const getTagEmoji = (tagId: string | null) => {
    if (!tagId) return '📝'
    return tags.find((t) => t.id === tagId)?.emoji ?? '📝'
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <div className="border-b border-border p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {selectedTagName
            ? `${selectedTagName} Transactions`
            : 'Transaction Listing'}
        </h3>
      </div>

      {/* Transaction List */}
      <div className="flex flex-1 flex-col overflow-y-auto">
        {transactions.length === 0 ? (
          <div className="flex flex-1 items-center justify-center p-6">
            <p className="text-sm text-muted-foreground">
              No transactions for this tag
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {transactions.map((transaction) => (
              <button
                key={transaction.id}
                type="button"
                onClick={() => setEditingTransaction(transaction)}
                className="flex items-center justify-between border-b border-border p-4 text-left transition-colors last:border-b-0 hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-muted text-lg">
                    {getTagEmoji(transaction.tag_id)}
                  </span>
                  <div>
                    <p className="font-medium">{transaction.title}</p>
                    <p className="text-xs uppercase text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <span
                  className={cn(
                    'font-semibold tooltip-fast',
                    transaction.type === 'income'
                      ? 'text-emerald-600'
                      : 'text-foreground',
                  )}
                  data-tooltip={formatCurrency(transaction.amount)}
                >
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCompact(transaction.amount)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Edit Transaction Modal */}
      <EditTransactionModal
        open={!!editingTransaction}
        onOpenChange={(open) => !open && setEditingTransaction(null)}
        transaction={editingTransaction}
      />
    </div>
  )
}
