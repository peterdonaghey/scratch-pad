## Role
This file is the project's README/documentation, describing the architecture, setup, API endpoints, and design decisions for the Scratch Pad markdown editor.

## Key exports
Not applicable – this is a documentation file with no executable exports. However, it documents the API endpoints: `POST /api/url` and `GET /api/content`.

## Dependencies
- `marked` (markdown parsing)
- React 19
- Vite 7
- Upstash Redis (KV store)
- Vercel (hosting)
- Internal modules: `api/url.mjs`, `api/content.mjs`, `src/App.tsx`, `src/ProseConfigPanel.tsx`, `src/storage.ts`, `src/types.ts`, `src/main.tsx`, `SKILL.md`

## Notable
- Shared content stored in Upstash Redis with 7-day TTL.
- Copy rendered uses native selection and `execCommand("copy")` to preserve computed CSS.
- Named sheets with `?id=` parameter do not overwrite saved content until explicit save.
- SPA rewrites in `vercel.json` serve `index.html` for all non-API routes.
- Environment variables `KV_REST_API_URL` and `KV_REST_API_TOKEN` needed from Vercel Upstash integration.
- React 19 and Vite 7 are used, with plain CSS for styling, and no custom clipboard pipeline.