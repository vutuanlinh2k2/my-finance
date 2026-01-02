import { CalendarBlank } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface DateInputProps
  extends Omit<React.ComponentProps<'input'>, 'type' | 'onChange'> {
  value?: string // ISO format: yyyy-mm-dd
  onChange?: (e: { target: { value: string } }) => void
}

/**
 * Formats an ISO date string (yyyy-mm-dd) to dd/mm/yyyy display format
 */
function formatDateDisplay(isoDate: string | undefined): string {
  if (!isoDate) return ''
  const [year, month, day] = isoDate.split('-')
  if (!year || !month || !day) return ''
  return `${day}/${month}/${year}`
}

/**
 * Date input component that displays dates in dd/mm/yyyy format
 * while using the native date picker for selection.
 */
function DateInput({ className, value, onChange, ...props }: DateInputProps) {
  const displayValue = formatDateDisplay(value)

  return (
    <div className={cn('relative', className)}>
      {/* Visible formatted display (behind the input) */}
      <div
        className={cn(
          'dark:bg-input/30 border-input h-8 rounded-none border bg-transparent px-2.5 py-1 text-xs transition-colors md:text-xs w-full min-w-0 flex items-center gap-2 pointer-events-none',
          'hover:border-ring',
          props.disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        <CalendarBlank className="size-4 text-muted-foreground shrink-0" />
        <span className={cn(!displayValue && 'text-muted-foreground')}>
          {displayValue || props.placeholder || 'dd/mm/yyyy'}
        </span>
      </div>
      {/* Native date input on top - transparent text but visible to browser */}
      <input
        type="date"
        value={value ?? ''}
        onChange={onChange}
        className={cn(
          'absolute inset-0 cursor-pointer z-10',
          'bg-transparent border-none outline-none',
          '[color:transparent]',
          '[&::-webkit-calendar-picker-indicator]:cursor-pointer',
          '[&::-webkit-calendar-picker-indicator]:absolute',
          '[&::-webkit-calendar-picker-indicator]:inset-0',
          '[&::-webkit-calendar-picker-indicator]:w-full',
          '[&::-webkit-calendar-picker-indicator]:h-full',
          '[&::-webkit-calendar-picker-indicator]:opacity-0',
        )}
        {...props}
      />
    </div>
  )
}

export { DateInput }
