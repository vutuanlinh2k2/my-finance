import { CaretLeft, CaretRight } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'

interface PeriodNavigatorProps {
  label: string
  onPrevious: () => void
  onNext: () => void
  canGoNext: boolean
}

export function PeriodNavigator({
  label,
  onPrevious,
  onNext,
  canGoNext,
}: PeriodNavigatorProps) {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="icon-sm"
        onClick={onPrevious}
        className="bg-background"
      >
        <CaretLeft weight="bold" className="size-4" />
      </Button>
      <div className="min-w-[90px] rounded-md border border-border bg-background px-3 py-1.5 text-center text-sm font-medium">
        {label}
      </div>
      <Button
        variant="outline"
        size="icon-sm"
        onClick={onNext}
        disabled={!canGoNext}
        className="bg-background"
      >
        <CaretRight weight="bold" className="size-4" />
      </Button>
    </div>
  )
}
