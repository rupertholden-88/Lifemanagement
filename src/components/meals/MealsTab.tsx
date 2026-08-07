import { useState } from 'react'
import { SectionTitle, Card } from '../shared/ui'
import { WeeklyPlan } from './WeeklyPlan'
import { Suggestions } from './Suggestions'
import { MealLibrary } from './MealLibrary'
import { MEAL_GROUND_RULES, MEAL_SWAPS } from '../../data/mealPlan'

type SubTab = 'plan' | 'suggest' | 'library'

const SUB_TABS: { id: SubTab; label: string }[] = [
  { id: 'plan', label: "This week" },
  { id: 'suggest', label: 'Suggestions' },
  { id: 'library', label: 'Library' },
]

export function MealsTab() {
  const [tab, setTab] = useState<SubTab>('plan')

  return (
    <div>
      <SectionTitle title="Meals" subtitle="Plan dinners, get suggestions from what's in stock, and log what you eat" />

      <div className="mb-5 flex gap-1 rounded-lg bg-slate-100 p-1 text-sm font-medium">
        {SUB_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`min-h-10 flex-1 rounded-md py-2 transition ${
              tab === t.id ? 'bg-white text-navy-900 shadow-sm' : 'text-slate-500'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'plan' && <WeeklyPlan />}
      {tab === 'suggest' && <Suggestions />}
      {tab === 'library' && <MealLibrary />}

      {tab === 'plan' && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Card>
            <p className="mb-2 text-sm font-semibold text-navy-900">Ground rules</p>
            <ul className="list-disc space-y-1.5 pl-4 text-sm text-slate-600">
              {MEAL_GROUND_RULES.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </Card>
          <Card>
            <p className="mb-2 text-sm font-semibold text-navy-900">Small swaps that add up</p>
            <div className="space-y-1.5 text-sm text-slate-600">
              {MEAL_SWAPS.map((swap) => (
                <p key={swap.from}>
                  <span className="text-slate-400">{swap.from} →</span> <span className="font-medium text-slate-700">{swap.to}</span>{' '}
                  <span className="text-xs text-emerald-600">({swap.saves})</span>
                </p>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
