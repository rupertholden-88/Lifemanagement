import { useState } from 'react'
import { Modal, Button } from '../shared/ui'
import type { InventoryCategory, InventoryItem, StockLevel, TrackingMode } from '../../types'
import { STOCK_LEVELS } from '../../types'
import { STOCK_LEVEL_LABEL } from '../../lib/inventory'

interface InventoryItemFormModalProps {
  open: boolean
  onClose: () => void
  onSave: (item: Omit<InventoryItem, 'id'>) => void
  initial?: InventoryItem
  defaultCategory?: InventoryCategory
  /** Subcategories already in use, offered as suggestions to avoid near-duplicates. */
  existingSubcategories?: string[]
}

export function InventoryItemFormModal({
  open,
  onClose,
  onSave,
  initial,
  defaultCategory,
  existingSubcategories = [],
}: InventoryItemFormModalProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [category, setCategory] = useState<InventoryCategory>(initial?.category ?? defaultCategory ?? 'food')
  const [subcategory, setSubcategory] = useState(initial?.subcategory ?? '')
  const [unit, setUnit] = useState(initial?.unit ?? '')
  const [trackingMode, setTrackingMode] = useState<TrackingMode>(initial?.trackingMode ?? 'quantity')
  const [quantity, setQuantity] = useState(initial?.quantity?.toString() ?? '1')
  const [lowThreshold, setLowThreshold] = useState(initial?.lowThreshold?.toString() ?? '1')
  const [stockLevel, setStockLevel] = useState<StockLevel>(initial?.stockLevel ?? 'medium')
  const [amazonUrl, setAmazonUrl] = useState(initial?.amazonUrl ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [aliases, setAliases] = useState((initial?.aliases ?? []).join(', '))

  if (!open) return null

  const handleSave = () => {
    if (!name.trim()) return
    onSave({
      name: name.trim(),
      category,
      subcategory: subcategory || undefined,
      unit: unit || undefined,
      trackingMode,
      quantity: trackingMode === 'quantity' ? Number(quantity) || 0 : undefined,
      lowThreshold: trackingMode === 'quantity' ? Number(lowThreshold) || 1 : undefined,
      stockLevel: trackingMode === 'level' ? stockLevel : undefined,
      amazonUrl: amazonUrl || undefined,
      notes: notes || undefined,
      aliases: aliases
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean),
    })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit item' : 'Add inventory item'}>
      <div className="space-y-3">
        <label className="block text-sm">
          <span className="mb-1 block text-xs font-medium text-slate-600">Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
            placeholder="e.g. Tinned chopped tomatoes"
            autoFocus
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">
            <span className="mb-1 block text-xs font-medium text-slate-600">Category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as InventoryCategory)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="food">Food</option>
              <option value="household">Household</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-xs font-medium text-slate-600">Subcategory</span>
            <input
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="e.g. Pantry"
              list="hb-subcategories"
            />
            <datalist id="hb-subcategories">
              {existingSubcategories.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </label>
        </div>

        <label className="block text-sm">
          <span className="mb-1 block text-xs font-medium text-slate-600">How do you want to track this?</span>
          <div className="flex gap-1 rounded-lg bg-slate-100 p-1 text-sm font-medium">
            <button
              type="button"
              onClick={() => setTrackingMode('quantity')}
              className={`flex-1 rounded-md py-1.5 transition ${trackingMode === 'quantity' ? 'bg-white text-navy-900 shadow-sm' : 'text-slate-500'}`}
            >
              Exact count
            </button>
            <button
              type="button"
              onClick={() => setTrackingMode('level')}
              className={`flex-1 rounded-md py-1.5 transition ${trackingMode === 'level' ? 'bg-white text-navy-900 shadow-sm' : 'text-slate-500'}`}
            >
              Low / medium / high
            </button>
          </div>
        </label>

        {trackingMode === 'quantity' ? (
          <div className="grid grid-cols-3 gap-3">
            <label className="text-sm">
              <span className="mb-1 block text-xs font-medium text-slate-600">Quantity</span>
              <input
                type="number"
                min={0}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-xs font-medium text-slate-600">Unit</span>
              <input
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="tins"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-xs font-medium text-slate-600">Low at</span>
              <input
                type="number"
                min={0}
                value={lowThreshold}
                onChange={(e) => setLowThreshold(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm">
              <span className="mb-1 block text-xs font-medium text-slate-600">Current level</span>
              <select
                value={stockLevel}
                onChange={(e) => setStockLevel(e.target.value as StockLevel)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                {STOCK_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {STOCK_LEVEL_LABEL[lvl]}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-xs font-medium text-slate-600">Unit</span>
              <input
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="rolls"
              />
            </label>
          </div>
        )}

        <label className="block text-sm">
          <span className="mb-1 block text-xs font-medium text-slate-600">
            Also matches (optional)
          </span>
          <input
            value={aliases}
            onChange={(e) => setAliases(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
            placeholder="passata, plum tomatoes"
          />
          <span className="mt-1 block text-xs text-slate-400">
            Extra names to recognise in recipe ingredients, comma separated. Use this when a recipe
            calls something by a different name than you do.
          </span>
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-xs font-medium text-slate-600">Amazon reorder link (optional)</span>
          <input
            value={amazonUrl}
            onChange={(e) => setAmazonUrl(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="https://www.amazon.co.uk/..."
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-xs font-medium text-slate-600">Notes</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
          />
        </label>
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save</Button>
      </div>
    </Modal>
  )
}
