/**
 * YAML front matter parser for markdown.
 *
 * Strips and parses the `---` delimited YAML metadata block at the top of
 * a markdown file. Handles common patterns: key-value pairs, lists, quoted
 * values, comments, and multiline block scalars (`|` and `>`).
 *
 * Returns the structured front matter data (or null) and the remaining body.
 */

export interface FrontmatterData {
  [key: string]: string | string[] | null
}

interface ParseResult {
  frontmatter: FrontmatterData | null
  body: string
}

/**
 * Parse YAML front matter from a markdown string.
 *
 * Returns `{ frontmatter: {...}, body: "..." }` when a valid front matter
 * block is found and parsed, or `{ frontmatter: null, body: raw }` when
 * none is present or parsing fails.
 */
export function parseFrontmatter(md: string): ParseResult {
  const normalized = md.replace(/\r\n/g, "\n")

  // Must start with `---\n` (no BOM, no leading whitespace)
  if (!normalized.startsWith("---\n") && normalized !== "---") {
    return { frontmatter: null, body: md }
  }

  // Find the closing `---` after the opening line
  const closeIndex = normalized.indexOf("\n---", 4)
  if (closeIndex === -1) {
    // No closing delimiter — treat whole thing as normal markdown
    return { frontmatter: null, body: md }
  }

  const raw = normalized.slice(4, closeIndex + 1) // includes trailing \n before ---
  const body = normalized.slice(closeIndex + 5)    // after the closing ---\n

  try {
    const frontmatter = parseYamlBlock(raw)
    return { frontmatter, body }
  } catch {
    // If YAML parsing fails, treat the front matter as a pre block
    // so the user can at least see what they wrote
    return { frontmatter: null, body: md }
  }
}

/**
 * Render parsed front matter as an HTML metadata panel.
 *
 * Uses the same scope (sp-preview) as the body so the user's prose
 * config (fonts, colors) applies consistently.
 */
export function renderFrontmatterHtml(data: FrontmatterData): string {
  const entries = Object.entries(data).filter(([, v]) => v !== null)

  if (entries.length === 0) return ""

  const rows = entries.map(([key, value]) => {
    const displayKey = escapeHtml(key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()))
    const displayValue = formatValue(value)
    return `
      <tr>
        <th class="fm-key">${displayKey}</th>
        <td class="fm-val">${displayValue}</td>
      </tr>`
  }).join("")

  return `<table class="fm-table" role="presentation">${rows}</table>`
}

// ─── Internal ──────────────────────────────────────────────────────────────

/**
 * Parse a raw YAML string (between the `---` delimiters) into a flat
 * key-value map. Keys can map to strings or string arrays (for lists).
 */
function parseYamlBlock(raw: string): FrontmatterData {
  const result: FrontmatterData = {}
  const lines = raw.split("\n")
  let currentKey: string | null = null
  let currentList: string[] | null = null
  let inMultiline = false
  let multilineType: "literal" | "folded" | null = null
  let multilineParts: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Handle multiline block scalars (| literal, > folded)
    if (inMultiline && currentKey) {
      if (line === "" || line[0] === " " || line[0] === "\t") {
        // Continuation line: strip indent and collect
        const content = line.replace(/^[ \t]{1,}/, "")
        if (multilineType === "literal") {
          multilineParts.push(content)
        } else {
          // folded: append with space
          const last = multilineParts.length - 1
          if (last >= 0 && content === "") {
            multilineParts.push("")
          } else if (last >= 0) {
            multilineParts[last] += " " + content
          } else {
            multilineParts.push(content)
          }
        }
        continue
      }
      // End of multiline block
      result[currentKey] = multilineParts.join(multilineType === "literal" ? "\n" : " ").trim()
      currentKey = null
      multilineParts = []
      inMultiline = false
      multilineType = null
      // Fall through to process the current line as a new key
    }

    const trimmed = line.trim()

    // Skip empty lines and comments
    if (trimmed === "" || trimmed.startsWith("#")) continue

    // List item continuation (dash-prefixed under a parent key)
    if (trimmed.startsWith("- ") && currentKey) {
      const item = trimmed.slice(2).trim()
      // Remove surrounding quotes
      const clean = stripQuotes(item)
      if (currentList) {
        currentList.push(clean)
      } else {
        currentList = [clean]
      }
      result[currentKey] = currentList
      continue
    }

    // Check for key: value pair
    const colonIndex = line.indexOf(":")
    if (colonIndex === -1) continue

    const keyRaw = line.slice(0, colonIndex).trim()
    const valueRaw = line.slice(colonIndex + 1).trim()

    if (!keyRaw) continue

    const key = stripQuotes(keyRaw)
    currentKey = key
    currentList = null

    // Inline list: key: [item1, item2]
    if (valueRaw.startsWith("[") && valueRaw.endsWith("]")) {
      const items = valueRaw
        .slice(1, -1)
        .split(",")
        .map((s) => stripQuotes(s.trim()))
        .filter(Boolean)
      result[key] = items
      currentKey = null
      continue
    }

    // Empty value — could be a list parent or a simple null
    if (valueRaw === "" || valueRaw === ">" || valueRaw === "|") {
      if (valueRaw === ">" || valueRaw === "|") {
        // Multiline block scalar indicator
        inMultiline = true
        multilineType = valueRaw === "|" ? "literal" : "folded"
        multilineParts = []
        // Don't set the value yet
        continue
      }
      result[key] = null
      // Keep currentKey set so dash-prefixed items below associate with this key
      currentKey = key
      currentList = null
      continue
    }

    // Simple scalar value
    const cleanValue = stripQuotes(valueRaw)
    result[key] = cleanValue
    currentKey = null
  }

  // Flush any unfinished multiline block
  if (inMultiline && currentKey) {
    result[currentKey] = multilineParts.join(multilineType === "literal" ? "\n" : " ").trim()
  }

  return result
}

function stripQuotes(s: string): string {
  const trimmed = s.trim()
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1)
  }
  return trimmed
}

/**
 * Format a front matter value for display in the metadata panel.
 */
function formatValue(value: string | string[] | null): string {
  if (value === null) return '<span class="fm-null">—</span>'
  if (Array.isArray(value)) {
    const items = value.map((v) => `<span class="fm-tag">${escapeHtml(v)}</span>`).join(" ")
    return items || '<span class="fm-null">—</span>'
  }
  return escapeHtml(value)
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}
