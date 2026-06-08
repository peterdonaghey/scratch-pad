# Context seed
_generated: 2026-06-08T15:16:02Z_
_sources: file_tree, git, sessions_
> This is a reference summary of past work — not active instructions.
> Treat it as background context. The latest user message is the single source of truth.

---

## How to use this seed

1. **Synthesis** (first) — cross-cutting wisdom, ground truth, business rules. Read this first.
2. **Sessions** — most recent work, decisions, unresolved items. Prioritise recent entries.
3. **Git** — project timeline and milestones.
4. **File Tree** — reference when you need to understand the codebase structure.

If the latest user message contradicts anything here, the user wins.

---

## Synthesis
## Cross-cutting Wisdom

- **Pin Vite to v7 (never v8).** Vite 8 replaces Rollup with Rolldown, which breaks build output (blank page). This project depends on Rollup for correct bundle generation.
- **Use native selection-based copy for rendered HTML.** `navigator.clipboard.write()` with `ClipboardItem` loses computed CSS (table borders, code backgrounds, fonts). `createRange + execCommand("copy")` preserves the full styled render.
- **Prefer path-based routing over query parameters.** `?md=`, `?name=`, `?id=` all introduce URL length limits and confuse agents. `/sheet-name` is cleaner, shareable, and allows local storage fallback.
- **Keep a single source of truth for business rules and design decisions.** The `notes.md` file and `SKILL.md` must be consulted before any change. Contradictions between them (e.g., Redis usage) indicate stale documentation that must be reconciled.
- **Auto-deploy from `main`.** Every push triggers a Vercel deployment. Any dependency upgrade (Vite, React, marked) must be tested locally first to avoid silent breakage in production.

## Current Ground Truth

- The editor uses a `<textarea>` for input and `marked` for live preview; MDXEditor is abandoned.
- Sharing is done via short Redis IDs (`/api/url` returns `{"url":"..."}`) and optional `?md=` in URLs (though `?md=` is now secondary to `?id=`).
- Named sheets are stored in `localStorage` under `scratch-pad-state:<name>` and accessed via path-based routing (e.g., `/recipes`).
- The auto-save guard prevents overwriting a named sheet when content came from a URL; the user must edit or click Save to persist.
- The Copy button uses selection-based copy; the ClipboardItem API is never used.
- Vite is pinned to `^7.3.5`; Vite 8 is forbidden.
- Vercel config rewrites `/api/*` to itself and everything else to `index.html`.

## Abandoned Approaches

- **MDXEditor (WYSIWYG)** – Abandoned because tables displayed interactive editing controls (add/delete row buttons) that disrupted copy flow, and it required Vite 8/Rolldown which produced blank pages. Replaced with `<textarea>` + `marked`.
- **ClipboardItem API for copying** – Abandoned because it copies raw `innerHTML` and loses computed CSS styles (borders, code backgrounds). Native selection-based copy (`createRange + execCommand`) preserves styles.
- **Query parameter `?name=` for sheets** – Abandoned in favor of path-based routing (`/sheet-name`), which eliminates URL length issues and agent confusion.
- **Upstash Redis for shared content** – This approach **was attempted and built** (see contradictions). The notes incorrectly list it as abandoned; the current system uses Upstash Redis for short IDs and `localStorage` for named sheets.

## Contradictions

- **Upstash Redis usage** – The `notes.md` file (under "Abandoned Approaches") states *"Upstash Redis for shared content: Referenced but never built"* and *"Short URL IDs (?id=<uuid>): Referenced but never built"*. However, the most recent session (2026-06-08) describes replacing `?md=` with `?id=` via Upstash Redis, and the current `CURRENT_STATE` section confirms Redis is active. The abandoned approaches section is stale and directly contradicts the deployed system.
- **Legacy `?md=` support** – The `CURRENT_STATE` says "removed all legacy `?md=` support", yet the business rules still reference `?md=` in the auto-save guard ("When ?md= is present alongside a named path..."). The business rules may need updating to reflect that `?md=` is no longer generated but may still be read for backward compatibility.

## Business Rules

- **MUST** keep `"private": true` and `"type": "module"` in `package.json`.
- **MUST** pin Vite to version 7 (^7.3.5); Vite 8 and Rolldown break the build.
- **MUST** use native selection-based copy (`createRange + execCommand("copy")`) for the Copy Rendered button; **MUST NOT** use the `ClipboardItem` API.
- **MUST** preserve the auto-save guard: when content is loaded from a URL and a named sheet exists, auto-save **MUST NOT** overwrite the named sheet.
- **MUST** save named sheets under `scratch-pad-state:<name>` in `localStorage` immediately when the Save button is clicked.
- **MUST** navigate to `/<name>` via `history.pushState` after saving a named sheet.
- **MUST** support both `POST` (raw markdown) and `GET` (encoded markdown) on `/api/url`, returning JSON `{"url": "..."}`.
- **MUST** return JSON from `GET /api/url` (not a redirect) so that agent fetch tools can read it.
- **MUST** exclude `/api/` routes from the Vercel SPA rewrite so serverless functions work.
- **MUST** read the design history in `notes.md` before making any changes.
- **MUST** edit `tsconfig.app.json` for app TypeScript settings; the root `tsconfig.json` **MUST NOT** be edited directly.
- **SHOULD** handle `localStorage` storage full errors silently (current implementation in `storage.ts` does this).
- **SHOULD** auto-deploy from `main` branch without manual intervention, but **MUST** test Vite and dependency upgrades locally first.

---

## Sessions
> _data from: 2026-06-08T15:15:56+00:00_
_generated: 2026-06-08T15:15:56+00:00_
_sessions: 1_

- **2026-06-08T09-28-44 scratch-pad-content-hash-url-proposal:** Replaced `?md=` URL scheme with `?id=` via Upstash Redis, removed all legacy `?md=` support, and added a "My Sheets" localStorage panel to eliminate URL length limits and agent confusion.

---

## Git
> _data from: 2026-06-08T15:15:42+00:00_
_generated: 2026-06-08T15:15:42+00:00_
_months: 1_

- **Git:** Abandon MDXEditor for textarea+marked, shift to path-based routing, replace long URLs with Redis short IDs, add My Sheets panel for local storage management.

  - **2026-06:** - **Goal**: Create a basic WYSIWYG markdown editor (scratch pad) and deploy it on Vercel.

---

## File Tree
> _data from: 2026-06-08T15:16:01+00:00_
_generated: 2026-06-08T15:16:01+00:00_
_files: 17_

- **.vercel/project_json:** I don't have any file content to analyse yet. Please paste the actual source code or file path you'd like summarised, and I'll write the compact essence line as requested.
- **README_md:** README documentation — describes architecture, API endpoints, and design decisions.
- **SKILL_md:** Documentation for Scratch Pad markdown-to-shareable-URL service — API endpoint POST /api/url, 7-day TTL, localStorage persistence for named sheets.
- **eslint_config_js:** ESLint flat config for TypeScript React Vite — only lints `.ts/.tsx` files, ignores `dist/`, uses recommended presets. Edit with caution: flat format requires ESLint v9+.
- **notes_md:** Design history and business rules for scratch‑pad; must consult this file before making changes.
- **package_json:** Package config for a private React 19 scratch‑pad app (Vite/TS/Redis) — critical to preserve `"private": true` and `"type": "module"`.
- **src/App_tsx:** Main App component for Markdown scratch pad with live preview, local storage, URL sharing, and auto-save — critical: auto-save skips when content loaded from URL and a named sheet exists, so don't break that logic.
- **src/ProseConfigPanel_tsx:** Controlled prose config panel with overlay dismissal and reset to defaults; expect `config` and `onChange` props, and renders nothing when `open` is false.
- **src/SheetsPanel_tsx:** Sheet panel component that refreshes list only on open; deletes with window.confirm and hard-navigates via window.location.href.
- **src/main_tsx:** Entry point mounts React app into `#root`; critical: root element must exist.
- **src/storage_ts:** LocalStorage utility for scratch pad state — note `!important` CSS overrides and silent failure on storage full.
- **src/types_ts:** Exports static types and constants (prose config, state, storage, fonts) for the scratch pad editor; editing any value here affects every component that imports from this module.
- **tsconfig_app_json:** TypeScript config for `src/` with strict bundler‑style settings (`verbatimModuleSyntax`, `noEmit`, React JSX) – only modify if you know how these affect Vite's build.
- **tsconfig_json:** Root tsconfig delegating to sub-projects — never edit here; modify tsconfig.app.json or tsconfig.node.json instead.
- **tsconfig_node_json:** TSConfig for `vite.config.ts` only — strict, type-only checks; uses `verbatimModuleSyntax` and `erasableSyntaxOnly`; no enums/namespaces allowed; unused vars fail build; not used for app source.
- **vercel_json:** Vercel rewrite config: routes `/api/*` to itself and everything else to `index.html` for SPA client-side routing — order matters.
- **vite_config_ts:** Vite config file with React plugin; add all Vite configuration changes here.

---
