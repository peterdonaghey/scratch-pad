/**
 * Encoding health checks for pasted / imported text.
 *
 * Scratch Pad itself is UTF-8 end to end, but text can arrive already
 * corrupted: copied out of a PDF, an email, a legacy database, or a
 * Word/Excel export produced on a non-UTF-8 machine. Those corruptions
 * are invisible in the editor and would otherwise be forwarded to a
 * client, so we surface them before the content is copied.
 *
 * Patterns are deliberately narrow: they catch known mojibake families
 * without flagging legitimate accented text (café, naïve, Zürich).
 */

export interface EncodingIssue {
  /** Short machine-ish id for the family of corruption. */
  kind: string
  /** Human label shown in the UI. */
  label: string
  /** A few representative fragments from the document. */
  examples: string[]
  /** Total matches found. */
  count: number
}

/** Latin-3 (ISO-8859-3) only letters. Appear when GBK/EUC-KR bytes are read as Latin-3. */
const LATIN3 = "\\u0126\\u010A\\u011E\\u0134\\u015E\\u015C\\u016C\\u017B\\u015D\\u016D\\u010B\\u0124\\u0135\\u017C"
const THAI = "\\u0E00-\\u0E7F"

const PATTERNS: Array<{ kind: string; label: string; re: RegExp; mustEmbed?: boolean }> = [
  {
    kind: "replacement-char",
    label: "Replacement characters (\uFFFD) — text was lost when it was decoded",
    re: /\uFFFD/g,
  },
  {
    kind: "utf8-as-latin1",
    label: "UTF-8 read as Latin-1/Windows-1252 (â€™, Ã©, Â£ …)",
    re: /(â€™|â€œ|â€\u009D|â€\u009C|â€“|â€”|â€¦|â€˜|Ã©|Ã¨|Ã¢|Ã¤|Ã¶|Ã¼|Ã±|Ã |Ã§|Ã´|Ã®|Ã»|Ã¹|Â£|Â©|Â®|Â«|Â»|ï¿½)/g,
  },
  {
    kind: "cjk-as-latin3",
    label: "CJK/Korean bytes read as Latin-3 (ĦŻ, Ċ, Ğ … inside words)",
    // A Latin-3-only letter wedged between ASCII letters: SkyĦŻs
    re: new RegExp(`[A-Za-z][${LATIN3}]+[A-Za-z]`, "g"),
  },
  {
    kind: "cjk-as-thai",
    label: "Thai script characters — often CJK bytes misread as Thai (กช, จ)",
    re: new RegExp(`[${THAI}]+`, "g"),
  },
]

function snippet(s: string, index: number, len: number): string {
  const start = Math.max(0, index - 8)
  const end = Math.min(s.length, index + len + 8)
  return (start > 0 ? "…" : "") + s.slice(start, end).replace(/\n/g, " ") + (end < s.length ? "…" : "")
}

/** Scan text for known encoding-corruption signatures. */
export function findEncodingIssues(text: string): EncodingIssue[] {
  if (!text) return []
  const issues: EncodingIssue[] = []

  for (const p of PATTERNS) {
    const re = new RegExp(p.re.source, p.re.flags)
    const examples: string[] = []
    let count = 0
    let m: RegExpExecArray | null
    while ((m = re.exec(text)) !== null) {
      count++
      if (examples.length < 3) examples.push(snippet(text, m.index, m[0].length))
      if (m[0].length === 0) re.lastIndex++
    }
    if (count > 0) {
      issues.push({ kind: p.kind, label: p.label, examples, count })
    }
  }

  return issues
}

/** One-line summary suitable for a banner. */
export function summariseIssues(issues: EncodingIssue[]): string {
  return issues
    .map((i) => `${i.label} — ${i.count}× (${i.examples.join("  ·  ")})`)
    .join(" | ")
}
