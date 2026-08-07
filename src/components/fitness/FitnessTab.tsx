import { useMemo, useState } from 'react'
import { useFitness } from '../../context/FitnessContext'
import { FITNESS_SESSIONS, FITNESS_RULES, HEART_RATE_ZONES, QUALITY_RUN_ROTATION, WEEKLY_MAX_POINTS } from '../../data/fitnessPlan'
import { getWeekDates, formatDayLabel, weekRangeLabel, weeksSince, isoToday } from '../../lib/date'
import { weeklyScoreFor, computeStreak } from '../../lib/fitnessScoring'
import { SectionTitle, Card, Button } from '../shared/ui'
import { SessionCard } from './SessionCard'
import { SessionLogModal } from './SessionLogModal'
import { WeeklyScoreCard } from './WeeklyScoreCard'
import { ProgressMetrics } from './ProgressMetrics'
import type { FitnessSession } from '../../types'

export function FitnessTab() {
  const { exerciseLogs, logSession, removeLog, planStartDate } = useFitness()
  const [weekOffset, setWeekOffset] = useState(0)
  const [activeSession, setActiveSession] = useState<{ session: FitnessSession; date: string; dateLabel: string } | null>(null)

  const week = useMemo(() => getWeekDates(new Date(), weekOffset), [weekOffset])
  const qualityWeek = useMemo(() => {
    const monday = new Date(week[0].date + 'T00:00:00')
    const idx = weeksSince(planStartDate, monday) % QUALITY_RUN_ROTATION.length
    return QUALITY_RUN_ROTATION[idx]
  }, [week, planStartDate])

  const score = useMemo(() => weeklyScoreFor(exerciseLogs, weekOffset), [exerciseLogs, weekOffset])
  const streak = useMemo(() => computeStreak(exerciseLogs), [exerciseLogs])
  const today = isoToday()

  const logsByKey = new Map(exerciseLogs.map((l) => [`${l.sessionId}-${l.date}`, l]))

  return (
    <div>
      <SectionTitle title="Fitness" subtitle="Your weekly training plan — log sessions and track progress" />

      <WeeklyScoreCard
        earned={score.earned}
        max={WEEKLY_MAX_POINTS}
        sessionsLogged={score.sessionsLogged}
        totalSessions={FITNESS_SESSIONS.filter((s) => s.type !== 'rest').length}
        streak={streak}
      />

      <div className="mt-6 mb-3 flex items-center justify-between">
        <Button variant="ghost" onClick={() => setWeekOffset((w) => w - 1)}>← Prev</Button>
        <p className="text-sm font-medium text-slate-600">{weekRangeLabel(week)}</p>
        <Button variant="ghost" onClick={() => setWeekOffset((w) => w + 1)}>Next →</Button>
      </div>

      <div className="space-y-2.5">
        {week.map(({ day, date }) => {
          const session = FITNESS_SESSIONS.find((s) => s.day === day)
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
              onOpen={() =>
                setActiveSession({ session, date, dateLabel: formatDayLabel(date) })
              }
            />
          )
        })}
      </div>

      <div className="mt-8">
        <ProgressMetrics />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Card>
          <p className="mb-2 text-sm font-semibold text-navy-900">Heart rate zones</p>
          <div className="space-y-2">
            {HEART_RATE_ZONES.map((z) => (
              <div key={z.zone} className="text-sm">
                <p className="font-medium text-slate-700">{z.zone} <span className="font-normal text-slate-400">· {z.range}</span></p>
                <p className="text-xs text-slate-500">{z.usedFor}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <p className="mb-2 text-sm font-semibold text-navy-900">The five rules that matter</p>
          <ol className="list-decimal space-y-1.5 pl-4 text-sm text-slate-600">
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
          onSave={(input) =>
            logSession({ sessionId: activeSession.session.id, date: activeSession.date, ...input })
          }
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
