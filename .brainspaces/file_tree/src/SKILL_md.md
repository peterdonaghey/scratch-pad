## Role
Documentation for a service that lets agents POST markdown to an API and receive a shareable URL that opens a styled WYSIWYG editor with native copy support for formatted content.

## Key exports
- **API endpoint**: `POST /api/url` at `https://scratch-pad-beryl.vercel.app/api/url`  
- **Web app endpoints**: `/` (default), `/?id=<uuid>` (shared content), `/<sheet-name>` (named sheet), `/<sheet-name>?id=<uuid>` (shared on named sheet)

## Dependencies
- Upstash Redis (shared URL storage, 7‑day TTL)  
- Vercel (deployment platform)  
- localStorage (client‑side named sheet persistence)  
- No specific markdown editor library mentioned (uses a custom split‑pane editor)

## Notable
- **No manual encoding**: post raw markdown, the API handles it.  
- **Auto‑expire**: shared content expires after 7 days; save to localStorage to make permanent.  
- **Named sheets never overwritten by URL**: user must explicitly save to overwrite local content.  
- **Copy flow relies on native browser copy**: user clicks “📋 Copy rendered” or selects preview and uses Cmd/Ctrl+C; all computed styles survive paste into apps like Gmail, Docs, Word.  
- **Open CORS**: `Access-Control-Allow-Origin: *` on the API endpoint.  
- **Bundle size**: ~247 KB JS + ~4 KB CSS (77 KB gzipped).  
- **Auto‑save to localStorage**: debounced 500 ms on every change for named sheets.  
- **Style control panel**: customisable fonts, sizes, colours (text, background, headings, links, code).