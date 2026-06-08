## Role
Defines URL rewrite rules for a Vercel deployment, routing API requests to an API handler and all other requests to `index.html` for single-page application (SPA) client-side routing.

## Key exports
*No functions, classes, or constants are exported; this is a configuration file.*

## Dependencies
*No external packages or internal modules are referenced.*

## Notable
- The first rewrite rule passes through any request starting with `/api/` to the same path, assuming an API backend is served separately (e.g., via serverless functions).
- The second rule catches all other requests and serves `index.html`, enabling SPA routing (e.g., React Router, Vue Router) without server-side path awareness.
- Order matters: `/api/` routes must be matched before the catch-all to avoid being incorrectly directed to `index.html`.
- This file is typically placed at the project root and recognized by Vercel/Now; if deploying to other platforms, equivalent configuration may be needed.