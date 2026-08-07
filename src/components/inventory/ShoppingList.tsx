import { useMemo, useState } from 'react'
import { useInventory } from '../../context/InventoryContext'
import { useMeals } from '../../context/MealsContext'
import { getEffectiveLevel, isLowStock, findInventoryItem, STOCK_LEVEL_LABEL } from '../../lib/inventory'
import { Card, Button, EmptyState, Badge } from '../shared/ui'

export function ShoppingList() {
  const { items } = useInventory()
  const { meals, weeklyPlan } = useMeals()
  const [copied, setCopied] = useState(false)

  const lowItems = useMemo(() => items.filter(isLowStock), [items])

  // Ingredients needed by this week's planned dinners that have no in-stock inventory match
  const missingForPlan = useMemo(() => {
    const missing = new Map<string, string[]>() // ingredient -> meal names
    for (const entry of weeklyPlan) {
      if (!entry.mealId) continue
      const meal = meals.find((m) => m.id === entry.mealId)
      if (!meal) continue
      for (const ingredient of meal.ingredients) {
        const item = findInventoryItem(ingredient, items)
        const inStock = item ? getEffectiveLevel(item) !== 'out' : false
        if (!inStock) {
          const key = ingredient.toLowerCase()
          missing.set(key, [...(missing.get(key) ?? []), meal.name])
        }
      }
    }
    return Array.from(missing.entries()).map(([ingredient, mealNames]) => ({
      ingredient,
      mealNames: Array.from(new Set(mealNames)),
    }))
  }, [weeklyPlan, meals, items])

  const listText = useMemo(() => {
    const lines: string[] = []
    for (const item of lowItems) {
      lines.push(item.trackingMode === 'quantity' ? item.name : `${item.name} (${STOCK_LEVEL_LABEL[getEffectiveLevel(item)].toLowerCase()})`)
    }
    for (const m of missingForPlan) {
      if (!lines.some((l) => l.toLowerCase().startsWith(m.ingredient))) {
        lines.push(m.ingredient)
      }
    }
    return lines.join('\n')
  }, [lowItems, missingForPlan])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(listText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard unavailable (non-https context) — user can still read the list
    }
  }

  const empty = lowItems.length === 0 && missingForPlan.length === 0

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Built automatically from low stock and this week's dinner plan.
        </p>
        {!empty && (
          <Button variant="secondary" onClick={handleCopy}>
            {copied ? '✓ Copied' : 'Copy list'}
          </Button>
        )}
      </div>

      {empty ? (
        <EmptyState
          icon="🛒"
          title="Nothing needed right now"
          description="Everything for this week's plan is in stock and nothing is running low."
        />
      ) : (
        <div className="space-y-4">
          {lowItems.length > 0 && (
            <Card>
              <p className="mb-2 text-sm font-semibold text-navy-900">Running low or out</p>
              <ul className="space-y-1.5">
                {lowItems.map((item) => {
                  const level = getEffectiveLevel(item)
                  return (
                    <li key={item.id} className="flex items-center justify-between gap-2 text-sm text-slate-700">
                      <span>{item.name}</span>
                      <span className="flex items-center gap-2">
                        <Badge
                          className={
                            level === 'out'
                              ? 'bg-red-100 text-red-700 ring-red-600/20'
                              : 'bg-amber-100 text-amber-700 ring-amber-600/20'
                          }
                        >
                          {STOCK_LEVEL_LABEL[level]}
                        </Badge>
                        {item.amazonUrl && (
                          <a
                            href={item.amazonUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-orange-700 hover:underline"
                          >
                            Amazon ↗
                          </a>
                        )}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </Card>
          )}

          {missingForPlan.length > 0 && (
            <Card>
              <p className="mb-2 text-sm font-semibold text-navy-900">Needed for this week's dinners</p>
              <ul className="space-y-1.5">
                {missingForPlan.map((m) => (
                  <li key={m.ingredient} className="text-sm text-slate-700">
                    <span className="capitalize">{m.ingredient}</span>
                    <span className="ml-1.5 text-xs text-slate-400">for {m.mealNames.join(', ')}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
