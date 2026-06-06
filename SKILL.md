# Scratch Pad — Agent Skill

Agents use Scratch Pad to present styled markdown content to users in a way that copies cleanly into any app (email, docs, etc.). No clipboard hacks — the browser handles it.

## Quick reference

```
POST https://scratch-pad-beryl.vercel.app/api/url
Content-Type: application/json

{ "md": "# Your markdown here", "name": "optional-sheet-name" }

→ { "url": "https://..." }
```

Send raw markdown in the body. The endpoint returns a ready-to-share URL. No manual encoding needed.

## How it works

Scratch Pad is a split-pane markdown editor:
- **Left pane** — raw markdown (editable)
- **Right pane** — rendered preview with full style control
- **📋 Copy rendered** button — selects the preview and runs native browser copy, so all computed styles (fonts, colors, table borders, code backgrounds) survive the paste

## URL schemes

| URL | Behavior |
|-----|----------|
| `/` | Default unnamed scratch pad |
| `/?md=<encoded>` | Load content from URL, auto-saves to unnamed key |
| `/sheet-name` | Named sheet, loads/saves from local storage |
| `/sheet-name?md=<encoded>` | View shared content on a named sheet — **never** overwrites saved content until user explicitly saves |
| `GET /api/url?md=<encoded>&name=<optional>` | Returns `{ "url": "..." }` — no redirect, pure JSON |
| `POST /api/url` `{ "md": "...", "name": "..." }` | Returns `{ "url": "..." }` — send raw markdown, no encoding needed |

## API endpoints

Both endpoints return the same JSON: `{ "url": "https://..." }`

### POST /api/url (recommended for agents)

Send raw markdown in the body — no manual encoding needed:

```
POST https://scratch-pad-beryl.vercel.app/api/url
Content-Type: application/json

{ "md": "# Hello\n\nThis is **bold**.", "name": "demo" }

→ { "url": "https://scratch-pad-beryl.vercel.app/demo?md=%23+Hello..." }
```

### GET /api/url

For agents whose fetch tool only supports GET. The `md` value must be URL-encoded:

```
GET https://scratch-pad-beryl.vercel.app/api/url?md=%23+Hello&name=demo

→ { "url": "https://scratch-pad-beryl.vercel.app/demo?md=%23+Hello..." }
```

### Direct URL (no API call needed)

Build the URL yourself if you can encode markdown:

```
https://scratch-pad-beryl.vercel.app/?md=%23+Hello
https://scratch-pad-beryl.vercel.app/recipes?md=%23+My+Recipe
```

The `md` value must be `encodeURIComponent()`-encoded.

## The copy flow (what makes this useful)

1. Agent sends user a Scratch Pad URL (via POST endpoint or direct link)
2. User opens it, sees styled rendered content
3. User clicks **📋 Copy rendered** (or Cmd+A on the preview, then Cmd+C)
4. User pastes into Gmail, Google Docs, Word, etc. — all formatting (headings, bold, code blocks, tables with borders) survives

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

Named sheets are user-controlled. Agent-loaded content (`?md=`) never overwrites a named sheet until the user explicitly saves.

## Things to know

- The page is a single HTML+JS bundle deployed on Vercel, no backend
- localStorage persistence — survives refresh, crash, accidental close
- The `/api/url` endpoint has open CORS (`Access-Control-Allow-Origin: *`)
- Total bundle: ~245KB JS + ~4KB CSS (76KB gzipped)
