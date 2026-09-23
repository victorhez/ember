import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, Lock, Minus, Plus, Sparkles, TrendingDown, Waves } from 'lucide-react'
import { useStore } from '../state/store'
import { EmberOrb } from './EmberOrb'
import { Wordmark } from './Logo'

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] as const },
})

export function Welcome() {
  const { dispatch } = useStore()
  const [fresh, setFresh] = useState(false)
  const [baseline, setBaseline] = useState(12)

  return (
    <div className="welcome">
      <motion.header className="welcome-top" {...rise(0)}>
        <Wordmark />
      </motion.header>

      <section className="welcome-hero">
        <motion.div className="welcome-orb" {...rise(0.1)}>
          <EmberOrb glow={0.9} size={220} />
        </motion.div>

        <motion.p className="eyebrow" {...rise(0.2)}>
          A pacing planner for energy-limiting illness
        </motion.p>
        <motion.h1 className="welcome-title" {...rise(0.3)}>
          See tomorrow’s crash <em>before</em> you spend today.
        </motion.h1>
        <motion.p className="welcome-lede" {...rise(0.4)}>
          With ME/CFS and Long COVID, overdoing it doesn’t hurt today — it lands one to three days later. Ember
          projects your plan onto the days ahead, learns your personal crash lag, and helps you pace before your body
          sends the bill.
        </motion.p>

        <motion.div className="welcome-actions" {...rise(0.5)}>
          <AnimatePresence mode="wait" initial={false}>
            {!fresh ? (
              <motion.div
                key="choose"
                className="welcome-buttons"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <button className="btn btn-primary btn-lg" onClick={() => dispatch({ type: 'start', sample: true, baseline: 12 })}>
                  Explore with sample history <ArrowRight size={18} />
                </button>
                <button className="btn btn-ghost btn-lg" onClick={() => setFresh(true)}>
                  Start fresh
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="fresh"
                className="welcome-fresh"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <label className="welcome-fresh-label" id="baseline-label">
                  On a good day, how many spoons do you usually have?
                </label>
                <div className="stepper stepper-lg" role="group" aria-labelledby="baseline-label">
                  <button className="icon-btn" aria-label="Fewer spoons" onClick={() => setBaseline((b) => Math.max(4, b - 1))}>
                    <Minus size={18} />
                  </button>
                  <output className="stepper-value" aria-live="polite">
                    {baseline} <small>spoons</small>
                  </output>
                  <button className="icon-btn" aria-label="More spoons" onClick={() => setBaseline((b) => Math.min(30, b + 1))}>
                    <Plus size={18} />
                  </button>
                </div>
                <p className="hint">Not sure? 12 is a common starting point. You can change it any time.</p>
                <div className="welcome-buttons">
                  <button className="btn btn-primary btn-lg" onClick={() => dispatch({ type: 'start', sample: false, baseline })}>
                    Begin <ArrowRight size={18} />
                  </button>
                  <button className="btn btn-ghost btn-lg" onClick={() => setFresh(false)}>
                    Back
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </section>

      <motion.ul className="welcome-features" {...rise(0.65)}>
        <li>
          <TrendingDown size={18} />
          <div>
            <strong>Forecast, not diary</strong>
            <span>Watch the next three days respond as you plan today.</span>
          </div>
        </li>
        <li>
          <Waves size={18} />
          <div>
            <strong>Learns your lag</strong>
            <span>Finds when your crashes land and how hard they hit.</span>
          </div>
        </li>
        <li>
          <Sparkles size={18} />
          <div>
            <strong>Gentle swaps</strong>
            <span>Concrete changes that keep the days ahead lit.</span>
          </div>
        </li>
        <li>
          <Lock size={18} />
          <div>
            <strong>Private by design</strong>
            <span>No account. Your data never leaves this device.</span>
          </div>
        </li>
      </motion.ul>
    </div>
  )
}
