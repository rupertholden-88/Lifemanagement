import type { ComponentType } from 'react'
import { FitnessIcon, HomeIcon, MealsIcon, RecipesIcon, StockIcon, type IconProps } from './icons'

export type Section = 'dashboard' | 'fitness' | 'meals' | 'recipes' | 'inventory'

export interface NavItem {
  id: Section
  label: string
  icon: ComponentType<IconProps>
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Home', icon: HomeIcon },
  { id: 'fitness', label: 'Fitness', icon: FitnessIcon },
  { id: 'meals', label: 'Meals', icon: MealsIcon },
  { id: 'recipes', label: 'Recipes', icon: RecipesIcon },
  { id: 'inventory', label: 'Stock', icon: StockIcon },
]
