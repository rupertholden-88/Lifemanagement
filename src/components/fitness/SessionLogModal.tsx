import { useState } from 'react'
import { Modal, Button } from '../shared/ui'
import type { ExerciseLog, FitnessSession } from '../../types'

interface SessionLogModalProps {
  open: boolean
  onClose: () => void
  session: FitnessSession
  date: string
  dateLabel: string
  qualityDetail?: { title: string; detail: string }
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
  existingLog,
  onSave,
  onDelete,
}: SessionLogModalProps) {
  const hasExercises = Boolean(session.exercises?.length)

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
    const totalItems = hasExercises ? session.exercises!.length : 1
    const completedCount = checked.size
    const pointsEarned = Math.round(session.points * (completedCount / totalItems))

    onSave({
      completedExercises: Array.from(checked),
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
        <div className="mb-4 rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-800">
          <span className="font-semibold">{qualityDetail.title}: </span>
          {qualityDetail.detail}
        </div>
      )}

      {hasExercises ? (
        <div className="mb-4 space-y-2">
          <p className="text-sm font-medium text-slate-700">Exercises completed</p>
          {session.exercises!.map((ex) => (
            <label
              key={ex.name}
              className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-2.5 hover:bg-slate-50"
            >
              <input
                type="checkbox"
                checked={checked.has(ex.name)}
                onChange={() => toggle(ex.name)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <span>
                <span className="block text-sm font-medium text-slate-800">
                  {ex.name} <span className="font-normal text-slate-500">· {ex.reps}</span>
                </span>
                <span className="block text-xs text-slate-500">{ex.cue}</span>
              </span>
            </label>
          ))}
          {session.rounds && (
            <p className="text-xs text-slate-500">
              {session.rounds} rounds · rest {session.restBetweenRounds} between rounds
            </p>
          )}
        </div>
      ) : (
        <label className="mb-4 flex items-center gap-3 rounded-lg border border-slate-200 p-3">
          <input
            type="checkbox"
            checked={checked.has('done')}
            onChange={() => toggle('done')}
            className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
          />
          <span className="text-sm font-medium text-slate-800">Mark this session as done</span>
        </label>
      )}

      <div className="mb-4 grid grid-cols-3 gap-3">
        <label className="text-sm">
          <span className="mb-1 block text-xs font-medium text-slate-600">Duration (min)</span>
          <input
            type="number"
            value={durationMin}
            onChange={(e) => setDurationMin(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-xs font-medium text-slate-600">Avg HR</span>
          <input
            type="number"
            value={avgHr}
            onChange={(e) => setAvgHr(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-xs font-medium text-slate-600">Distance (km)</span>
          <input
            type="number"
            step="0.1"
            value={distanceKm}
            onChange={(e) => setDistanceKm(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
          />
        </label>
      </div>

      <label className="mb-5 block text-sm">
        <span className="mb-1 block text-xs font-medium text-slate-600">Notes</span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
        />
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
