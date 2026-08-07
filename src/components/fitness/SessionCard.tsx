import { Badge } from '../shared/ui'
import type { ExerciseLog, FitnessSession } from '../../types'

const TYPE_STYLE: Record<FitnessSession['type'], string> = {
  'run-easy': 'bg-sky-50 text-sky-700 ring-sky-600/20',
  'run-quality': 'bg-clay-100 text-clay-700 ring-clay-500/20',
  strength: 'bg-plum-100 text-plum-600 ring-plum-600/20',
  rest: 'bg-slate-100 text-slate-500 ring-slate-500/10',
  'active-recovery': 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
}

/** Left-edge accent so the shape of the week is legible at a glance. */
const TYPE_ACCENT: Record<FitnessSession['type'], string> = {
  'run-easy': 'border-l-sky-400',
  'run-quality': 'border-l-clay-500',
  strength: 'border-l-plum-600',
  rest: 'border-l-slate-200',
  'active-recovery': 'border-l-emerald-400',
}

const TYPE_ICON: Record<FitnessSession['type'], string> = {
  'run-easy': '🏃',
  'run-quality': '⚡',
  strength: '💪',
  rest: '🌙',
  'active-recovery': '🚶',
}

interface SessionCardProps {
  session: FitnessSession
  dateLabel: string
  isToday: boolean
  log?: ExerciseLog
  qualityTitle?: string
  onOpen: () => void
}

export function SessionCard({ session, dateLabel, isToday, log, qualityTitle, onOpen }: SessionCardProps) {
  const isRest = session.type === 'rest'
  const completed = Boolean(log)

  return (
    <button
      onClick={isRest ? undefined : onOpen}
      disabled={isRest}
      className={`flex w-full items-start gap-3 rounded-xl border border-l-4 p-3.5 text-left transition sm:p-4 ${
        TYPE_ACCENT[session.type]
      } ${isToday ? 'border-teal-300 border-l-teal-500 bg-teal-50/50' : 'border-paper-200 bg-white'} ${
        isRest ? 'cursor-default' : 'hover:shadow-sm'
      }`}
    >
      <div className="w-14 shrink-0 pt-0.5 text-center sm:w-16">
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
          {dateLabel.split(' ')[0]}
        </p>
        <p className="text-sm font-semibold text-navy-900">{dateLabel.split(' ')[1]}</p>
      </div>

      <div className="flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5">
            <span className="text-sm">{TYPE_ICON[session.type]}</span>
            <span className="font-medium text-navy-900">{session.title}</span>
          </span>
          <Badge className={TYPE_STYLE[session.type]}>{session.duration}</Badge>
          {completed && <Badge className="bg-teal-600 text-white ring-0">✓ Logged · {log!.pointsEarned} pts</Badge>}
          {isToday && !completed && <Badge className="bg-navy-900 text-white ring-0">Today</Badge>}
        </div>
        <p className="text-sm text-slate-500">
          {qualityTitle ? <span className="font-medium text-slate-700">{qualityTitle} — </span> : null}
          {session.detail}
        </p>
      </div>

      {!isRest && (
        <span className="shrink-0 self-center text-sm font-medium text-teal-600">
          {completed ? 'Edit' : 'Log'}
        </span>
      )}
    </button>
  )
}
