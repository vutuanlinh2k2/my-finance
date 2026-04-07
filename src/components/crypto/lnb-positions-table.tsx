import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { CryptoAssetAvatar } from '@/components/crypto/crypto-asset-avatar'
import { formatCompact, formatCurrency } from '@/lib/currency'
import { convertUsdToVnd } from '@/lib/crypto/utils'
import { formatApy, formatTokenAmount, formatUsdDetailed } from '@/lib/aave/lnb'

type SuppliedRow = {
  id: string
  name: string
  symbol: string
  iconUrl: string | null
  suppliedAmount: number
  valueUsd: number
  supplyApy: number
}

type BorrowedRow = {
  id: string
  name: string
  symbol: string
  iconUrl: string | null
  borrowedAmount: number
  debtValueUsd: number
  borrowApy: number
}

interface LnbPositionsTableProps {
  title: string
  rows: Array<SuppliedRow> | Array<BorrowedRow>
  type: 'supplied' | 'borrowed'
  exchangeRate: number
  isLoading?: boolean
  emptyMessage: string
}

function LoadingRows({ columns }: { columns: number }) {
  return Array.from({ length: 3 }).map((_, index) => (
    <TableRow key={index}>
      <TableCell>
        <div className="flex items-center gap-3">
          <Skeleton className="size-8 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      </TableCell>
      {Array.from({ length: columns - 1 }).map((__, cellIndex) => (
        <TableCell key={cellIndex}>
          <div className="flex justify-end">
            <Skeleton className="h-4 w-16" />
          </div>
        </TableCell>
      ))}
    </TableRow>
  ))
}

export function LnbPositionsTable({
  title,
  rows,
  type,
  exchangeRate,
  isLoading = false,
  emptyMessage,
}: LnbPositionsTableProps) {
  const isSupplied = type === 'supplied'

  return (
    <div className="rounded-lg border border-border bg-sidebar">
      <div className="border-b border-border px-4 py-3">
        <h2 className="font-semibold">{title}</h2>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Asset</TableHead>
            <TableHead className="text-right">
              {isSupplied ? 'Supplied' : 'Borrowed'}
            </TableHead>
            <TableHead className="text-right">
              {isSupplied ? 'Value' : 'Debt Value'}
            </TableHead>
            <TableHead className="text-right">
              {isSupplied ? 'Supply APY' : 'Borrow APY'}
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            <LoadingRows columns={4} />
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="px-4 py-12 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : isSupplied ? (
            (rows as Array<SuppliedRow>).map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <CryptoAssetAvatar
                      iconUrl={row.iconUrl}
                      symbol={row.symbol}
                      name={row.name}
                    />
                    <div className="min-w-0">
                      <div className="truncate font-medium">{row.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {row.symbol}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {formatTokenAmount(row.suppliedAmount)}
                </TableCell>
                <TableCell className="text-right">
                  {(() => {
                    const valueVnd = convertUsdToVnd(row.valueUsd, exchangeRate)

                    return (
                      <div className="space-y-1">
                        <span
                          className="tooltip-fast block font-medium"
                          data-tooltip={formatUsdDetailed(row.valueUsd)}
                        >
                          {formatUsdDetailed(row.valueUsd)}
                        </span>
                        <span
                          className="tooltip-fast block text-xs text-muted-foreground"
                          data-tooltip={formatCurrency(valueVnd)}
                        >
                          {formatCompact(valueVnd)}
                        </span>
                      </div>
                    )
                  })()}
                </TableCell>
                <TableCell className="text-right">
                  {formatApy(row.supplyApy)}
                </TableCell>
              </TableRow>
            ))
          ) : (
            (rows as Array<BorrowedRow>).map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <CryptoAssetAvatar
                      iconUrl={row.iconUrl}
                      symbol={row.symbol}
                      name={row.name}
                    />
                    <div className="min-w-0">
                      <div className="truncate font-medium">{row.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {row.symbol}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {formatTokenAmount(row.borrowedAmount)}
                </TableCell>
                <TableCell className="text-right">
                  {(() => {
                    const valueVnd = convertUsdToVnd(row.debtValueUsd, exchangeRate)

                    return (
                      <div className="space-y-1">
                        <span
                          className="tooltip-fast block font-medium"
                          data-tooltip={formatUsdDetailed(row.debtValueUsd)}
                        >
                          {formatUsdDetailed(row.debtValueUsd)}
                        </span>
                        <span
                          className="tooltip-fast block text-xs text-muted-foreground"
                          data-tooltip={formatCurrency(valueVnd)}
                        >
                          {formatCompact(valueVnd)}
                        </span>
                      </div>
                    )
                  })()}
                </TableCell>
                <TableCell className="text-right">
                  {formatApy(row.borrowApy)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
