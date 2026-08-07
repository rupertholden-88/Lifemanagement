import { useState } from 'react'
import { Badge, Button } from '../shared/ui'
import type { Recipe } from '../../types'

interface RecipeCardProps {
  recipe: Recipe
  onToggleLiked: () => void
  onDelete: () => void
}

export function RecipeCard({ recipe, onToggleLiked, onDelete }: RecipeCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-xl border border-paper-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="font-medium text-navy-900">{recipe.title}</p>
            <button
              onClick={onToggleLiked}
              className="-my-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base transition hover:bg-slate-100"
              aria-label="Toggle liked"
            >
              {recipe.liked ? '❤️' : '🤍'}
            </button>
          </div>
          <div className="mt-1 flex flex-wrap gap-1.5 text-xs">
            {recipe.totalTime && <Badge className="bg-slate-100 text-slate-600 ring-slate-500/10">⏱ {recipe.totalTime}</Badge>}
            {!recipe.totalTime && recipe.cookTime && (
              <Badge className="bg-slate-100 text-slate-600 ring-slate-500/10">⏱ cook {recipe.cookTime}</Badge>
            )}
            {recipe.servings && <Badge className="bg-slate-100 text-slate-600 ring-slate-500/10">Serves {recipe.servings}</Badge>}
            {recipe.calories && <Badge className="bg-slate-100 text-slate-600 ring-slate-500/10">{recipe.calories}</Badge>}
            <Badge className="bg-slate-100 text-slate-600 ring-slate-500/10">
              {recipe.ingredients.length} ingredients
            </Badge>
          </div>
        </div>
        {recipe.image && (
          <img src={recipe.image} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" />
        )}
      </div>

      {recipe.description && <p className="mt-2 text-sm text-slate-500">{recipe.description}</p>}

      {expanded && (
        <div className="mt-3 space-y-3 border-t border-slate-100 pt-3">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Ingredients</p>
            <ul className="list-disc space-y-0.5 pl-4 text-sm text-slate-600">
              {recipe.ingredients.map((ing, i) => (
                <li key={i}>{ing}</li>
              ))}
            </ul>
          </div>
          {recipe.steps.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Method</p>
              <ol className="list-decimal space-y-1 pl-4 text-sm text-slate-600">
                {recipe.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button variant="secondary" onClick={() => setExpanded((e) => !e)}>
          {expanded ? 'Hide details' : 'View recipe'}
        </Button>
        <Badge className="bg-violet-50 text-violet-700 ring-violet-600/20">In meal library</Badge>
        {recipe.url && (
          <a
            href={recipe.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-teal-700 hover:underline"
          >
            Original ↗
          </a>
        )}
        <button onClick={onDelete} className="ml-auto text-xs font-medium text-slate-400 hover:text-red-600">
          Remove
        </button>
      </div>
    </div>
  )
}
