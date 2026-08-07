import { useState } from 'react'
import { useRecipes } from '../../context/RecipesContext'
import { RecipeImport } from './RecipeImport'
import { RecipeCard } from './RecipeCard'
import { Button, EmptyState, Modal, Banner, TextInput, TextArea } from '../shared/ui'
import { RecipesIcon } from '../shared/icons'
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
      <p className="mb-2.5 text-[11px] font-semibold tracking-[0.16em] text-accent-700">{sorted.length} saved recipe{sorted.length === 1 ? '' : 's'}</p>
      <h1 className="mb-5 text-[36px] leading-[1.05] font-semibold tracking-[-0.03em] text-ink">Recipe bank</h1>

      {banner && <Banner>{banner}</Banner>}

      <div className="mb-2">
        <RecipeImport onImported={handleImported} />
      </div>
      <button onClick={() => setManualOpen(true)} className="mb-6 font-heading text-[13px] font-semibold text-accent-700">
        + Add manually instead
      </button>

      {sorted.length === 0 ? (
        <EmptyState icon={<RecipesIcon width={28} height={28} />} title="No recipes saved yet" description="Paste a recipe link above, or add one manually." />
      ) : (
        <div>
          {sorted.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} onToggleLiked={() => toggleLiked(recipe.id)} onDelete={() => deleteRecipe(recipe.id)} />
          ))}
        </div>
      )}

      {manualOpen && (
        <ManualRecipeModal
          open
          onClose={() => setManualOpen(false)}
          onSave={(data) => {
            addRecipe({ ...data, liked: true })
            setBanner(`Added "${data.title}"`)
            setTimeout(() => setBanner(null), 5000)
          }}
        />
      )}
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
      <div className="space-y-4">
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs font-medium text-neutral-600">Title</span>
          <TextInput value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs font-medium text-neutral-600">Link (optional)</span>
          <TextInput value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs font-medium text-neutral-600">Ingredients (one per line)</span>
          <TextArea value={ingredients} onChange={(e) => setIngredients(e.target.value)} rows={4} />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs font-medium text-neutral-600">Method (one step per line)</span>
          <TextArea value={steps} onChange={(e) => setSteps(e.target.value)} rows={4} />
        </label>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save recipe</Button>
      </div>
    </Modal>
  )
}
