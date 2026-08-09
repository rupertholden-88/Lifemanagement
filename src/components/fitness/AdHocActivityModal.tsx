import { useState } from 'react'
import { Modal, Button, TextInput, TextArea } from '../shared/ui'
import { isoToday } from '../../lib/date'
import type { AdHocActivity } from '../../types'

interface AdHocActivityModalProps {
  open: boolean
  onClose: () => void
  onSave: (input: Omit<AdHocActivity, 'id'>) => void
}

export function AdHocActivityModal({ open, onClose, onSave }: AdHocActivityModalProps) {
  const [activity, setActivity] = useState('')
  const [date, setDate] = useState(isoToday())
  const [durationMin, setDurationMin] = useState('')
  const [notes, setNotes] = useState('')

  if (!open) return null

  const handleSave = () => {
    if (!activity.trim()) return
    onSave({
      activity: activity.trim(),
      date,
      durationMin: durationMin ? Number(durationMin) : undefined,
      notes: notes || undefined,
    })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Log something else">
      <p className="mb-4 text-xs text-neutral-600">
        For anything outside the plan — this is kept for the record and doesn&rsquo;t count toward your weekly score.
      </p>
      <div className="space-y-4">
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs font-medium text-neutral-600">What did you do?</span>
          <TextInput value={activity} onChange={(e) => setActivity(e.target.value)} placeholder="e.g. Golf, Light run" autoFocus />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">
            <span className="mb-1.5 block text-xs font-medium text-neutral-600">Date</span>
            <TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label className="text-sm">
            <span className="mb-1.5 block text-xs font-medium text-neutral-600">Duration (min)</span>
            <TextInput type="number" value={durationMin} onChange={(e) => setDurationMin(e.target.value)} />
          </label>
        </div>

        <label className="block text-sm">
          <span className="mb-1.5 block text-xs font-medium text-neutral-600">Notes</span>
          <TextArea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
        </label>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save</Button>
      </div>
    </Modal>
  )
}
