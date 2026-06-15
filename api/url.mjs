/**
 * POST /api/url  —  { "md": "# markdown", "name": "optional" }
 * GET  /api/url?md=<encoded>&name=<optional>
 *   → 200 { "url": "https://scratch-pad-beryl.vercel.app/?id=abc..." }
 *
 * GET is for agents whose fetch tool only supports GET requests.
 * The ?md= is only used as input to the API — the returned URL
 * always uses the short ?id= scheme.
 *
 * Content stored in Upstash Redis auto-expires after 7 days.
 */
import { Redis } from "@upstash/redis"
import crypto from "node:crypto"

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
})

const BASE = "https://scratch-pad-beryl.vercel.app"
const TTL_SECONDS = 7 * 24 * 60 * 60 // 7 days

async function storeAndRespond(res, md, name) {
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

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  if (req.method === "OPTIONS") return res.status(200).end()

  // POST — for agents that can send JSON bodies
  if (req.method === "POST") {
    let body = ""
    req.on("data", (c) => (body += c))
    await new Promise((resolve) => req.on("end", resolve))

    try {
      const { md, name } = JSON.parse(body)
      return await storeAndRespond(res, md, name)
    } catch {
      res.writeHead(400, { "Content-Type": "application/json" })
      return res.end(JSON.stringify({ error: "Invalid JSON body" }))
    }
  }

  // GET — for agents whose fetch tool only supports GET
  // The ?md= param is the input — the returned URL never contains it
  if (req.method === "GET") {
    const qs = new URLSearchParams(req.url.split("?")[1] || "")
    return await storeAndRespond(res, qs.get("md"), qs.get("name"))
  }

  res.writeHead(405, { "Content-Type": "application/json" })
  res.end(JSON.stringify({ error: "Method not allowed" }))
}
