# Scratch Pad

A minimal markdown editor with live preview, full style control, and clipboard-friendly copy. Designed for agents to present styled content to users — and for users to save, tweak, and share it.

**Live at:** [https://scratch-pad-beryl.vercel.app](https://scratch-pad-beryl.vercel.app)  
**Agent API:** `POST /api/url` or `GET /api/url?md=...` — send markdown, get a short `?id=` URL back  
**Agent skill:** See [`SKILL.md`](SKILL.md) for the full agent protocol

---

## How it works

Split-pane layout:
- **Left pane** — raw markdown (textarea, monospace)
- **Right pane** — rendered preview with full style control via `marked`

Key insight: **no custom clipboard pipeline.** The 📋 Copy rendered button selects the preview div and fires the browser's native `execCommand("copy")`. The browser copies *computed* CSS — fonts, colors, table borders, code backgrounds — and they survive pasting into Gmail, Google Docs, Word, etc.

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Language | TypeScript |
| Framework | React 19 |
| Build | Vite 7 (Rollup) |
| Markdown | [`marked`](https://marked.js.org/) |
| Styling | Plain CSS |
| Persistence | `localStorage` + Upstash Redis (shared links via API) |
| Hosting | Vercel (static + serverless functions) |

---

## Project structure

```
api/
  url.mjs              # Serverless function: POST → stores in Redis → { "url": "..." }
  content.mjs          # Serverless function: GET → retrieves stored content by ID
src/
  App.tsx              # Main component (textarea + preview + top bar)
  ProseConfigPanel.tsx # Style control slide-over panel
  index.css            # All styles
  main.tsx             # Entry point
  storage.ts           # localStorage, URL parsing, CSS generation, API fetch
  types.ts             # ProseConfig, constants, font lists
SKILL.md               # Agent skill documentation
vercel.json            # SPA rewrites + API passthrough
vite.config.ts
```

---

## Development

```bash
cd ~/Projects/scratch-pad
npm install
npm run dev       # → http://localhost:5173
npm run build     # → dist/
npm run preview   # → serve dist/ locally
```

Environment variables (from Vercel Upstash Redis integration):

```
KV_REST_API_URL=   # Set via `vercel env pull .env.local`
KV_REST_API_TOKEN=
```

---

## URL schemes

| URL | Behavior |
|-----|----------|
| `/` | Default unnamed scratch pad |
| `/?id=<uuid>` | Load shared content from Upstash Redis |
| `/sheet-name` | Named sheet — loads/saves local storage under `scratch-pad-state:<name>` |
| `/sheet-name?id=<uuid>` | View shared content on a named sheet — **never** overwrites saved content until user explicitly saves |

### Agent API: POST /api/url

Send raw markdown, get a short URL back. No encoding needed.

```bash
curl -X POST https://scratch-pad-beryl.vercel.app/api/url \
  -H "Content-Type: application/json" \
  -d '{"md":"# Hello\n\nWorld","name":"demo"}'

# → { "url": "https://scratch-pad-beryl.vercel.app/demo?id=550e8400-e29b-41d4-a716-446655440000" }
```

Content is stored in Upstash Redis with a **7-day TTL** and served to the browser via `GET /api/content?id=...`.

---

## Key design decisions

### Why Upstash Redis instead of Vercel KV

Vercel KV was sunset in 2024. Upstash Redis is the replacement via Vercel Marketplace. It uses HTTP-based requests (no persistent TCP connections), making it ideal for serverless functions. The free tier (10K commands/day, 256MB) is more than enough for ephemeral shared links.

### 7-day TTL for shared content

Shared URLs are inherently ephemeral. A 7-day TTL gives users plenty of time to open the link and save it to localStorage if they want it permanent. Old links auto-expire.

### Copy approach: native selection

The Copy rendered button uses `document.createRange()` + `window.getSelection()` + `execCommand("copy")` — identical to what happens when the user manually selects the preview and presses Cmd+C. This preserves all computed CSS because the browser copies what it renders, not raw innerHTML.

### Named sheets safety

When `?id=` is present alongside a named path (e.g., `/notes?id=...`), the auto-save guard prevents overwriting the saved sheet. Content is displayed but not saved until the user explicitly clicks **💾 Save** or edits, which clears the `loadedFromUrl` flag.

---

## Style control

The **Styles** slide-over panel provides:
- Font family & mono font dropdowns (Arial, Georgia, Inter, Consolas, Fira Code, etc.)
- Font size (10-28px) & line height (1.0-2.5) sliders
- Color pickers for text, background, headings, links, code background
- Reset to defaults

Styles are saved per localStorage key and injected via a dynamic `<style>` tag with `!important` rules scoped to `.sp-preview`.

---

## Deployment

Pushes to `main` auto-deploy to Vercel. The SPA rewrite in `vercel.json` serves `index.html` for all routes except `/api/*`.

### One-time setup

1. In Vercel dashboard: Storage → Browse Marketplace → Upstash
2. Create a free Redis database
3. It auto-injects `KV_REST_API_URL` and `KV_REST_API_TOKEN` environment variables
4. Run `vercel env pull .env.local` to sync locally

---

## Bundle size

- JS: ~247 KB (77 KB gzipped)
- CSS: ~4 KB (1 KB gzipped)

---

## Agent integration

Full protocol in [`SKILL.md`](SKILL.md). Summary:

1. Agent POSTs markdown to `/api/url` — gets back a short `?id=` URL
2. User opens the URL, sees styled rendered content
3. User clicks **📋 Copy rendered** to copy styled output
4. User pastes into any app that accepts rich text
