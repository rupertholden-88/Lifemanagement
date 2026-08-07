import { defineConfig, type Plugin, type Connect } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import type { ServerResponse } from 'node:http'

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
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LifeManagementRecipeBot/1.0)', Accept: 'text/html' },
        redirect: 'follow',
        signal: AbortSignal.timeout(10000),
      })
      if (!upstream.ok) return send(502, { error: `Site returned ${upstream.status}` })
      const html = await upstream.text()
      const recipe = parseRecipeFromHtml(html)
      if (!recipe) {
        return send(422, { error: 'No structured recipe data found on that page — add it manually instead' })
      }
      return send(200, { recipe })
    } catch {
      return send(502, { error: 'Could not fetch that page' })
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
