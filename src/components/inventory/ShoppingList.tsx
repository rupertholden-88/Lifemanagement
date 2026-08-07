import { useMemo, useState } from 'react'
import { useInventory } from '../../context/InventoryContext'
import { useMeals } from '../../context/MealsContext'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { getEffectiveLevel, isLowStock, findInventoryItem, STOCK_LEVEL_LABEL } from '../../lib/inventory'
import { Card, Button, EmptyState, Badge } from '../shared/ui'

export function ShoppingList() {
  const { items, restockItem, addItem } = useInventory()
  const { meals, weeklyPlan } = useMeals()
  const [ticked, setTicked] = useLocalStorage<string[]>('hb.shopping.ticked', [])
  const [copied, setCopied] = useState(false)

  const tickedSet = new Set(ticked)
  const toggle = (key: string) =>
    setTicked((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))

  const lowItems = useMemo(() => items.filter(isLowStock), [items])

  // Ingredients this week's dinners need that aren't tracked in inventory at all.
  // Anything that *is* tracked but out of stock already shows in `lowItems`.
  const untrackedForPlan = useMemo(() => {
    const missing = new Map<string, string[]>() // ingredient -> meal names
    for (const entry of weeklyPlan) {
      if (!entry.mealId) continue
      const meal = meals.find((m) => m.id === entry.mealId)
      if (!meal) continue
      for (const ingredient of meal.ingredients) {
        if (findInventoryItem(ingredient, items)) continue
        const key = ingredient.toLowerCase()
        missing.set(key, [...(missing.get(key) ?? []), meal.name])
      }
    }
    return Array.from(missing.entries()).map(([ingredient, mealNames]) => ({
      ingredient,
      mealNames: Array.from(new Set(mealNames)),
    }))
  }, [weeklyPlan, meals, items])

  const totalCount = lowItems.length + untrackedForPlan.length
  const tickedCount =
    lowItems.filter((i) => tickedSet.has(i.id)).length +
    untrackedForPlan.filter((m) => tickedSet.has(m.ingredient)).length

  const listText = useMemo(() => {
    const lines = lowItems.map((item) =>
      item.trackingMode === 'quantity'
        ? item.name
        : `${item.name} (${STOCK_LEVEL_LABEL[getEffectiveLevel(item)].toLowerCase()})`,
    )
    for (const m of untrackedForPlan) lines.push(m.ingredient)
    return lines.join('\n')
  }, [lowItems, untrackedForPlan])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(listText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard unavailable (non-https context) — the list is still readable on screen
    }
  }

  /** Ticks the row and refills the item so it drops off the list. */
  const handleBought = (id: string) => {
    restockItem(id)
    setTicked((prev) => prev.filter((k) => k !== id))
  }

  const handleAddToStock = (ingredient: string) => {
    addItem({
      name: ingredient.charAt(0).toUpperCase() + ingredient.slice(1),
      category: 'food',
      subcategory: 'Pantry',
      trackingMode: 'quantity',
      quantity: 2,
      lowThreshold: 1,
      unit: '',
    })
    setTicked((prev) => prev.filter((k) => k !== ingredient))
  }

  if (totalCount === 0) {
    return (
      <EmptyState
        icon="🛒"
        title="Nothing needed right now"
        description="Everything for this week's plan is in stock and nothing is running low."
      />
    )
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-500">
          {tickedCount > 0 ? (
            <>
              <span className="font-medium text-teal-700">{tickedCount} of {totalCount}</span> ticked off
            </>
          ) : (
            "Built automatically from low stock and this week's dinner plan."
          )}
        </p>
        <div className="flex gap-2">
          {tickedCount > 0 && (
            <Button variant="ghost" onClick={() => setTicked([])}>
              Clear ticks
            </Button>
          )}
          <Button variant="secondary" onClick={handleCopy}>
            {copied ? '✓ Copied' : 'Copy list'}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {lowItems.length > 0 && (
          <Card>
            <p className="mb-2 text-sm font-semibold text-navy-900">Running low or out</p>
            <ul className="divide-y divide-slate-100">
              {lowItems.map((item) => {
                const level = getEffectiveLevel(item)
                const isTicked = tickedSet.has(item.id)
                return (
                  <li key={item.id} className="flex items-center gap-3 py-2">
                    <input
                      type="checkbox"
                      checked={isTicked}
                      onChange={() => toggle(item.id)}
                      className="h-4 w-4 shrink-0 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                      aria-label={`Tick off ${item.name}`}
                    />
                    <button
                      onClick={() => toggle(item.id)}
                      className={`flex-1 text-left text-sm ${
                        isTicked ? 'text-slate-400 line-through' : 'text-slate-700'
                      }`}
                    >
                      {item.name}
                    </button>
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
                        className="shrink-0 text-xs font-medium text-orange-700 hover:underline"
                      >
                        Amazon ↗
                      </a>
                    )}
                    <button
                      onClick={() => handleBought(item.id)}
                      className="shrink-0 rounded-md bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700 transition hover:bg-teal-100"
                      title="Restock this item and remove it from the list"
                    >
                      Bought
                    </button>
                  </li>
                )
              })}
            </ul>
            <p className="mt-2 text-xs text-slate-400">
              Tick items as you shop. “Bought” refills the item in your stock and clears it from this list.
            </p>
          </Card>
        )}

        {untrackedForPlan.length > 0 && (
          <Card>
            <p className="mb-2 text-sm font-semibold text-navy-900">Needed for this week's dinners</p>
            <ul className="divide-y divide-slate-100">
              {untrackedForPlan.map((m) => {
                const isTicked = tickedSet.has(m.ingredient)
                return (
                  <li key={m.ingredient} className="flex items-center gap-3 py-2">
                    <input
                      type="checkbox"
                      checked={isTicked}
                      onChange={() => toggle(m.ingredient)}
                      className="h-4 w-4 shrink-0 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                      aria-label={`Tick off ${m.ingredient}`}
                    />
                    <button
                      onClick={() => toggle(m.ingredient)}
                      className={`flex-1 text-left text-sm ${
                        isTicked ? 'text-slate-400 line-through' : 'text-slate-700'
                      }`}
                    >
                      <span className="capitalize">{m.ingredient}</span>
                      <span className="ml-1.5 text-xs text-slate-400">for {m.mealNames.join(', ')}</span>
                    </button>
                    <button
                      onClick={() => handleAddToStock(m.ingredient)}
                      className="shrink-0 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-200"
                      title="Start tracking this in your stock"
                    >
                      + Add to stock
                    </button>
                  </li>
                )
              })}
            </ul>
          </Card>
        )}
      </div>
    </div>
  )
}
