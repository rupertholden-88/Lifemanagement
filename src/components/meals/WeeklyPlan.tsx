import { useMemo, useState } from 'react'
import { useMeals } from '../../context/MealsContext'
import { useInventory } from '../../context/InventoryContext'
import { useMealOptions } from '../../hooks/useMealOptions'
import { useCookMeal } from '../../hooks/useCookMeal'
import { checkMealAvailability } from '../../lib/meals'
import { getWeekDates, formatDayLabel, isoToday } from '../../lib/date'
import { Banner, Button, Tag, inputClass } from '../shared/ui'
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
      {banner && <Banner>{banner}</Banner>}

      <div className="mb-6 border-t-2 border-ink pt-4">
        <p className="mb-1 text-[15px] font-semibold text-ink">Breakfast &amp; lunch</p>
        <p className="mb-3 text-xs text-neutral-600">Same repeatable options every day — pick whichever&rsquo;s easiest.</p>
        <div className="grid grid-cols-2 gap-2">
          {[...breakfast, ...lunch].map((m) => (
            <div key={m.id} className="rounded-2xl bg-neutral-100 px-4 py-2.5 text-sm text-ink">
              {m.name}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-2.5">
        <p className="text-[15px] font-semibold text-ink">Dinners</p>
        <p className="text-xs text-neutral-600">
          One per night — change any day from the dropdown. &ldquo;Cook this&rdquo; logs it and takes the ingredients out of your stock.
        </p>
      </div>

      <div>
        {week.map(({ day, date }) => {
          const entry = weeklyPlan.find((e) => e.day === day)
          const meal = entry?.mealId ? findMeal(entry.mealId) : undefined
          const availability = meal ? checkMealAvailability(meal, inventory) : null
          const cooked = meal ? loggedToday.has(meal.id) && date === today : false

          return (
            <div key={day} className={`border-t-2 py-4 ${date === today ? 'border-ink' : 'border-divider'}`}>
              <div className="mb-2.5 flex items-center justify-between gap-2.5">
                <span className="text-[11px] font-semibold tracking-[0.12em] text-neutral-600 uppercase">{formatDayLabel(date)}</span>
                {availability && (
                  <Tag tone={availability.missing.length === 0 ? 'neutral' : 'accent'}>
                    {availability.matched.length}/{meal!.ingredients.length} in stock
                  </Tag>
                )}
              </div>
              <select
                value={entry?.mealId ?? ''}
                onChange={(e) => setWeeklyPlanDay(day, e.target.value || null)}
                className={`${inputClass} mb-2.5`}
              >
                <option value="">— choose dinner —</option>
                {dinnerOptions.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
              {meal && (
                <Button variant={cooked ? 'done' : date === today ? 'primary' : 'secondary'} onClick={() => handleCook(meal.id, date)} disabled={cooked} className="w-full">
                  {cooked ? 'Cooked ✓' : 'Cook this'}
                </Button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
