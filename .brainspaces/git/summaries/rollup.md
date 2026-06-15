## 2026-06 Narrative

The project began as a minimal WYSIWYG markdown editor on Vercel. **MDXEditor** caused production build failures (Vite 8 → 7 downgrade didn't fix it), so it was **abandoned** entirely in favor of a simple textarea + `marked` preview. This shift from rich editing to plain text saved complexity.

**Navigation** evolved from query parameters (`?name=`) to path-based routes (`/sheet-name`), and saving became explicit (no accidental auto-save). A **native copy** behavior replaced custom clipboard logic.

**Two API/agent milestones**:
- First `/api/url` endpoint (POST markdown → long `?md=` URL) and a `SKILL.md` for agents.
- Quickly replaced by **short URLs via Upstash Redis** (PR #2): `?id=` with GET `/api/content`, removing legacy local tools (`url-generator.html`, `url-for-pad.js`). The API was hardened (manual body parsing, GET returns JSON).

**My Sheets Panel** (PR #3) added a slide-over drawer listing localStorage documents with title extraction, snippet preview, and timestamps, completing the offline storage story.

**Key shifts**:
- **Editor**: WYSIWYG → plain textarea
- **Routing**: query param → path-based
- **URLs**: long inline → short Redis IDs
- **Persistence**: single sheet → panel for multiple sheets

**Abandoned approaches**: MDXEditor, query-param routing, long URL scheme, local URL generation utilities.

**Pattern**: Iterative simplification and infrastructure consolidation – each PR solved a concrete pain point (build errors, URL length, agent integration, sheet management) while removing previous half-solutions.