import { createContext, useContext, type ReactNode } from 'react'
import { useSyncedList } from '../hooks/useSyncedList'
import { useAuth } from './AuthContext'
import { SEED_MEALS, DEFAULT_WEEKLY_DINNER_PLAN } from '../data/mealPlan'
import type { DayOfWeek, Meal, MealLogEntry, MealType, WeeklyMealPlanEntry } from '../types'

interface MealsContextValue {
  meals: Meal[]
  weeklyPlan: WeeklyMealPlanEntry[]
  mealLogs: MealLogEntry[]
  addMeal: (meal: Omit<Meal, 'id' | 'isCustom'>) => Meal
  updateMeal: (id: string, updates: Partial<Meal>) => void
  deleteMeal: (id: string) => void
  toggleLiked: (id: string) => void
  setWeeklyPlanDay: (day: DayOfWeek, mealId: string | null) => void
  logMeal: (mealId: string, type: MealType, date: string) => MealLogEntry
  removeMealLog: (id: string) => void
}

const MealsContext = createContext<MealsContextValue | null>(null)

export function MealsProvider({ children }: { children: ReactNode }) {
  const { uid } = useAuth()
  const { items: meals, set: setMeal, remove: removeMealItem } = useSyncedList<Meal>(
    'hb.meals.list',
    'meals',
    uid,
    SEED_MEALS,
  )
  const { items: weeklyPlan, set: setPlanDay } = useSyncedList<WeeklyMealPlanEntry>(
    'hb.meals.weeklyPlan',
    'weeklyMealPlan',
    uid,
    DEFAULT_WEEKLY_DINNER_PLAN,
  )
  const { items: mealLogs, set: setMealLog, remove: removeMealLogItem } = useSyncedList<MealLogEntry>(
    'hb.meals.logs',
    'mealLogs',
    uid,
    [],
  )

  const addMeal: MealsContextValue['addMeal'] = (meal) => {
    const newMeal: Meal = { ...meal, id: `meal-${Date.now()}`, isCustom: true }
    setMeal(newMeal)
    return newMeal
  }

  const updateMeal = (id: string, updates: Partial<Meal>) => {
    const existing = meals.find((m) => m.id === id)
    if (!existing) return
    setMeal({ ...existing, ...updates })
  }

  const deleteMeal = (id: string) => {
    removeMealItem(id)
    weeklyPlan
      .filter((entry) => entry.mealId === id)
      .forEach((entry) => setPlanDay({ ...entry, mealId: null }))
  }

  const toggleLiked = (id: string) => {
    const existing = meals.find((m) => m.id === id)
    if (!existing) return
    setMeal({ ...existing, liked: !existing.liked })
  }

  const setWeeklyPlanDay = (day: DayOfWeek, mealId: string | null) => {
    setPlanDay({ id: day, day, mealId })
  }

  const logMeal = (mealId: string, type: MealType, date: string) => {
    const entry: MealLogEntry = { id: `mlog-${Date.now()}`, date, mealId, type }
    setMealLog(entry)
    return entry
  }

  const removeMealLog = (id: string) => removeMealLogItem(id)

  const value: MealsContextValue = {
    meals,
    weeklyPlan,
    mealLogs,
    addMeal,
    updateMeal,
    deleteMeal,
    toggleLiked,
    setWeeklyPlanDay,
    logMeal,
    removeMealLog,
  }

  return <MealsContext.Provider value={value}>{children}</MealsContext.Provider>
}

export function useMeals() {
  const ctx = useContext(MealsContext)
  if (!ctx) throw new Error('useMeals must be used within MealsProvider')
  return ctx
}
