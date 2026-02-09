import { useState } from 'react'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { Popover as PopoverPrimitive } from 'radix-ui'
import { useTheme } from '@/components/theme-provider'
import { cn } from '@/lib/utils'

interface EmojiPickerProps {
  value: string
  onChange: (emoji: string) => void
  className?: string
}

export function EmojiPicker({ value, onChange, className }: EmojiPickerProps) {
  const [open, setOpen] = useState(false)
  const { resolvedTheme } = useTheme()

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          className={cn(
            'flex size-10 items-center justify-center rounded-lg border border-border bg-muted text-xl hover:bg-muted/80',
            className,
          )}
        >
          {value}
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          side="bottom"
          align="start"
          sideOffset={4}
          className="z-[200]"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Picker
            data={data}
            theme={resolvedTheme}
            onEmojiSelect={(emoji: { native: string }) => {
              onChange(emoji.native)
              setOpen(false)
            }}
            previewPosition="none"
            skinTonePosition="search"
            maxFrequentRows={2}
            perLine={8}
          />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
