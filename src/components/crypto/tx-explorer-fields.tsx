import type { TxExplorerMode } from '@/lib/crypto/use-tx-explorer'
import { BLOCKCHAIN_EXPLORERS, buildExplorerUrl } from '@/lib/crypto/chains'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface TxExplorerFieldsProps {
  txId: string
  onTxIdChange: (value: string) => void
  mode: TxExplorerMode
  onModeChange: (mode: TxExplorerMode) => void
  selectedChain: string
  onSelectedChainChange: (chainId: string) => void
  rawUrl: string
  onRawUrlChange: (url: string) => void
  disabled?: boolean
}

export function TxExplorerFields({
  txId,
  onTxIdChange,
  mode,
  onModeChange,
  selectedChain,
  onSelectedChainChange,
  rawUrl,
  onRawUrlChange,
  disabled = false,
}: TxExplorerFieldsProps) {
  const generatedUrl =
    mode === 'generated' && selectedChain && txId.trim()
      ? buildExplorerUrl(selectedChain, txId)
      : null

  return (
    <>
      {/* TX ID */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">TX ID</label>
        <Input
          value={txId}
          onChange={(e) => onTxIdChange(e.target.value)}
          placeholder="Transaction hash (optional)"
          className="h-10"
          disabled={disabled}
        />
      </div>

      {/* TX Explorer URL */}
      <div className="min-w-0">
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-sm font-medium">TX Explorer URL</label>
          <div className="inline-flex rounded-lg bg-muted p-0.5">
            <button
              type="button"
              onClick={() => onModeChange('raw')}
              className={cn(
                'rounded-md px-2 py-1 text-xs font-medium transition-colors',
                mode === 'raw'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
              disabled={disabled}
            >
              Raw
            </button>
            <button
              type="button"
              onClick={() => onModeChange('generated')}
              className={cn(
                'rounded-md px-2 py-1 text-xs font-medium transition-colors',
                mode === 'generated'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
              disabled={disabled}
            >
              Generated
            </button>
          </div>
        </div>

        {mode === 'raw' ? (
          <Input
            value={rawUrl}
            onChange={(e) => onRawUrlChange(e.target.value)}
            placeholder="https://... (optional)"
            className="h-10"
            disabled={disabled}
          />
        ) : (
          <div className="flex min-w-0 flex-col gap-1.5">
            <select
              value={selectedChain}
              onChange={(e) => onSelectedChainChange(e.target.value)}
              disabled={disabled}
              className={cn(
                'h-10 w-full rounded-lg border border-border bg-background px-3 text-sm',
                'focus:outline-none focus:ring-2 focus:ring-primary',
                'disabled:cursor-not-allowed disabled:opacity-50',
              )}
            >
              <option value="">Select chain</option>
              {BLOCKCHAIN_EXPLORERS.map((chain) => (
                <option key={chain.id} value={chain.id}>
                  {chain.name}
                </option>
              ))}
            </select>
            {generatedUrl && (
              <p className="truncate text-xs text-muted-foreground">
                {generatedUrl}
              </p>
            )}
            {selectedChain && !txId.trim() && (
              <p className="text-xs text-amber-600">
                TX hash required to generate explorer URL
              </p>
            )}
          </div>
        )}
      </div>
    </>
  )
}
