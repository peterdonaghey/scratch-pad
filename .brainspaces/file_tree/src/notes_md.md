## Role
Captures the design history, business rules, abandoned approaches, known issues, and research insights for the scratch‑pad project, serving as a source of truth for development decisions and agent behavior.

## Key exports
*(None – this is a plain documentation file, not a module.)*

## Dependencies
*(None – the file itself has no imports.)*

## Notable
- **Vite version pinned to v7** – Vite 8 (Rolldown) produces a blank page. Upgrading will silently break the build; must stay on `^7.3.5`.
- **Do not re‑attempt MDXEditor or ClipboardItem API** – both were abandoned due to fatal issues (MDXEditor: table editing controls in preview, Vite 8 incompatibility; ClipboardItem API: loses computed CSS styles on paste). Use `textarea + marked` and native selection‑based copy instead.
- **Business rules are critical** – named sheets must not be overwritten by `?md=` content (auto‑save guard enabled); save button must prompt for name, save to localStorage, and navigate to path without query param; copy must use `createRange` + `execCommand("copy")`; `/api/url` must accept both POST (raw) and GET (encoded), return JSON, and have open CORS; `vercel.json` must exclude `/api/` from SPA rewrite.
- **Known issues** – SPA pages are not simplifiable by agent fetch tools (expected); the auto‑save guard is subtle and correct; Vite 8/Rolldown is fatal.
- **Gist sync** – when `SKILL.md` is updated, also update gist `dd31cedd0445f094ed0fd5af505ef768` via the provided `gh api` command (consider automating with a GitHub Action).
- **This file itself** must be kept accurate and used as the primary reference for project decisions – future agents should consult it before making changes.