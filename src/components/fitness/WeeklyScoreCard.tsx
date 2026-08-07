import { ProgressBar } from '../shared/ui'
import { FlameIcon } from '../shared/icons'

interface WeeklyScoreCardProps {
  earned: number
  max: number
  sessionsLogged: number
  totalSessions: number
  streak: number
}

export function WeeklyScoreCard({ earned, max, sessionsLogged, totalSessions, streak }: WeeklyScoreCardProps) {
  const percent = max > 0 ? earned / max : 0
  return (
    <div>
      <div className="grid grid-cols-3 border-t-2 border-ink border-b-2 border-divider">
        <div className="py-3.5 pr-2.5">
          <p className="mb-1.5 text-[10px] font-semibold tracking-[0.12em] text-neutral-600 uppercase">Score</p>
          <p className="text-[28px] leading-none font-semibold tracking-[-0.03em] text-ink">{earned}</p>
        </div>
        <div className="border-l-2 border-divider py-3.5 px-2.5">
          <p className="mb-1.5 text-[10px] font-semibold tracking-[0.12em] text-neutral-600 uppercase">Done</p>
          <p className="text-[28px] leading-none font-semibold tracking-[-0.03em] text-ink">{Math.round(percent * 100)}%</p>
        </div>
        <div className="border-l-2 border-divider py-3.5 px-2.5">
          <p className="mb-1.5 text-[10px] font-semibold tracking-[0.12em] text-neutral-600 uppercase">Streak</p>
          <p className="text-[28px] leading-none font-semibold tracking-[-0.03em] text-ink">{streak}d</p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <ProgressBar value={percent} className="flex-1" />
        <span className="shrink-0 text-xs text-neutral-600">{sessionsLogged}/{totalSessions} sessions</span>
      </div>
      {streak > 0 && (
        <p className="mt-2.5 flex items-center gap-1.5 text-[13px] text-accent-700">
          <FlameIcon width={14} height={14} /> {streak}-day streak
        </p>
      )}
    </div>
  )
}
