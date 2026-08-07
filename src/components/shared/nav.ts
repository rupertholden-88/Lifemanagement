export type Section = 'dashboard' | 'fitness' | 'meals' | 'recipes' | 'inventory'

export interface NavItem {
  id: Section
  label: string
  icon: string
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Home', icon: '🏠' },
  { id: 'fitness', label: 'Fitness', icon: '🏃' },
  { id: 'meals', label: 'Meals', icon: '🍽️' },
  { id: 'recipes', label: 'Recipes', icon: '📖' },
  { id: 'inventory', label: 'Stock', icon: '📦' },
]
