import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PencilSimple, Trash, Plus, Tag as TagIcon } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import {
  type Tag,
  type TagType,
  getTags,
  saveTags,
  generateTagId,
  EXPENSE_EMOJIS,
  INCOME_EMOJIS,
} from '@/lib/tags'

interface ManageTagsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface TagItemProps {
  tag: Tag
  onEdit: (tag: Tag) => void
  onDelete: (id: string) => void
  isEditing: boolean
  editName: string
  editEmoji: string
  onEditNameChange: (name: string) => void
  onEditEmojiChange: (emoji: string) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
}

function TagItem({
  tag,
  onEdit,
  onDelete,
  isEditing,
  editName,
  editEmoji,
  onEditNameChange,
  onEditEmojiChange,
  onSaveEdit,
  onCancelEdit,
}: TagItemProps) {
  const emojis = tag.type === 'expense' ? EXPENSE_EMOJIS : INCOME_EMOJIS

  if (isEditing) {
    return (
      <div className="flex flex-col gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3">
        <div className="flex items-center gap-2">
          <EmojiPicker
            value={editEmoji}
            onChange={onEditEmojiChange}
            emojis={emojis}
          />
          <Input
            value={editName}
            onChange={(e) => onEditNameChange(e.target.value)}
            className="flex-1"
            autoFocus
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="xs" onClick={onCancelEdit}>
            Cancel
          </Button>
          <Button size="xs" onClick={onSaveEdit}>
            Save
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-background p-3">
      <div className="flex items-center gap-3">
        <span className="text-xl">{tag.emoji}</span>
        <span className="text-sm font-medium">{tag.name}</span>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => onEdit(tag)}
          className="text-muted-foreground hover:text-foreground"
        >
          <PencilSimple weight="duotone" className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => onDelete(tag.id)}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash weight="duotone" className="size-4" />
        </Button>
      </div>
    </div>
  )
}

interface EmojiPickerProps {
  value: string
  onChange: (emoji: string) => void
  emojis: string[]
}

function EmojiPicker({ value, onChange, emojis }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex size-10 items-center justify-center rounded-lg border border-border bg-muted text-xl hover:bg-muted/80"
      >
        {value}
      </button>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 z-50 mt-1 grid max-h-32 w-48 grid-cols-5 gap-1 overflow-y-auto rounded-lg border border-border bg-popover p-2 shadow-lg">
            {emojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  onChange(emoji)
                  setIsOpen(false)
                }}
                className={cn(
                  'flex size-8 items-center justify-center rounded text-lg hover:bg-muted',
                  value === emoji && 'bg-primary/20'
                )}
              >
                {emoji}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

interface AddTagFormProps {
  type: TagType
  onAdd: (tag: Omit<Tag, 'id'>) => void
}

function AddTagForm({ type, onAdd }: AddTagFormProps) {
  const emojis = type === 'expense' ? EXPENSE_EMOJIS : INCOME_EMOJIS
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState(emojis[0])

  const handleSubmit = () => {
    if (!name.trim()) return
    onAdd({ name: name.trim(), emoji, type })
    setName('')
    setEmoji(emojis[0])
  }

  return (
    <div className="mt-4">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Add New {type === 'expense' ? 'Expense' : 'Income'} Tag
      </p>
      <div className="flex items-center gap-2">
        <EmojiPicker value={emoji} onChange={setEmoji} emojis={emojis} />
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={
            type === 'expense' ? 'Tag name (e.g. Health)' : 'Tag name (e.g. Gift)'
          }
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleSubmit()
            }
          }}
        />
        <Button size="icon" onClick={handleSubmit} disabled={!name.trim()}>
          <Plus weight="bold" className="size-4" />
        </Button>
      </div>
    </div>
  )
}

export function ManageTagsModal({ open, onOpenChange }: ManageTagsModalProps) {
  const [tags, setTags] = useState<Tag[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editEmoji, setEditEmoji] = useState('')

  // Load tags when modal opens
  useEffect(() => {
    if (open) {
      setTags(getTags())
      setEditingId(null)
    }
  }, [open])

  const expenseTags = tags.filter((t) => t.type === 'expense')
  const incomeTags = tags.filter((t) => t.type === 'income')

  const handleEdit = (tag: Tag) => {
    setEditingId(tag.id)
    setEditName(tag.name)
    setEditEmoji(tag.emoji)
  }

  const handleSaveEdit = () => {
    if (!editingId || !editName.trim()) return
    const editedTag = tags.find((t) => t.id === editingId)
    const updatedTags = tags.map((t) =>
      t.id === editingId ? { ...t, name: editName.trim(), emoji: editEmoji } : t
    )
    setTags(updatedTags)
    saveTags(updatedTags)
    setEditingId(null)
    toast.success(`Tag "${editedTag?.name}" updated`)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditName('')
    setEditEmoji('')
  }

  const handleDelete = (id: string) => {
    const deletedTag = tags.find((t) => t.id === id)
    const updatedTags = tags.filter((t) => t.id !== id)
    setTags(updatedTags)
    saveTags(updatedTags)
    toast.success(`Tag "${deletedTag?.name}" deleted`)
  }

  const handleAdd = (newTag: Omit<Tag, 'id'>) => {
    const updatedTags = [...tags, { ...newTag, id: generateTagId() }]
    setTags(updatedTags)
    saveTags(updatedTags)
    toast.success(`Tag "${newTag.name}" added`)
  }

  const handleClose = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Manage Tags</DialogTitle>
          <DialogDescription>
            Add, edit, or remove tags for your transactions.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6">
          {/* Expense Tags Column */}
          <div className="flex flex-col">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TagIcon weight="duotone" className="size-5 text-rose-500" />
                <span className="text-sm font-semibold uppercase tracking-wide text-rose-500">
                  Expense Tags
                </span>
              </div>
              <span className="rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground">
                {expenseTags.length} items
              </span>
            </div>
            <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1" style={{ maxHeight: '280px' }}>
              {expenseTags.map((tag) => (
                <TagItem
                  key={tag.id}
                  tag={tag}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  isEditing={editingId === tag.id}
                  editName={editName}
                  editEmoji={editEmoji}
                  onEditNameChange={setEditName}
                  onEditEmojiChange={setEditEmoji}
                  onSaveEdit={handleSaveEdit}
                  onCancelEdit={handleCancelEdit}
                />
              ))}
            </div>
            <AddTagForm type="expense" onAdd={handleAdd} />
          </div>

          {/* Income Tags Column */}
          <div className="flex flex-col">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TagIcon weight="duotone" className="size-5 text-emerald-500" />
                <span className="text-sm font-semibold uppercase tracking-wide text-emerald-500">
                  Income Tags
                </span>
              </div>
              <span className="rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground">
                {incomeTags.length} items
              </span>
            </div>
            <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1" style={{ maxHeight: '280px' }}>
              {incomeTags.map((tag) => (
                <TagItem
                  key={tag.id}
                  tag={tag}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  isEditing={editingId === tag.id}
                  editName={editName}
                  editEmoji={editEmoji}
                  onEditNameChange={setEditName}
                  onEditEmojiChange={setEditEmoji}
                  onSaveEdit={handleSaveEdit}
                  onCancelEdit={handleCancelEdit}
                />
              ))}
            </div>
            <AddTagForm type="income" onAdd={handleAdd} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
