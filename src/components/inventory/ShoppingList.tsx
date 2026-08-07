import { useMemo, useState } from 'react'
import { useInventory } from '../../context/InventoryContext'
import { useMeals } from '../../context/MealsContext'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { getEffectiveLevel, isLowStock, findInventoryItem, STOCK_LEVEL_LABEL } from '../../lib/inventory'
import { shortIngredientLabel } from '../../lib/ingredientMatch'
import { Button, EmptyState, Tag, Card } from '../shared/ui'
import { CartIcon, CheckIcon } from '../shared/icons'

export function ShoppingList() {
  const { items, restockItem, addItem } = useInventory()
  const { meals, weeklyPlan } = useMeals()
  const [ticked, setTicked] = useLocalStorage<string[]>('hb.shopping.ticked', [])
  const [copied, setCopied] = useState(false)

  const tickedSet = new Set(ticked)
  const toggle = (key: string) => setTicked((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))

  const lowItems = useMemo(() => items.filter(isLowStock), [items])

  const untrackedForPlan = useMemo(() => {
    const missing = new Map<string, string[]>()
    for (const entry of weeklyPlan) {
      if (!entry.mealId) continue
      const meal = meals.find((m) => m.id === entry.mealId)
      if (!meal) continue
      for (const ingredient of meal.ingredients) {
        if (findInventoryItem(ingredient, items)) continue
        const key = shortIngredientLabel(ingredient).toLowerCase()
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
    lowItems.filter((i) => tickedSet.has(i.id)).length + untrackedForPlan.filter((m) => tickedSet.has(m.ingredient)).length

  const listText = useMemo(() => {
    const lines = lowItems.map((item) =>
      item.trackingMode === 'quantity' ? item.name : `${item.name} (${STOCK_LEVEL_LABEL[getEffectiveLevel(item)].toLowerCase()})`,
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
        icon={<CartIcon width={28} height={28} />}
        title="Nothing needed right now"
        description="Everything for this week's plan is in stock and nothing is running low."
      />
    )
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-neutral-600">
          {tickedCount > 0 ? (
            <>
              <span className="font-semibold text-accent-700">
                {tickedCount} of {totalCount}
              </span>{' '}
              ticked off
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
            {copied ? 'Copied ✓' : 'Copy list'}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {lowItems.length > 0 && (
          <Card>
            <p className="mb-2 text-[15px] font-semibold text-ink">Running low or out</p>
            <div>
              {lowItems.map((item) => {
                const level = getEffectiveLevel(item)
                const isTicked = tickedSet.has(item.id)
                return (
                  <div key={item.id} className="flex items-center gap-3 border-b-2 border-divider py-2 last:border-b-0">
                    <input
                      type="checkbox"
                      checked={isTicked}
                      onChange={() => toggle(item.id)}
                      className="h-5 w-5 shrink-0 rounded border-2 border-divider accent-accent focus:ring-accent"
                      aria-label={`Tick off ${item.name}`}
                    />
                    <button
                      onClick={() => toggle(item.id)}
                      className={`min-h-11 flex-1 text-left text-sm ${isTicked ? 'text-neutral-400 line-through' : 'text-neutral-700'}`}
                    >
                      {item.name}
                    </button>
                    <Tag tone={level === 'out' ? 'accent' : 'neutral'}>{STOCK_LEVEL_LABEL[level]}</Tag>
                    {item.amazonUrl && (
                      <a href={item.amazonUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 text-xs font-semibold text-accent-700">
                        Amazon ↗
                      </a>
                    )}
                    <button
                      onClick={() => handleBought(item.id)}
                      className="min-h-10 shrink-0 rounded-full bg-accent-100 px-3 text-xs font-semibold text-accent-800 hover:bg-accent-200"
                      title="Restock this item and remove it from the list"
                    >
                      Bought
                    </button>
                  </div>
                )
              })}
            </div>
            <p className="mt-2 text-xs text-neutral-500">
              Tick items as you shop. &ldquo;Bought&rdquo; refills the item in your stock and clears it from this list.
            </p>
          </Card>
        )}

        {untrackedForPlan.length > 0 && (
          <Card>
            <p className="mb-2 text-[15px] font-semibold text-ink">Needed for this week&rsquo;s dinners</p>
            <div>
              {untrackedForPlan.map((m) => {
                const isTicked = tickedSet.has(m.ingredient)
                return (
                  <div key={m.ingredient} className="flex items-center gap-3 border-b-2 border-divider py-2 last:border-b-0">
                    <input
                      type="checkbox"
                      checked={isTicked}
                      onChange={() => toggle(m.ingredient)}
                      className="h-5 w-5 shrink-0 rounded border-2 border-divider accent-accent focus:ring-accent"
                      aria-label={`Tick off ${m.ingredient}`}
                    />
                    <button
                      onClick={() => toggle(m.ingredient)}
                      className={`min-h-11 flex-1 text-left text-sm ${isTicked ? 'text-neutral-400 line-through' : 'text-neutral-700'}`}
                    >
                      <span className="capitalize">{m.ingredient}</span>
                      <span className="ml-1.5 text-xs text-neutral-500">for {m.mealNames.join(', ')}</span>
                    </button>
                    <button
                      onClick={() => handleAddToStock(m.ingredient)}
                      className="min-h-10 shrink-0 rounded-full bg-neutral-200 px-3 text-xs font-semibold text-neutral-700 hover:bg-neutral-300"
                      title="Start tracking this in your stock"
                    >
                      + Add to stock
                    </button>
                  </div>
                )
              })}
            </div>
          </Card>
        )}
      </div>
      {tickedCount === totalCount && totalCount > 0 && (
        <p className="mt-4 flex items-center gap-2 text-sm text-accent-700">
          <CheckIcon width={14} height={14} /> All ticked off.
        </p>
      )}
    </div>
  )
}
