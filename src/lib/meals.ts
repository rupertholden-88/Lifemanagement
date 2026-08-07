import type { InventoryItem, Meal } from '../types'
import { getEffectiveLevel, ingredientMatchesItem } from './inventory'

export interface MealAvailability {
  matched: string[]
  missing: string[]
  ratio: number // 0..1, fraction of ingredients in stock
}

export function checkMealAvailability(meal: Meal, inventory: InventoryItem[]): MealAvailability {
  if (meal.ingredients.length === 0) {
    return { matched: [], missing: [], ratio: 1 }
  }
  const matched: string[] = []
  const missing: string[] = []

  for (const ingredient of meal.ingredients) {
    const item = inventory.find((i) => ingredientMatchesItem(ingredient, i.name))
    const inStock = item ? getEffectiveLevel(item) !== 'out' : false
    if (inStock) matched.push(ingredient)
    else missing.push(ingredient)
  }

  return { matched, missing, ratio: matched.length / meal.ingredients.length }
}

/** Ranks meals of a given type by liked-first, then how much of the pantry already covers them. */
export function suggestMeals(
  meals: Meal[],
  inventory: InventoryItem[],
  options: { type?: Meal['type']; onlyLiked?: boolean } = {},
): Array<{ meal: Meal; availability: MealAvailability }> {
  const filtered = meals.filter((m) => {
    if (options.type && m.type !== options.type) return false
    if (options.onlyLiked && !m.liked) return false
    return true
  })

  return filtered
    .map((meal) => ({ meal, availability: checkMealAvailability(meal, inventory) }))
    .sort((a, b) => {
      if (a.meal.liked !== b.meal.liked) return a.meal.liked ? -1 : 1
      return b.availability.ratio - a.availability.ratio
    })
}
