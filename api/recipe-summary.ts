import { parseRecipeFromHtml } from '../server/recipeParser'

export const config = { runtime: 'edge' }

function isBlockedHost(hostname: string): boolean {
  const lower = hostname.toLowerCase()
  if (lower === 'localhost' || lower.endsWith('.local') || lower.endsWith('.internal')) return true
  // Private/loopback/link-local IPv4 literals, and any IPv6 literal
  if (/^(127\.|10\.|192\.168\.|169\.254\.|0\.)/.test(lower)) return true
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(lower)) return true
  if (lower.includes(':')) return true
  return false
}

export default async function handler(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url)
  const target = searchParams.get('url')

  if (!target) {
    return Response.json({ error: 'Missing url parameter' }, { status: 400 })
  }

  let parsed: URL
  try {
    parsed = new URL(target)
  } catch {
    return Response.json({ error: 'Invalid URL' }, { status: 400 })
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return Response.json({ error: 'Only http(s) URLs are supported' }, { status: 400 })
  }
  if (isBlockedHost(parsed.hostname)) {
    return Response.json({ error: 'That host is not allowed' }, { status: 400 })
  }

  try {
    const res = await fetch(parsed.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; HomeBaseRecipeBot/1.0)',
        Accept: 'text/html',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
    })

    if (!res.ok) {
      return Response.json({ error: `Site returned ${res.status}` }, { status: 502 })
    }

    const html = await res.text()
    const recipe = parseRecipeFromHtml(html)

    if (!recipe) {
      return Response.json(
        { error: 'No structured recipe data found on that page — add it manually instead' },
        { status: 422 },
      )
    }

    return Response.json({ recipe })
  } catch {
    return Response.json({ error: 'Could not fetch that page' }, { status: 502 })
  }
}
