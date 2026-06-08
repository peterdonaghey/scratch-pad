# Scratch Pad

A minimal markdown editor with live preview, full style control, and clipboard-friendly copy. Designed for agents to present styled content to users — and for users to save, tweak, and share it.

**Live at:** [https://scratch-pad-beryl.vercel.app](https://scratch-pad-beryl.vercel.app)  
**Agent API:** `POST /api/url` — send markdown, get a shareable URL back  
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
| Framework | React 18 |
| Build | Vite 7 (Rollup) |
| Markdown | [`marked`](https://marked.js.org/) |
| Styling | Plain CSS |
| Persistence | `localStorage` |
| Hosting | Vercel (static + serverless function) |

---

## Project structure

```
api/
  url.mjs              # Serverless function: POST/GET → { "url": "..." }
src/
  App.tsx              # Main component (textarea + preview + top bar)
  ProseConfigPanel.tsx # Style control slide-over panel
  index.css            # All styles
  main.tsx             # Entry point
  storage.ts           # localStorage, URL parsing, CSS generation
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

---

## URL schemes

| URL | Behavior |
|-----|----------|
| `/` | Default unnamed scratch pad |
| `/?md=<encoded>` | Load content from URL, auto-saves to unnamed key |
| `/sheet-name` | Named sheet — loads/saves local storage under `scratch-pad-state:<name>` |
| `/sheet-name?md=<encoded>` | View shared content on a named sheet — **never** overwrites saved content until user explicitly saves |

### Agent API: POST /api/url

Send raw markdown, get a URL back. No encoding needed.

```bash
curl -X POST https://scratch-pad-beryl.vercel.app/api/url \
  -H "Content-Type: application/json" \
  -d '{"md":"# Hello\n\nWorld","name":"demo"}'

# → { "url": "https://scratch-pad-beryl.vercel.app/demo?md=%23+Hello%0A%0AWorld" }
```

### Agent API: GET /api/url

For agents whose fetch tool only supports GET. Markdown must be `encodeURIComponent()`-encoded.

```
GET https://scratch-pad-beryl.vercel.app/api/url?md=%23+Hello&name=demo
→ { "url": "https://scratch-pad-beryl.vercel.app/demo?md=%23+Hello" }
```

### Direct URL

```
https://scratch-pad-beryl.vercel.app/?md=%23+Hello
https://scratch-pad-beryl.vercel.app/recipes?md=%23+My+Recipe
```

---

## Key design decisions

### Why Vite 7 instead of 8

Vite 8 replaced Rollup with Rolldown (Rust bundler). MDXEditor's dynamic imports break under Rolldown, producing a blank page. Since we replaced MDXEditor with `marked`, this is no longer a blocking issue, but the project remains on Vite 7 for stability.

### Copy approach: native selection

The Copy rendered button uses `document.createRange()` + `window.getSelection()` + `execCommand("copy")` — identical to what happens when the user manually selects the preview and presses Cmd+C. This preserves all computed CSS because the browser copies what it renders, not raw innerHTML.

### Named sheets safety

When `?md=` is present alongside a named path (e.g., `/notes?md=...`), the auto-save guard prevents overwriting the saved sheet. Content is displayed but not saved until the user explicitly clicks **💾 Save** or edits, which clears the `loadedFromUrl` flag.

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

---

## Bundle size

- JS: ~245 KB (76 KB gzipped)
- CSS: ~4 KB (1 KB gzipped)

---

## Agent integration

Full protocol in [`SKILL.md`](SKILL.md). Summary:

1. Agent POSTs markdown to `/api/url` (or builds URL directly)
2. User opens the URL in a browser
3. User clicks **📋 Copy rendered** to copy styled output
4. User pastes into any app that accepts rich text
