import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { marked } from "marked"

import { ProseConfigPanel } from "./ProseConfigPanel"
import { parseFrontmatter, renderFrontmatterHtml } from "./frontmatter"
import { SheetsPanel } from "./SheetsPanel"
import type { ProseConfig, ScratchPadState } from "./types"
import {
  saveToStorage,
  proseConfigToCss,
  getInitialState,
  parseIdFromUrl,
  fetchContentById,
} from "./storage"
import { CONTENT_CLASS, WELCOME_MARKDOWN } from "./types"

export default function App() {
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
  const [sheetsOpen, setSheetsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [loadingRemote, setLoadingRemote] = useState(false)
  const [remoteError, setRemoteError] = useState<string | null>(null)
  const [leftWidth, setLeftWidth] = useState(50) // percentage for editor pane
  const [dragging, setDragging] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)
  const splitPaneRef = useRef<HTMLDivElement>(null)

  // On mount, check for ?id= in the URL and fetch content from the API
  useEffect(() => {
    const id = parseIdFromUrl()
    if (!id) return

    setLoadingRemote(true)

    fetchContentById(id).then((data) => {
      if (!data) {
        setRemoteError("Content not found — the link may have expired.")
        setLoadingRemote(false)
        return
      }
      setState((prev) => ({
        ...prev,
        markdown: data.md,
        loadedFromUrl: true,
        // If the stored content has a name, use it as the sheet name
        sheetName: data.name ?? prev.sheetName,
      }))
      setLoadingRemote(false)
    })
  }, [])

  // Debounced auto-save — NEVER saves to a named key when loaded from URL
  // (prevents ?id= shared content from overwriting a user's named sheet)
  useEffect(() => {
    // Skip auto-save when content arrived via URL on a named sheet
    if (loadedFromUrl && sheetName) return

    const key = sheetName ?? undefined
    const timer = setTimeout(() => {
      saveToStorage({ markdown, prose }, key)
    }, 500)
    return () => clearTimeout(timer)
  }, [markdown, prose, sheetName, loadedFromUrl])

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

  // Parse front matter and render markdown to HTML
  const renderedHtml = useMemo(() => {
    try {
      const { frontmatter, body } = parseFrontmatter(markdown)
      const bodyHtml = marked.parse(body, { breaks: true })
      if (frontmatter) {
        return renderFrontmatterHtml(frontmatter) + bodyHtml
      }
      return bodyHtml
    } catch {
      return "<p>Error rendering markdown</p>"
    }
  }, [markdown])

  // Resizable split pane divider handlers
  const handleDividerMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setDragging(true)
  }, [])

  useEffect(() => {
    if (!dragging) return

    const handleMouseMove = (e: MouseEvent) => {
      const container = splitPaneRef.current
      if (!container) return
      const rect = container.getBoundingClientRect()
      const x = e.clientX - rect.left
      const pct = Math.min(90, Math.max(10, (x / rect.width) * 100))
      setLeftWidth(pct)
    }

    const handleMouseUp = () => {
      setDragging(false)
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [dragging])

  // Generate the dynamic style tag content
  const styleCss = useMemo(() => proseConfigToCss(prose), [prose])

  // Copy rendered — grabs the rendered HTML + plain text from the preview div
  // and writes both to the clipboard via the modern Clipboard API.
  // This gives us explicit control over clipboard formats and avoids browser
  // quirks with the deprecated execCommand("copy") path.
  const handleCopy = useCallback(() => {
    const preview = previewRef.current
    if (!preview) return

    // Build a standalone HTML document from the preview content so copied styles
    // (table borders, fonts, colors, etc.) survive the paste into rich text apps.
    const html = `
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; padding: 8px; }
</style>
</head>
<body>
${preview.innerHTML}
</body>
</html>`
    const text = preview.innerText

    navigator.clipboard.write([
      new ClipboardItem({
        "text/html": new Blob([html], { type: "text/html" }),
        "text/plain": new Blob([text], { type: "text/plain" }),
      }),
    ]).catch(() => {
      // Clipboard API unavailable — fall back to execCommand
      const range = document.createRange()
      range.selectNodeContents(preview)
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(range)
      document.execCommand("copy")
      sel?.removeAllRanges()
    })

    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
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

  // Copy scratch pad URL to clipboard — uses API to get a short ?id= URL
  const handleCopyUrl = useCallback(async () => {
    try {
      const res = await fetch("/api/url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ md: markdown, name: sheetName || undefined }),
      })
      const { url } = await res.json()
      await navigator.clipboard.writeText(url)
    } catch {
      // API unavailable — silently fail
    }
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

  // Save as named sheet
  const handleSave = useCallback(() => {
    const name = prompt("Save as:", sheetName || "")
    if (!name || !name.trim()) return

    const clean = name.trim()
    saveToStorage({ markdown, prose }, clean)

    // Navigate to the named path (no ?md= since we just saved)
    const path = `/${encodeURIComponent(clean)}`
    window.history.pushState(null, "", path)

    setState((prev) => ({
      ...prev,
      sheetName: clean,
      loadedFromUrl: false,
    }))
  }, [markdown, prose, sheetName])

  return (
    <div className="app-shell">
      <style>{styleCss}</style>

      {/* Top bar */}
      <header className="topbar">
        <div className="topbar-left">
          <h1 className="app-title">Scratch Pad</h1>
          {sheetName && <span className="badge badge-sheet">{sheetName}</span>}
          {loadedFromUrl && !sheetName && (
            <span className="badge badge-chat">Loaded from chat</span>
          )}
          {loadedFromUrl && sheetName && (
            <span className="badge badge-chat">Viewing shared — edit to save</span>
          )}
        </div>
        <div className="topbar-right">
          <button className="btn" onClick={handleSave}>
            💾 Save
          </button>
          <button className="btn" onClick={handleCopy}>
            {copied ? "✅ Copied" : "📋 Copy rendered"}
          </button>
          <button className="btn" onClick={handleCopyUrl}>
            Copy URL
          </button>
          <button className="btn" onClick={() => setSheetsOpen(true)}>
            My Sheets
          </button>
          <a className="btn btn-link" href="https://gist.github.com/peterdonaghey/dd31cedd0445f094ed0fd5af505ef768" target="_blank" rel="noopener">
            Skill
          </a>
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

      {/* Loading / error state for remote content */}
      {loadingRemote && (
        <div className="split-pane">
          <div className="pane pane-edit">
            <div className="pane-label">Markdown</div>
            <div className="md-input md-input-idle">
              <div className="loading-dots"><span></span><span></span><span></span></div>
            </div>
          </div>
          <div className="pane pane-preview">
            <div className="pane-label">Preview</div>
            <div className={`preview ${CONTENT_CLASS}`}>
              <p><em>Loading shared content…</em></p>
            </div>
          </div>
        </div>
      )}

      {remoteError && (
        <div className="split-pane">
          <div className="pane pane-edit">
            <div className="pane-label">Markdown</div>
            <div className="md-input md-input-idle">
              <span style={{ color: "#c00" }}>⚠</span>
            </div>
          </div>
          <div className="pane pane-preview">
            <div className="pane-label">Preview</div>
            <div className={`preview ${CONTENT_CLASS}`}>
              <p style={{ color: "#c00" }}>{remoteError}</p>
              <p>Try requesting a fresh link from the agent.</p>
            </div>
          </div>
        </div>
      )}

      {/* Split pane: editor + preview */}
      {!loadingRemote && !remoteError && (
      <div
        ref={splitPaneRef}
        className={`split-pane${dragging ? " dragging" : ""}`}
      >
        <div className="pane pane-edit" style={{ width: `${leftWidth}%` }}>
          <div className="pane-label">Markdown</div>
          <textarea
            className="md-input"
            value={markdown}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Type or paste Markdown here..."
            spellCheck={false}
          />
        </div>
        <div
          className={`divider${dragging ? " active" : ""}`}
          onMouseDown={handleDividerMouseDown}
        />
        <div className="pane pane-preview" style={{ width: `${100 - leftWidth}%` }}>
          <div className="pane-label">Preview</div>
          <div
            ref={previewRef}
            className={`preview ${CONTENT_CLASS}`}
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
          />
        </div>
      </div>
      )}

      {/* Styles panel */}
      <ProseConfigPanel
        open={panelOpen}
        config={prose}
        onChange={handleProseChange}
        onClose={() => setPanelOpen(false)}
      />

      {/* Sheets panel */}
      <SheetsPanel
        open={sheetsOpen}
        onClose={() => setSheetsOpen(false)}
      />
    </div>
  )
}
