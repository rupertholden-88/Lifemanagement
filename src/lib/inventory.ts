import type { InventoryItem, StockLevel } from '../types'

/** Normalises quantity- and level-tracked items to a single low/medium/high/out reading. */
export function getEffectiveLevel(item: InventoryItem): StockLevel {
  if (item.trackingMode === 'level') {
    return item.stockLevel ?? 'medium'
  }
  const qty = item.quantity ?? 0
  const low = item.lowThreshold ?? 1
  if (qty <= 0) return 'out'
  if (qty <= low) return 'low'
  if (qty <= low * 2) return 'medium'
  return 'high'
}

export function isLowStock(item: InventoryItem): boolean {
  const level = getEffectiveLevel(item)
  return level === 'out' || level === 'low'
}

export const STOCK_LEVEL_LABEL: Record<StockLevel, string> = {
  out: 'Out of stock',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

export const STOCK_LEVEL_COLOR: Record<StockLevel, string> = {
  out: 'bg-red-100 text-red-700 ring-red-600/20',
  low: 'bg-amber-100 text-amber-700 ring-amber-600/20',
  medium: 'bg-sky-100 text-sky-700 ring-sky-600/20',
  high: 'bg-emerald-100 text-emerald-700 ring-emerald-600/20',
}

export function describeQuantity(item: InventoryItem): string {
  if (item.trackingMode === 'quantity') {
    const unit = item.unit ? ` ${item.unit}` : ''
    return `${item.quantity ?? 0}${unit}`
  }
  return STOCK_LEVEL_LABEL[item.stockLevel ?? 'medium']
}

/** Case-insensitive match of a meal ingredient name against an inventory item name. */
export function ingredientMatchesItem(ingredient: string, itemName: string): boolean {
  const a = ingredient.trim().toLowerCase()
  const b = itemName.trim().toLowerCase()
  return a === b || a.includes(b) || b.includes(a)
}

export function findInventoryItem(ingredient: string, items: InventoryItem[]): InventoryItem | undefined {
  return items.find((i) => ingredientMatchesItem(ingredient, i.name))
}
