import { useMemo, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { CornerDownLeft, Minus, Plus, Search, Undo2, X } from 'lucide-react'
import { useStore } from '../state/store'
import { ACTIVITIES, KIND_LABEL, KIND_ORDER, formatMinutes, formatSpoons, planItemFrom, withMinutes } from '../model/activities'
import { parseQuickAdd } from '../model/quickAdd'
import { weekday } from '../model/dates'
import type { Kind, PlanItem } from '../model/types'

const EXAMPLES = ['shower, 1h zoom call, cook dinner', 'groceries and a nap', 'doctor appointment, bus, rest']

export function PlanBuilder() {
  const { state, dispatch } = useStore()
  const { plan, moved } = state.today

  return (
    <section className="card plan" aria-labelledby="plan-title">
      <div className="card-head">
        <div>
          <p className="eyebrow">Plan</p>
          <h2 id="plan-title" className="card-title">What’s on today?</h2>
        </div>
        {plan.length > 0 && (
          <button className="link-btn" onClick={() => dispatch({ type: 'clearPlan' })}>
            Clear
          </button>
        )}
      </div>

      <QuickAdd />

      <ul className="plan-list" aria-live="polite">
        <AnimatePresence initial={false}>
          {plan.map((item) => (
            <PlanRow key={item.id} item={item} />
          ))}
        </AnimatePresence>
      </ul>

      {plan.length === 0 && (
        <div className="plan-empty">
          <p>Nothing planned yet. Type your day in plain words, or try one of these:</p>
          <div className="chip-row">
            {EXAMPLES.map((e) => (
              <button key={e} className="chip chip-example" onClick={() => dispatch({ type: 'add', items: parseQuickAdd(e) })}>
                {e}
              </button>
            ))}
          </div>
        </div>
      )}

      {moved.length > 0 && (
        <div className="moved">
          <p className="eyebrow">Moved to another day</p>
          <ul>
            {moved.map((m) => (
              <li key={m.id} className="moved-row">
                <span className={`kind-dot kind-${m.kind}`} aria-hidden />
                <span className="moved-name">{m.name}</span>
                <span className="moved-day">{weekday(m.toDate, 'long')}</span>
                <button className="link-btn" onClick={() => dispatch({ type: 'restoreMoved', id: m.id })}>
                  <Undo2 size={14} /> Bring back
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Library />
    </section>
  )
}

function QuickAdd() {
  const { dispatch } = useStore()
  const [text, setText] = useState('')
  const [flash, setFlash] = useState<string | null>(null)

  function submit(e: FormEvent) {
    e.preventDefault()
    const items = parseQuickAdd(text)
    if (items.length === 0) return
    dispatch({ type: 'add', items })
    setFlash(`Added ${items.length} ${items.length === 1 ? 'activity' : 'activities'}`)
    setText('')
    window.setTimeout(() => setFlash(null), 1800)
  }

  return (
    <form className="quickadd" onSubmit={submit}>
      <label htmlFor="quickadd" className="sr-only">
        Describe your day
      </label>
      <input
        id="quickadd"
        className="quickadd-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your day — “shower, groceries, 2h zoom call…”"
        autoComplete="off"
        enterKeyHint="done"
      />
      <button className="quickadd-btn" type="submit" aria-label="Add to plan" disabled={!text.trim()}>
        <CornerDownLeft size={18} />
      </button>
      <AnimatePresence>
        {flash && (
          <motion.span
            className="quickadd-flash"
            role="status"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {flash}
          </motion.span>
        )}
      </AnimatePresence>
    </form>
  )
}

function PlanRow({ item }: { item: PlanItem }) {
  const { dispatch } = useStore()
  const rest = item.cost < 0
  const step = item.minutes != null && item.minutes <= 30 ? 5 : 15

  return (
    <motion.li
      layout
      className={`plan-row ${rest ? 'is-rest' : ''}`}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="plan-row-inner">
        <span className={`kind-dot kind-${item.kind}`} aria-hidden />
        <div className="plan-row-main">
          <span className="plan-row-name">{item.name}</span>
          <span className="plan-row-kind">{KIND_LABEL[item.kind]}</span>
        </div>
        {item.minutes != null && (
          <div className="stepper" role="group" aria-label={`${item.name} duration`}>
            <button
              className="icon-btn icon-btn-sm"
              aria-label="Shorter"
              disabled={item.minutes <= 5}
              onClick={() => dispatch({ type: 'update', item: withMinutes(item, Math.max(5, item.minutes! - step)) })}
            >
              <Minus size={14} />
            </button>
            <span className="stepper-text">{formatMinutes(item.minutes)}</span>
            <button
              className="icon-btn icon-btn-sm"
              aria-label="Longer"
              onClick={() => dispatch({ type: 'update', item: withMinutes(item, Math.min(480, item.minutes! + step)) })}
            >
              <Plus size={14} />
            </button>
          </div>
        )}
        <span className={`cost ${rest ? 'cost-rest' : ''}`} aria-label={`${rest ? 'gives back' : 'costs'} ${formatSpoons(item.cost)} spoons`}>
          {rest ? '+' : '−'}
          {formatSpoons(item.cost)}
        </span>
        <button className="icon-btn icon-btn-sm icon-btn-quiet" aria-label={`Remove ${item.name}`} onClick={() => dispatch({ type: 'remove', id: item.id })}>
          <X size={15} />
        </button>
      </div>
    </motion.li>
  )
}

function Library() {
  const { dispatch } = useStore()
  const [kind, setKind] = useState<Kind | 'all'>('all')
  const [query, setQuery] = useState('')

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return ACTIVITIES.filter(
      (a) =>
        (kind === 'all' || a.kind === kind) &&
        (!q || a.name.toLowerCase().includes(q) || a.keywords.some((k) => k.includes(q))),
    )
  }, [kind, query])

  return (
    <div className="library">
      <div className="library-head">
        <p className="eyebrow">Library</p>
        <div className="library-search">
          <Search size={15} aria-hidden />
          <label htmlFor="lib-search" className="sr-only">
            Search activities
          </label>
          <input id="lib-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" autoComplete="off" />
        </div>
      </div>
      <div className="kind-tabs" role="tablist" aria-label="Activity kinds">
        {(['all', ...KIND_ORDER] as const).map((k) => (
          <button key={k} role="tab" aria-selected={kind === k} className={`kind-tab ${kind === k ? 'is-active' : ''}`} onClick={() => setKind(k)}>
            {k !== 'all' && <span className={`kind-dot kind-${k}`} aria-hidden />}
            {k === 'all' ? 'All' : KIND_LABEL[k]}
          </button>
        ))}
      </div>
      <div className="library-grid">
        {list.map((a) => (
          <button key={a.id} className={`lib-item ${a.cost < 0 ? 'is-rest' : ''}`} onClick={() => dispatch({ type: 'add', items: [planItemFrom(a)] })}>
            <span className="lib-name">{a.name}</span>
            <span className="lib-meta">
              {a.minutes ? `${formatMinutes(a.minutes)} · ` : ''}
              <span className={a.cost < 0 ? 'text-rest' : ''}>
                {a.cost < 0 ? '+' : ''}
                {formatSpoons(a.cost)}
              </span>
            </span>
            <Plus size={14} className="lib-plus" aria-hidden />
          </button>
        ))}
        {list.length === 0 && <p className="muted">No match. Quick add turns anything into a custom activity.</p>}
      </div>
    </div>
  )
}
