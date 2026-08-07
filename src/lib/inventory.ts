import type { InventoryItem, StockLevel } from '../types'
import { ingredientMatchesName } from './ingredientMatch'

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

export function describeQuantity(item: InventoryItem): string {
  if (item.trackingMode === 'quantity') {
    const unit = item.unit ? ` ${item.unit}` : ''
    return `${item.quantity ?? 0}${unit}`
  }
  return STOCK_LEVEL_LABEL[item.stockLevel ?? 'medium']
}

/** Case-insensitive match of a meal ingredient name against an inventory item name. */
export function ingredientMatchesItem(ingredient: string, itemName: string): boolean {
  return ingredientMatchesName(ingredient, itemName)
}

/** True if the ingredient matches the item's name or any of its manual aliases. */
export function itemMatchesIngredient(item: InventoryItem, ingredient: string): boolean {
  if (ingredientMatchesName(ingredient, item.name)) return true
  return (item.aliases ?? []).some((alias) => ingredientMatchesName(ingredient, alias))
}

/**
 * The inventory item a recipe ingredient refers to. Several items can match a
 * loose ingredient ("1 onion" matches both Onion and Red onion), so an in-stock
 * match is preferred over one that has run out.
 */
export function findInventoryItem(ingredient: string, items: InventoryItem[]): InventoryItem | undefined {
  const matches = items.filter((i) => itemMatchesIngredient(i, ingredient))
  if (matches.length === 0) return undefined
  return matches.find((i) => getEffectiveLevel(i) !== 'out') ?? matches[0]
}
