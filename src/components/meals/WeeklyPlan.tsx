import { useMemo, useState } from 'react'
import { useMeals } from '../../context/MealsContext'
import { useInventory } from '../../context/InventoryContext'
import { useMealOptions } from '../../hooks/useMealOptions'
import { useCookMeal } from '../../hooks/useCookMeal'
import { checkMealAvailability } from '../../lib/meals'
import { getWeekDates, formatDayLabel, isoToday } from '../../lib/date'
import { Card, Badge } from '../shared/ui'
import { SEED_MEALS } from '../../data/mealPlan'

export function WeeklyPlan() {
  const { weeklyPlan, setWeeklyPlanDay, mealLogs } = useMeals()
  const { allMeals, findMeal } = useMealOptions()
  const { items: inventory } = useInventory()
  const { cookMeal } = useCookMeal()
  const [banner, setBanner] = useState<string | null>(null)

  const week = useMemo(() => getWeekDates(new Date(), 0), [])
  const today = isoToday()
  const dinnerOptions = allMeals.filter((m) => m.type === 'dinner')
  const breakfast = SEED_MEALS.filter((m) => m.type === 'breakfast')
  const lunch = SEED_MEALS.filter((m) => m.type === 'lunch')

  const loggedToday = new Set(mealLogs.filter((l) => l.date === today).map((l) => l.mealId))

  const handleCook = (mealId: string, date: string) => {
    const meal = findMeal(mealId)
    if (!meal) return
    const result = cookMeal(meal, date)
    setBanner(
      result.updatedItems.length > 0
        ? `Logged ${meal.name} — updated ${result.updatedItems.length} pantry item${result.updatedItems.length === 1 ? '' : 's'}${
            result.missingIngredients.length ? `. No inventory match for: ${result.missingIngredients.join(', ')}` : ''
          }`
        : `Logged ${meal.name}.`,
    )
    setTimeout(() => setBanner(null), 5000)
  }

  return (
    <div>
      {banner && (
        <div className="mb-3 rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-800">{banner}</div>
      )}

      <Card className="mb-6">
        <p className="mb-1 text-sm font-semibold text-navy-900">Breakfast & lunch</p>
        <p className="text-xs text-slate-500">
          Same repeatable options every day — pick whichever's easiest.
        </p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {[...breakfast, ...lunch].map((m) => (
            <div key={m.id} className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
              {m.name}
            </div>
          ))}
        </div>
      </Card>

      <div className="mb-2">
        <p className="text-sm font-semibold text-navy-900">Dinners</p>
        <p className="text-xs text-slate-500">
          One per night — change any day from the dropdown. “Cook this” logs it and takes the
          ingredients out of your stock.
        </p>
      </div>

      <div className="space-y-2">
        {week.map(({ day, date }) => {
          const entry = weeklyPlan.find((e) => e.day === day)
          const meal = entry?.mealId ? findMeal(entry.mealId) : undefined
          const availability = meal ? checkMealAvailability(meal, inventory) : null
          const cooked = meal ? loggedToday.has(meal.id) && date === today : false

          return (
            <div
              key={day}
              className={`flex flex-col gap-2 rounded-xl border p-3.5 sm:flex-row sm:items-center sm:justify-between ${
                date === today ? 'border-teal-300 bg-teal-50/50' : 'border-paper-200 bg-white'
              }`}
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="w-16 shrink-0 text-xs font-medium text-slate-400">{formatDayLabel(date)}</div>
                <select
                  value={entry?.mealId ?? ''}
                  onChange={(e) => setWeeklyPlanDay(day, e.target.value || null)}
                  className="min-h-10 min-w-0 flex-1 rounded-lg border border-slate-300 px-2 py-2 text-sm font-medium text-navy-900"
                >
                  <option value="">— choose dinner —</option>
                  {dinnerOptions.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pl-19 sm:shrink-0 sm:pl-0">
                {availability && (
                  <Badge className={availability.missing.length === 0 ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : 'bg-amber-50 text-amber-700 ring-amber-600/20'}>
                    {availability.matched.length}/{meal!.ingredients.length} in stock
                  </Badge>
                )}
                {meal && (
                  <button
                    onClick={() => handleCook(meal.id, date)}
                    disabled={cooked}
                    className="ml-auto min-h-10 whitespace-nowrap rounded-lg bg-teal-600 px-3 text-sm font-medium text-white transition hover:bg-teal-500 disabled:bg-slate-200 disabled:text-slate-500 sm:ml-0"
                  >
                    {cooked ? '✓ Cooked' : 'Cook this'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
