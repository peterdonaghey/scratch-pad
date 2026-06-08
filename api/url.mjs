/**
 * POST /api/url  —  { "md": "# markdown", "name": "optional" }
 *   → 200 { "url": "https://scratch-pad-beryl.vercel.app/?id=abc..." }
 *
 * Stores markdown in Upstash Redis with a short ID and returns a clean URL.
 * Content auto-expires after 7 days.
 */
import { Redis } from "@upstash/redis"
import crypto from "node:crypto"

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
})

const BASE = "https://scratch-pad-beryl.vercel.app"
const TTL_SECONDS = 7 * 24 * 60 * 60 // 7 days

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  if (req.method === "OPTIONS") return res.status(200).end()
  if (req.method !== "POST") {
    res.writeHead(405, { "Content-Type": "application/json" })
    return res.end(JSON.stringify({ error: "Method not allowed" }))
  }

  let body = ""
  req.on("data", (c) => (body += c))
  await new Promise((resolve) => req.on("end", resolve))

  let md, name
  try {
    const parsed = JSON.parse(body)
    md = parsed.md
    name = parsed.name
  } catch {
    res.writeHead(400, { "Content-Type": "application/json" })
    return res.end(JSON.stringify({ error: "Invalid JSON body" }))
  }

  if (!md || typeof md !== "string") {
    res.writeHead(400, { "Content-Type": "application/json" })
    return res.end(JSON.stringify({ error: 'Missing "md" parameter' }))
  }

  try {
    const id = crypto.randomUUID()
    await redis.set(`sp:${id}`, { md, name: name || null, ts: Date.now() }, { ex: TTL_SECONDS })

    const url = new URL(BASE + (name ? `/${encodeURIComponent(name)}` : "/"))
    url.searchParams.set("id", id)

    res.writeHead(200, { "Content-Type": "application/json" })
    res.end(JSON.stringify({ url: url.toString() }))
  } catch (err) {
    console.error("Redis store error:", err)
    res.writeHead(500, { "Content-Type": "application/json" })
    res.end(JSON.stringify({ error: "Failed to store content" }))
  }
}
