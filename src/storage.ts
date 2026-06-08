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
    localStorage.setItem(storageKey(sheetName), JSON.stringify({ ...state, savedAt: Date.now() }))
  } catch {
    // localStorage full or unavailable — silently fail
  }
}

export function deleteSheet(sheetName?: string): void {
  try {
    localStorage.removeItem(storageKey(sheetName))
  } catch {
    // silently fail
  }
}

export function parseNameFromUrl(): string | null {
  // Read name from path: /name-here → "name-here"
  // Skip empty segments and the root path
  const path = window.location.pathname.replace(/^\//, "").replace(/\/$/, "")
  return path || null
}

/** Read the ?id= parameter from the URL (short shared ID via Upstash Redis). */
export function parseIdFromUrl(): string | null {
  return new URLSearchParams(window.location.search).get("id")
}

/**
 * Fetch stored markdown content from the API by its short ID.
 * Used when the URL has ?id= instead of ?md=.
 */
export async function fetchContentById(id: string): Promise<{ md: string; name: string | null } | null> {
  try {
    const res = await fetch(`/api/content?id=${encodeURIComponent(id)}`)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export interface SheetInfo {
  name: string | null       // null for unnamed, string for named
  title: string              // first # heading, or sheet name, or "Untitled"
  snippet: string            // first ~120 chars of plain-ish text
  savedAt: number | null
}

/** Exclude default welcome text from the unnamed sheet listing. */
const WELCOME_MARKDOWN_COMPACT = WELCOME_MARKDOWN.replace(/\s+/g, " ").trim()

function isWelcomePage(md: string): boolean {
  return md.replace(/\s+/g, " ").trim() === WELCOME_MARKDOWN_COMPACT
}

function extractTitle(md: string, name: string | null): string {
  // First # Heading
  const match = md.match(/^#\s+(.+)/m)
  if (match) return match[1].trim()
  // Fall back to sheet name
  if (name) return name
  return "Untitled"
}

function extractSnippet(md: string): string {
  // Strip headings, code blocks, blockquotes, horizontal rules, images
  const clean = md
    .replace(/^```[\s\S]*?```$/gm, "")
    .replace(/^#+\s+/gm, "")
    .replace(/^>\s+/gm, "")
    .replace(/^---+$/gm, "")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[([^\]]+)\]\(.*?\)/g, "$1")
    .replace(/[*_~`]/g, "")
    .replace(/\n{2,}/g, " ")
    .trim()
  return clean.substring(0, 120).replace(/\s+$/, "") + (clean.length > 120 ? "…" : "")
}

/**
 * List all saved sheets from localStorage.
 * Returns unnamed first, then named sheets alphabetically.
 */
export function listSavedSheets(): SheetInfo[] {
  const results: SheetInfo[] = []

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key) continue

    // Match scratch-pad-state or scratch-pad-state:<name>
    let name: string | null = null
    if (key === STORAGE_KEY) {
      name = null
    } else if (key.startsWith(STORAGE_KEY + ":")) {
      name = key.slice(STORAGE_KEY.length + 1)
    } else {
      continue
    }

    try {
      const raw = localStorage.getItem(key)
      if (!raw) continue
      const parsed = JSON.parse(raw) as ScratchPadState
      if (typeof parsed.markdown !== "string") continue

      // Skip unnamed sheets that are just the welcome page
      if (name === null && isWelcomePage(parsed.markdown)) continue

      results.push({
        name,
        title: extractTitle(parsed.markdown, name),
        snippet: extractSnippet(parsed.markdown),
        savedAt: parsed.savedAt ?? null,
      })
    } catch {
      // skip unparseable entries
    }
  }

  // Sort: unnamed first, then alphabetical by title
  results.sort((a, b) => {
    if (a.name === null && b.name === null) return 0
    if (a.name === null) return -1
    if (b.name === null) return 1
    return a.title.localeCompare(b.title)
  })

  return results
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

  const saved = loadFromStorage(sheetName ?? undefined)
  if (saved) {
    return { markdown: saved.markdown, prose: saved.prose, loadedFromUrl: false, sheetName }
  }

  const welcome = sheetName
    ? `# ${sheetName}\n\nStart typing — this sheet auto-saves under the name **${sheetName}**.`
    : WELCOME_MARKDOWN

  return { markdown: welcome, prose: { ...DEFAULT_PROSE }, loadedFromUrl: false, sheetName }
}
