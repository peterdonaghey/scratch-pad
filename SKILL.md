---
name: scratch-pad
description: Generate a shareable Scratch Pad URL with styled markdown content. Agents POST markdown to an API endpoint and get back a short URL that opens a WYSIWYG editor with live preview, style control, and clipboard-friendly copy. No manual encoding needed.
---

# Scratch Pad — Agent Skill

Agents use Scratch Pad to present styled markdown content to users in a way that copies cleanly into any app (email, docs, etc.). No clipboard hacks — the browser handles it.

## Quick reference

```
POST https://scratch-pad-beryl.vercel.app/api/url
Content-Type: application/json

{ "md": "# Your markdown here", "name": "optional-sheet-name" }

→ { "url": "https://scratch-pad-beryl.vercel.app/?id=abc-123-def" }
```

Send raw markdown in the body. The endpoint returns a short, clean URL. No manual encoding needed. Content is stored server-side and auto-expires after 7 days.

### Calling from agent tools

When using an HTTP request tool (like `http_request` or `fetch`), pass all required keyword arguments explicitly, even if empty:

```
http_request(
  url="https://scratch-pad-beryl.vercel.app/api/url",
  method="POST",
  query={},          # required by some tools — pass empty dict
  headers={"Content-Type": "application/json"},
  data={"md": "# Your markdown", "name": "optional-name"}  # JSON body
)
→ { "url": "https://scratch-pad-beryl.vercel.app/?id=abc-123-def" }
```

If your tool only supports GET requests, use the query-string form instead:

```
http_request(
  url="https://scratch-pad-beryl.vercel.app/api/url?md=%23+Hello&name=demo",
  method="GET",
  query={},
  headers={},
  data={}
)
→ { "url": "https://scratch-pad-beryl.vercel.app/demo?id=abc-123-def" }
```

## How it works

Scratch Pad is a split-pane markdown editor:
- **Left pane** — raw markdown (editable)
- **Right pane** — rendered preview with full style control
- **📋 Copy rendered** button — selects the preview and runs native browser copy, so all computed styles (fonts, colors, table borders, code backgrounds) survive the paste

## API endpoints

### POST /api/url (recommended for agents with JSON body support)

Send raw markdown in the body — no manual encoding needed:

```
POST https://scratch-pad-beryl.vercel.app/api/url
Content-Type: application/json

{ "md": "# Hello\n\nThis is **bold**.", "name": "demo" }

→ { "url": "https://scratch-pad-beryl.vercel.app/demo?id=abc-123-def" }
```

### GET /api/url (for agents whose fetch tool only supports GET)

The `md` value must be `encodeURIComponent()`-encoded:

```
GET https://scratch-pad-beryl.vercel.app/api/url?md=%23+Hello&name=demo

→ { "url": "https://scratch-pad-beryl.vercel.app/demo?id=abc-123-def" }
```

Important: `?md=` is only used as the **input** to the API — the returned URL uses the short `?id=` scheme and never contains the full markdown.

## URL schemes

| URL | Behavior |
|-----|----------|
| `/` | Default unnamed scratch pad |
| `/?id=<uuid>` | Load shared content from Upstash Redis |
| `/sheet-name` | Named sheet, loads/saves from local storage |
| `/sheet-name?id=<uuid>` | View shared content on a named sheet — **never** overwrites saved content until user explicitly saves |

## The copy flow (what makes this useful)

1. Agent POSTs or GETs markdown to `/api/url` — gets back a short `?id=` URL
2. Agent sends the URL to the user
3. User opens it, sees styled rendered content
4. User clicks **📋 Copy rendered** (or Cmd+A on the preview, then Cmd+C)
5. User pastes into Gmail, Google Docs, Word, etc. — all formatting (headings, bold, code blocks, tables with borders) survives

No custom clipboard pipeline. No lost formatting.

## Style control

The **Styles** slide-over panel lets users customize:
- Font family & mono font
- Font size & line height
- Colors: text, background, headings, links, code background
- Reset to defaults

Styles persist per localStorage key.

## Named sheets

Users can save content under a name via the **💾 Save** button. This:
1. Saves markdown + styles to `localStorage` under `scratch-pad-state:<name>`
2. Navigates to `/<name>` for a clean URL
3. Auto-saves on every change (debounced 500ms)

Named sheets are user-controlled. Agent-loaded content (`?id=`) never overwrites a named sheet until the user explicitly saves.

## Things to know

- The page is a single HTML+JS bundle deployed on Vercel
- Shared URLs (`?id=`) store content in Upstash Redis with a 7-day TTL — save to localStorage if you want it permanent
- localStorage persistence — survives refresh, crash, accidental close
- The `/api/url` endpoint has open CORS (`Access-Control-Allow-Origin: *`)
- Total bundle: ~247KB JS + ~4KB CSS (77KB gzipped)
