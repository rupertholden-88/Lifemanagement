/**
 * Matching recipe ingredient lines against inventory item names.
 *
 * Imported recipes give full phrases — "500g lean minced beef", "400g can
 * chopped tomatoes", "1 tbsp oil" — while inventory names are short — "Beef
 * mince 5%", "Tinned tomatoes", "Olive oil". Plain substring comparison misses
 * nearly all of these, so both sides are reduced to a set of meaningful food
 * words and compared on that.
 */

/** Quantities, units and container words that say nothing about which food it is. */
const NOISE = new Set([
  // units
  'g', 'gram', 'grams', 'kg', 'ml', 'l', 'litre', 'litres', 'oz', 'lb', 'lbs',
  'tbsp', 'tbsps', 'tablespoon', 'tablespoons', 'tsp', 'tsps', 'teaspoon', 'teaspoons',
  'cup', 'cups', 'pinch', 'pinches', 'handful', 'dash', 'splash', 'drizzle',
  // containers / packaging
  'can', 'cans', 'tin', 'tins', 'tinned', 'canned', 'pack', 'packs', 'packet',
  'jar', 'jars', 'bottle', 'bottles', 'box', 'boxes', 'bag', 'bags', 'sachet',
  'punnet', 'carton', 'tub', 'tubs', 'loaf', 'net',
  // pieces / cuts that don't identify the food
  'slice', 'slices', 'clove', 'cloves', 'sprig', 'sprigs', 'stick', 'sticks',
  'bunch', 'head', 'heads', 'rasher', 'rashers', 'fillet', 'fillets',
  'breast', 'breasts', 'thigh', 'thighs', 'piece', 'pieces', 'ball', 'bulb',
  // preparation
  'chopped', 'diced', 'sliced', 'crushed', 'grated', 'peeled', 'trimmed',
  'finely', 'roughly', 'thinly', 'freshly', 'halved', 'quartered', 'cubed',
  'shredded', 'beaten', 'melted', 'softened', 'drained', 'rinsed', 'deseeded',
  'heaped', 'level', 'rounded',
  // descriptors
  'fresh', 'free', 'range', 'organic', 'large', 'small', 'medium', 'ripe',
  'lean', 'light', 'low', 'fat', 'reduced', 'skinless', 'boneless', 'plain',
  'raw', 'cooked', 'frozen', 'good', 'quality', 'best', 'plus', 'extra',
  'optional', 'roasting', 'cooking', 'natural', 'unsalted', 'salted',
  // filler
  'a', 'an', 'the', 'of', 'to', 'for', 'and', 'or', 'with', 'if', 'you',
  'only', 'have', 'see', 'tip', 'tips', 'instead', 'along', 'serve', 'serving',
  'taste', 'about', 'approx', 'each', 'few', 'some', 'your', 'own', 'from',
  'into', 'plenty', 'needed', 'required', 'garnish', 'topping', 'side',
])

/** Different words for the same ingredient, mapped to one canonical form. */
const SYNONYMS: Record<string, string> = {
  minced: 'mince',
  mincemeat: 'mince',
  ground: 'mince',
  yogurt: 'yoghurt',
  eggplant: 'aubergine',
  zucchini: 'courgette',
  cilantro: 'coriander',
  scallion: 'springonion',
  garbanzo: 'chickpea',
  passata: 'tomato',
  spaghetti: 'pasta',
  penne: 'pasta',
  fusilli: 'pasta',
  tagliatelle: 'pasta',
  macaroni: 'pasta',
  linguine: 'pasta',
  mayo: 'mayonnaise',
  scallions: 'springonion',
}

/**
 * Words for a *processed form* of a food. Tomato purée is not tinned tomatoes,
 * and a beef stock cube is not beef mince, so a match requires both sides to
 * agree on which of these words are present.
 */
const FORM_WORDS = new Set([
  'puree', 'pure', 'paste', 'sauce', 'powder', 'stock', 'cube', 'cubes',
  'juice', 'extract', 'essence', 'oil', 'vinegar', 'flour', 'syrup',
  'gravy', 'dressing', 'soup', 'jam', 'marmalade', 'butter', 'cream',
  'milk', 'cheese', 'yoghurt', 'wine', 'beer', 'water', 'sugar', 'honey',
])

function singularise(word: string): string {
  if (word.length <= 3) return word
  if (word.endsWith('ies')) return `${word.slice(0, -3)}y`
  if (word.endsWith('oes')) return word.slice(0, -2)
  if (word.endsWith('ss')) return word
  if (word.endsWith('s')) return word.slice(0, -1)
  return word
}

/** Reduces a name or ingredient line to its meaningful food words. */
export function foodTokens(text: string): Set<string> {
  const cleaned = text
    .toLowerCase()
    // fold accents so "purée" becomes "puree" rather than losing the é
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    // drop parenthetical asides: "(or 1 level tbsp if you only have mild)"
    .replace(/\([^)]*\)/g, ' ')
    // drop anything after a comma — usually preparation notes
    .replace(/,.*$/, ' ')
    // fractions, numbers, ranges, percentages and units glued to numbers
    .replace(/[¼½¾⅓⅔⅛]/g, ' ')
    .replace(/\d+(\.\d+)?\s*%/g, ' ')
    .replace(/\b\d+(\.\d+)?\s*(g|kg|ml|l|oz|lb|cm)\b/g, ' ')
    .replace(/\d+/g, ' ')
    .replace(/[^a-z\s-]/g, ' ')

  const tokens = new Set<string>()
  for (const raw of cleaned.split(/[\s-]+/)) {
    if (!raw) continue
    const word = singularise(raw)
    if (NOISE.has(word) || NOISE.has(raw)) continue
    if (word.length < 2) continue
    tokens.add(SYNONYMS[word] ?? word)
  }
  return tokens
}

/**
 * A short, readable version of a recipe ingredient line for display —
 * "400g can chopped tomatoes" becomes "chopped tomatoes". Keeps word order and
 * descriptive words, unlike `foodTokens`, which is for matching only.
 */
export function shortIngredientLabel(line: string): string {
  const label = line
    .replace(/\([^)]*\)/g, '')
    .replace(/,.*$/, '')
    .replace(/\b\d+(\.\d+)?\s*(g|kg|ml|l|litres?|oz|lbs?)\b/gi, '')
    .replace(/[¼½¾⅓⅔⅛]/g, '')
    .replace(/\d+(\.\d+)?\s*%/g, '')
    .replace(/\b\d+(\.\d+)?\b/g, '')
    .replace(/\b(tbsps?|tsps?|tablespoons?|teaspoons?|cups?|cloves?|cans?|tins?|packs?|packets?|jars?|bottles?|pinch(es)?|handfuls?|sprigs?|sticks?|slices?|heaped|level|rounded|x)\b/gi, '')
    .replace(/\b(to (serve|taste|garnish)|for (serving|garnish)|optional)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^[-–,\s]+|[-–,\s]+$/g, '')

  return label || line.trim()
}

function formWordsIn(tokens: Set<string>): Set<string> {
  const out = new Set<string>()
  for (const t of tokens) if (FORM_WORDS.has(t)) out.add(t)
  return out
}

function sameSet(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) return false
  for (const v of a) if (!b.has(v)) return false
  return true
}

function isSubset(small: Set<string>, big: Set<string>): boolean {
  if (small.size === 0) return false
  for (const v of small) if (!big.has(v)) return false
  return true
}

/**
 * True when a recipe ingredient line refers to the same food as an inventory
 * item name. One side's food words must fully contain the other's, and both
 * sides must agree on any processed-form words.
 */
export function ingredientMatchesName(ingredient: string, itemName: string): boolean {
  const a = foodTokens(ingredient)
  const b = foodTokens(itemName)
  if (a.size === 0 || b.size === 0) return false

  // "tomato purée" must not match "tinned tomatoes"
  if (!sameSet(formWordsIn(a), formWordsIn(b))) return false

  return isSubset(a, b) || isSubset(b, a)
}
