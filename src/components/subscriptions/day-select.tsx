import { useState } from 'react'
import { CaretDown, Check } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface DaySelectProps {
  value: number | null
  onChange: (day: number) => void
  disabled?: boolean
}

export function DaySelect({
  value,
  onChange,
  disabled = false,
}: DaySelectProps) {
  const [isOpen, setIsOpen] = useState(false)

  const days = Array.from({ length: 31 }, (_, i) => i + 1)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex h-10 w-full items-center justify-between rounded-lg border border-input bg-transparent px-3 text-sm transition-colors hover:bg-muted/50 disabled:opacity-50"
      >
        {value !== null ? (
          <span>{value}</span>
        ) : (
          <span className="text-muted-foreground">Day</span>
        )}
        <CaretDown
          weight="bold"
          className={cn(
            'size-4 text-muted-foreground transition-transform',
            isOpen && 'rotate-180',
          )}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-border bg-popover p-1 shadow-lg">
            {days.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => {
                  onChange(day)
                  setIsOpen(false)
                }}
                className={cn(
                  'flex w-full items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-muted',
                  value === day && 'bg-primary/10',
                )}
              >
                <span>{day}</span>
                {value === day && (
                  <Check weight="bold" className="size-4 text-primary" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
