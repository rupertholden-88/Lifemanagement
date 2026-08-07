import { useState } from 'react'
import { useFitness } from '../../context/FitnessContext'
import { METRIC_TARGETS } from '../../data/fitnessPlan'
import { Card, Button, ProgressBar } from '../shared/ui'
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
        <h2 className="text-base font-semibold text-navy-900">Progress markers</h2>
        <Button variant="secondary" onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Cancel' : '+ Log reading'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <label className="text-sm">
              <span className="mb-1 block text-xs font-medium text-slate-600">Date</span>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-xs font-medium text-slate-600">Weight (kg)</span>
              <input
                type="number"
                step="0.1"
                value={form.weight}
                onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-xs font-medium text-slate-600">Resting HR</span>
              <input
                type="number"
                value={form.restingHr}
                onChange={(e) => setForm((f) => ({ ...f, restingHr: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-xs font-medium text-slate-600">Body fat (%)</span>
              <input
                type="number"
                step="0.1"
                value={form.bodyFat}
                onChange={(e) => setForm((f) => ({ ...f, bodyFat: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-xs font-medium text-slate-600">5K time (min)</span>
              <input
                type="number"
                step="0.1"
                value={form.fiveKMinutes}
                onChange={(e) => setForm((f) => ({ ...f, fiveKMinutes: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
              />
            </label>
          </div>
          <div className="mt-3 flex justify-end">
            <Button onClick={handleSubmit}>Save reading</Button>
          </div>
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {METRIC_TARGETS.map((target) => {
          const current = latestFor(target.key) ?? target.start
          const history = historyFor(target.key)
          const totalDelta = target.target - target.start
          const progress = totalDelta !== 0 ? (current - target.start) / totalDelta : 0
          return (
            <Card key={target.key}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-600">{target.label}</p>
                <Sparkline values={history.length ? history : [target.start, current]} />
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-semibold text-navy-900">
                  {current}
                  <span className="ml-1 text-sm font-normal text-slate-400">{target.unit}</span>
                </span>
                <span className="text-xs text-slate-400">target {target.target}{target.unit}</span>
              </div>
              <ProgressBar value={Math.max(0, Math.min(1, progress))} className="mt-2" />
            </Card>
          )
        })}
      </div>

      {sorted.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">History</p>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs text-slate-500">
                <tr>
                  <th className="px-3 py-2 font-medium">Date</th>
                  <th className="px-3 py-2 font-medium">Weight</th>
                  <th className="px-3 py-2 font-medium">RHR</th>
                  <th className="px-3 py-2 font-medium">Body fat</th>
                  <th className="px-3 py-2 font-medium">5K</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {[...sorted].reverse().map((entry) => (
                  <tr key={entry.id} className="border-t border-slate-100">
                    <td className="px-3 py-2 text-slate-700">{entry.date}</td>
                    <td className="px-3 py-2 text-slate-700">{entry.weight ?? '—'}</td>
                    <td className="px-3 py-2 text-slate-700">{entry.restingHr ?? '—'}</td>
                    <td className="px-3 py-2 text-slate-700">{entry.bodyFat ?? '—'}</td>
                    <td className="px-3 py-2 text-slate-700">{entry.fiveKMinutes ?? '—'}</td>
                    <td className="px-3 py-2 text-right">
                      <button
                        onClick={() => removeMetricEntry(entry.id)}
                        className="text-xs text-slate-400 hover:text-red-600"
                      >
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
