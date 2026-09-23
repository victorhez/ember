import { AnimatePresence, motion } from 'motion/react'
import { CalendarArrowUp, Feather, Leaf, SplitSquareHorizontal } from 'lucide-react'
import { useStore } from '../state/store'
import type { Swap } from '../model/swaps'
import type { DayProjection } from '../model/types'
import { formatSpoons } from '../model/activities'
import { weekday } from '../model/dates'

const ICON = {
  lighter: Feather,
  split: SplitSquareHorizontal,
  move: CalendarArrowUp,
}

export function Swaps({ swaps, days }: { swaps: Swap[]; days: DayProjection[] }) {
  const { dispatch, envelope, spent, state } = useStore()
  const over = spent > envelope

  function apply(s: Swap) {
    if (s.kind === 'move' && s.moved) {
      // Send it to the roomiest day ahead once today's payback is gone.
      const target = days
        .slice(1)
        .map((d) => ({ date: d.date, room: d.envelope + d.owedFromToday }))
        .sort((a, b) => b.room - a.room || b.date.localeCompare(a.date))[0]
      dispatch({ type: 'setPlan', plan: s.plan, moved: { ...s.moved, toDate: target.date } })
    } else {
      dispatch({ type: 'setPlan', plan: s.plan })
    }
  }

  return (
    <section className="card swaps" aria-labelledby="swaps-title">
      <div className="card-head">
        <div>
          <p className="eyebrow">Swaps</p>
          <h2 id="swaps-title" className="card-title">{over ? 'Ways to keep the days ahead lit' : 'Nothing to fix'}</h2>
        </div>
      </div>

      <AnimatePresence mode="popLayout" initial={false}>
        {over && swaps.length > 0 ? (
          <motion.ul key="list" className="swap-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {swaps.map((s, i) => {
              const Icon = ICON[s.kind]
              return (
                <motion.li
                  key={s.id}
                  layout
                  className="swap"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                >
                  <span className={`swap-icon swap-icon-${s.kind}`} aria-hidden>
                    <Icon size={18} />
                  </span>
                  <div className="swap-text">
                    <p className="swap-title">{s.title}</p>
                    <p className="swap-detail">{s.detail}</p>
                  </div>
                  <span className="swap-gain" title="Improvement to the hardest day ahead">
                    +{formatSpoons(s.gain)} {weekday(s.gainDate)}
                  </span>
                  <button className="btn btn-soft btn-sm" onClick={() => apply(s)}>
                    Apply
                  </button>
                </motion.li>
              )
            })}
          </motion.ul>
        ) : (
          <motion.div key="calm" className="swaps-calm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Leaf size={20} aria-hidden />
            <p>
              {state.today.plan.length === 0
                ? 'When a plan goes over your envelope, Ember suggests lighter versions, rests and moves here.'
                : 'Your plan fits inside today’s envelope. The days ahead stay as they are.'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
