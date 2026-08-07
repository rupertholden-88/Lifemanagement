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
import { isoToday } from '../../lib/date'
import { weeklyScoreFor } from '../../lib/fitnessScoring'
import { Card, Badge, ProgressBar, Button } from '../shared/ui'
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

  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  const schedule = useMemo(() => scheduleForWfhDay(wfhDay), [wfhDay])
  const today = isoToday()
  const todayDayName = DAY_NAMES[new Date().getDay()]
  const todaySession = schedule.find((s) => s.day === todayDayName)
  const todayLog = exerciseLogs.find((l) => l.sessionId === todaySession?.id && l.date === today)

  const todayDinnerEntry = weeklyPlan.find((e) => e.day === todayDayName)
  const todayDinner = todayDinnerEntry?.mealId ? findMeal(todayDinnerEntry.mealId) : undefined
  const dinnerAvailability = todayDinner ? checkMealAvailability(todayDinner, inventory) : null
  const dinnerCooked = todayDinner ? mealLogs.some((l) => l.date === today && l.mealId === todayDinner.id) : false

  const score = useMemo(() => weeklyScoreFor(exerciseLogs, schedule, 0), [exerciseLogs, schedule])
  const lowStockItems = inventory.filter(isLowStock)

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
      <div className="mb-5 overflow-hidden rounded-2xl bg-gradient-to-br from-navy-950 via-navy-900 to-teal-600 p-5 text-white shadow-sm sm:p-6">
        <p className="text-xs font-medium uppercase tracking-widest text-teal-200">{todayLabel}</p>
        <h1 className="font-display mt-1 text-2xl font-semibold sm:text-3xl">Welcome back</h1>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <span className="text-slate-200">
            <span className="font-display text-lg font-semibold text-white">{score.earned}</span>
            <span className="text-slate-300"> / {WEEKLY_MAX_POINTS} pts this week</span>
          </span>
          <span className="text-slate-200">
            <span className="font-display text-lg font-semibold text-white">{lowStockItems.length}</span>
            <span className="text-slate-300"> to restock</span>
          </span>
        </div>
      </div>

      {banner && <div className="mb-4 rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-800">{banner}</div>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-clay-100 text-base">
                🏃
              </span>
              <p className="text-sm font-semibold text-navy-900">Today's session</p>
            </div>
            {todaySession && todaySession.duration !== '—' && (
              <Badge className="bg-clay-100 text-clay-700 ring-clay-500/20">{todaySession.duration}</Badge>
            )}
          </div>
          {todaySession ? (
            <>
              <p className="font-medium text-navy-900">{todaySession.title}</p>
              <p className="mt-1 text-sm text-slate-500">{todaySession.detail}</p>
              {todaySession.type !== 'rest' && (
                <div className="mt-3 flex items-center gap-2">
                  {todayLog ? (
                    <>
                      <Badge className="bg-teal-600 text-white ring-0">✓ Logged · {todayLog.pointsEarned} pts</Badge>
                      <Button variant="ghost" onClick={() => onNavigate('fitness')}>
                        View
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => onNavigate('fitness')}>Log this session</Button>
                  )}
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-slate-500">Nothing scheduled today.</p>
          )}
        </Card>

        <Card>
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-600/10 text-base">
                🍽️
              </span>
              <p className="text-sm font-semibold text-navy-900">Tonight's dinner</p>
            </div>
            {dinnerAvailability && (
              <Badge className={dinnerAvailability.missing.length === 0 ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : 'bg-amber-50 text-amber-700 ring-amber-600/20'}>
                {dinnerAvailability.matched.length}/{todayDinner!.ingredients.length} in stock
              </Badge>
            )}
          </div>
          {todayDinner ? (
            <>
              <p className="font-medium text-navy-900">{todayDinner.name}</p>
              {todayDinner.notes && <p className="mt-1 text-sm text-slate-500">{todayDinner.notes}</p>}
              <div className="mt-3 flex items-center gap-2">
                <Button onClick={handleCookDinner} disabled={dinnerCooked} variant={dinnerCooked ? 'secondary' : 'primary'}>
                  {dinnerCooked ? '✓ Cooked today' : 'Cook this'}
                </Button>
                <Button variant="ghost" onClick={() => onNavigate('meals')}>
                  Change plan
                </Button>
              </div>
            </>
          ) : (
            <div>
              <p className="text-sm text-slate-500">No dinner planned yet.</p>
              <Button className="mt-2" variant="secondary" onClick={() => onNavigate('meals')}>
                Plan tonight
              </Button>
            </div>
          )}
        </Card>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-plum-100 text-base">
              📈
            </span>
            <p className="text-sm font-semibold text-navy-900">This week's fitness score</p>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-semibold text-plum-600">{score.earned}</span>
            <span className="text-sm text-slate-400">/ {WEEKLY_MAX_POINTS} pts</span>
          </div>
          <ProgressBar value={score.percent} className="mt-2" />
          <Button variant="ghost" className="mt-2 -ml-3.5" onClick={() => onNavigate('fitness')}>
            View fitness →
          </Button>
        </Card>

        <Card>
          <div className="mb-3 flex items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-base">
              📦
            </span>
            <p className="text-sm font-semibold text-navy-900">Household inventory</p>
          </div>
          {lowStockItems.length === 0 ? (
            <p className="text-sm text-slate-500">Everything's well stocked. 👍</p>
          ) : (
            <>
              <p className="text-sm text-slate-600">
                <span className="font-medium text-amber-700">{lowStockItems.length}</span> item{lowStockItems.length === 1 ? '' : 's'} running low or out:
              </p>
              <p className="mt-1 truncate text-sm text-slate-500">
                {lowStockItems.slice(0, 5).map((i) => i.name).join(', ')}
                {lowStockItems.length > 5 ? '…' : ''}
              </p>
            </>
          )}
          <Button variant="ghost" className="mt-2 -ml-3.5" onClick={() => onNavigate('inventory')}>
            View inventory →
          </Button>
        </Card>
      </div>
    </div>
  )
}
