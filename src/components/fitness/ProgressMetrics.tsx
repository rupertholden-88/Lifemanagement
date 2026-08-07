import { useState } from 'react'
import { useFitness } from '../../context/FitnessContext'
import { METRIC_TARGETS } from '../../data/fitnessPlan'
import { Card, Button, ProgressBar, TextInput } from '../shared/ui'
import { Sparkline } from '../shared/Sparkline'
import { isoToday } from '../../lib/date'
import type { MetricKey } from '../../types'

export function ProgressMetrics() {
  const { metricEntries, addMetricEntry, removeMetricEntry } = useFitness()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ date: isoToday(), weight: '', restingHr: '', bodyFat: '', fiveKMinutes: '', notes: '' })

  const sorted = [...metricEntries].sort((a, b) => (a.date < b.date ? -1 : 1))

  const latestFor = (key: MetricKey) => {
    for (let i = sorted.length - 1; i >= 0; i--) {
      const v = sorted[i][key]
      if (typeof v === 'number') return v
    }
    return undefined
  }

  const historyFor = (key: MetricKey) => sorted.map((e) => e[key]).filter((v): v is number => typeof v === 'number')

  const handleSubmit = () => {
    addMetricEntry({
      date: form.date,
      weight: form.weight ? Number(form.weight) : undefined,
      restingHr: form.restingHr ? Number(form.restingHr) : undefined,
      bodyFat: form.bodyFat ? Number(form.bodyFat) : undefined,
      fiveKMinutes: form.fiveKMinutes ? Number(form.fiveKMinutes) : undefined,
      notes: form.notes || undefined,
    })
    setForm({ date: isoToday(), weight: '', restingHr: '', bodyFat: '', fiveKMinutes: '', notes: '' })
    setShowForm(false)
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[19px] font-semibold tracking-[-0.02em] text-ink">Progress markers</h2>
        <Button variant="secondary" onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Cancel' : '+ Log reading'}
        </Button>
      </div>

      {showForm && (
        <div className="mb-5 border-t-2 border-ink pt-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm">
              <span className="mb-1.5 block text-xs font-medium text-neutral-600">Date</span>
              <TextInput type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
            </label>
            <label className="text-sm">
              <span className="mb-1.5 block text-xs font-medium text-neutral-600">Weight (kg)</span>
              <TextInput type="number" step="0.1" value={form.weight} onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))} />
            </label>
            <label className="text-sm">
              <span className="mb-1.5 block text-xs font-medium text-neutral-600">Resting HR</span>
              <TextInput type="number" value={form.restingHr} onChange={(e) => setForm((f) => ({ ...f, restingHr: e.target.value }))} />
            </label>
            <label className="text-sm">
              <span className="mb-1.5 block text-xs font-medium text-neutral-600">Body fat (%)</span>
              <TextInput type="number" step="0.1" value={form.bodyFat} onChange={(e) => setForm((f) => ({ ...f, bodyFat: e.target.value }))} />
            </label>
            <label className="text-sm">
              <span className="mb-1.5 block text-xs font-medium text-neutral-600">5K time (min)</span>
              <TextInput type="number" step="0.1" value={form.fiveKMinutes} onChange={(e) => setForm((f) => ({ ...f, fiveKMinutes: e.target.value }))} />
            </label>
          </div>
          <div className="mt-3 flex justify-end">
            <Button onClick={handleSubmit}>Save reading</Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-x-4 gap-y-5">
        {METRIC_TARGETS.map((target) => {
          const current = latestFor(target.key) ?? target.start
          const history = historyFor(target.key)
          const totalDelta = target.target - target.start
          const progress = totalDelta !== 0 ? (current - target.start) / totalDelta : 0
          return (
            <Card key={target.key}>
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-medium text-neutral-700">{target.label}</p>
                <Sparkline values={history.length ? history : [target.start, current]} color="var(--color-accent)" />
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-xl font-semibold text-ink">
                  {current}
                  <span className="ml-1 text-xs font-normal text-neutral-500">{target.unit}</span>
                </span>
              </div>
              <p className="text-xs text-neutral-500">target {target.target}{target.unit}</p>
              <ProgressBar value={Math.max(0, Math.min(1, progress))} className="mt-2" />
            </Card>
          )
        })}
      </div>

      {sorted.length > 0 && (
        <div className="mt-6">
          <p className="mb-2 text-[10.5px] font-semibold tracking-[0.14em] text-neutral-600 uppercase">History</p>
          <div className="overflow-x-auto border-t-2 border-ink">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-neutral-500">
                <tr className="border-b-2 border-divider">
                  <th className="py-2 pr-2 font-medium">Date</th>
                  <th className="px-2 py-2 font-medium">Weight</th>
                  <th className="px-2 py-2 font-medium">RHR</th>
                  <th className="px-2 py-2 font-medium">Body fat</th>
                  <th className="px-2 py-2 font-medium">5K</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {[...sorted].reverse().map((entry) => (
                  <tr key={entry.id} className="border-b border-neutral-200">
                    <td className="py-2 pr-2 text-neutral-700">{entry.date}</td>
                    <td className="px-2 py-2 text-neutral-700">{entry.weight ?? '—'}</td>
                    <td className="px-2 py-2 text-neutral-700">{entry.restingHr ?? '—'}</td>
                    <td className="px-2 py-2 text-neutral-700">{entry.bodyFat ?? '—'}</td>
                    <td className="px-2 py-2 text-neutral-700">{entry.fiveKMinutes ?? '—'}</td>
                    <td className="py-2 text-right">
                      <button onClick={() => removeMetricEntry(entry.id)} className="text-xs text-neutral-500 hover:text-accent-700">
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
