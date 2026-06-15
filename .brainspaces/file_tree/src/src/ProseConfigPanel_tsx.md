## Role
This file defines a React component that renders a style configuration panel for prose settings, allowing users to adjust fonts, font size, line height, and colors, and to reset to defaults.

## Key exports
- **`ProseConfigPanel`** – the main component.
- To import: `import { ProseConfigPanel } from "./ProseConfigPanel"` (file name inferred).
- Relies on types from `"./types"`: `ProseConfig`, `DEFAULT_PROSE`, `FONT_FAMILIES`, `MONO_FONTS`.

## Dependencies
- Internal: `"./types"` (for `ProseConfig`, constants, defaults)
- External: React (JSX implicit)

## Notable
- Controlled component: expects `config` (current state) and `onChange` (update callback).
- Renders nothing when `open` is `false`.
- Uses an overlay click to close, with stopPropagation on the inner panel.
- `ColorField` is a private helper component (not exported).
- Reset button spreads `DEFAULT_PROSE` to reset all values.
- Range sliders have explicit `min`, `max`, `step` values (fontSize: 10–28, step 1; lineHeight: 1.0–2.5, step 0.1).