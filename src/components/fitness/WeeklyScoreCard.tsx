import { Card, ProgressBar } from '../shared/ui'

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
    <Card className="bg-gradient-to-br from-navy-900 to-navy-800 text-white">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-teal-300">This week's score</p>
          <p className="font-display mt-1 text-3xl font-semibold">
            {earned} <span className="text-lg font-normal text-slate-300">/ {max} pts</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold">{Math.round(percent * 100)}%</p>
          <p className="text-xs text-slate-300">{sessionsLogged}/{totalSessions} sessions</p>
        </div>
      </div>
      <ProgressBar value={percent} className="mt-4 bg-white/10" />
      {streak > 0 && (
        <p className="mt-3 text-sm text-teal-200">🔥 {streak}-day streak</p>
      )}
    </Card>
  )
}
