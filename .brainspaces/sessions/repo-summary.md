# scratch-pad
_scope: 1 sessions_
_generated: 2026-06-08T15:15:54+00:00_

## Higher-Level Summary

This session transforms the scratch pad from a client‑only, URL‑embedded markdown system into a server‑backed, short‑link architecture. The old `?md=` scheme—where the entire markdown lived in the URL—is replaced by a `?id=` scheme that stores content in Upstash Redis with a 7‑day TTL. Legacy support is fully removed, both from code and documentation. A new “My Sheets” panel provides basic localStorage management (list, title, snippet, delete). The frontend is updated to handle async URL generation and content fetching with loading/error states. The technical dependency shifts from a self‑contained client to a Vercel‑integrated service (Upstash Redis via environment variables).

**Patterns:**  
- **Decoupling data from URLs** – moving payload from URL parameter to server storage.  
- **Clean break** – no backward compatibility; all old code, tools, and docs are purged.  
- **Service integration** – using Vercel’s marketplace for Redis (replacing sunset `@vercel/kv`).  
- **User‑facing persistence** – adding a panel to manage locally saved sheets, mirroring the Styles panel pattern.  
- **Synchronous cleanup** – documentation (`SKILL.md`, `README.md`) updated in lockstep with code to avoid agent confusion.

**What matters most:**  
- The **complete removal** of `?md=` prevents agents from accidentally using the old scheme.  
- Moving markdown to Redis solves URL length limits and reduces agent overhead from parsing long URLs.  
- The **7‑day TTL** is a deliberate trade‑off: shorter than permanent storage but longer than a session.  
- The **“My Sheets” panel** was added as a convenience, not a requirement, and deliberately kept minimal.

---

## Extracted Insights

### Current ground truth (accepted way to do things now)
- Markdown is stored in Upstash Redis with a short UUID and 7‑day TTL.
- URLs use the format `?id=<uuid>`; the API returns this URL after storing.
- Frontend fetches content via `api/content.mjs` using the `?id=`.
- All legacy `?md=` support is removed from frontend (`parseMdFromUrl`, `buildScratchPadUrl`), API (`url.mjs` no longer has GET), and documentation.
- Users can save sheets to localStorage (with `savedAt` timestamp) and browse them in a slide‑over “My Sheets” panel (list, title/snippet, delete).
- The `url-for-pad.js` CLI is deleted; there is no off‑line URL generator.

### Abandoned approaches (tried and rejected)
- **LZ‑String compression in URL** – rejected because it only shortens the URL without removing content from it, and still requires full markdown in the POST body.
- **Keeping `?md=` backward compatibility** – rejected because it adds complexity and confuses agents; the user insisted on a clean break.

### Contradictions (conflicting approaches in summaries)
- None identified in this single session summary. All decisions are internally consistent and reinforce a single direction.
