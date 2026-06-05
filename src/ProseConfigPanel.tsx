import type { ProseConfig } from "./types"
import { DEFAULT_PROSE, FONT_FAMILIES, MONO_FONTS } from "./types"

interface Props {
  open: boolean
  config: ProseConfig
  onChange: (config: ProseConfig) => void
  onClose: () => void
}

export function ProseConfigPanel({ open, config, onChange, onClose }: Props) {
  if (!open) return null

  const set = (partial: Partial<ProseConfig>) => onChange({ ...config, ...partial })

  return (
    <div className="panel-overlay" onClick={onClose}>
      <div className="panel" onClick={(e) => e.stopPropagation()}>
        <div className="panel-header">
          <h2>Style Settings</h2>
          <button className="panel-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="panel-body">
          <label className="field">
            <span>Font</span>
            <select
              value={config.fontFamily}
              onChange={(e) => set({ fontFamily: e.target.value })}
            >
              {FONT_FAMILIES.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Mono font</span>
            <select
              value={config.monoFont}
              onChange={(e) => set({ monoFont: e.target.value })}
            >
              {MONO_FONTS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Font size: {config.fontSize}px</span>
            <input
              type="range"
              min={10}
              max={28}
              step={1}
              value={config.fontSize}
              onChange={(e) => set({ fontSize: Number(e.target.value) })}
            />
          </label>

          <label className="field">
            <span>Line height: {config.lineHeight.toFixed(1)}</span>
            <input
              type="range"
              min={1.0}
              max={2.5}
              step={0.1}
              value={config.lineHeight}
              onChange={(e) => set({ lineHeight: Number(e.target.value) })}
            />
          </label>

          <div className="field-group">
            <span>Colors</span>
            <div className="color-grid">
              <ColorField
                label="Text"
                value={config.textColor}
                onChange={(v) => set({ textColor: v })}
              />
              <ColorField
                label="Background"
                value={config.backgroundColor}
                onChange={(v) => set({ backgroundColor: v })}
              />
              <ColorField
                label="Headings"
                value={config.headingColor}
                onChange={(v) => set({ headingColor: v })}
              />
              <ColorField
                label="Links"
                value={config.linkColor}
                onChange={(v) => set({ linkColor: v })}
              />
              <ColorField
                label="Code BG"
                value={config.codeBg}
                onChange={(v) => set({ codeBg: v })}
              />
            </div>
          </div>

          <button
            className="reset-btn"
            onClick={() => onChange({ ...DEFAULT_PROSE })}
          >
            Reset to defaults
          </button>
        </div>
      </div>
    </div>
  )
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="color-field">
      <span>{label}</span>
      <div className="color-input-wrap">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="color-hex"
        />
      </div>
    </div>
  )
}
