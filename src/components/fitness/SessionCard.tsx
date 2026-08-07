import { Tag } from '../shared/ui'
import { RecoveryIcon, RestIcon, RunEasyIcon, RunQualityIcon, StrengthIcon, type IconProps } from '../shared/icons'
import type { ComponentType } from 'react'
import type { ExerciseLog, FitnessSession } from '../../types'

const TYPE_ICON: Record<FitnessSession['type'], ComponentType<IconProps>> = {
  'run-easy': RunEasyIcon,
  'run-quality': RunQualityIcon,
  strength: StrengthIcon,
  rest: RestIcon,
  'active-recovery': RecoveryIcon,
}

const TYPE_TONE: Record<FitnessSession['type'], { bg: string; fg: string }> = {
  'run-easy': { bg: 'bg-neutral-200', fg: 'text-ink' },
  strength: { bg: 'bg-neutral-200', fg: 'text-ink' },
  rest: { bg: 'bg-neutral-300', fg: 'text-neutral-700' },
  'run-quality': { bg: 'bg-accent-200', fg: 'text-accent-800' },
  'active-recovery': { bg: 'bg-neutral-200', fg: 'text-ink' },
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
  const TypeIcon = TYPE_ICON[session.type]
  const tone = TYPE_TONE[session.type]

  return (
    <div className={`border-t-2 py-4 ${isToday ? 'border-ink' : 'border-divider'} ${completed ? 'opacity-70' : ''}`}>
      <div className="mb-2 flex items-center gap-3">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${tone.bg} ${tone.fg}`}>
          <TypeIcon width={16} height={16} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10.5px] font-semibold tracking-[0.12em] text-neutral-600 uppercase">{dateLabel}</p>
          <p className="truncate text-[17px] font-semibold tracking-[-0.02em] text-ink">{session.title}</p>
        </div>
        {isToday && <Tag tone="accent">Today</Tag>}
      </div>

      <p className="mb-3 text-[14px] leading-relaxed text-neutral-700">
        {qualityTitle ? <span className="font-semibold text-ink">{qualityTitle} — </span> : null}
        {session.detail}
      </p>

      <div className="flex items-center gap-2.5">
        <Tag>{session.duration}</Tag>
        {session.points > 0 && <span className="text-[13px] text-neutral-600">{session.points} pts</span>}
        {completed && <Tag tone="ink">✓ {log!.pointsEarned} pts</Tag>}
        <div className="flex-1" />
        {!isRest && (
          <button onClick={onOpen} className="min-h-11 rounded-full px-4 font-heading text-[13.5px] font-semibold text-accent-700 hover:bg-accent-100">
            {completed ? 'Edit' : 'Log'}
          </button>
        )}
      </div>
    </div>
  )
}
