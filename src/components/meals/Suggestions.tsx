import { useMemo, useState } from 'react'
import { useMeals } from '../../context/MealsContext'
import { useInventory } from '../../context/InventoryContext'
import { useMealOptions, isRecipeMeal } from '../../hooks/useMealOptions'
import { useCookMeal } from '../../hooks/useCookMeal'
import { suggestMeals } from '../../lib/meals'
import { isoToday } from '../../lib/date'
import { MealCard } from './MealCard'
import { EmptyState } from '../shared/ui'
import type { MealType } from '../../types'

const TYPES: { value: MealType | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
]

export function Suggestions() {
  const { mealLogs } = useMeals()
  const { allMeals, findMeal, toggleLikedAny, deleteAny } = useMealOptions()
  const { items: inventory } = useInventory()
  const { cookMeal } = useCookMeal()
  const [type, setType] = useState<MealType | 'all'>('all')
  const [onlyLiked, setOnlyLiked] = useState(true)
  const [banner, setBanner] = useState<string | null>(null)

  const today = isoToday()
  const loggedToday = new Set(mealLogs.filter((l) => l.date === today).map((l) => l.mealId))

  const results = useMemo(
    () =>
      suggestMeals(allMeals, inventory, {
        type: type === 'all' ? undefined : type,
        onlyLiked,
      }),
    [allMeals, inventory, type, onlyLiked],
  )

  const handleCook = (mealId: string) => {
    const meal = findMeal(mealId)
    if (!meal) return
    const result = cookMeal(meal, today)
    setBanner(
      result.updatedItems.length > 0
        ? `Logged ${meal.name} — updated ${result.updatedItems.length} pantry item${result.updatedItems.length === 1 ? '' : 's'}.`
        : `Logged ${meal.name}.`,
    )
    setTimeout(() => setBanner(null), 5000)
  }

  return (
    <div>
      {banner && <div className="mb-3 rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-800">{banner}</div>}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => setType(t.value)}
            className={`min-h-10 rounded-full px-4 py-2 text-sm font-medium transition ${
              type === t.value ? 'bg-navy-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
        <label className="ml-auto flex min-h-10 items-center gap-2 px-1 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={onlyLiked}
            onChange={(e) => setOnlyLiked(e.target.checked)}
            className="h-5 w-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
          />
          Only liked
        </label>
      </div>

      {results.length === 0 ? (
        <EmptyState icon="🍽️" title="No meals match" description="Try clearing filters or add a meal in the library." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {results.map(({ meal, availability }) => (
            <MealCard
              key={meal.id}
              meal={meal}
              availability={availability}
              fromRecipe={isRecipeMeal(meal.id)}
              onToggleLiked={() => toggleLikedAny(meal.id)}
              onCook={() => handleCook(meal.id)}
              cooked={loggedToday.has(meal.id)}
              onDelete={() => {
                const extra = isRecipeMeal(meal.id) ? ' This removes it from your recipe bank too.' : ''
                if (window.confirm(`Delete "${meal.name}"?${extra}`)) {
                  deleteAny(meal.id)
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
