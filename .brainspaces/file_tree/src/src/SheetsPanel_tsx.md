## Role
Renders an overlay panel that lists, opens, and deletes saved sheets, refreshing the list each time the panel is opened.

## Key exports
- `SheetsPanel` (React component)  
  **How to reference:** `import { SheetsPanel } from "./SheetsPanel"` (assuming same directory)

## Dependencies
- `react` (useState, useEffect)
- `./storage` (listSavedSheets, deleteSheet, SheetInfo type)

## Notable
- The sheet list is refreshed **only when the panel opens** (`useEffect` on `open` prop), not on every render.
- Deleting causes a synchronous re‑fetch of the sheet list via `listSavedSheets()` right after deletion.
- Delete confirmation uses `window.confirm`, which blocks the UI thread.
- Opening a sheet navigates via `window.location.href` (hard navigation), not React Router.
- Null sheet names are treated as "Untitled" in the delete confirmation and as `undefined` when calling `deleteSheet`.
- The panel overlay closes on click (via `onClick={onClose}`), but clicks inside the panel are stopped with `e.stopPropagation()`.
- Relative time formatting is done manually (`formatDate`) with thresholds: just now, Xm ago, Xh ago, then locale date.
- A sheet with `name === null` gets the key `"__unnamed__"` to avoid React key issues.