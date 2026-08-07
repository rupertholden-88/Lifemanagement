import { useMemo } from 'react'
import { useMeals } from '../context/MealsContext'
import { useRecipes } from '../context/RecipesContext'
import type { Meal, Recipe } from '../types'

const RECIPE_PREFIX = 'recipe:'

export function isRecipeMeal(mealId: string): boolean {
  return mealId.startsWith(RECIPE_PREFIX)
}

function recipeIdFromMealId(mealId: string): string {
  return mealId.slice(RECIPE_PREFIX.length)
}

/** A saved recipe presented as a dinner option in the meal library. */
function recipeAsMeal(recipe: Recipe): Meal {
  const calories = recipe.calories ? Number(String(recipe.calories).replace(/[^\d]/g, '')) : undefined
  return {
    id: `${RECIPE_PREFIX}${recipe.id}`,
    name: recipe.title,
    type: 'dinner',
    ingredients: recipe.ingredients,
    kcal: Number.isFinite(calories) && calories ? calories : undefined,
    liked: recipe.liked,
    notes: recipe.url ?? recipe.description,
    isCustom: true,
  }
}

/**
 * The meal library, with every saved recipe included automatically as a dinner
 * option. Recipe-derived meals aren't stored separately — they're projected from
 * the recipe bank, so importing, editing or deleting a recipe is reflected here
 * immediately with no duplicate copies to keep in sync.
 */
export function useMealOptions() {
  const { meals, toggleLiked, deleteMeal } = useMeals()
  const { recipes, toggleLiked: toggleRecipeLiked, deleteRecipe } = useRecipes()

  const allMeals = useMemo(() => {
    const fromRecipes = recipes.map(recipeAsMeal)
    // A recipe previously copied into the library would otherwise appear twice.
    const recipeNames = new Set(fromRecipes.map((m) => m.name.toLowerCase()))
    const base = meals.filter((m) => !recipeNames.has(m.name.toLowerCase()))
    return [...base, ...fromRecipes]
  }, [meals, recipes])

  const findMeal = (id: string) => allMeals.find((m) => m.id === id)

  /** Routes the like to the recipe bank or the meal library, whichever owns it. */
  const toggleLikedAny = (mealId: string) => {
    if (isRecipeMeal(mealId)) toggleRecipeLiked(recipeIdFromMealId(mealId))
    else toggleLiked(mealId)
  }

  const deleteAny = (mealId: string) => {
    if (isRecipeMeal(mealId)) deleteRecipe(recipeIdFromMealId(mealId))
    else deleteMeal(mealId)
  }

  return { allMeals, findMeal, toggleLikedAny, deleteAny }
}
