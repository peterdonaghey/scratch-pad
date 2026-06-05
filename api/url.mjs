/**
 * POST /api/url  —  body: { "md": "# markdown", "name": "optional-name" }
 *   → 200 { "url": "https://..." }
 *
 * GET /api/url?md=<encoded>&name=<optional>
 *   → 302 redirect to https://...
 *
 * Any agent with basic fetch can use this.
 */

const BASE = "https://scratch-pad-beryl.vercel.app"

function buildUrl(md, name) {
  const url = new URL(BASE + (name ? `/${encodeURIComponent(name)}` : "/"))
  url.searchParams.set("md", md)
  return url.toString()
}

export default function handler(req, res) {
  // CORS headers so any agent can call this
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  if (req.method === "OPTIONS") {
    return res.status(200).end()
  }

  if (req.method === "POST") {
    const { md, name } = req.body || {}
    if (!md || typeof md !== "string") {
      return res.status(400).json({ error: 'Missing "md" string in body' })
    }
    return res.json({ url: buildUrl(md, name) })
  }

  if (req.method === "GET") {
    const md = req.query?.md
    if (!md) {
      return res.status(400).json({ error: 'Missing "md" query parameter' })
    }
    return res.redirect(302, buildUrl(md, req.query?.name))
  }

  return res.status(405).json({ error: "Method not allowed" })
}
