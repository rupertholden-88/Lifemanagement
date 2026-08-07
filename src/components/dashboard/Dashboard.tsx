import { useMemo, useState } from 'react'
import { useFitness } from '../../context/FitnessContext'
import { useMeals } from '../../context/MealsContext'
import { useInventory } from '../../context/InventoryContext'
import { useCookMeal } from '../../hooks/useCookMeal'
import { FITNESS_SESSIONS, WEEKLY_MAX_POINTS } from '../../data/fitnessPlan'
import { isLowStock } from '../../lib/inventory'
import { checkMealAvailability } from '../../lib/meals'
import { isoToday } from '../../lib/date'
import { weeklyScoreFor } from '../../lib/fitnessScoring'
import { Card, SectionTitle, Badge, ProgressBar, Button } from '../shared/ui'
import type { Section } from '../shared/nav'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const

export function Dashboard({ onNavigate }: { onNavigate: (section: Section) => void }) {
  const { exerciseLogs } = useFitness()
  const { meals, weeklyPlan, mealLogs } = useMeals()
  const { items: inventory } = useInventory()
  const { cookMeal } = useCookMeal()
  const [banner, setBanner] = useState<string | null>(null)

  const today = isoToday()
  const todayDayName = DAY_NAMES[new Date().getDay()]
  const todaySession = FITNESS_SESSIONS.find((s) => s.day === todayDayName)
  const todayLog = exerciseLogs.find((l) => l.sessionId === todaySession?.id && l.date === today)

  const todayDinnerEntry = weeklyPlan.find((e) => e.day === todayDayName)
  const todayDinner = todayDinnerEntry?.mealId ? meals.find((m) => m.id === todayDinnerEntry.mealId) : undefined
  const dinnerAvailability = todayDinner ? checkMealAvailability(todayDinner, inventory) : null
  const dinnerCooked = todayDinner ? mealLogs.some((l) => l.date === today && l.mealId === todayDinner.id) : false

  const score = useMemo(() => weeklyScoreFor(exerciseLogs, 0), [exerciseLogs])
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
      <SectionTitle title="Welcome back" subtitle="Here's today at a glance" />

      {banner && <div className="mb-4 rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-800">{banner}</div>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-navy-900">Today's session</p>
            {todaySession && <Badge className="bg-slate-100 text-slate-600 ring-slate-500/10">{todaySession.duration}</Badge>}
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
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-navy-900">Tonight's dinner</p>
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
          <p className="mb-2 text-sm font-semibold text-navy-900">This week's fitness score</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-navy-900">{score.earned}</span>
            <span className="text-sm text-slate-400">/ {WEEKLY_MAX_POINTS} pts</span>
          </div>
          <ProgressBar value={score.percent} className="mt-2" />
          <Button variant="ghost" className="mt-2 -ml-3.5" onClick={() => onNavigate('fitness')}>
            View fitness →
          </Button>
        </Card>

        <Card>
          <p className="mb-2 text-sm font-semibold text-navy-900">Household inventory</p>
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
