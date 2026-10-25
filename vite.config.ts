import { defineConfig, type Plugin, type Connect } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import type { ServerResponse } from 'node:http'

// Dev used to announce itself as LifeManagementRecipeBot, so sites refused it
// that production can read. These are the headers a browser sends. Note the
// endpoints still differ where it counts: production uses curl_cffi to borrow
// Chrome's TLS fingerprint, which fetch() can't do, so a site that fingerprints
// TLS (Waitrose among them) will fail here and succeed in production.
const FETCH_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-GB,en;q=0.9',
  'Upgrade-Insecure-Requests': '1',
}

// Mirrors api/recipe-summary.ts so the recipe importer works in `npm run dev`
// (Vercel only runs the /api directory in production).
function recipeSummaryDevApi(): Plugin {
  const handle = async (req: Connect.IncomingMessage, res: ServerResponse) => {
    const url = new URL(req.url ?? '', 'http://localhost')
    const target = url.searchParams.get('url')

    const send = (status: number, body: unknown) => {
      res.statusCode = status
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(body))
    }

    if (!target) return send(400, { error: 'Missing url parameter' })

    let parsed: URL
    try {
      parsed = new URL(target)
    } catch {
      return send(400, { error: 'Invalid URL' })
    }
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return send(400, { error: 'Only http(s) URLs are supported' })
    }

    try {
      const { parseRecipeFromHtml } = await import('./server/recipeParser.ts')
      const upstream = await fetch(parsed.toString(), {
        headers: FETCH_HEADERS,
        redirect: 'follow',
        signal: AbortSignal.timeout(15000),
      })
      if (!upstream.ok) {
        const blocked = [401, 403, 406, 429].includes(upstream.status)
        return send(502, {
          error: blocked
            ? `${parsed.hostname} blocked the import (HTTP ${upstream.status}) — add it manually instead`
            : `${parsed.hostname} returned HTTP ${upstream.status}`,
        })
      }
      const html = await upstream.text()
      const recipe = parseRecipeFromHtml(html)
      if (!recipe) {
        return send(422, { error: 'No structured recipe data found on that page — add it manually instead' })
      }
      return send(200, { recipe })
    } catch (err) {
      const timedOut = err instanceof Error && (err.name === 'TimeoutError' || err.name === 'AbortError')
      return send(timedOut ? 504 : 502, {
        error: timedOut
          ? `${parsed.hostname} took too long to respond — it may be blocking imports`
          : `Could not reach ${parsed.hostname}`,
      })
    }
  }

  return {
    name: 'recipe-summary-dev-api',
    configureServer(server) {
      server.middlewares.use('/api/recipe-summary', (req, res) => {
        handle(req, res)
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), recipeSummaryDevApi()],
})
