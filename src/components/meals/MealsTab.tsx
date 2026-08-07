import { useMemo, useState } from 'react'
import { Card, Segmented } from '../shared/ui'
import { WeeklyPlan } from './WeeklyPlan'
import { Suggestions } from './Suggestions'
import { MealLibrary } from './MealLibrary'
import { MEAL_GROUND_RULES, MEAL_SWAPS } from '../../data/mealPlan'
import { getWeekDates, weekRangeLabel } from '../../lib/date'

type SubTab = 'plan' | 'suggest' | 'library'

const SUB_TABS: { id: SubTab; label: string }[] = [
  { id: 'plan', label: 'This week' },
  { id: 'suggest', label: 'Suggestions' },
  { id: 'library', label: 'Library' },
]

export function MealsTab() {
  const [tab, setTab] = useState<SubTab>('plan')
  const week = useMemo(() => getWeekDates(new Date(), 0), [])

  return (
    <div>
      <p className="mb-2.5 text-[11px] font-semibold tracking-[0.16em] text-accent-700">{weekRangeLabel(week).toUpperCase()}</p>
      <h1 className="mb-5 text-[36px] leading-[1.05] font-semibold tracking-[-0.03em] text-ink">Meals</h1>

      <Segmented options={SUB_TABS} value={tab} onChange={setTab} className="mb-6" />

      {tab === 'plan' && <WeeklyPlan />}
      {tab === 'suggest' && <Suggestions />}
      {tab === 'library' && <MealLibrary />}

      {tab === 'plan' && (
        <div className="mt-8 space-y-6">
          <Card>
            <p className="mb-3 text-[15px] font-semibold text-ink">Ground rules</p>
            <ul className="list-disc space-y-2 pl-4 text-sm text-neutral-700">
              {MEAL_GROUND_RULES.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </Card>
          <Card>
            <p className="mb-3 text-[15px] font-semibold text-ink">Small swaps that add up</p>
            <div className="space-y-2 text-sm text-neutral-700">
              {MEAL_SWAPS.map((swap) => (
                <p key={swap.from}>
                  <span className="text-neutral-500">{swap.from} →</span> <span className="font-medium text-ink">{swap.to}</span>{' '}
                  <span className="text-xs text-accent-700">({swap.saves})</span>
                </p>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
