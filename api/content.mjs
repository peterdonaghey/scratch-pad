/**
 * GET /api/content?id=<key>
 *   → 200 { "md": "# markdown", "name": "optional" }
 *   → 404 { "error": "Not found" }
 *
 * Retrieves markdown content that was previously stored via POST /api/url.
 */
import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
})

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  if (req.method === "OPTIONS") return res.status(200).end()
  if (req.method !== "GET") {
    res.writeHead(405, { "Content-Type": "application/json" })
    return res.end(JSON.stringify({ error: "Method not allowed" }))
  }

  const qs = new URLSearchParams(req.url.split("?")[1] || "")
  const id = qs.get("id")
  if (!id) {
    res.writeHead(400, { "Content-Type": "application/json" })
    return res.end(JSON.stringify({ error: 'Missing "id" parameter' }))
  }

  try {
    const data = await redis.get(`sp:${id}`)
    if (!data) {
      res.writeHead(404, { "Content-Type": "application/json" })
      return res.end(JSON.stringify({ error: "Not found" }))
    }
    res.writeHead(200, { "Content-Type": "application/json" })
    res.end(JSON.stringify(data))
  } catch (err) {
    res.writeHead(500, { "Content-Type": "application/json" })
    res.end(JSON.stringify({ error: "Internal server error" }))
  }
}
