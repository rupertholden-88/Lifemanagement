import { Tag, Button } from '../shared/ui'
import { HeartIcon } from '../shared/icons'
import type { Meal } from '../../types'
import type { MealAvailability } from '../../lib/meals'
import { shortIngredientLabel } from '../../lib/ingredientMatch'

interface MealCardProps {
  meal: Meal
  availability: MealAvailability
  onToggleLiked: () => void
  onCook?: () => void
  onEdit?: () => void
  onDelete?: () => void
  cooked?: boolean
  fromRecipe?: boolean
}

export function MealCard({
  meal,
  availability,
  onToggleLiked,
  onCook,
  onEdit,
  onDelete,
  cooked,
  fromRecipe,
}: MealCardProps) {
  const ready = availability.missing.length === 0

  return (
    <div className="border-2 border-divider p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1">
            <p className="font-heading font-semibold text-ink">{meal.name}</p>
            <button
              onClick={onToggleLiked}
              aria-label="Toggle liked"
              className="-my-1.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-neutral-100"
            >
              <HeartIcon width={15} height={15} filled={meal.liked} className={meal.liked ? 'text-accent' : 'text-neutral-500'} />
            </button>
            {fromRecipe && <Tag tone="accent">Recipe</Tag>}
          </div>
          {(meal.kcal || meal.protein) && (
            <p className="text-xs text-neutral-600">
              {meal.kcal && `${meal.kcal} kcal`} {meal.protein && `· ${meal.protein}g protein`}
            </p>
          )}
        </div>
        <Tag tone={ready ? 'neutral' : 'accent'}>
          {availability.matched.length}/{meal.ingredients.length} in stock
        </Tag>
      </div>

      {meal.notes && <p className="mt-2 text-xs leading-relaxed text-neutral-600">{meal.notes}</p>}

      {availability.missing.length > 0 && (
        <p className="mt-2 text-xs text-accent-700">
          Missing: {availability.missing.slice(0, 6).map(shortIngredientLabel).join(', ')}
          {availability.missing.length > 6 && ` +${availability.missing.length - 6} more`}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {onCook && (
          <Button variant={cooked ? 'done' : 'primary'} onClick={onCook} disabled={cooked}>
            {cooked ? 'Cooked ✓' : 'Cook this'}
          </Button>
        )}
        {onEdit && (
          <Button variant="ghost" onClick={onEdit}>
            Edit
          </Button>
        )}
        {onDelete && (
          <Button variant="ghost" onClick={onDelete}>
            Delete
          </Button>
        )}
      </div>
    </div>
  )
}
