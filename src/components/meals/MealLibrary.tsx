import { useState } from 'react'
import { useMeals } from '../../context/MealsContext'
import { useInventory } from '../../context/InventoryContext'
import { useMealOptions, isRecipeMeal } from '../../hooks/useMealOptions'
import { checkMealAvailability } from '../../lib/meals'
import { MealCard } from './MealCard'
import { MealFormModal } from './MealFormModal'
import { Button, SectionTitle, Badge } from '../shared/ui'
import type { Meal } from '../../types'

export function MealLibrary() {
  const { addMeal, updateMeal } = useMeals()
  const { allMeals, toggleLikedAny, deleteAny } = useMealOptions()
  const { items: inventory } = useInventory()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Meal | undefined>(undefined)

  const openNew = () => {
    setEditing(undefined)
    setFormOpen(true)
  }

  const openEdit = (meal: Meal) => {
    setEditing(meal)
    setFormOpen(true)
  }

  const handleSave = (data: Omit<Meal, 'id' | 'isCustom'>) => {
    if (editing) updateMeal(editing.id, data)
    else addMeal(data)
  }

  const handleDelete = (meal: Meal) => {
    const extra = isRecipeMeal(meal.id) ? ' This removes it from your recipe bank too.' : ''
    if (window.confirm(`Delete "${meal.name}"?${extra}`)) {
      deleteAny(meal.id)
    }
  }

  const recipeCount = allMeals.filter((m) => isRecipeMeal(m.id)).length

  return (
    <div>
      <div className="mb-4 flex items-start justify-between">
        <SectionTitle
          title="Meal library"
          subtitle="Every meal you can plan — including everything saved in your recipe bank"
        />
        <Button onClick={openNew}>+ Add meal</Button>
      </div>

      {recipeCount > 0 && (
        <p className="mb-3 text-xs text-slate-500">
          {recipeCount} of these come from your recipe bank — marked{' '}
          <Badge className="bg-violet-50 text-violet-700 ring-violet-600/20">Recipe</Badge>.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {allMeals.map((meal) => (
          <MealCard
            key={meal.id}
            meal={meal}
            availability={checkMealAvailability(meal, inventory)}
            fromRecipe={isRecipeMeal(meal.id)}
            onToggleLiked={() => toggleLikedAny(meal.id)}
            onEdit={isRecipeMeal(meal.id) ? undefined : () => openEdit(meal)}
            onDelete={() => handleDelete(meal)}
          />
        ))}
      </div>

      {formOpen && (
        <MealFormModal open onClose={() => setFormOpen(false)} onSave={handleSave} initial={editing} />
      )}
    </div>
  )
}
