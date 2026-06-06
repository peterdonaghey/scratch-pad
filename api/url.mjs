/**
 * POST /api/url  —  { "md": "# markdown", "name": "optional" }
 *   → 200 { "url": "https://..." }
 *
 * GET /api/url?md=<encoded>&name=<optional>
 *   → 200 { "url": "https://..." }
 *
 * Any agent anywhere can use this — just send markdown, get a URL back.
 */

const BASE = "https://scratch-pad-beryl.vercel.app"

function buildUrl(md, name) {
  const u = new URL(BASE + (name ? `/${encodeURIComponent(name)}` : "/"))
  u.searchParams.set("md", md)
  return u.toString()
}

function respond(res, md, name) {
  if (!md || typeof md !== "string") {
    res.writeHead(400, { "Content-Type": "application/json" })
    return res.end(JSON.stringify({ error: 'Missing "md" parameter' }))
  }
  const url = buildUrl(md, name)
  res.writeHead(200, { "Content-Type": "application/json" })
  res.end(JSON.stringify({ url }))
}

function readBody(req) {
  return new Promise((resolve) => {
    let body = ""
    req.on("data", (c) => (body += c))
    req.on("end", () => resolve(body))
  })
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  if (req.method === "OPTIONS") return res.status(200).end()

  if (req.method === "POST") {
    const raw = await readBody(req)
    try {
      const { md, name } = JSON.parse(raw)
      return respond(res, md, name)
    } catch {
      res.writeHead(400, { "Content-Type": "application/json" })
      return res.end(JSON.stringify({ error: "Invalid JSON body" }))
    }
  }

  if (req.method === "GET") {
    const qs = new URLSearchParams(req.url.split("?")[1] || "")
    return respond(res, qs.get("md"), qs.get("name"))
  }

  res.writeHead(405, { "Content-Type": "application/json" })
  res.end(JSON.stringify({ error: "Method not allowed" }))
}
