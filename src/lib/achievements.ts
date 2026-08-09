import { WEEKLY_MAX_POINTS } from '../data/fitnessPlan'
import { toIso } from './date'
import { computeStreakStats } from './fitnessScoring'
import type { AdHocActivity, DayOfWeek, ExerciseLog, FitnessSession, MetricEntry } from '../types'

export interface Achievement {
  id: string
  name: string
  description: string
  unlocked: boolean
  /** Countable achievements expose progress so a locked one still shows how close it is. */
  progress?: { current: number; target: number }
}

/** Monday of the week containing `iso`, used to bucket logs into weeks. */
function mondayOf(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return toIso(d)
}

interface WeekTotals {
  points: number
  sessionIds: Set<string>
}

function weeklyTotals(logs: ExerciseLog[]): Map<string, WeekTotals> {
  const weeks = new Map<string, WeekTotals>()
  for (const log of logs) {
    if (log.pointsEarned <= 0) continue
    const key = mondayOf(log.date)
    const week = weeks.get(key) ?? { points: 0, sessionIds: new Set<string>() }
    week.points += log.pointsEarned
    week.sessionIds.add(log.sessionId)
    weeks.set(key, week)
  }
  return weeks
}

/**
 * True once a session has been logged on a day following a missed one. Rewards
 * getting back to it after a slip rather than only rewarding unbroken runs —
 * the plan's "never miss two in a row" framing, as something to earn.
 */
function hasComeback(logs: ExerciseLog[], adHoc: AdHocActivity[], schedule: FitnessSession[]): boolean {
  const active = new Set<string>()
  for (const log of logs) if (log.pointsEarned > 0) active.add(log.date)
  for (const a of adHoc) active.add(a.date)
  if (active.size === 0) return false

  const restDays = new Set(schedule.filter((s) => s.type === 'rest').map((s) => s.day))
  const todayIso = toIso(new Date())
  const cursor = new Date(Array.from(active).sort()[0] + 'T00:00:00')
  let missedSinceLastSession = false

  for (let guard = 0; guard < 3660; guard++) {
    const iso = toIso(cursor)
    const dayName = cursor.toLocaleDateString('en-US', { weekday: 'long' }) as DayOfWeek

    if (active.has(iso)) {
      if (missedSinceLastSession) return true
      missedSinceLastSession = false
    } else if (!restDays.has(dayName) && iso !== todayIso) {
      missedSinceLastSession = true
    }

    if (iso === todayIso) break
    cursor.setDate(cursor.getDate() + 1)
  }

  return false
}

/**
 * Milestones derived entirely from existing logs — nothing extra is stored, so
 * they stay correct if history is edited or removed. Weighted toward turning up
 * regularly rather than doing more, since the plan itself caps hard sessions at
 * one a week.
 */
export function computeAchievements(
  logs: ExerciseLog[],
  adHoc: AdHocActivity[],
  metrics: MetricEntry[],
  schedule: FitnessSession[],
): Achievement[] {
  const sessions = logs.filter((l) => l.pointsEarned > 0).length
  const { longest } = computeStreakStats(logs, adHoc, schedule)
  const weeks = weeklyTotals(logs)
  const plannedSessions = schedule.filter((s) => s.type !== 'rest').length

  const perfectWeeks = Array.from(weeks.values()).filter((w) => w.points >= WEEKLY_MAX_POINTS).length
  const fullWeeks = Array.from(weeks.values()).filter((w) => w.sessionIds.size >= plannedSessions).length
  const steadyMonths = Array.from(weeks.values()).filter((w) => w.points >= WEEKLY_MAX_POINTS / 2).length

  const counted = (
    id: string,
    name: string,
    description: string,
    current: number,
    target: number,
  ): Achievement => ({
    id,
    name,
    description,
    unlocked: current >= target,
    progress: { current: Math.min(current, target), target },
  })

  return [
    counted('first-session', 'On the board', 'Log your first session', sessions, 1),
    counted('sessions-25', 'Twenty-five in', 'Log 25 sessions', sessions, 25),
    counted('sessions-100', 'Hundred club', 'Log 100 sessions', sessions, 100),

    counted('streak-7', 'Week unbroken', 'Reach a 7-day streak', longest, 7),
    counted('streak-30', 'Month unbroken', 'Reach a 30-day streak', longest, 30),
    counted('streak-100', 'Hundred days', 'Reach a 100-day streak', longest, 100),

    counted('perfect-week', 'Perfect week', `Earn all ${WEEKLY_MAX_POINTS} points in a week`, perfectWeeks, 1),
    counted('perfect-weeks-4', 'Four of the best', `Four weeks at ${WEEKLY_MAX_POINTS} points`, perfectWeeks, 4),
    counted('full-house', 'Full house', 'Log every session in one week', fullWeeks, 1),
    counted('steady-12', 'Judged by the month', 'Twelve solid weeks banked', steadyMonths, 12),

    {
      id: 'back-on-it',
      name: 'Back on it',
      description: 'Train the day after missing one',
      unlocked: hasComeback(logs, adHoc, schedule),
    },
    counted('off-plan-5', 'Mix it up', 'Log 5 activities outside the plan', adHoc.length, 5),

    counted('first-metric', 'Benchmarked', 'Log your first progress reading', metrics.length, 1),
    counted('metrics-10', 'Watching the trend', 'Log 10 progress readings', metrics.length, 10),
  ]
}
