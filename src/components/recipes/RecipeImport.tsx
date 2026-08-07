import { useState } from 'react'
import { Button, TextInput } from '../shared/ui'
import type { Recipe } from '../../types'

interface RecipeImportProps {
  onImported: (recipe: Omit<Recipe, 'id' | 'addedAt' | 'liked'>) => void
}

export function RecipeImport({ onImported }: RecipeImportProps) {
  const [url, setUrl] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleImport = async () => {
    if (!url.trim()) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/recipe-summary?url=${encodeURIComponent(url.trim())}`)
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Could not import that recipe')
        return
      }
      onImported({ ...data.recipe, url: url.trim() })
      setUrl('')
    } catch {
      setError('Could not reach the importer — check your connection')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <p className="mb-3 text-xs text-neutral-600">
        Paste a link from BBC Good Food, Jamie Oliver, or most recipe sites — the ingredients, timings and steps are pulled out automatically.
      </p>
      <div className="flex gap-2">
        <TextInput
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleImport()}
          placeholder="Paste a recipe link…"
          className="flex-1"
        />
        <Button onClick={handleImport} disabled={busy || !url.trim()}>
          {busy ? 'Importing…' : 'Import'}
        </Button>
      </div>
      {error && <p className="mt-2 text-sm text-accent-700">{error}</p>}
    </div>
  )
}
