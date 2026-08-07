import { useState } from 'react'
import { Modal, Button, TextInput, TextArea, inputClass } from '../shared/ui'
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
      <div className="space-y-4">
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs font-medium text-neutral-600">Name</span>
          <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Fajitas" autoFocus />
        </label>

        <label className="block text-sm">
          <span className="mb-1.5 block text-xs font-medium text-neutral-600">Meal type</span>
          <select value={type} onChange={(e) => setType(e.target.value as MealType)} className={inputClass}>
            {MEAL_TYPES.map((t) => (
              <option key={t} value={t}>
                {t[0].toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="mb-1.5 block text-xs font-medium text-neutral-600">Ingredients (comma separated)</span>
          <TextArea
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            rows={2}
            placeholder="chicken breast, rice, mixed vegetables"
          />
          <span className="mt-1 block text-xs text-neutral-500">Matched against your inventory names to check what you can make now.</span>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">
            <span className="mb-1.5 block text-xs font-medium text-neutral-600">kcal</span>
            <TextInput type="number" value={kcal} onChange={(e) => setKcal(e.target.value)} />
          </label>
          <label className="text-sm">
            <span className="mb-1.5 block text-xs font-medium text-neutral-600">Protein (g)</span>
            <TextInput type="number" value={protein} onChange={(e) => setProtein(e.target.value)} />
          </label>
        </div>

        <label className="block text-sm">
          <span className="mb-1.5 block text-xs font-medium text-neutral-600">Notes</span>
          <TextArea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
        </label>

        <label className="flex items-center gap-2.5 text-sm">
          <input
            type="checkbox"
            checked={liked}
            onChange={(e) => setLiked(e.target.checked)}
            className="h-5 w-5 rounded border-2 border-divider accent-accent focus:ring-accent"
          />
          I like this meal
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
