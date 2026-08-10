import { useState } from 'react'
import { Modal, Button, TextInput, TextArea, Banner, Segmented } from '../shared/ui'
import type { ExerciseLog, FitnessSession, StrengthVariant } from '../../types'

interface SessionLogModalProps {
  open: boolean
  onClose: () => void
  session: FitnessSession
  date: string
  dateLabel: string
  qualityDetail?: { title: string; detail: string }
  /** The routine live for this week, and a way to switch it. */
  variant?: StrengthVariant
  onVariantChange?: (variantId: string) => void
  existingLog?: ExerciseLog
  onSave: (input: {
    completedExercises: string[]
    durationMin?: number
    avgHr?: number
    distanceKm?: number
    notes?: string
    pointsEarned: number
  }) => void
  onDelete?: () => void
}

export function SessionLogModal({
  open,
  onClose,
  session,
  dateLabel,
  qualityDetail,
  variant,
  onVariantChange,
  existingLog,
  onSave,
  onDelete,
}: SessionLogModalProps) {
  const exercises = variant?.exercises ?? []
  const hasExercises = exercises.length > 0

  const [checked, setChecked] = useState<Set<string>>(
    new Set(existingLog?.completedExercises ?? (hasExercises ? [] : ['done'])),
  )
  const [durationMin, setDurationMin] = useState(existingLog?.durationMin?.toString() ?? '')
  const [avgHr, setAvgHr] = useState(existingLog?.avgHr?.toString() ?? '')
  const [distanceKm, setDistanceKm] = useState(existingLog?.distanceKm?.toString() ?? '')
  const [notes, setNotes] = useState(existingLog?.notes ?? '')

  if (!open) return null

  const toggle = (name: string) => {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  const handleSave = () => {
    // Switching routine mid-week can leave ticks for exercises the current one
    // doesn't have; counting those would score above what was actually done.
    const relevant = hasExercises
      ? Array.from(checked).filter((name) => exercises.some((ex) => ex.name === name))
      : Array.from(checked)
    const totalItems = hasExercises ? exercises.length : 1
    const pointsEarned = Math.round(session.points * (relevant.length / totalItems))

    onSave({
      completedExercises: relevant,
      durationMin: durationMin ? Number(durationMin) : undefined,
      avgHr: avgHr ? Number(avgHr) : undefined,
      distanceKm: distanceKm ? Number(distanceKm) : undefined,
      notes: notes || undefined,
      pointsEarned,
    })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={`${session.title} — ${dateLabel}`}>
      {qualityDetail && (
        <Banner>
          <span className="font-semibold">{qualityDetail.title}: </span>
          {qualityDetail.detail}
        </Banner>
      )}

      {session.variants && session.variants.length > 1 && onVariantChange && (
        <div className="mb-4">
          <p className="mb-1.5 text-xs font-medium text-neutral-600">Routine for this week</p>
          <Segmented
            options={session.variants.map((v) => ({ id: v.id, label: v.name }))}
            value={variant?.id ?? session.variants[0].id}
            onChange={onVariantChange}
          />
          {variant && <p className="mt-1.5 text-xs text-neutral-600">{variant.focus}</p>}
        </div>
      )}

      {hasExercises ? (
        <div className="mb-4">
          <p className="mb-2 text-sm font-semibold text-ink">Exercises completed</p>
          {exercises.map((ex) => (
            <label
              key={ex.name}
              className="flex cursor-pointer items-start gap-3 border-t-2 border-divider py-3 first:border-t-0"
            >
              <input
                type="checkbox"
                checked={checked.has(ex.name)}
                onChange={() => toggle(ex.name)}
                className="mt-0.5 h-5 w-5 shrink-0 rounded border-2 border-divider accent-accent focus:ring-accent"
              />
              <span>
                <span className="block text-sm font-medium text-ink">
                  {ex.name} <span className="font-normal text-neutral-600">· {ex.reps}</span>
                </span>
                <span className="block text-xs text-neutral-600">{ex.cue}</span>
              </span>
            </label>
          ))}
          {session.rounds && (
            <p className="mt-2 text-xs text-neutral-600">
              {session.rounds} rounds · rest {session.restBetweenRounds} between rounds
            </p>
          )}
        </div>
      ) : (
        <label className="mb-4 flex items-center gap-3 border-2 border-divider p-3">
          <input
            type="checkbox"
            checked={checked.has('done')}
            onChange={() => toggle('done')}
            className="h-5 w-5 rounded border-2 border-divider accent-accent focus:ring-accent"
          />
          <span className="text-sm font-medium text-ink">Mark this session as done</span>
        </label>
      )}

      <div className="mb-4 grid grid-cols-3 gap-3">
        <label className="text-sm">
          <span className="mb-1.5 block text-xs font-medium text-neutral-600">Duration (min)</span>
          <TextInput type="number" value={durationMin} onChange={(e) => setDurationMin(e.target.value)} />
        </label>
        <label className="text-sm">
          <span className="mb-1.5 block text-xs font-medium text-neutral-600">Avg HR</span>
          <TextInput type="number" value={avgHr} onChange={(e) => setAvgHr(e.target.value)} />
        </label>
        <label className="text-sm">
          <span className="mb-1.5 block text-xs font-medium text-neutral-600">Distance (km)</span>
          <TextInput type="number" step="0.1" value={distanceKm} onChange={(e) => setDistanceKm(e.target.value)} />
        </label>
      </div>

      <label className="mb-5 block text-sm">
        <span className="mb-1.5 block text-xs font-medium text-neutral-600">Notes</span>
        <TextArea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
      </label>

      <div className="flex items-center justify-between gap-3">
        {existingLog && onDelete ? (
          <Button variant="danger" onClick={onDelete}>
            Remove log
          </Button>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div>
    </Modal>
  )
}
