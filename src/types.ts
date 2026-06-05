export interface ProseConfig {
  fontFamily: string
  monoFont: string
  textColor: string
  backgroundColor: string
  headingColor: string
  linkColor: string
  fontSize: number
  lineHeight: number
  codeBg: string
}

export const DEFAULT_PROSE: ProseConfig = {
  fontFamily: "Arial, Helvetica, sans-serif",
  monoFont: "Consolas, 'Courier New', monospace",
  textColor: "#1a1a1a",
  backgroundColor: "#ffffff",
  headingColor: "#000000",
  linkColor: "#1a6bb5",
  fontSize: 14,
  lineHeight: 1.6,
  codeBg: "#f5f5f5",
}

export interface ScratchPadState {
  markdown: string
  prose: ProseConfig
}

export const STORAGE_KEY = "scratch-pad-state"
export const CONTENT_CLASS = "sp-preview"

export const WELCOME_MARKDOWN = `# Welcome to Scratch Pad

A clean markdown editor with live preview. Start typing — your content auto-saves.

## Quick start

- Write markdown on the left, see the rendered preview on the right
- Open the **Styles** panel to customize fonts and colors
- Click **Copy rendered** to paste styled content into any app
- Click **Export .md** to download the raw markdown

## Features

- Auto-saves to localStorage (500ms debounce)
- Full style control (fonts, sizes, colors)
- Path-based sheets: \`/sheet-name\` creates a named scratch pad
- URL param loading: \`/?md=<encoded-markdown>\` or \`/sheet?md=...\`
- No backend needed — runs entirely in your browser
`

export const FONT_FAMILIES = [
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Georgia", value: "Georgia, 'Times New Roman', serif" },
  { label: "Times New Roman", value: "'Times New Roman', Times, serif" },
  { label: "Inter", value: "'Inter', system-ui, sans-serif" },
  { label: "System UI", value: "system-ui, -apple-system, sans-serif" },
  { label: "Helvetica", value: "Helvetica, Arial, sans-serif" },
  { label: "Palatino", value: "Palatino, 'Palatino Linotype', serif" },
  { label: "Garamond", value: "Garamond, 'EB Garamond', serif" },
]

export const MONO_FONTS = [
  { label: "Consolas", value: "Consolas, 'Courier New', monospace" },
  { label: "Fira Code", value: "'Fira Code', 'Consolas', monospace" },
  { label: "Source Code Pro", value: "'Source Code Pro', 'Consolas', monospace" },
  { label: "JetBrains Mono", value: "'JetBrains Mono', 'Consolas', monospace" },
  { label: "Monaco", value: "Monaco, 'Courier New', monospace" },
  { label: "Courier New", value: "'Courier New', Courier, monospace" },
]
