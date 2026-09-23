import { motion } from 'motion/react'
import { Moon, Settings2, Sun } from 'lucide-react'
import { useStore } from '../state/store'
import { longDate } from '../model/dates'
import { Wordmark } from './Logo'
import { useResolvedTheme } from './useTheme'

export type View = 'today' | 'pattern'

const TABS: { id: View; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'pattern', label: 'Pattern' },
]

export function Header({ view, onView, onSettings }: { view: View; onView: (v: View) => void; onSettings: () => void }) {
  const { state, dispatch } = useStore()
  const theme = useResolvedTheme(state.settings.theme)

  return (
    <header className="header">
      <div className="header-left">
        <Wordmark />
        <span className="header-date">{longDate(state.today.date)}</span>
      </div>

      <nav className="tabs" aria-label="Main">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab ${view === t.id ? 'is-active' : ''}`}
            aria-current={view === t.id ? 'page' : undefined}
            onClick={() => onView(t.id)}
          >
            {view === t.id && <motion.span layoutId="tab-pill" className="tab-pill" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
            <span className="tab-label">{t.label}</span>
          </button>
        ))}
      </nav>

      <div className="header-right">
        {state.sample && <span className="badge badge-sample">Sample data</span>}
        <button
          className="icon-btn"
          aria-label={theme === 'night' ? 'Switch to daylight theme' : 'Switch to night theme'}
          onClick={() => dispatch({ type: 'theme', value: theme === 'night' ? 'day' : 'night' })}
        >
          {theme === 'night' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button className="icon-btn" aria-label="Settings" onClick={onSettings}>
          <Settings2 size={18} />
        </button>
      </div>
    </header>
  )
}
