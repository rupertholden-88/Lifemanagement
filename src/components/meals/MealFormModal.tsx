import { useState } from 'react'
import { Modal, Button } from '../shared/ui'
import type { Meal, MealType } from '../../types'

interface MealFormModalProps {
  open: boolean
  onClose: () => void
  onSave: (meal: Omit<Meal, 'id' | 'isCustom'>) => void
  initial?: Meal
}

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']

export function MealFormModal({ open, onClose, onSave, initial }: MealFormModalProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [type, setType] = useState<MealType>(initial?.type ?? 'dinner')
  const [ingredients, setIngredients] = useState(initial?.ingredients.join(', ') ?? '')
  const [kcal, setKcal] = useState(initial?.kcal?.toString() ?? '')
  const [protein, setProtein] = useState(initial?.protein?.toString() ?? '')
  const [liked, setLiked] = useState(initial?.liked ?? true)
  const [notes, setNotes] = useState(initial?.notes ?? '')

  if (!open) return null

  const handleSave = () => {
    if (!name.trim()) return
    onSave({
      name: name.trim(),
      type,
      ingredients: ingredients.split(',').map((i) => i.trim()).filter(Boolean),
      kcal: kcal ? Number(kcal) : undefined,
      protein: protein ? Number(protein) : undefined,
      liked,
      notes: notes || undefined,
    })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit meal' : 'Add a meal'}>
      <div className="space-y-3">
        <label className="block text-sm">
          <span className="mb-1 block text-xs font-medium text-slate-600">Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
            placeholder="e.g. Fajitas"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-xs font-medium text-slate-600">Meal type</span>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as MealType)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {MEAL_TYPES.map((t) => (
              <option key={t} value={t}>
                {t[0].toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-xs font-medium text-slate-600">Ingredients (comma separated)</span>
          <textarea
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            rows={2}
            className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
            placeholder="chicken breast, rice, mixed vegetables"
          />
          <span className="mt-1 block text-xs text-slate-400">
            Matched against your inventory names to check what you can make now.
          </span>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">
            <span className="mb-1 block text-xs font-medium text-slate-600">kcal</span>
            <input
              type="number"
              value={kcal}
              onChange={(e) => setKcal(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-xs font-medium text-slate-600">Protein (g)</span>
            <input
              type="number"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
        </div>

        <label className="block text-sm">
          <span className="mb-1 block text-xs font-medium text-slate-600">Notes</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
          />
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={liked}
            onChange={(e) => setLiked(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
          />
          I like this meal
        </label>
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save</Button>
      </div>
    </Modal>
  )
}
