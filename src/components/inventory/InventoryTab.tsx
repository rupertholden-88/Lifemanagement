import { useMemo, useState } from 'react'
import { useInventory } from '../../context/InventoryContext'
import { isLowStock } from '../../lib/inventory'
import { InventoryItemRow } from './InventoryItemRow'
import { InventoryItemFormModal } from './InventoryItemFormModal'
import { ShoppingList } from './ShoppingList'
import { SectionTitle, Button, EmptyState } from '../shared/ui'
import type { InventoryCategory, InventoryItem } from '../../types'

type CategoryFilter = 'all' | InventoryCategory

export function InventoryTab() {
  const [view, setView] = useState<'stock' | 'shopping'>('stock')

  return (
    <div>
      <div className="mb-5 flex gap-1 rounded-lg bg-slate-100 p-1 text-sm font-medium">
        <button
          onClick={() => setView('stock')}
          className={`flex-1 rounded-md py-1.5 transition ${view === 'stock' ? 'bg-white text-navy-900 shadow-sm' : 'text-slate-500'}`}
        >
          In stock
        </button>
        <button
          onClick={() => setView('shopping')}
          className={`flex-1 rounded-md py-1.5 transition ${view === 'shopping' ? 'bg-white text-navy-900 shadow-sm' : 'text-slate-500'}`}
        >
          Shopping list
        </button>
      </div>
      {view === 'stock' ? <StockView /> : <ShoppingListView />}
    </div>
  )
}

function ShoppingListView() {
  return (
    <div>
      <SectionTitle title="Shopping list" subtitle="What to buy next" />
      <ShoppingList />
    </div>
  )
}

function StockView() {
  const { items, addItem, updateItem, deleteItem, setStockLevel, adjustQuantity, renameSubcategory } =
    useInventory()
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
      <div className="mb-4 flex items-start justify-between">
        <SectionTitle title="Inventory" subtitle="What's in stock at home — food and household essentials" />
        <Button onClick={openNew}>+ Add item</Button>
      </div>

      {lowStockCount > 0 && (
        <button
          onClick={() => setLowOnly(true)}
          className="mb-4 flex w-full items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left text-sm text-amber-800 hover:bg-amber-100"
        >
          <span className="text-lg">⚠️</span>
          <span>
            <span className="font-medium">{lowStockCount} item{lowStockCount === 1 ? '' : 's'}</span> running low or out —
            tap to filter
          </span>
        </button>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(['all', 'food', 'household'] as CategoryFilter[]).map((c) => (
          <button
            key={c}
            onClick={() => setCategoryFilter(c)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
              categoryFilter === c ? 'bg-navy-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {c === 'all' ? 'All' : c[0].toUpperCase() + c.slice(1)}
          </button>
        ))}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search…"
          className="ml-auto w-40 rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
        />
        <label className="flex items-center gap-1.5 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={lowOnly}
            onChange={(e) => setLowOnly(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
          />
          Low stock only
        </label>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="📦" title="No items found" description="Try a different filter, or add a new item." />
      ) : (
        <div className="space-y-6">
          {grouped.map(([subcategory, groupItems]) => (
            <div key={subcategory}>
              {renaming === subcategory ? (
                <div className="mb-2 flex items-center gap-2">
                  <input
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitRename()
                      if (e.key === 'Escape') setRenaming(null)
                    }}
                    autoFocus
                    className="rounded-lg border border-slate-300 px-2 py-1 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                    aria-label={`Rename ${subcategory}`}
                  />
                  <button onClick={commitRename} className="text-xs font-medium text-teal-700 hover:underline">
                    Save
                  </button>
                  <button onClick={() => setRenaming(null)} className="text-xs text-slate-400 hover:text-slate-600">
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="mb-2 flex items-center gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{subcategory}</p>
                  <button
                    onClick={() => startRename(subcategory)}
                    className="text-xs font-medium text-slate-300 transition hover:text-teal-700"
                    title={`Rename "${subcategory}" everywhere it's used`}
                  >
                    Rename
                  </button>
                </div>
              )}
              <div className="space-y-2">
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
        <InventoryItemFormModal
          open
          onClose={() => setFormOpen(false)}
          onSave={handleSave}
          initial={editing}
          existingSubcategories={subcategories}
        />
      )}
    </div>
  )
}
