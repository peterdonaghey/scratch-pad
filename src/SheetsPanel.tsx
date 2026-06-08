import { useEffect, useState } from "react"
import { listSavedSheets, deleteSheet } from "./storage"
import type { SheetInfo } from "./storage"

interface Props {
  open: boolean
  onClose: () => void
}

export function SheetsPanel({ open, onClose }: Props) {
  const [sheets, setSheets] = useState<SheetInfo[]>([])

  // Refresh the list every time the panel opens
  useEffect(() => {
    if (open) setSheets(listSavedSheets())
  }, [open])

  if (!open) return null

  const handleOpen = (name: string | null) => {
    window.location.href = name ? `/${encodeURIComponent(name)}` : "/"
  }

  const handleDelete = (name: string | null) => {
    const label = name ?? "Untitled"
    if (!window.confirm(`Delete "${label}"? This cannot be undone.`)) return
    deleteSheet(name ?? undefined)
    setSheets(listSavedSheets())
  }

  const formatDate = (ts: number | null): string => {
    if (!ts) return ""
    const d = new Date(ts)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    if (diffMin < 1) return "just now"
    if (diffMin < 60) return `${diffMin}m ago`
    const diffHrs = Math.floor(diffMin / 60)
    if (diffHrs < 24) return `${diffHrs}h ago`
    return d.toLocaleDateString()
  }

  return (
    <div className="panel-overlay" onClick={onClose}>
      <div className="panel" onClick={(e) => e.stopPropagation()}>
        <div className="panel-header">
          <h2>My Sheets</h2>
          <button className="panel-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="panel-body sheets-body">
          {sheets.length === 0 && (
            <p className="sheets-empty">
              No saved sheets yet. Type some markdown and it will auto-save, or use{" "}
              <strong>💾 Save</strong> to name a sheet.
            </p>
          )}

          {sheets.map((sheet) => (
            <div className="sheet-card" key={sheet.name ?? "__unnamed__"}>
              <div className="sheet-card-body">
                <div className="sheet-card-title">{sheet.title}</div>
                {sheet.name !== null && sheet.title !== sheet.name && (
                  <div className="sheet-card-name">{sheet.name}</div>
                )}
                <div className="sheet-card-snippet">{sheet.snippet}</div>
                <div className="sheet-card-meta">
                  {sheet.savedAt ? formatDate(sheet.savedAt) : "Unsaved"}
                </div>
              </div>
              <div className="sheet-card-actions">
                <button
                  className="btn btn-sm"
                  onClick={() => handleOpen(sheet.name)}
                  title="Open sheet"
                >
                  Open
                </button>
                <button
                  className="btn btn-sm btn-danger-soft"
                  onClick={() => handleDelete(sheet.name)}
                  title="Delete sheet"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
