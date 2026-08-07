export type DayOfWeek =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday'

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

// ---------- Fitness ----------

export type SessionType = 'run-easy' | 'run-quality' | 'strength' | 'rest' | 'active-recovery'

export interface ExerciseStep {
  name: string
  reps: string
  cue: string
}

export interface FitnessSession {
  id: string
  day: DayOfWeek
  type: SessionType
  title: string
  duration: string
  detail: string
  points: number
  exercises?: ExerciseStep[]
  rounds?: number
  restBetweenRounds?: string
}

/** One of the 4 rotating Saturday "quality run" sessions. */
export interface QualityRunWeek {
  week: number
  title: string
  detail: string
}

export interface ExerciseLog {
  id: string
  sessionId: string
  date: string // ISO yyyy-mm-dd
  completedExercises: string[] // exercise names checked off (strength sessions)
  durationMin?: number
  avgHr?: number
  distanceKm?: number
  notes?: string
  pointsEarned: number
}

export type MetricKey = 'weight' | 'restingHr' | 'bodyFat' | 'fiveKMinutes'

export interface MetricEntry {
  id: string
  date: string // ISO yyyy-mm-dd
  weight?: number // kg
  restingHr?: number // bpm
  bodyFat?: number // %
  fiveKMinutes?: number // minutes
  notes?: string
}

export interface MetricTarget {
  key: MetricKey
  label: string
  unit: string
  start: number
  target: number
  lowerIsBetter: boolean
}

// ---------- Meals ----------

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export interface Meal {
  id: string
  name: string
  type: MealType
  ingredients: string[] // free-text ingredient names, matched against inventory
  kcal?: number
  protein?: number
  liked: boolean
  notes?: string
  isCustom: boolean
}

export interface WeeklyMealPlanEntry {
  id: DayOfWeek
  day: DayOfWeek
  mealId: string | null
}

export interface MealLogEntry {
  id: string
  date: string // ISO yyyy-mm-dd
  mealId: string
  type: MealType
}

// ---------- Recipes ----------

export interface Recipe {
  id: string
  url?: string
  title: string
  description?: string
  ingredients: string[]
  steps: string[]
  prepTime?: string
  cookTime?: string
  totalTime?: string
  servings?: string
  calories?: string
  image?: string
  liked: boolean
  addedAt: string // ISO date
}

// ---------- Inventory ----------

export type InventoryCategory = 'food' | 'household'

export type StockLevel = 'out' | 'low' | 'medium' | 'high'

export const STOCK_LEVELS: StockLevel[] = ['out', 'low', 'medium', 'high']

export type TrackingMode = 'quantity' | 'level'

export interface InventoryItem {
  id: string
  name: string
  category: InventoryCategory
  subcategory?: string
  unit?: string
  amazonUrl?: string
  notes?: string
  trackingMode: TrackingMode
  /** Used when trackingMode === 'quantity' — a literal count, e.g. 4 tins. */
  quantity?: number
  /** Used when trackingMode === 'quantity' — quantity at/below this is "low". */
  lowThreshold?: number
  /** Used when trackingMode === 'level' — a qualitative low/medium/high/out reading. */
  stockLevel?: StockLevel
}
