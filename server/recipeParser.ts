export interface ParsedRecipe {
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
}

interface JsonLdNode {
  [key: string]: unknown
}

function asArray(value: unknown): unknown[] {
  if (value == null) return []
  return Array.isArray(value) ? value : [value]
}

function text(value: unknown): string | undefined {
  if (typeof value === 'string') return decodeEntities(value.trim())
  if (typeof value === 'number') return String(value)
  return undefined
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/<[^>]+>/g, '')
    .trim()
}

/** ISO-8601 duration (PT1H30M) → human string. Returns input unchanged if not a duration. */
function humanDuration(value: string | undefined): string | undefined {
  if (!value) return undefined
  const match = /^PT(?:(\d+)H)?(?:(\d+)M)?/i.exec(value)
  if (!match || (!match[1] && !match[2])) return value
  const parts: string[] = []
  if (match[1]) parts.push(`${match[1]} hr`)
  if (match[2]) parts.push(`${match[2]} min`)
  return parts.join(' ')
}

function findRecipeNode(node: unknown): JsonLdNode | null {
  if (node == null || typeof node !== 'object') return null
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findRecipeNode(child)
      if (found) return found
    }
    return null
  }
  const obj = node as JsonLdNode
  const type = obj['@type']
  const types = asArray(type).map((t) => String(t).toLowerCase())
  if (types.includes('recipe')) return obj
  if (obj['@graph']) return findRecipeNode(obj['@graph'])
  return null
}

function extractInstructions(value: unknown): string[] {
  const out: string[] = []
  for (const item of asArray(value)) {
    if (typeof item === 'string') {
      const t = decodeEntities(item)
      if (t) out.push(t)
      continue
    }
    if (item && typeof item === 'object') {
      const obj = item as JsonLdNode
      const types = asArray(obj['@type']).map((t) => String(t).toLowerCase())
      if (types.includes('howtosection')) {
        out.push(...extractInstructions(obj.itemListElement))
      } else {
        const t = text(obj.text) ?? text(obj.name)
        if (t) out.push(t)
      }
    }
  }
  return out
}

export function parseRecipeFromHtml(html: string): ParsedRecipe | null {
  const scripts = html.matchAll(
    /<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  )

  for (const match of scripts) {
    let json: unknown
    try {
      json = JSON.parse(match[1])
    } catch {
      continue
    }
    const recipe = findRecipeNode(json)
    if (!recipe) continue

    const ingredients = asArray(recipe.recipeIngredient ?? recipe.ingredients)
      .map((i) => text(i))
      .filter((i): i is string => Boolean(i))

    const steps = extractInstructions(recipe.recipeInstructions)

    const nutrition = (recipe.nutrition ?? {}) as JsonLdNode
    const imageNode = asArray(recipe.image)[0]
    const image =
      typeof imageNode === 'string'
        ? imageNode
        : imageNode && typeof imageNode === 'object'
          ? text((imageNode as JsonLdNode).url)
          : undefined

    const title = text(recipe.name)
    if (!title || ingredients.length === 0) continue

    return {
      title,
      description: text(recipe.description),
      ingredients,
      steps,
      prepTime: humanDuration(text(recipe.prepTime)),
      cookTime: humanDuration(text(recipe.cookTime)),
      totalTime: humanDuration(text(recipe.totalTime)),
      servings: text(asArray(recipe.recipeYield)[0]),
      calories: text(nutrition.calories),
      image,
    }
  }

  return null
}
