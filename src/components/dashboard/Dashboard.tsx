import { useMemo, useState } from 'react'
import { useFitness } from '../../context/FitnessContext'
import { useMeals } from '../../context/MealsContext'
import { useInventory } from '../../context/InventoryContext'
import { useSettings } from '../../context/SettingsContext'
import { useCookMeal } from '../../hooks/useCookMeal'
import { useMealOptions } from '../../hooks/useMealOptions'
import { WEEKLY_MAX_POINTS, scheduleForWfhDay } from '../../data/fitnessPlan'
import { isLowStock } from '../../lib/inventory'
import { checkMealAvailability } from '../../lib/meals'
import { isoToday, getWeekDates } from '../../lib/date'
import { weeklyScoreFor } from '../../lib/fitnessScoring'
import { Banner, Button, Tag } from '../shared/ui'
import { CheckIcon } from '../shared/icons'
import type { Section } from '../shared/nav'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const

export function Dashboard({ onNavigate }: { onNavigate: (section: Section) => void }) {
  const { exerciseLogs } = useFitness()
  const { weeklyPlan, mealLogs } = useMeals()
  const { findMeal } = useMealOptions()
  const { items: inventory } = useInventory()
  const { wfhDay } = useSettings()
  const { cookMeal } = useCookMeal()
  const [banner, setBanner] = useState<string | null>(null)

  const dateLabel = new Date()
    .toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })
    .toUpperCase()
  const schedule = useMemo(() => scheduleForWfhDay(wfhDay), [wfhDay])
  const today = isoToday()
  const week = useMemo(() => getWeekDates(new Date(), 0), [])
  const todayDayName = DAY_NAMES[new Date().getDay()]
  const todaySession = schedule.find((s) => s.day === todayDayName)
  const todayLog = exerciseLogs.find((l) => l.sessionId === todaySession?.id && l.date === today)

  const todayDinnerEntry = weeklyPlan.find((e) => e.day === todayDayName)
  const todayDinner = todayDinnerEntry?.mealId ? findMeal(todayDinnerEntry.mealId) : undefined
  const dinnerAvailability = todayDinner ? checkMealAvailability(todayDinner, inventory) : null
  const dinnerCooked = todayDinner ? mealLogs.some((l) => l.date === today && l.mealId === todayDinner.id) : false

  const score = useMemo(() => weeklyScoreFor(exerciseLogs, schedule, 0), [exerciseLogs, schedule])
  const lowStockItems = inventory.filter(isLowStock)

  const summary = [
    todaySession ? (todaySession.type === 'rest' ? 'a rest day' : todaySession.title.toLowerCase()) : 'nothing scheduled',
    todayDinner ? `${todayDinner.name.toLowerCase()} for dinner` : 'dinner not planned yet',
    lowStockItems.length > 0 ? `${lowStockItems.length} thing${lowStockItems.length === 1 ? '' : 's'} to restock` : 'the stock topped up',
  ].join(', ')

  const handleCookDinner = () => {
    if (!todayDinner) return
    const result = cookMeal(todayDinner, today)
    setBanner(
      result.updatedItems.length > 0
        ? `Logged ${todayDinner.name} — updated ${result.updatedItems.length} pantry item${result.updatedItems.length === 1 ? '' : 's'}.`
        : `Logged ${todayDinner.name}.`,
    )
    setTimeout(() => setBanner(null), 5000)
  }

  return (
    <div>
      <p className="mb-2.5 text-[11px] font-semibold tracking-[0.16em] text-accent-700">{dateLabel}</p>
      <h1 className="mb-2.5 text-[36px] leading-[1.05] font-semibold tracking-[-0.03em] text-ink">Welcome back</h1>
      <p className="mb-6 text-[15px] leading-relaxed text-neutral-700">
        {summary.charAt(0).toUpperCase() + summary.slice(1)}.
      </p>

      {banner && <Banner>{banner}</Banner>}

      <div className="mb-0 grid grid-cols-2 border-t-2 border-ink border-b-2 border-divider">
        <div className="py-4 pr-4">
          <p className="mb-2 text-[10.5px] font-semibold tracking-[0.14em] text-neutral-600 uppercase">Points</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[34px] leading-none font-semibold tracking-[-0.03em] text-ink">{score.earned}</span>
            <span className="text-sm text-neutral-600">/ {WEEKLY_MAX_POINTS}</span>
          </div>
        </div>
        <div className="border-l-2 border-divider py-4 pl-4">
          <p className="mb-2 text-[10.5px] font-semibold tracking-[0.14em] text-neutral-600 uppercase">To restock</p>
          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-[34px] leading-none font-semibold tracking-[-0.03em] ${lowStockItems.length ? 'text-accent' : 'text-ink'}`}
            >
              {lowStockItems.length}
            </span>
            <span className="text-sm text-neutral-600">{lowStockItems.length === 1 ? 'item' : 'items'}</span>
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-7 border-b-2 border-divider">
        {week.map(({ day, date }) => {
          const session = schedule.find((s) => s.day === day)
          const logged = exerciseLogs.some((l) => l.sessionId === session?.id && l.date === date && l.pointsEarned > 0)
          const isRest = session?.points === 0
          return (
            <div
              key={day}
              className={`py-2.5 text-center text-[11px] font-semibold ${
                logged ? 'bg-accent text-white' : isRest ? 'bg-neutral-200 text-neutral-600' : 'text-neutral-600'
              } ${date === today ? 'underline decoration-2 underline-offset-4' : ''}`}
            >
              {day.slice(0, 1)}
            </div>
          )
        })}
      </div>

      <div className="mb-6 border-t-2 border-ink pt-4">
        <div className="mb-2.5 flex items-center justify-between gap-2.5">
          <p className="text-[10.5px] font-semibold tracking-[0.14em] text-neutral-600 uppercase">Today&rsquo;s session</p>
          {todaySession && todaySession.duration !== '—' && <Tag>{todaySession.duration}</Tag>}
        </div>
        {todaySession ? (
          <>
            <h3 className="mb-2 text-[26px] leading-tight font-semibold tracking-[-0.025em] text-ink">{todaySession.title}</h3>
            <p className="mb-3.5 text-[14.5px] leading-relaxed text-neutral-700">{todaySession.detail}</p>
            {todaySession.type !== 'rest' &&
              (todayLog ? (
                <div className="flex items-center gap-2">
                  <Tag tone="ink">
                    <CheckIcon width={12} height={12} /> Logged · {todayLog.pointsEarned} pts
                  </Tag>
                  <Button variant="ghost" onClick={() => onNavigate('fitness')}>
                    View
                  </Button>
                </div>
              ) : (
                <Button onClick={() => onNavigate('fitness')}>Log this session</Button>
              ))}
          </>
        ) : (
          <p className="text-[14.5px] text-neutral-600">Nothing scheduled today.</p>
        )}
      </div>

      <div className="mb-6 border-t-2 border-ink pt-4">
        <div className="mb-2.5 flex items-center justify-between gap-2.5">
          <p className="text-[10.5px] font-semibold tracking-[0.14em] text-neutral-600 uppercase">Tonight&rsquo;s dinner</p>
          {dinnerAvailability && (
            <Tag tone={dinnerAvailability.missing.length === 0 ? 'neutral' : 'accent'}>
              {dinnerAvailability.matched.length}/{todayDinner!.ingredients.length} in stock
            </Tag>
          )}
        </div>
        {todayDinner ? (
          <>
            <h3 className="mb-2 text-[26px] leading-tight font-semibold tracking-[-0.025em] text-ink">{todayDinner.name}</h3>
            {todayDinner.notes && <p className="mb-3.5 text-[14.5px] leading-relaxed text-neutral-700">{todayDinner.notes}</p>}
            <div className="flex gap-2">
              <Button variant={dinnerCooked ? 'done' : 'primary'} onClick={handleCookDinner} disabled={dinnerCooked}>
                {dinnerCooked ? 'Cooked ✓' : 'Cook this'}
              </Button>
              <Button variant="secondary" onClick={() => onNavigate('meals')}>
                Change
              </Button>
            </div>
          </>
        ) : (
          <div>
            <p className="mb-3 text-[14.5px] text-neutral-600">No dinner planned yet.</p>
            <Button variant="secondary" onClick={() => onNavigate('meals')}>
              Plan tonight
            </Button>
          </div>
        )}
      </div>

      <div className="border-t-2 border-ink pt-4">
        <p className="mb-3 text-[10.5px] font-semibold tracking-[0.14em] text-neutral-600 uppercase">Running low</p>
        {lowStockItems.length === 0 ? (
          <p className="mb-3.5 flex items-center gap-2 text-[14.5px] text-neutral-600">
            <CheckIcon width={16} height={16} /> Everything&rsquo;s well stocked.
          </p>
        ) : (
          <div className="mb-3.5 flex flex-wrap gap-2">
            {lowStockItems.map((item) => (
              <Tag key={item.id} tone="accent">
                {item.name}
              </Tag>
            ))}
          </div>
        )}
        <Button variant="secondary" onClick={() => onNavigate('inventory')}>
          View inventory
        </Button>
      </div>
    </div>
  )
}
