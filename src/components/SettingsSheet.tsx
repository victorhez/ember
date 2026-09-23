import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Database, Info, Minus, Plus, Trash2, X } from 'lucide-react'
import { useStore, type ThemeChoice } from '../state/store'

const THEMES: { id: ThemeChoice; label: string }[] = [
  { id: 'system', label: 'System' },
  { id: 'night', label: 'Night' },
  { id: 'day', label: 'Daylight' },
]

export function SettingsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, dispatch } = useStore()
  const [confirming, setConfirming] = useState(false)
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) {
      setConfirming(false)
      return
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    panel.current?.focus()
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const baseline = state.settings.baseline

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="scrim" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.div
            ref={panel}
            className="sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
            tabIndex={-1}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 36 }}
          >
            <div className="sheet-head">
              <h2 id="settings-title" className="card-title">Settings</h2>
              <button className="icon-btn" aria-label="Close settings" onClick={onClose}>
                <X size={18} />
              </button>
            </div>

            <div className="sheet-section">
              <p className="sheet-label" id="set-baseline">Usual good-day budget</p>
              <p className="hint">How many spoons you have on a genuinely good day. Everything else scales from this.</p>
              <div className="stepper stepper-lg" role="group" aria-labelledby="set-baseline">
                <button className="icon-btn" aria-label="Fewer spoons" onClick={() => dispatch({ type: 'baseline', value: Math.max(4, baseline - 1) })}>
                  <Minus size={18} />
                </button>
                <output className="stepper-value">
                  {baseline} <small>spoons</small>
                </output>
                <button className="icon-btn" aria-label="More spoons" onClick={() => dispatch({ type: 'baseline', value: Math.min(30, baseline + 1) })}>
                  <Plus size={18} />
                </button>
              </div>
            </div>

            <div className="sheet-section">
              <p className="sheet-label">Theme</p>
              <div className="segmented" role="radiogroup" aria-label="Theme">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    role="radio"
                    aria-checked={state.settings.theme === t.id}
                    className={state.settings.theme === t.id ? 'is-active' : ''}
                    onClick={() => dispatch({ type: 'theme', value: t.id })}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="sheet-section">
              <p className="sheet-label">Data</p>
              <button className="sheet-row" onClick={() => dispatch({ type: 'loadSample' })}>
                <Database size={17} />
                <span>
                  <strong>Load sample history</strong>
                  <small>Replaces history with 21 labelled sample days.</small>
                </span>
              </button>
              {!confirming ? (
                <button className="sheet-row sheet-row-danger" onClick={() => setConfirming(true)}>
                  <Trash2 size={17} />
                  <span>
                    <strong>Clear everything</strong>
                    <small>Removes your plan, history and settings from this device.</small>
                  </span>
                </button>
              ) : (
                <div className="confirm">
                  <p>Delete all Ember data on this device? This can’t be undone.</p>
                  <div className="confirm-actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => setConfirming(false)}>
                      Keep it
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => {
                        dispatch({ type: 'reset' })
                        onClose()
                      }}
                    >
                      Delete everything
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="sheet-section sheet-about">
              <p className="sheet-label">
                <Info size={15} /> About Ember
              </p>
              <p>
                Ember is a planning aid for people pacing an energy-limiting illness. Its forecast is a simple, transparent model
                learned from your own log — not a diagnosis, and not a substitute for advice from your clinician.
              </p>
              <p>
                Spoons are the community’s unit of energy, from Christine Miserandino’s{' '}
                <a href="https://butyoudontlooksick.com/articles/written-by-christine/the-spoon-theory/" target="_blank" rel="noreferrer">
                  Spoon Theory
                </a>
                . Everything you enter stays in this browser.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
