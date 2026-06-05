import type { ProseConfig, ScratchPadState } from "./types"
import { STORAGE_KEY, CONTENT_CLASS, DEFAULT_PROSE, WELCOME_MARKDOWN } from "./types"

function storageKey(sheetName?: string): string {
  return sheetName ? `${STORAGE_KEY}:${sheetName}` : STORAGE_KEY
}

export function loadFromStorage(sheetName?: string): ScratchPadState | null {
  try {
    const raw = localStorage.getItem(storageKey(sheetName))
    if (!raw) return null
    const parsed = JSON.parse(raw) as ScratchPadState
    // validate shape minimally
    if (typeof parsed.markdown === "string" && parsed.prose && typeof parsed.prose.fontFamily === "string") {
      return parsed
    }
    return null
  } catch {
    return null
  }
}

export function saveToStorage(state: ScratchPadState, sheetName?: string): void {
  try {
    localStorage.setItem(storageKey(sheetName), JSON.stringify(state))
  } catch {
    // localStorage full or unavailable — silently fail
  }
}

export function parseNameFromUrl(): string | null {
  // Read name from path: /name-here → "name-here"
  // Skip empty segments and the root path
  const path = window.location.pathname.replace(/^\//, "").replace(/\/$/, "")
  return path || null
}

export function parseMdFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search)
  const md = params.get("md")
  if (!md) return null
  try {
    return decodeURIComponent(md)
  } catch {
    return null
  }
}

export function buildScratchPadUrl(markdown: string, sheetName?: string): string {
  const base = sheetName
    ? `${window.location.origin}/${encodeURIComponent(sheetName)}`
    : window.location.origin + window.location.pathname.replace(/[^/]*$/, "")
  const url = new URL(base)
  url.searchParams.set("md", markdown)
  return url.toString()
}

/**
 * Generate a <style> tag content string for the prose config.
 * Every rule uses !important to override MDXEditor's internal styles.
 */
export function proseConfigToCss(config: ProseConfig): string {
  const {
    fontFamily,
    monoFont,
    textColor,
    backgroundColor,
    headingColor,
    linkColor,
    fontSize,
    lineHeight,
    codeBg,
  } = config

  return `
.${CONTENT_CLASS} {
  font-family: ${fontFamily} !important;
  color: ${textColor} !important;
  font-size: ${fontSize}px !important;
  line-height: ${lineHeight} !important;
  background-color: ${backgroundColor} !important;
}

.${CONTENT_CLASS} h1,
.${CONTENT_CLASS} h2,
.${CONTENT_CLASS} h3,
.${CONTENT_CLASS} h4,
.${CONTENT_CLASS} h5,
.${CONTENT_CLASS} h6 {
  color: ${headingColor} !important;
  font-weight: bold !important;
  text-shadow: none !important;
  text-transform: none !important;
  letter-spacing: normal !important;
}

.${CONTENT_CLASS} h1 { font-size: ${fontSize * 2.0}px !important; }
.${CONTENT_CLASS} h2 { font-size: ${fontSize * 1.5}px !important; }
.${CONTENT_CLASS} h3 { font-size: ${fontSize * 1.25}px !important; }

.${CONTENT_CLASS} a {
  color: ${linkColor} !important;
  text-decoration: underline !important;
}

.${CONTENT_CLASS} code,
.${CONTENT_CLASS} pre {
  font-family: ${monoFont} !important;
  background-color: ${codeBg} !important;
  color: ${textColor} !important;
}

.${CONTENT_CLASS} pre {
  padding: 12px !important;
  border-radius: 4px !important;
  overflow-x: auto !important;
}

.${CONTENT_CLASS} code {
  padding: 2px 6px !important;
  border-radius: 3px !important;
  font-size: 0.9em !important;
}

.${CONTENT_CLASS} blockquote {
  border-left: 3px solid ${linkColor} !important;
  padding-left: 16px !important;
  margin-left: 0 !important;
  color: ${textColor} !important;
  opacity: 0.85 !important;
}

.${CONTENT_CLASS} table {
  border-collapse: collapse !important;
  width: 100% !important;
}

.${CONTENT_CLASS} th,
.${CONTENT_CLASS} td {
  border: 1px solid #ccc !important;
  padding: 6px 10px !important;
  text-align: left !important;
}

.${CONTENT_CLASS} th {
  font-weight: bold !important;
  background-color: ${codeBg} !important;
}

.${CONTENT_CLASS} ul,
.${CONTENT_CLASS} ol {
  padding-left: 24px !important;
}

.${CONTENT_CLASS} img {
  max-width: 100% !important;
  height: auto !important;
}

.${CONTENT_CLASS} p {
  margin: 0 0 ${lineHeight * 0.5}em !important;
}
`
}

export function getInitialState(): {
  markdown: string
  prose: ProseConfig
  loadedFromUrl: boolean
  sheetName: string | null
} {
  const sheetName = parseNameFromUrl()
  const urlMd = parseMdFromUrl()

  if (urlMd !== null) {
    return { markdown: urlMd, prose: { ...DEFAULT_PROSE }, loadedFromUrl: true, sheetName }
  }

  const saved = loadFromStorage(sheetName ?? undefined)
  if (saved) {
    return { markdown: saved.markdown, prose: saved.prose, loadedFromUrl: false, sheetName }
  }

  const welcome = sheetName
    ? `# ${sheetName}\n\nStart typing — this sheet auto-saves under the name **${sheetName}**.`
    : WELCOME_MARKDOWN

  return { markdown: welcome, prose: { ...DEFAULT_PROSE }, loadedFromUrl: false, sheetName }
}
