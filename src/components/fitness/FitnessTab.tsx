import { useMemo, useState } from 'react'
import { useFitness } from '../../context/FitnessContext'
import { useSettings } from '../../context/SettingsContext'
import { FITNESS_RULES, HEART_RATE_ZONES, QUALITY_RUN_ROTATION, WEEKLY_MAX_POINTS, scheduleForWfhDay } from '../../data/fitnessPlan'
import { getWeekDates, formatDayLabel, weekRangeLabel, weeksSince, isoToday } from '../../lib/date'
import { weeklyScoreFor, computeStreak } from '../../lib/fitnessScoring'
import { Card, IconButton } from '../shared/ui'
import { ChevronLeftIcon, ChevronRightIcon } from '../shared/icons'
import { SessionCard } from './SessionCard'
import { SessionLogModal } from './SessionLogModal'
import { WeeklyScoreCard } from './WeeklyScoreCard'
import { ProgressMetrics } from './ProgressMetrics'
import { DAYS_OF_WEEK, type DayOfWeek, type FitnessSession } from '../../types'

export function FitnessTab() {
  const { exerciseLogs, logSession, removeLog, planStartDate } = useFitness()
  const { wfhDay, setWfhDay } = useSettings()
  const [weekOffset, setWeekOffset] = useState(0)
  const [activeSession, setActiveSession] = useState<{ session: FitnessSession; date: string; dateLabel: string } | null>(null)

  const schedule = useMemo(() => scheduleForWfhDay(wfhDay), [wfhDay])
  const week = useMemo(() => getWeekDates(new Date(), weekOffset), [weekOffset])
  const qualityWeek = useMemo(() => {
    const monday = new Date(week[0].date + 'T00:00:00')
    const idx = weeksSince(planStartDate, monday) % QUALITY_RUN_ROTATION.length
    return QUALITY_RUN_ROTATION[idx]
  }, [week, planStartDate])

  const score = useMemo(() => weeklyScoreFor(exerciseLogs, schedule, weekOffset), [exerciseLogs, schedule, weekOffset])
  const streak = useMemo(() => computeStreak(exerciseLogs, schedule), [exerciseLogs, schedule])
  const today = isoToday()

  const logsByKey = new Map(exerciseLogs.map((l) => [`${l.sessionId}-${l.date}`, l]))

  return (
    <div>
      <p className="mb-2.5 text-[11px] font-semibold tracking-[0.16em] text-accent-700">{weekRangeLabel(week).toUpperCase()}</p>
      <h1 className="mb-5 text-[36px] leading-[1.05] font-semibold tracking-[-0.03em] text-ink">Fitness</h1>

      <div className="mb-5 flex items-center justify-between gap-3">
        <IconButton onClick={() => setWeekOffset((w) => w - 1)} aria-label="Previous week">
          <ChevronLeftIcon width={16} height={16} />
        </IconButton>
        <label className="flex items-center gap-2 text-[13px] text-neutral-600">
          WFH day
          <select
            value={wfhDay}
            onChange={(e) => setWfhDay(e.target.value as DayOfWeek)}
            className="min-h-10 rounded-full border-2 border-divider bg-neutral-100 px-3 py-1.5 font-heading text-[13px] font-semibold text-ink"
            title="Strength B (the longer session) follows your work-from-home day"
          >
            {DAYS_OF_WEEK.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
        <IconButton onClick={() => setWeekOffset((w) => w + 1)} aria-label="Next week">
          <ChevronRightIcon width={16} height={16} />
        </IconButton>
      </div>

      <div className="mb-6">
        <WeeklyScoreCard
          earned={score.earned}
          max={WEEKLY_MAX_POINTS}
          sessionsLogged={score.sessionsLogged}
          totalSessions={schedule.filter((s) => s.type !== 'rest').length}
          streak={streak}
        />
      </div>

      <div>
        {week.map(({ day, date }) => {
          const session = schedule.find((s) => s.day === day)
          if (!session) return null
          const log = logsByKey.get(`${session.id}-${date}`)
          return (
            <SessionCard
              key={session.id}
              session={session}
              dateLabel={formatDayLabel(date)}
              isToday={date === today}
              log={log}
              qualityTitle={session.type === 'run-quality' ? qualityWeek.title : undefined}
              onOpen={() => setActiveSession({ session, date, dateLabel: formatDayLabel(date) })}
            />
          )
        })}
      </div>

      <div className="mt-8">
        <ProgressMetrics />
      </div>

      <div className="mt-8 space-y-6">
        <Card>
          <p className="mb-3 text-[15px] font-semibold text-ink">Heart rate zones</p>
          <div className="space-y-3">
            {HEART_RATE_ZONES.map((z) => (
              <div key={z.zone} className="text-sm">
                <p className="font-medium text-ink">
                  {z.zone} <span className="font-normal text-neutral-500">· {z.range}</span>
                </p>
                <p className="text-xs text-neutral-600">{z.usedFor}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <p className="mb-3 text-[15px] font-semibold text-ink">The five rules that matter</p>
          <ol className="list-decimal space-y-2 pl-4 text-sm text-neutral-700">
            {FITNESS_RULES.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ol>
        </Card>
      </div>

      {activeSession && (
        <SessionLogModal
          open
          onClose={() => setActiveSession(null)}
          session={activeSession.session}
          date={activeSession.date}
          dateLabel={activeSession.dateLabel}
          qualityDetail={
            activeSession.session.type === 'run-quality'
              ? { title: qualityWeek.title, detail: qualityWeek.detail }
              : undefined
          }
          existingLog={logsByKey.get(`${activeSession.session.id}-${activeSession.date}`)}
          onSave={(input) => logSession({ sessionId: activeSession.session.id, date: activeSession.date, ...input })}
          onDelete={() => {
            const log = logsByKey.get(`${activeSession.session.id}-${activeSession.date}`)
            if (log) removeLog(log.id)
            setActiveSession(null)
          }}
        />
      )}
    </div>
  )
}
