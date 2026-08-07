import { useMeals } from '../context/MealsContext'
import { useInventory } from '../context/InventoryContext'
import { findInventoryItem } from '../lib/inventory'
import type { Meal } from '../types'

export interface CookMealResult {
  updatedItems: string[]
  missingIngredients: string[]
}

/** Logs a meal as cooked/eaten today and decrements matching pantry inventory. */
export function useCookMeal() {
  const { logMeal } = useMeals()
  const { items, decrementForUsage } = useInventory()

  const cookMeal = (meal: Meal, date: string): CookMealResult => {
    logMeal(meal.id, meal.type, date)

    const updatedItems: string[] = []
    const missingIngredients: string[] = []

    for (const ingredient of meal.ingredients) {
      const match = findInventoryItem(ingredient, items)
      if (match) {
        decrementForUsage(match.id)
        updatedItems.push(match.name)
      } else {
        missingIngredients.push(ingredient)
      }
    }

    return { updatedItems, missingIngredients }
  }

  return { cookMeal }
}
