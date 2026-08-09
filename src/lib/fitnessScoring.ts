import { WEEKLY_MAX_POINTS } from '../data/fitnessPlan'
import { getWeekDates, toIso } from './date'
import type { AdHocActivity, DayOfWeek, ExerciseLog, FitnessSession } from '../types'

export function weeklyScoreFor(logs: ExerciseLog[], schedule: FitnessSession[], weekOffset: number) {
  const week = getWeekDates(new Date(), weekOffset)
  const logsByKey = new Map(logs.map((l) => [`${l.sessionId}-${l.date}`, l]))

  let earned = 0
  let sessionsLogged = 0
  for (const { day, date } of week) {
    const session = schedule.find((s) => s.day === day)
    if (!session) continue
    const log = logsByKey.get(`${session.id}-${date}`)
    if (log) {
      earned += log.pointsEarned
      sessionsLogged += 1
    }
  }

  return { earned, max: WEEKLY_MAX_POINTS, sessionsLogged, percent: earned / WEEKLY_MAX_POINTS }
}

export interface StreakStats {
  /** Consecutive active days ending today. */
  current: number
  /** The best `current` ever reached. */
  longest: number
}

/** Days that count toward a streak: a scheduled session logged for points, or anything logged off-plan. */
function activeDates(logs: ExerciseLog[], adHoc: AdHocActivity[]): Set<string> {
  const dates = new Set<string>()
  for (const log of logs) if (log.pointsEarned > 0) dates.add(log.date)
  for (const activity of adHoc) dates.add(activity.date)
  return dates
}

/**
 * Streak of consecutive days meeting the plan, counted forward over the whole
 * history so both the current run and the all-time best come from one pass.
 *
 * Three rules, each chosen to match how the plan itself is written:
 * - A rest day carries the streak but never adds to it. Resting when the plan
 *   says rest shouldn't break a streak, but it shouldn't manufacture one either
 *   — an empty history has to read zero, not one-per-rest-day.
 * - One missed session is forgiven, two in a row ends the run. This is the
 *   plan's own "never miss two in a row" rule expressed as a score. A forgiven
 *   day holds the streak steady rather than extending it.
 * - Today never counts as a miss, since there's still time to do it.
 */
export function computeStreakStats(
  logs: ExerciseLog[],
  adHoc: AdHocActivity[],
  schedule: FitnessSession[],
): StreakStats {
  const active = activeDates(logs, adHoc)
  if (active.size === 0) return { current: 0, longest: 0 }

  const restDays = new Set(schedule.filter((s) => s.type === 'rest').map((s) => s.day))
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayIso = toIso(today)

  const cursor = new Date(Array.from(active).sort()[0] + 'T00:00:00')
  let run = 0
  let longest = 0
  let misses = 0

  // Bounded so a corrupt future-dated record can't spin forever.
  for (let guard = 0; guard < 3660; guard++) {
    const iso = toIso(cursor)
    const dayName = cursor.toLocaleDateString('en-US', { weekday: 'long' }) as DayOfWeek

    if (active.has(iso)) {
      run += 1
      misses = 0
      if (run > longest) longest = run
    } else if (!restDays.has(dayName) && iso !== todayIso) {
      // A rest day laundering a miss would let someone alternate missing and
      // resting indefinitely, so only real activity clears the miss count.
      misses += 1
      if (misses >= 2) {
        run = 0
        misses = 0
      }
    }

    if (iso === todayIso) break
    cursor.setDate(cursor.getDate() + 1)
  }

  return { current: run, longest }
}
