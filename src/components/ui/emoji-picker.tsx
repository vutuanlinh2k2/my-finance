import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
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
  const triggerRef = useRef<HTMLButtonElement>(null)
  const pickerRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ top: 0, left: 0 })

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const pickerHeight = 400
    const spaceBelow = window.innerHeight - rect.bottom
    const top =
      spaceBelow >= pickerHeight
        ? rect.bottom + 4
        : rect.top - pickerHeight - 4
    setPosition({ top, left: rect.left })
  }, [])

  useEffect(() => {
    if (!open) return
    updatePosition()

    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node
      if (
        triggerRef.current?.contains(target) ||
        pickerRef.current?.contains(target)
      ) {
        return
      }
      setOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open, updatePosition])

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'flex size-10 items-center justify-center rounded-lg border border-border bg-muted text-xl hover:bg-muted/80',
          className,
        )}
      >
        {value}
      </button>
      {open &&
        createPortal(
          <div
            ref={pickerRef}
            className="pointer-events-auto fixed z-[200]"
            style={{ top: position.top, left: position.left }}
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
          </div>,
          document.body,
        )}
    </>
  )
}
