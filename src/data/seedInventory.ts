import type { InventoryItem } from '../types'

let counter = 0
const id = (prefix: string) => `${prefix}-${counter++}`

const level = (
  name: string,
  subcategory: string,
  stockLevel: InventoryItem['stockLevel'],
  unit: string,
  amazonUrl?: string,
): InventoryItem => ({
  id: id('hh'),
  name,
  category: 'household',
  subcategory,
  unit,
  trackingMode: 'level',
  stockLevel,
  // Only include the key when there's a real URL — an undefined value would
  // otherwise be rejected by Firestore.
  ...(amazonUrl ? { amazonUrl } : {}),
})

const qty = (
  name: string,
  subcategory: string,
  quantity: number,
  unit: string,
  lowThreshold = 0,
): InventoryItem => ({
  id: id('fd'),
  name,
  category: 'food',
  subcategory,
  unit,
  trackingMode: 'quantity',
  quantity,
  lowThreshold,
})

export const SEED_INVENTORY: InventoryItem[] = [
  // Household essentials — tracked as low/medium/high
  level('Toilet roll', 'Bathroom', 'medium', 'rolls'),
  level('Bin bags (kitchen)', 'Cleaning', 'medium', 'box'),
  level('Bin bags (garden/general)', 'Cleaning', 'medium', 'roll'),
  level('Kitchen roll', 'Kitchen', 'medium', 'rolls'),
  level('Washing-up liquid', 'Kitchen', 'medium', 'bottle'),
  level('Dishwasher tablets', 'Kitchen', 'medium', 'box'),
  level('Laundry detergent', 'Laundry', 'medium', 'bottle'),
  level('Hand soap', 'Bathroom', 'medium', 'bottle'),
  level('Cleaning spray', 'Cleaning', 'medium', 'bottle'),
  level('Nappies', 'Toddler', 'medium', 'pack'),

  // Pantry / fridge / freezer — tracked by count, matched to meal plan ingredients.
  // lowThreshold defaults to 0 (flag only when it runs out) for single-container
  // items; multi-unit staples get a real buffer so the alert is useful, not noisy.
  qty('Chicken breast', 'Meat', 4, 'breasts', 2),
  qty('Beef mince 5%', 'Meat', 2, 'packs', 1),
  qty('Sausages', 'Meat', 6, 'sausages', 2),
  qty('Ham', 'Meat', 1, 'pack'),
  qty('Steak or roast chicken', 'Meat', 1, 'pack'),
  qty('Chicken or beef joint', 'Meat', 0, 'joint'),
  qty('Eggs', 'Fridge', 6, 'eggs', 3),
  qty('Greek yoghurt', 'Fridge', 1, 'tub'),
  qty('Cottage cheese', 'Fridge', 2, 'tubs', 1),
  qty('Babybel', 'Fridge', 4, 'pieces', 2),
  qty('Milk', 'Fridge', 1, 'litre'),
  qty('Granola', 'Pantry', 1, 'box'),
  qty('Bread', 'Pantry', 1, 'loaf'),
  qty('Bread or wrap', 'Pantry', 4, 'wraps', 2),
  qty('Rice', 'Pantry', 1, 'kg bag'),
  qty('Pasta', 'Pantry', 1, 'kg bag'),
  qty('New potatoes', 'Pantry', 1, 'bag'),
  qty('Potatoes', 'Pantry', 1, 'bag'),
  qty('Tinned tomatoes', 'Pantry', 4, 'tins', 2),
  qty('Kidney beans', 'Pantry', 2, 'tins', 1),
  qty('Lentils', 'Pantry', 1, 'tin'),
  qty('Mixed vegetables', 'Fridge', 1, 'bag'),
  qty('Mushrooms', 'Fridge', 0, 'pack'),
  qty('Carrot', 'Fridge', 1, 'bag'),
  qty('Onion', 'Pantry', 4, 'onions', 2),
  qty('Red onion', 'Pantry', 2, 'onions', 1),
  qty('Garlic', 'Pantry', 1, 'bulb'),
  qty('Peppers', 'Fridge', 2, 'peppers', 1),
  qty('Soy sauce', 'Pantry', 1, 'bottle'),
  qty('Honey', 'Pantry', 1, 'jar'),
  qty('Olive oil', 'Pantry', 1, 'bottle'),
  qty('Banana', 'Fruit', 4, 'bananas', 2),
  qty('Apple', 'Fruit', 4, 'apples', 2),
  qty('Fruit', 'Fruit', 3, 'pieces', 1),
  qty('Salad', 'Fridge', 1, 'bag'),
  qty('Pizza', 'Freezer', 1, 'pizzas'),
  qty('Yorkshire puddings', 'Freezer', 0, 'pack'),
  qty('Mixed nuts', 'Pantry', 1, 'bag'),
  qty('Beef jerky', 'Pantry', 0, 'pack'),
  qty('Protein powder', 'Pantry', 1, 'tub'),
  qty('Butter or mayo', 'Fridge', 1, 'jar'),

  // Store-cupboard staples most recipes assume you have. Included so imported
  // recipes match sensibly rather than flagging salt and spices as missing.
  qty('Salt', 'Store cupboard', 1, 'box'),
  qty('Black pepper', 'Store cupboard', 1, 'grinder'),
  qty('Chilli powder', 'Store cupboard', 1, 'jar'),
  qty('Paprika', 'Store cupboard', 1, 'jar'),
  qty('Cumin', 'Store cupboard', 1, 'jar'),
  qty('Mixed herbs', 'Store cupboard', 1, 'jar'),
  qty('Stock cubes', 'Store cupboard', 6, 'cubes', 2),
  qty('Tomato purée', 'Store cupboard', 1, 'tube'),
  qty('Sugar', 'Store cupboard', 1, 'bag'),
  qty('Plain flour', 'Store cupboard', 1, 'bag'),
]
