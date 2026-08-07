import { createContext, useContext, type ReactNode } from 'react'
import { useSyncedList } from '../hooks/useSyncedList'
import { useAuth } from './AuthContext'
import { SEED_INVENTORY } from '../data/seedInventory'
import type { InventoryItem, StockLevel } from '../types'

interface InventoryContextValue {
  items: InventoryItem[]
  addItem: (item: Omit<InventoryItem, 'id'>) => void
  updateItem: (id: string, updates: Partial<InventoryItem>) => void
  deleteItem: (id: string) => void
  setStockLevel: (id: string, level: StockLevel) => void
  adjustQuantity: (id: string, delta: number) => void
  /** Used when logging a cooked meal — steps a level down or removes one unit of quantity. */
  decrementForUsage: (id: string) => void
  /** Used when shopping — refills a quantity item above its low threshold, or sets a level item to high. */
  restockItem: (id: string) => void
  /** Renames a subcategory across every item that uses it, in one write. */
  renameSubcategory: (from: string, to: string) => void
}

const InventoryContext = createContext<InventoryContextValue | null>(null)

const LEVEL_STEP_DOWN: Record<StockLevel, StockLevel> = {
  high: 'medium',
  medium: 'low',
  low: 'out',
  out: 'out',
}

export function InventoryProvider({ children }: { children: ReactNode }) {
  const { uid } = useAuth()
  const { items, set: setItem, setMany, remove: removeItem } = useSyncedList<InventoryItem>(
    'hb.inventory.items',
    'inventory',
    uid,
    SEED_INVENTORY,
  )

  const addItem: InventoryContextValue['addItem'] = (item) => {
    setItem({ ...item, id: `inv-${Date.now()}` })
  }

  const updateItem = (id: string, updates: Partial<InventoryItem>) => {
    const existing = items.find((i) => i.id === id)
    if (!existing) return
    setItem({ ...existing, ...updates })
  }

  const deleteItem = (id: string) => removeItem(id)

  const setStockLevel = (id: string, level: StockLevel) => {
    const existing = items.find((i) => i.id === id)
    if (!existing) return
    setItem({ ...existing, stockLevel: level })
  }

  const adjustQuantity = (id: string, delta: number) => {
    const existing = items.find((i) => i.id === id)
    if (!existing) return
    const next = Math.max(0, (existing.quantity ?? 0) + delta)
    setItem({ ...existing, quantity: next })
  }

  const decrementForUsage = (id: string) => {
    const existing = items.find((i) => i.id === id)
    if (!existing) return
    if (existing.trackingMode === 'quantity') {
      setItem({ ...existing, quantity: Math.max(0, (existing.quantity ?? 0) - 1) })
    } else {
      const current = existing.stockLevel ?? 'medium'
      setItem({ ...existing, stockLevel: LEVEL_STEP_DOWN[current] })
    }
  }

  const restockItem = (id: string) => {
    const existing = items.find((i) => i.id === id)
    if (!existing) return
    if (existing.trackingMode === 'quantity') {
      const threshold = existing.lowThreshold ?? 0
      const refill = Math.max(threshold * 2, threshold + 2, 2)
      setItem({ ...existing, quantity: refill })
    } else {
      setItem({ ...existing, stockLevel: 'high' })
    }
  }

  const renameSubcategory = (from: string, to: string) => {
    const trimmed = to.trim()
    if (!trimmed || trimmed === from) return
    const affected = items
      .filter((i) => (i.subcategory || 'Other') === from)
      .map((i) => ({ ...i, subcategory: trimmed }))
    if (affected.length > 0) setMany(affected)
  }

  const value: InventoryContextValue = {
    items,
    addItem,
    updateItem,
    deleteItem,
    setStockLevel,
    adjustQuantity,
    decrementForUsage,
    restockItem,
    renameSubcategory,
  }

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>
}

export function useInventory() {
  const ctx = useContext(InventoryContext)
  if (!ctx) throw new Error('useInventory must be used within InventoryProvider')
  return ctx
}
