import { DAYS_OF_WEEK, type DayOfWeek } from '../types'

export function isoToday(): string {
  return toIso(new Date())
}

export function toIso(date: Date): string {
  return date.toISOString().slice(0, 10)
}

/** Monday-indexed day-of-week for a Date (0 = Monday .. 6 = Sunday). */
function mondayIndex(date: Date): number {
  return (date.getDay() + 6) % 7
}

/** Returns the Monday..Sunday dates for the week containing `today`, shifted by `weekOffset` weeks. */
export function getWeekDates(today: Date = new Date(), weekOffset = 0): { day: DayOfWeek; date: string }[] {
  const monday = new Date(today)
  monday.setDate(monday.getDate() - mondayIndex(today) + weekOffset * 7)
  monday.setHours(0, 0, 0, 0)

  return DAYS_OF_WEEK.map((day, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return { day, date: toIso(d) }
  })
}

export function formatDayLabel(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })
}

export function weekRangeLabel(dates: { date: string }[]): string {
  if (dates.length === 0) return ''
  const first = new Date(dates[0].date + 'T00:00:00')
  const last = new Date(dates[dates.length - 1].date + 'T00:00:00')
  const fmt: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }
  return `${first.toLocaleDateString(undefined, fmt)} – ${last.toLocaleDateString(undefined, fmt)}`
}

/** Number of whole weeks between planStart and today (>= 0), used to pick the quality-run rotation. */
export function weeksSince(planStartIso: string, referenceDate: Date = new Date()): number {
  const start = new Date(planStartIso + 'T00:00:00')
  const days = Math.max(0, Math.floor((referenceDate.getTime() - start.getTime()) / 86400000))
  return Math.floor(days / 7)
}
