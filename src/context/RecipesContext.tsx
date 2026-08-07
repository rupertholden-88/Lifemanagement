import { createContext, useContext, type ReactNode } from 'react'
import { useSyncedList } from '../hooks/useSyncedList'
import { useAuth } from './AuthContext'
import type { Recipe } from '../types'

interface RecipesContextValue {
  recipes: Recipe[]
  addRecipe: (recipe: Omit<Recipe, 'id' | 'addedAt'>) => Recipe
  updateRecipe: (id: string, updates: Partial<Recipe>) => void
  deleteRecipe: (id: string) => void
  toggleLiked: (id: string) => void
}

const RecipesContext = createContext<RecipesContextValue | null>(null)

export function RecipesProvider({ children }: { children: ReactNode }) {
  const { uid } = useAuth()
  const { items: recipes, set: setRecipe, remove } = useSyncedList<Recipe>(
    'hb.recipes.list',
    'recipes',
    uid,
    [],
  )

  const addRecipe: RecipesContextValue['addRecipe'] = (recipe) => {
    const newRecipe: Recipe = {
      ...recipe,
      id: `recipe-${Date.now()}`,
      addedAt: new Date().toISOString().slice(0, 10),
    }
    setRecipe(newRecipe)
    return newRecipe
  }

  const updateRecipe = (id: string, updates: Partial<Recipe>) => {
    const existing = recipes.find((r) => r.id === id)
    if (!existing) return
    setRecipe({ ...existing, ...updates })
  }

  const deleteRecipe = (id: string) => remove(id)

  const toggleLiked = (id: string) => {
    const existing = recipes.find((r) => r.id === id)
    if (!existing) return
    setRecipe({ ...existing, liked: !existing.liked })
  }

  return (
    <RecipesContext.Provider value={{ recipes, addRecipe, updateRecipe, deleteRecipe, toggleLiked }}>
      {children}
    </RecipesContext.Provider>
  )
}

export function useRecipes() {
  const ctx = useContext(RecipesContext)
  if (!ctx) throw new Error('useRecipes must be used within RecipesProvider')
  return ctx
}
