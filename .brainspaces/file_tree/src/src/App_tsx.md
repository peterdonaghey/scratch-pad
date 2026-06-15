## Role
This is the main application component for a Markdown scratch pad with live preview, prose styling, local storage persistence, named sheets, shared URL support, and export/copy actions.

## Key exports
- `App` (default export)  
How to reference: `import App from "./App"` (default import).

## Dependencies
- `react` (hooks: `useCallback`, `useEffect`, `useMemo`, `useRef`, `useState`)
- `marked` (markdown parsing)
- `./ProseConfigPanel` (component)
- `./SheetsPanel` (component)
- `./types` (types: `ProseConfig`, `ScratchPadState`, constants: `CONTENT_CLASS`, `WELCOME_MARKDOWN`)
- `./storage` (functions: `saveToStorage`, `proseConfigToCss`, `getInitialState`, `parseIdFromUrl`, `fetchContentById`)

## Notable
- **URL loading**: On mount, checks for `?id=` in URL and fetches content via `fetchContentById`. Shows loading/error states while fetching. Sets `loadedFromUrl` to true.
- **Auto-save**: Debounced auto‑save (500 ms) but **skips saving** when content came from a URL *and* a named sheet exists (to avoid overwriting the user’s named sheet with shared content).
- **Copy rendered**: Uses `document.createRange()` and `execCommand("copy")` on the preview DOM node so computed styles (tables, fonts) survive paste.
- **Copy URL**: Posts current markdown (and optional sheet name) to `/api/url`, expects `{ url }` response, then copies to clipboard. Silently fails if API unavailable.
- **Save as named sheet**: Prompts for a name, saves to storage under that key, updates URL via `window.history.pushState`.
- **Clear**: Confirms then resets markdown to `WELCOME_MARKDOWN`.
- **Export**: Creates a blob of markdown and triggers download with filename `{sheetName}.md` or `scratch-pad.md`.
- **Panel management**: `ProseConfigPanel` and `SheetsPanel` are controlled by boolean state (`panelOpen`, `sheetsOpen`).
- **Performance**: Rendered HTML and dynamic CSS are memoized (`useMemo`). The editor’s `handleChange` reset `loadedFromUrl` to false on any edit.