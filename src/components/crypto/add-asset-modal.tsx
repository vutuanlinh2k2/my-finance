import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Check, MagnifyingGlass, SpinnerGap } from '@phosphor-icons/react'
import type { CreateCryptoAssetInput } from '@/lib/api/crypto-assets'
import { useCoinGeckoSearch } from '@/lib/hooks/use-coingecko'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface AddAssetModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: CreateCryptoAssetInput) => Promise<void>
  isSubmitting?: boolean
}

export function AddAssetModal({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting: externalIsSubmitting = false,
}: AddAssetModalProps) {
  const [internalIsSubmitting, setInternalIsSubmitting] = useState(false)
  const isSubmitting = externalIsSubmitting || internalIsSubmitting

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  // Form state
  const [selectedCoin, setSelectedCoin] = useState<{
    id: string
    name: string
    symbol: string
    thumb: string
  } | null>(null)
  const [name, setName] = useState('')
  const [symbol, setSymbol] = useState('')
  const [iconUrl, setIconUrl] = useState('')

  // Search coins with debounce
  const {
    data: searchResults = [],
    isLoading: isSearching,
    error: searchError,
  } = useCoinGeckoSearch(debouncedQuery, debouncedQuery.length >= 2)

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setSearchQuery('')
      setDebouncedQuery('')
      setSelectedCoin(null)
      setName('')
      setSymbol('')
      setIconUrl('')
      setInternalIsSubmitting(false)
    }
  }, [open])

  // Auto-fill form when coin is selected
  const handleSelectCoin = (coin: {
    id: string
    name: string
    symbol: string
    thumb: string
  }) => {
    setSelectedCoin(coin)
    setName(coin.name)
    setSymbol(coin.symbol.toUpperCase())
    setIconUrl(coin.thumb)
    setSearchQuery('')
    setDebouncedQuery('')
  }

  const handleSubmit = async () => {
    if (!selectedCoin) {
      toast.error('Please select a cryptocurrency')
      return
    }

    if (!name.trim()) {
      toast.error('Please enter a name')
      return
    }

    if (!symbol.trim()) {
      toast.error('Please enter a symbol')
      return
    }

    setInternalIsSubmitting(true)

    try {
      const input: CreateCryptoAssetInput = {
        coingecko_id: selectedCoin.id,
        name: name.trim(),
        symbol: symbol.trim().toUpperCase(),
        icon_url: iconUrl || null,
      }

      await onSubmit(input)
      onOpenChange(false)
    } catch {
      // Error handling is done by parent
    } finally {
      setInternalIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Crypto Asset</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Search Input */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Search Cryptocurrency
            </label>
            <div className="relative">
              <MagnifyingGlass className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or symbol..."
                className="h-10 rounded-lg pl-9 text-sm"
                disabled={isSubmitting}
              />
              {isSearching && (
                <SpinnerGap className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
              )}
            </div>

            {/* Search Results */}
            {debouncedQuery.length >= 2 && !isSearching && (
              <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-border bg-background">
                {searchError ? (
                  <div className="p-3 text-center text-sm text-destructive">
                    {searchError instanceof Error
                      ? searchError.message
                      : 'Failed to search'}
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="p-3 text-center text-sm text-muted-foreground">
                    No results found
                  </div>
                ) : (
                  <ul className="divide-y divide-border">
                    {searchResults.map((coin) => (
                      <li key={coin.id}>
                        <button
                          type="button"
                          onClick={() => handleSelectCoin(coin)}
                          className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-muted/50"
                          disabled={isSubmitting}
                        >
                          <img
                            src={coin.thumb}
                            alt={coin.name}
                            className="size-6 rounded-full"
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium">
                              {coin.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {coin.symbol.toUpperCase()}
                            </div>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Selected Coin Preview */}
          {selectedCoin && (
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
              {iconUrl && (
                <img
                  src={iconUrl}
                  alt={name}
                  className="size-8 rounded-full"
                />
              )}
              <div className="flex-1">
                <div className="text-sm font-medium">{name}</div>
                <div className="text-xs text-muted-foreground">{symbol}</div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedCoin(null)
                  setName('')
                  setSymbol('')
                  setIconUrl('')
                }}
                disabled={isSubmitting}
              >
                Change
              </Button>
            </div>
          )}

          {/* Manual Input Fields (hidden when coin is selected, shown for edge cases) */}
          {selectedCoin && (
            <>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Bitcoin"
                  className="h-10 rounded-lg text-sm"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Symbol
                </label>
                <Input
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  placeholder="e.g. BTC"
                  className="h-10 rounded-lg text-sm"
                  disabled={isSubmitting}
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="gap-2"
            disabled={isSubmitting || !selectedCoin}
          >
            {isSubmitting ? (
              <SpinnerGap className="size-4 animate-spin" />
            ) : (
              <Check weight="bold" className="size-4" />
            )}
            Add Asset
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
