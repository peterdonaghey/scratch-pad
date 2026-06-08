# scratch-pad — file tree context seed
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
