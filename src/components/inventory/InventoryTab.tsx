import { useMemo, useState } from 'react'
import { useInventory } from '../../context/InventoryContext'
import { isLowStock } from '../../lib/inventory'
import { InventoryItemRow } from './InventoryItemRow'
import { InventoryItemFormModal } from './InventoryItemFormModal'
import { ShoppingList } from './ShoppingList'
import { Button, Chip, EmptyState, Segmented, TextInput } from '../shared/ui'
import { AlertIcon, StockIcon } from '../shared/icons'
import type { InventoryCategory, InventoryItem } from '../../types'

type CategoryFilter = 'all' | InventoryCategory
type View = 'stock' | 'shopping'

export function InventoryTab() {
  const [view, setView] = useState<View>('stock')

  return (
    <div>
      <p className="mb-2.5 text-[11px] font-semibold tracking-[0.16em] text-accent-700">Food &amp; household</p>
      <h1 className="mb-5 text-[36px] leading-[1.05] font-semibold tracking-[-0.03em] text-ink">Inventory</h1>

      <Segmented
        options={[
          { id: 'stock' as View, label: 'In stock' },
          { id: 'shopping' as View, label: 'Shopping list' },
        ]}
        value={view}
        onChange={setView}
        className="mb-6"
      />

      {view === 'stock' ? <StockView /> : <ShoppingList />}
    </div>
  )
}

function StockView() {
  const { items, addItem, updateItem, deleteItem, setStockLevel, adjustQuantity, renameSubcategory } = useInventory()
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [search, setSearch] = useState('')
  const [lowOnly, setLowOnly] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<InventoryItem | undefined>(undefined)
  const [renaming, setRenaming] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')

  const lowStockCount = items.filter(isLowStock).length

  const filtered = useMemo(() => {
    return items
      .filter((item) => categoryFilter === 'all' || item.category === categoryFilter)
      .filter((item) => !lowOnly || isLowStock(item))
      .filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
  }, [items, categoryFilter, lowOnly, search])

  const grouped = useMemo(() => {
    const groups = new Map<string, InventoryItem[]>()
    for (const item of filtered) {
      const key = item.subcategory || 'Other'
      groups.set(key, [...(groups.get(key) ?? []), item])
    }
    return Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [filtered])

  const subcategories = useMemo(
    () => Array.from(new Set(items.map((i) => i.subcategory || 'Other'))).sort((a, b) => a.localeCompare(b)),
    [items],
  )

  const startRename = (name: string) => {
    setRenaming(name)
    setRenameValue(name)
  }

  const commitRename = () => {
    if (renaming) renameSubcategory(renaming, renameValue)
    setRenaming(null)
  }

  const openNew = () => {
    setEditing(undefined)
    setFormOpen(true)
  }

  const openEdit = (item: InventoryItem) => {
    setEditing(item)
    setFormOpen(true)
  }

  const handleSave = (data: Omit<InventoryItem, 'id'>) => {
    if (editing) updateItem(editing.id, data)
    else addItem(data)
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={openNew}>+ Add item</Button>
      </div>

      {lowStockCount > 0 && (
        <button
          onClick={() => setLowOnly(true)}
          className="mb-4 flex w-full items-center gap-2.5 rounded-full border-2 border-accent-300 bg-accent-100 px-4 py-3 text-left text-sm text-accent-800"
        >
          <AlertIcon width={17} height={17} className="shrink-0" />
          <span>
            <span className="font-semibold">
              {lowStockCount} item{lowStockCount === 1 ? '' : 's'}
            </span>{' '}
            running low or out — tap to filter
          </span>
        </button>
      )}

      <TextInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search inventory…" className="mb-3" />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        {(['all', 'food', 'household'] as CategoryFilter[]).map((c) => (
          <Chip key={c} active={categoryFilter === c} onClick={() => setCategoryFilter(c)}>
            {c === 'all' ? 'All' : c[0].toUpperCase() + c.slice(1)}
          </Chip>
        ))}
        <label className="ml-auto flex min-h-10 items-center gap-2 px-1 text-sm text-neutral-700">
          <input
            type="checkbox"
            checked={lowOnly}
            onChange={(e) => setLowOnly(e.target.checked)}
            className="h-5 w-5 rounded border-2 border-divider accent-accent focus:ring-accent"
          />
          Low stock only
        </label>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<StockIcon width={28} height={28} />} title="No items found" description="Try a different filter, or add a new item." />
      ) : (
        <div className="space-y-6">
          {grouped.map(([subcategory, groupItems]) => (
            <div key={subcategory}>
              {renaming === subcategory ? (
                <div className="mb-2.5 flex items-center gap-2">
                  <TextInput
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitRename()
                      if (e.key === 'Escape') setRenaming(null)
                    }}
                    autoFocus
                    className="flex-1"
                    aria-label={`Rename ${subcategory}`}
                  />
                  <button onClick={commitRename} className="min-h-10 rounded-full px-3 text-xs font-semibold text-accent-700">
                    Save
                  </button>
                  <button onClick={() => setRenaming(null)} className="min-h-10 rounded-full px-3 text-xs text-neutral-500">
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="mb-2.5 flex items-baseline justify-between gap-2.5 border-b-2 border-ink pb-2">
                  <h4 className="text-[12px] font-semibold tracking-[0.14em] text-ink uppercase">{subcategory}</h4>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-neutral-500">
                      {groupItems.length} item{groupItems.length === 1 ? '' : 's'}
                    </span>
                    <button onClick={() => startRename(subcategory)} className="text-xs font-medium text-neutral-400 hover:text-accent-700">
                      Rename
                    </button>
                  </div>
                </div>
              )}
              <div>
                {groupItems.map((item) => (
                  <InventoryItemRow
                    key={item.id}
                    item={item}
                    onAdjustQuantity={(delta) => adjustQuantity(item.id, delta)}
                    onSetLevel={(level) => setStockLevel(item.id, level)}
                    onEdit={() => openEdit(item)}
                    onDelete={() => deleteItem(item.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {formOpen && (
        <InventoryItemFormModal open onClose={() => setFormOpen(false)} onSave={handleSave} initial={editing} existingSubcategories={subcategories} />
      )}
    </div>
  )
}
