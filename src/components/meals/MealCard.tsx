import { Badge, Button } from '../shared/ui'
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
    <div className="rounded-xl border border-slate-200 bg-white p-3.5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="font-medium text-navy-900">{meal.name}</p>
            <button onClick={onToggleLiked} className="text-sm" aria-label="Toggle liked">
              {meal.liked ? '❤️' : '🤍'}
            </button>
            {fromRecipe && (
              <Badge className="bg-violet-50 text-violet-700 ring-violet-600/20">Recipe</Badge>
            )}
          </div>
          {(meal.kcal || meal.protein) && (
            <p className="text-xs text-slate-500">
              {meal.kcal && `${meal.kcal} kcal`} {meal.protein && `· ${meal.protein} g protein`}
            </p>
          )}
        </div>
        <Badge className={ready ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : 'bg-amber-50 text-amber-700 ring-amber-600/20'}>
          {availability.matched.length}/{meal.ingredients.length} in stock
        </Badge>
      </div>

      {meal.notes && <p className="mt-1.5 text-xs text-slate-500">{meal.notes}</p>}

      {availability.missing.length > 0 && (
        <p className="mt-2 text-xs text-amber-700">
          Missing: {availability.missing.slice(0, 6).map(shortIngredientLabel).join(', ')}
          {availability.missing.length > 6 && ` +${availability.missing.length - 6} more`}
        </p>
      )}

      <div className="mt-3 flex items-center gap-2">
        {onCook && (
          <Button variant={cooked ? 'secondary' : 'primary'} onClick={onCook} disabled={cooked}>
            {cooked ? '✓ Cooked today' : 'Cook this'}
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
