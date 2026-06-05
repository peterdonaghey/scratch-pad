import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { marked } from "marked"

import { ProseConfigPanel } from "./ProseConfigPanel"
import type { ProseConfig, ScratchPadState } from "./types"
import {
  saveToStorage,
  proseConfigToCss,
  getInitialState,
  buildScratchPadUrl,
} from "./storage"
import { CONTENT_CLASS, WELCOME_MARKDOWN } from "./types"

export default function App() {
  // Combined state — single object avoids stale-closure problems
  const [state, setState] = useState<
    ScratchPadState & { loadedFromUrl: boolean; sheetName: string | null }
  >(() => {
    const initial = getInitialState()
    return {
      markdown: initial.markdown,
      prose: initial.prose,
      loadedFromUrl: initial.loadedFromUrl,
      sheetName: initial.sheetName,
    }
  })

  const { markdown, prose, loadedFromUrl, sheetName } = state

  const [panelOpen, setPanelOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)

  // Debounced auto-save
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      saveToStorage({ markdown, prose }, sheetName ?? undefined)
    }, 500)
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [markdown, prose, sheetName])

  // Handle editor text change
  const handleChange = useCallback((md: string) => {
    setState((prev) => ({
      ...prev,
      markdown: md,
      loadedFromUrl: false,
    }))
  }, [])

  // Handle prose config change
  const handleProseChange = useCallback((next: ProseConfig) => {
    setState((prev) => ({ ...prev, prose: next }))
  }, [])

  // Render markdown to HTML
  const renderedHtml = useMemo(() => {
    try {
      return marked.parse(markdown, { breaks: true })
    } catch {
      return "<p>Error rendering markdown</p>"
    }
  }, [markdown])

  // Generate the dynamic style tag content
  const styleCss = useMemo(() => proseConfigToCss(prose), [prose])

  // Copy rendered HTML to clipboard
  const handleCopy = useCallback(() => {
    const preview = previewRef.current
    if (!preview) return

    const html = preview.innerHTML
    if (!html.trim()) return

    const text = preview.textContent || ""

    navigator.clipboard
      .write([
        new ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
          "text/plain": new Blob([text], { type: "text/plain" }),
        }),
      ])
      .then(
        () => {
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        },
        () => {
          // Fallback
          const range = document.createRange()
          range.selectNodeContents(preview)
          const sel = window.getSelection()
          sel?.removeAllRanges()
          sel?.addRange(range)
          document.execCommand("copy")
          sel?.removeAllRanges()
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        },
      )
  }, [])

  // Export markdown
  const handleExport = useCallback(() => {
    const blob = new Blob([markdown], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = sheetName ? `${sheetName}.md` : "scratch-pad.md"
    a.click()
    URL.revokeObjectURL(url)
  }, [markdown, sheetName])

  // Copy scratch pad URL to clipboard
  const handleCopyUrl = useCallback(() => {
    const url = buildScratchPadUrl(markdown, sheetName ?? undefined)
    navigator.clipboard.writeText(url).catch(() => {})
  }, [markdown, sheetName])

  // Clear
  const handleClear = useCallback(() => {
    if (window.confirm("Clear the editor? This discards current content.")) {
      setState((prev) => ({
        ...prev,
        markdown: WELCOME_MARKDOWN,
        loadedFromUrl: false,
      }))
    }
  }, [])

  return (
    <div className="app-shell">
      <style>{styleCss}</style>

      {/* Top bar */}
      <header className="topbar">
        <div className="topbar-left">
          <h1 className="app-title">Scratch Pad</h1>
          {sheetName && <span className="badge badge-sheet">{sheetName}</span>}
          {loadedFromUrl && (
            <span className="badge badge-chat">Loaded from chat</span>
          )}
        </div>
        <div className="topbar-right">
          <button className="btn" onClick={handleCopy}>
            {copied ? "✅ Copied" : "📋 Copy rendered"}
          </button>
          <button className="btn" onClick={handleCopyUrl}>
            Copy URL
          </button>
          <button className="btn" onClick={() => setPanelOpen(true)}>
            Styles
          </button>
          <button className="btn" onClick={handleExport}>
            Export .md
          </button>
          <button className="btn btn-danger" onClick={handleClear}>
            Clear
          </button>
        </div>
      </header>

      {/* Split pane: editor + preview */}
      <div className="split-pane">
        <div className="pane pane-edit">
          <div className="pane-label">Markdown</div>
          <textarea
            className="md-input"
            value={markdown}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Type or paste Markdown here..."
            spellCheck={false}
          />
        </div>
        <div className="pane pane-preview">
          <div className="pane-label">Preview</div>
          <div
            ref={previewRef}
            className={`preview ${CONTENT_CLASS}`}
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
          />
        </div>
      </div>

      {/* Styles panel */}
      <ProseConfigPanel
        open={panelOpen}
        config={prose}
        onChange={handleProseChange}
        onClose={() => setPanelOpen(false)}
      />
    </div>
  )
}
