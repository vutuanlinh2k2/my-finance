import { useState } from 'react'
import { CaretDown, Check } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface MonthSelectProps {
  value: number | null
  onChange: (month: number) => void
  disabled?: boolean
}

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
]

export function MonthSelect({
  value,
  onChange,
  disabled = false,
}: MonthSelectProps) {
  const [isOpen, setIsOpen] = useState(false)

  const selectedMonth = MONTHS.find((m) => m.value === value)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex h-10 w-full items-center justify-between rounded-lg border border-input bg-transparent px-3 text-sm transition-colors hover:bg-muted/50 disabled:opacity-50"
      >
        {selectedMonth ? (
          <span>{selectedMonth.label}</span>
        ) : (
          <span className="text-muted-foreground">Month</span>
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
            {MONTHS.map((month) => (
              <button
                key={month.value}
                type="button"
                onClick={() => {
                  onChange(month.value)
                  setIsOpen(false)
                }}
                className={cn(
                  'flex w-full items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-muted',
                  value === month.value && 'bg-primary/10',
                )}
              >
                <span>{month.label}</span>
                {value === month.value && (
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
