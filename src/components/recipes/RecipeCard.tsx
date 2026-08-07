import { useState } from 'react'
import { Tag, Button } from '../shared/ui'
import { HeartIcon, ExternalLinkIcon } from '../shared/icons'
import type { Recipe } from '../../types'

interface RecipeCardProps {
  recipe: Recipe
  onToggleLiked: () => void
  onDelete: () => void
}

export function RecipeCard({ recipe, onToggleLiked, onDelete }: RecipeCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border-t-2 border-ink py-4">
      {recipe.image ? (
        <img src={recipe.image} alt="" className="mb-3.5 h-[150px] w-full object-cover" />
      ) : (
        <div
          className="mb-3.5 flex h-[150px] items-center justify-center"
          style={{
            background:
              'repeating-linear-gradient(135deg, var(--color-neutral-200), var(--color-neutral-200) 8px, var(--color-neutral-300) 8px, var(--color-neutral-300) 16px)',
          }}
        >
          <span className="font-mono text-[11px] text-neutral-700">recipe photo — {recipe.title.toLowerCase()}</span>
        </div>
      )}

      <div className="mb-2.5 flex items-center gap-3">
        <h4 className="min-w-0 flex-1 text-[21px] leading-tight font-semibold tracking-[-0.025em] text-ink">{recipe.title}</h4>
        <button
          onClick={onToggleLiked}
          aria-label="Toggle liked"
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 ${
            recipe.liked ? 'border-accent text-accent' : 'border-divider text-neutral-500'
          }`}
        >
          <HeartIcon width={16} height={16} filled={recipe.liked} />
        </button>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {recipe.totalTime && <Tag>{recipe.totalTime}</Tag>}
        {!recipe.totalTime && recipe.cookTime && <Tag>cook {recipe.cookTime}</Tag>}
        {recipe.servings && <Tag>Serves {recipe.servings}</Tag>}
        {recipe.calories && <Tag>{recipe.calories}</Tag>}
        <Tag tone="accent">{recipe.ingredients.length} ingredients</Tag>
      </div>

      {recipe.description && <p className="mb-3.5 text-[14px] leading-relaxed text-neutral-700">{recipe.description}</p>}

      {expanded && (
        <div className="mb-3.5 space-y-3 border-t-2 border-divider pt-3.5">
          <div>
            <p className="mb-1.5 text-xs font-semibold tracking-[0.1em] text-neutral-500 uppercase">Ingredients</p>
            <ul className="list-disc space-y-0.5 pl-4 text-sm text-neutral-700">
              {recipe.ingredients.map((ing, i) => (
                <li key={i}>{ing}</li>
              ))}
            </ul>
          </div>
          {recipe.steps.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold tracking-[0.1em] text-neutral-500 uppercase">Method</p>
              <ol className="list-decimal space-y-1 pl-4 text-sm text-neutral-700">
                {recipe.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" onClick={() => setExpanded((e) => !e)}>
          {expanded ? 'Hide details' : 'View recipe'}
        </Button>
        <Tag tone="neutral">In meal library</Tag>
        {recipe.url && (
          <a
            href={recipe.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-heading text-[13.5px] font-semibold text-accent-700"
          >
            Original <ExternalLinkIcon width={13} height={13} />
          </a>
        )}
        <button onClick={onDelete} className="ml-auto text-xs font-medium text-neutral-500 hover:text-accent-700">
          Remove
        </button>
      </div>
    </div>
  )
}
