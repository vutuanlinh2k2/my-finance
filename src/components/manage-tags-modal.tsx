import { useState } from 'react'
import { toast } from 'sonner'
import {
  PencilSimple,
  Plus,
  SpinnerGap,
  Tag as TagIcon,
  Trash,
} from '@phosphor-icons/react'
import type { Tag, TagType } from '@/lib/hooks/use-tags'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  useCreateTag,
  useDeleteTag,
  useTags,
  useUpdateTag,
} from '@/lib/hooks/use-tags'
import { EXPENSE_EMOJIS, INCOME_EMOJIS } from '@/lib/tags'

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
  isSaving: boolean
  isDeleting: boolean
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
  isSaving,
  isDeleting,
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
            disabled={isSaving}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="xs"
            onClick={onCancelEdit}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button size="xs" onClick={onSaveEdit} disabled={isSaving}>
            {isSaving ? <SpinnerGap className="size-4 animate-spin" /> : 'Save'}
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
          disabled={isDeleting}
        >
          <PencilSimple weight="duotone" className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => onDelete(tag.id)}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          disabled={isDeleting}
        >
          {isDeleting ? (
            <SpinnerGap className="size-4 animate-spin" />
          ) : (
            <Trash weight="duotone" className="size-4" />
          )}
        </Button>
      </div>
    </div>
  )
}

interface EmojiPickerProps {
  value: string
  onChange: (emoji: string) => void
  emojis: Array<string>
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
                  value === emoji && 'bg-primary/20',
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
  onAdd: (name: string, emoji: string, type: TagType) => void
  isAdding: boolean
}

function AddTagForm({ type, onAdd, isAdding }: AddTagFormProps) {
  const emojis = type === 'expense' ? EXPENSE_EMOJIS : INCOME_EMOJIS
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState(emojis[0])

  const handleSubmit = () => {
    if (!name.trim() || isAdding) return
    onAdd(name.trim(), emoji, type)
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
            type === 'expense'
              ? 'Tag name (e.g. Health)'
              : 'Tag name (e.g. Gift)'
          }
          className="flex-1"
          disabled={isAdding}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleSubmit()
            }
          }}
        />
        <Button
          size="icon"
          onClick={handleSubmit}
          disabled={!name.trim() || isAdding}
        >
          {isAdding ? (
            <SpinnerGap className="size-4 animate-spin" />
          ) : (
            <Plus weight="bold" className="size-4" />
          )}
        </Button>
      </div>
    </div>
  )
}

export function ManageTagsModal({ open, onOpenChange }: ManageTagsModalProps) {
  const { data: tags = [], isLoading } = useTags()
  const createMutation = useCreateTag()
  const updateMutation = useUpdateTag()
  const deleteMutation = useDeleteTag()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editEmoji, setEditEmoji] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [addingType, setAddingType] = useState<TagType | null>(null)

  const expenseTags = tags.filter((t) => t.type === 'expense')
  const incomeTags = tags.filter((t) => t.type === 'income')

  const handleEdit = (tag: Tag) => {
    setEditingId(tag.id)
    setEditName(tag.name)
    setEditEmoji(tag.emoji)
  }

  const handleSaveEdit = async () => {
    if (!editingId || !editName.trim()) return
    const editedTag = tags.find((t) => t.id === editingId)

    try {
      await updateMutation.mutateAsync({
        id: editingId,
        updates: { name: editName.trim(), emoji: editEmoji },
      })
      toast.success(`Tag "${editedTag?.name}" updated`)
      setEditingId(null)
    } catch (error) {
      console.error('Failed to update tag:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to update tag',
      )
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditName('')
    setEditEmoji('')
  }

  const handleDelete = async (id: string) => {
    const deletedTag = tags.find((t) => t.id === id)
    setDeletingId(id)

    try {
      await deleteMutation.mutateAsync(id)
      toast.success(`Tag "${deletedTag?.name}" deleted`)
    } catch (error) {
      console.error('Failed to delete tag:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete tag',
      )
    } finally {
      setDeletingId(null)
    }
  }

  const handleAdd = async (name: string, emoji: string, type: TagType) => {
    setAddingType(type)

    try {
      await createMutation.mutateAsync({ name, emoji, type })
      toast.success(`Tag "${name}" added`)
    } catch (error) {
      console.error('Failed to add tag:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to add tag',
      )
    } finally {
      setAddingType(null)
    }
  }

  const handleClose = () => {
    setEditingId(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Manage Tags</DialogTitle>
          <DialogDescription>
            Add, edit, or remove tags for your transactions.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <SpinnerGap className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
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
              <div
                className="flex min-h-0 max-h-[280px] flex-1 flex-col gap-2 overflow-y-auto pr-1"
              >
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
                    isSaving={updateMutation.isPending && editingId === tag.id}
                    isDeleting={deletingId === tag.id}
                  />
                ))}
              </div>
              <AddTagForm
                type="expense"
                onAdd={handleAdd}
                isAdding={addingType === 'expense'}
              />
            </div>

            {/* Income Tags Column */}
            <div className="flex flex-col">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TagIcon
                    weight="duotone"
                    className="size-5 text-emerald-500"
                  />
                  <span className="text-sm font-semibold uppercase tracking-wide text-emerald-500">
                    Income Tags
                  </span>
                </div>
                <span className="rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground">
                  {incomeTags.length} items
                </span>
              </div>
              <div
                className="flex min-h-0 max-h-[280px] flex-1 flex-col gap-2 overflow-y-auto pr-1"
              >
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
                    isSaving={updateMutation.isPending && editingId === tag.id}
                    isDeleting={deletingId === tag.id}
                  />
                ))}
              </div>
              <AddTagForm
                type="income"
                onAdd={handleAdd}
                isAdding={addingType === 'income'}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
