[CURRENT_STATE]
- Repo lives at ~/Projects/scratch-pad (moved from ~/Projects/notes/scratch-pad on 2026-06-08)
- Deployed on Vercel at https://scratch-pad-beryl.vercel.app
- Git remote: peterdonaghey/scratch-pad (public)
- Auto-deploys from main branch on push
- Active dev branch: main
- All source code, API endpoint, and docs are in the repo
- Agent skill gist: dd31cedd0445f094ed0fd5af505ef768 (updated to match current SKILL.md)
- Agent skill also saved to ~/.agents/skills/scratch-pad/SKILL.md

[BUSINESS_RULES]
- Named sheets (e.g., /recipes) MUST NOT be overwritten by ?md= content. When ?md= is present alongside a named path, the auto-save guard skips saving to the named key. Content is displayed but not persisted until the user explicitly edits or clicks the Save button.
- Save button (💾 Save) MUST prompt for a name, save immediately to localStorage under scratch-pad-state:<name>, and navigate to /<name> via history.pushState without ?md=.
- The Copy rendered button MUST use native browser selection-based copy (createRange + execCommand("copy")), NOT the ClipboardItem API, because selection-based copy preserves computed CSS styles (table borders, fonts, code backgrounds).
- /api/url endpoint MUST support both POST (raw markdown, no encoding needed) and GET (encoded markdown) returning {"url": "..."} JSON. CORS must be open (Access-Control-Allow-Origin: *).
- GET /api/url MUST return JSON, not a redirect, because some agents' fetch tools support GET only and don't follow redirects.
- vercel.json MUST exclude /api/ from the SPA rewrite so serverless functions work.
- The project MUST pin Vite to v7, not v8. Vite 8 uses Rolldown which breaks the build (blank page). Vite 7 uses Rollup which works correctly.

[ABANDONED_APPROACHES]
- MDXEditor (WYSIWYG): Tried but abandoned 2026-06-08. Two fatal issues: (1) tables render with interactive editing controls (add/delete row buttons) that show in the content area and disrupt copy flow; (2) Vite 8/Rolldown produces blank pages — only works under Vite 7/Rollup. Replaced with textarea + marked preview approach.
- ClipboardItem API for copying: Abandoned 2026-06-08. Using navigator.clipboard.write() with ClipboardItem loses computed styles (table borders, code backgrounds) when pasting. Native selection-based copy (createRange + execCommand) preserves everything.
- Upstash Redis for shared content: Referenced in an old gist but never built. The current approach uses ?md= URL parameter for sharing, no backend needed.
- Query param ?name= for named sheets: Abandoned 2026-06-08. Now uses path-based routing: /sheet-name instead of ?name=sheet-name.
- Short URL IDs (?id=<uuid>): Referenced in old gist but never built. Content is shared directly via ?md=<encoded> in the URL.

[KNOWN_ISSUES]
- SPA pages can't be simplified to text by agent fetch tools (expected — it's a client-rendered React app designed for humans in browsers).
- Vite 8 / Rolldown breaks this project. MUST stay on Vite 7 (^7.3.5).
- The auto-save guard (loadedFromUrl && sheetName) prevents saving named sheets when content comes from ?md=. First user edit clears the flag and resumes normal save. This is correct behavior, but subtle.

[RESEARCH_INSIGHTS]
- Browser native copy preserves computed CSS styles from the rendered DOM. ClipboardItem API copies raw innerHTML which loses styles. This is a fundamental browser behavior, not a library choice.
- Vite 8 replaced Rollup with Rolldown (Rust bundler) starting March 2026. Some packages (MDXEditor, Lexical-based editors) have compatibility issues with Rolldown.
- marked library from npm is ~245KB bundled (76KB gzipped) — lightweight and reliable for markdown rendering.
- Vercel serverless functions in api/ directory don't automatically parse JSON bodies. Body must be read as a stream and parsed manually when using .mjs files with the default Node.js runtime.

[CRYSTALISATION_GUIDANCE]
- This notes.md captures the full design history of the scratch-pad project. Crystallise should preserve the business rules as MUST/MUST NOT/SHOULD statements.
- The abandoned approaches section is critical — future agents should not re-attempt MDXEditor or ClipboardItem API.
- The Vite 7 vs Vite 8 issue is critical — if someone upgrades Vite, the build will silently break (blank page).
- The agent skill gist ID is dd31cedd0445f094ed0fd5af505ef768. If SKILL.md is updated, the gist should also be updated via:
  python3 -c "import json; content=open('SKILL.md').read(); payload={'files':{'SKILL.md':{'content':content}}}; open('/tmp/gist-payload.json','w').write(json.dumps(payload))"
  gh api -X PATCH gists/dd31cedd0445f094ed0fd5af505ef768 --input /tmp/gist-payload.json
- Future: consider setting up a GitHub Action to auto-update the gist when SKILL.md changes in main.
