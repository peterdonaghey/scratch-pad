import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  linkPlugin,
  linkDialogPlugin,
  imagePlugin,
  tablePlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  CodeToggle,
  ListsToggle,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  ConditionalContents,
  BlockTypeSelect,
  Separator,
  type MDXEditorMethods,
} from "@mdxeditor/editor"
import "@mdxeditor/editor/style.css"

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
  const editorRef = useRef<MDXEditorMethods>(null)

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

  // Debounced auto-save — uses sheetName from state
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

  // Handle editor content change
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

  // Generate the dynamic style tag content
  const styleCss = useMemo(() => proseConfigToCss(prose), [prose])

  // Export markdown
  const handleExport = useCallback(() => {
    const blob = new Blob([markdown], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "scratch-pad.md"
    a.click()
    URL.revokeObjectURL(url)
  }, [markdown])

  // Copy scratch pad URL to clipboard
  const handleCopyUrl = useCallback(() => {
    const url = buildScratchPadUrl(markdown, sheetName ?? undefined)
    navigator.clipboard.writeText(url).catch(() => {
      // fallback for older browsers
    })
  }, [markdown, sheetName])

  // Clear
  const handleClear = useCallback(() => {
    if (window.confirm("Clear the editor? This discards current content.")) {
      editorRef.current?.setMarkdown(WELCOME_MARKDOWN)
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
          {loadedFromUrl && <span className="badge badge-chat">Loaded from chat</span>}
        </div>
        <div className="topbar-right">
          <button className="btn btn-text" onClick={handleCopyUrl}>
            Copy URL
          </button>
          <button className="btn btn-text" onClick={() => setPanelOpen(true)}>
            Styles
          </button>
          <button className="btn btn-text" onClick={handleExport}>
            Export .md
          </button>
          <button className="btn btn-text btn-danger" onClick={handleClear}>
            Clear
          </button>
        </div>
      </header>

      {/* Editor */}
      <div className="editor-wrapper">
        <MDXEditor
          ref={editorRef}
          markdown={markdown}
          onChange={handleChange}
          contentEditableClassName={CONTENT_CLASS}
          plugins={[
            toolbarPlugin({
              toolbarContents: () => (
                <>
                  <UndoRedo />
                  <Separator />
                  <BlockTypeSelect />
                  <Separator />
                  <BoldItalicUnderlineToggles />
                  <Separator />
                  <CodeToggle />
                  <ListsToggle />
                  <Separator />
                  <ConditionalContents
                    options={[
                      {
                        when: (editor) => editor?.editorType === "codeblock",
                        contents: () => null,
                      },
                      {
                        fallback: () => (
                          <>
                            <InsertImage />
                            <InsertTable />
                            <InsertThematicBreak />
                          </>
                        ),
                      },
                    ]}
                  />
                </>
              ),
            }),
            headingsPlugin({ allowedHeadingLevels: [1, 2, 3, 4, 5, 6] }),
            listsPlugin(),
            quotePlugin(),
            linkPlugin(),
            linkDialogPlugin(),
            imagePlugin(),
            tablePlugin(),
            codeBlockPlugin({ defaultCodeBlockLanguage: "txt" }),
            codeMirrorPlugin({
              codeBlockLanguages: {
                sql: "SQL",
                python: "Python",
                js: "JavaScript",
                ts: "TypeScript",
                tsx: "TSX",
                css: "CSS",
                html: "HTML",
                json: "JSON",
                yaml: "YAML",
                bash: "Bash",
                txt: "Text",
                md: "Markdown",
              },
            }),
            thematicBreakPlugin(),
            markdownShortcutPlugin(),
          ]}
        />
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
