import { useEffect, useState, type CSSProperties } from 'react'
import { cn } from '@/lib/utils'

interface CryptoAssetAvatarProps {
  iconUrl?: string | null
  symbol: string
  name: string
  className?: string
  fallbackClassName?: string
  fallbackStyle?: CSSProperties
}

export function CryptoAssetAvatar({
  iconUrl,
  symbol,
  name,
  className,
  fallbackClassName,
  fallbackStyle,
}: CryptoAssetAvatarProps) {
  const [hasImageError, setHasImageError] = useState(false)

  useEffect(() => {
    setHasImageError(false)
  }, [iconUrl])

  if (iconUrl && !hasImageError) {
    return (
      <img
        src={iconUrl}
        alt={name}
        className={cn('size-8 rounded-full', className)}
        onError={() => setHasImageError(true)}
      />
    )
  }

  return (
    <div
      className={cn(
        'flex size-8 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground',
        className,
        fallbackClassName,
      )}
      style={fallbackStyle}
      aria-hidden="true"
    >
      {symbol.slice(0, 2).toUpperCase()}
    </div>
  )
}
