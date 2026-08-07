import { useState } from 'react'
import { Modal, Button, TextInput, TextArea, Segmented, inputClass } from '../shared/ui'
import type { InventoryCategory, InventoryItem, StockLevel, TrackingMode } from '../../types'
import { STOCK_LEVELS } from '../../types'
import { STOCK_LEVEL_LABEL } from '../../lib/inventory'

interface InventoryItemFormModalProps {
  open: boolean
  onClose: () => void
  onSave: (item: Omit<InventoryItem, 'id'>) => void
  initial?: InventoryItem
  defaultCategory?: InventoryCategory
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
      aliases: aliases.split(',').map((a) => a.trim()).filter(Boolean),
    })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit item' : 'Add inventory item'}>
      <div className="space-y-4">
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs font-medium text-neutral-600">Name</span>
          <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Tinned chopped tomatoes" autoFocus />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">
            <span className="mb-1.5 block text-xs font-medium text-neutral-600">Category</span>
            <select value={category} onChange={(e) => setCategory(e.target.value as InventoryCategory)} className={inputClass}>
              <option value="food">Food</option>
              <option value="household">Household</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1.5 block text-xs font-medium text-neutral-600">Subcategory</span>
            <TextInput value={subcategory} onChange={(e) => setSubcategory(e.target.value)} placeholder="e.g. Pantry" list="hb-subcategories" />
            <datalist id="hb-subcategories">
              {existingSubcategories.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </label>
        </div>

        <label className="block text-sm">
          <span className="mb-1.5 block text-xs font-medium text-neutral-600">How do you want to track this?</span>
          <Segmented
            options={[
              { id: 'quantity' as TrackingMode, label: 'Exact count' },
              { id: 'level' as TrackingMode, label: 'Low / medium / high' },
            ]}
            value={trackingMode}
            onChange={setTrackingMode}
          />
        </label>

        {trackingMode === 'quantity' ? (
          <div className="grid grid-cols-3 gap-3">
            <label className="text-sm">
              <span className="mb-1.5 block text-xs font-medium text-neutral-600">Quantity</span>
              <TextInput type="number" min={0} value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            </label>
            <label className="text-sm">
              <span className="mb-1.5 block text-xs font-medium text-neutral-600">Unit</span>
              <TextInput value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="tins" />
            </label>
            <label className="text-sm">
              <span className="mb-1.5 block text-xs font-medium text-neutral-600">Low at</span>
              <TextInput type="number" min={0} value={lowThreshold} onChange={(e) => setLowThreshold(e.target.value)} />
            </label>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm">
              <span className="mb-1.5 block text-xs font-medium text-neutral-600">Current level</span>
              <select value={stockLevel} onChange={(e) => setStockLevel(e.target.value as StockLevel)} className={inputClass}>
                {STOCK_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {STOCK_LEVEL_LABEL[lvl]}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1.5 block text-xs font-medium text-neutral-600">Unit</span>
              <TextInput value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="rolls" />
            </label>
          </div>
        )}

        <label className="block text-sm">
          <span className="mb-1.5 block text-xs font-medium text-neutral-600">Also matches (optional)</span>
          <TextInput value={aliases} onChange={(e) => setAliases(e.target.value)} placeholder="passata, plum tomatoes" />
          <span className="mt-1 block text-xs text-neutral-500">
            Extra names to recognise in recipe ingredients, comma separated. Use this when a recipe calls something by a different name than you do.
          </span>
        </label>

        <label className="block text-sm">
          <span className="mb-1.5 block text-xs font-medium text-neutral-600">Amazon reorder link (optional)</span>
          <TextInput value={amazonUrl} onChange={(e) => setAmazonUrl(e.target.value)} placeholder="https://www.amazon.co.uk/..." />
        </label>

        <label className="block text-sm">
          <span className="mb-1.5 block text-xs font-medium text-neutral-600">Notes</span>
          <TextArea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
        </label>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save</Button>
      </div>
    </Modal>
  )
}
