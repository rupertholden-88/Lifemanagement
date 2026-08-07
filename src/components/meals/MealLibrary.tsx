import { useState } from 'react'
import { useMeals } from '../../context/MealsContext'
import { useInventory } from '../../context/InventoryContext'
import { checkMealAvailability } from '../../lib/meals'
import { MealCard } from './MealCard'
import { MealFormModal } from './MealFormModal'
import { Button, SectionTitle } from '../shared/ui'
import type { Meal } from '../../types'

export function MealLibrary() {
  const { meals, addMeal, updateMeal, deleteMeal, toggleLiked } = useMeals()
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

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <SectionTitle title="Meal library" subtitle="All meals, including your own additions" />
        <Button onClick={openNew}>+ Add meal</Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {meals.map((meal) => (
          <MealCard
            key={meal.id}
            meal={meal}
            availability={checkMealAvailability(meal, inventory)}
            onToggleLiked={() => toggleLiked(meal.id)}
            onEdit={() => openEdit(meal)}
            onDelete={meal.isCustom ? () => deleteMeal(meal.id) : undefined}
          />
        ))}
      </div>

      <MealFormModal open={formOpen} onClose={() => setFormOpen(false)} onSave={handleSave} initial={editing} />
    </div>
  )
}
