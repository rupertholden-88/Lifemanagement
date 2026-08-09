import { useMemo, useState } from 'react'
import { useFitness } from '../../context/FitnessContext'
import { computeAchievements } from '../../lib/achievements'
import { Button } from '../shared/ui'
import { CheckIcon, LockIcon, TrophyIcon } from '../shared/icons'
import type { FitnessSession } from '../../types'

/** Locked achievements shown before the user asks to see them all. */
const COLLAPSED_LOCKED = 4

export function Achievements({ schedule }: { schedule: FitnessSession[] }) {
  const { exerciseLogs, adHocActivities, metricEntries } = useFitness()
  const [expanded, setExpanded] = useState(false)

  const achievements = useMemo(
    () => computeAchievements(exerciseLogs, adHocActivities, metricEntries, schedule),
    [exerciseLogs, adHocActivities, metricEntries, schedule],
  )

  const unlocked = achievements.filter((a) => a.unlocked)
  const locked = achievements.filter((a) => !a.unlocked)

  // Closest to completion first, so the next thing to aim at leads.
  const lockedByCloseness = [...locked].sort((a, b) => {
    const share = (x: typeof a) => (x.progress ? x.progress.current / x.progress.target : 0)
    return share(b) - share(a)
  })
  const visibleLocked = expanded ? lockedByCloseness : lockedByCloseness.slice(0, COLLAPSED_LOCKED)

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="text-[19px] font-semibold tracking-[-0.02em] text-ink">Achievements</h2>
        <span className="text-xs text-neutral-600">
          {unlocked.length} of {achievements.length}
        </span>
      </div>

      {unlocked.length > 0 && (
        <div className="mb-3 grid grid-cols-2 gap-2">
          {unlocked.map((a) => (
            <div key={a.id} className="border-2 border-accent bg-accent-100 p-3">
              <div className="mb-1 flex items-center gap-1.5 text-accent-800">
                <TrophyIcon width={14} height={14} className="shrink-0" />
                <p className="font-heading text-[13.5px] font-semibold">{a.name}</p>
              </div>
              <p className="text-xs leading-snug text-accent-800/80">{a.description}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        {visibleLocked.map((a) => (
          <div key={a.id} className="border-2 border-divider p-3">
            <div className="mb-1 flex items-center gap-1.5 text-neutral-600">
              <LockIcon width={13} height={13} className="shrink-0" />
              <p className="font-heading text-[13.5px] font-semibold">{a.name}</p>
            </div>
            <p className="text-xs leading-snug text-neutral-600">{a.description}</p>
            {a.progress && a.progress.target > 1 && (
              <p className="mt-1.5 font-heading text-[11px] font-semibold text-neutral-500">
                {a.progress.current} / {a.progress.target}
              </p>
            )}
          </div>
        ))}
      </div>

      {locked.length > COLLAPSED_LOCKED && (
        <Button variant="ghost" className="mt-2" onClick={() => setExpanded((e) => !e)}>
          {expanded ? 'Show less' : `Show ${locked.length - COLLAPSED_LOCKED} more`}
        </Button>
      )}

      {unlocked.length === achievements.length && (
        <p className="mt-3 flex items-center gap-2 text-sm text-accent-700">
          <CheckIcon width={14} height={14} /> Every one of them. Go again.
        </p>
      )}
    </div>
  )
}
