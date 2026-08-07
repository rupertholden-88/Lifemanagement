import { FITNESS_SESSIONS, WEEKLY_MAX_POINTS } from '../data/fitnessPlan'
import { getWeekDates, toIso } from './date'
import type { DayOfWeek, ExerciseLog } from '../types'

export function weeklyScoreFor(logs: ExerciseLog[], weekOffset: number) {
  const week = getWeekDates(new Date(), weekOffset)
  const logsByKey = new Map(logs.map((l) => [`${l.sessionId}-${l.date}`, l]))

  let earned = 0
  let sessionsLogged = 0
  for (const { day, date } of week) {
    const session = FITNESS_SESSIONS.find((s) => s.day === day)
    if (!session) continue
    const log = logsByKey.get(`${session.id}-${date}`)
    if (log) {
      earned += log.pointsEarned
      sessionsLogged += 1
    }
  }

  return { earned, max: WEEKLY_MAX_POINTS, sessionsLogged, percent: earned / WEEKLY_MAX_POINTS }
}

/** Consecutive days (ending today) where the scheduled session was logged, or was a rest day. */
export function computeStreak(logs: ExerciseLog[]): number {
  const logsByKey = new Map(logs.map((l) => [`${l.sessionId}-${l.date}`, l]))
  let streak = 0
  const cursor = new Date()

  for (let i = 0; i < 60; i++) {
    const iso = toIso(cursor)
    const dayName = cursor.toLocaleDateString('en-US', { weekday: 'long' }) as DayOfWeek
    const session = FITNESS_SESSIONS.find((s) => s.day === dayName)
    if (!session) break

    if (session.type === 'rest') {
      streak += 1
      cursor.setDate(cursor.getDate() - 1)
      continue
    }

    const log = logsByKey.get(`${session.id}-${iso}`)
    if (log && log.pointsEarned > 0) {
      streak += 1
      cursor.setDate(cursor.getDate() - 1)
    } else {
      // Today may legitimately not be logged yet — don't break the streak for that.
      if (i === 0) {
        cursor.setDate(cursor.getDate() - 1)
        continue
      }
      break
    }
  }

  return streak
}
