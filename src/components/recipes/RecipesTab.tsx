import { useState } from 'react'
import { useRecipes } from '../../context/RecipesContext'
import { RecipeImport } from './RecipeImport'
import { RecipeCard } from './RecipeCard'
import { SectionTitle, Button, EmptyState, Modal } from '../shared/ui'
import type { Recipe } from '../../types'

export function RecipesTab() {
  const { recipes, addRecipe, deleteRecipe, toggleLiked } = useRecipes()
  const [manualOpen, setManualOpen] = useState(false)
  const [banner, setBanner] = useState<string | null>(null)

  const handleImported = (data: Omit<Recipe, 'id' | 'addedAt' | 'liked'>) => {
    addRecipe({ ...data, liked: true })
    setBanner(`Imported "${data.title}" — ${data.ingredients.length} ingredients found`)
    setTimeout(() => setBanner(null), 5000)
  }

  const sorted = [...recipes].sort((a, b) => (a.addedAt < b.addedAt ? 1 : -1))

  return (
    <div>
      <div className="mb-4 flex items-start justify-between">
        <SectionTitle
          title="Recipe bank"
          subtitle="Save recipe links — every recipe here is automatically available as a dinner in Meals"
        />
        <Button variant="secondary" onClick={() => setManualOpen(true)}>
          + Add manually
        </Button>
      </div>

      {banner && <div className="mb-4 rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-800">{banner}</div>}

      <div className="mb-6">
        <RecipeImport onImported={handleImported} />
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          icon="📖"
          title="No recipes saved yet"
          description="Paste a recipe link above, or add one manually."
        />
      ) : (
        <div className="space-y-3">
          {sorted.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onToggleLiked={() => toggleLiked(recipe.id)}
              onDelete={() => deleteRecipe(recipe.id)}
            />
          ))}
        </div>
      )}

      <ManualRecipeModal
        open={manualOpen}
        onClose={() => setManualOpen(false)}
        onSave={(data) => {
          addRecipe({ ...data, liked: true })
          setBanner(`Added "${data.title}"`)
          setTimeout(() => setBanner(null), 5000)
        }}
      />
    </div>
  )
}

function ManualRecipeModal({
  open,
  onClose,
  onSave,
}: {
  open: boolean
  onClose: () => void
  onSave: (data: Omit<Recipe, 'id' | 'addedAt' | 'liked'>) => void
}) {
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [ingredients, setIngredients] = useState('')
  const [steps, setSteps] = useState('')

  if (!open) return null

  const handleSave = () => {
    if (!title.trim()) return
    onSave({
      title: title.trim(),
      url: url.trim() || undefined,
      ingredients: ingredients.split('\n').map((i) => i.trim()).filter(Boolean),
      steps: steps.split('\n').map((s) => s.trim()).filter(Boolean),
    })
    setTitle('')
    setUrl('')
    setIngredients('')
    setSteps('')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Add a recipe manually">
      <div className="space-y-3">
        <label className="block text-sm">
          <span className="mb-1 block text-xs font-medium text-slate-600">Title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
            autoFocus
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-xs font-medium text-slate-600">Link (optional)</span>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="https://…"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-xs font-medium text-slate-600">Ingredients (one per line)</span>
          <textarea
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            rows={4}
            className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-xs font-medium text-slate-600">Method (one step per line)</span>
          <textarea
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
            rows={4}
            className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
          />
        </label>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save recipe</Button>
      </div>
    </Modal>
  )
}
