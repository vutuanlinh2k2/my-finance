import { useState } from 'react'
import { CaretDown, Check } from '@phosphor-icons/react'
import type { Tag } from '@/lib/api/tags'
import { cn } from '@/lib/utils'

interface TagSelectProps {
  value: string | null
  onChange: (tagId: string | null) => void
  tags: Array<Tag>
  disabled?: boolean
  placeholder?: string
}

export function TagSelect({
  value,
  onChange,
  tags,
  disabled = false,
  placeholder = 'Select Tag',
}: TagSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selectedTag = tags.find((t) => t.id === value)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex h-10 w-full items-center justify-between rounded-lg border border-input bg-transparent px-3 text-sm transition-colors hover:bg-muted/50 disabled:opacity-50"
      >
        {selectedTag ? (
          <span className="flex items-center gap-2">
            <span>{selectedTag.emoji}</span>
            <span className="truncate">{selectedTag.name}</span>
          </span>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
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
            {tags.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No tags available
              </div>
            ) : (
              <>
                {/* Option to clear selection */}
                <button
                  type="button"
                  onClick={() => {
                    onChange(null)
                    setIsOpen(false)
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
                >
                  No tag
                </button>
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => {
                      onChange(tag.id)
                      setIsOpen(false)
                    }}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted',
                      value === tag.id && 'bg-primary/10',
                    )}
                  >
                    <span>{tag.emoji}</span>
                    <span className="flex-1 truncate text-left">
                      {tag.name}
                    </span>
                    {value === tag.id && (
                      <Check weight="bold" className="size-4 text-primary" />
                    )}
                  </button>
                ))}
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
