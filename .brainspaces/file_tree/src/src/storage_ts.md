## Role
Provides utility functions for managing persistent scratch pad state (localStorage), URL parsing, content fetching via short ID, CSS generation for prose config, and initial state resolution.

## Key exports
- `loadFromStorage`
- `saveToStorage`
- `deleteSheet`
- `parseNameFromUrl`
- `parseIdFromUrl`
- `fetchContentById`
- `listSavedSheets`
- `proseConfigToCss`
- `getInitialState`

How to reference this file: `import { ... } from './scratchPadStorage'` (or similar path; exact name unknown, but file co‑located with `./types`).

## Dependencies
- `./types` (ProseConfig, ScratchPadState, STORAGE_KEY, CONTENT_CLASS, DEFAULT_PROSE, WELCOME_MARKDOWN)
- browser APIs: `localStorage`, `window.location`, `fetch`

## Notable
- `saveToStorage` silently fails if localStorage is full or unavailable.
- `loadFromStorage` performs minimal shape validation (checks `markdown` is string and `prose.fontFamily` is string).
- `listSavedSheets` excludes unnamed sheets that consist solely of the welcome markdown (after whitespace normalisation). Returns unnamed sheets first, then alphabetically by title.
- `proseConfigToCss` generates CSS using `!important` everywhere to override MDXEditor’s internal styles.
- `getInitialState` resolves state from saved localStorage (if present), otherwise constructs a default welcome sheet (with a named heading if a sheet name is parsed from the URL).
- `fetchContentById` is used when a short `?id=` is provided in the URL rather than inline markdown.
- Edge cases: empty path segments are skipped; `deleteSheet` silently fails; `fetchContentById` returns `null` on any network or parsing error.