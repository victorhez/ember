import { AnimatePresence, motion } from 'motion/react'
import { useStore } from '../state/store'
import { CHECK_IN_LEVELS, COMFORT_ZONE, envelopeFromCheckIn } from '../model/forecast'
import { formatSpoons, round1 } from '../model/activities'
import { EmberOrb } from './EmberOrb'
import { AnimatedNumber } from './AnimatedNumber'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export function EnergyHero() {
  const { state, dispatch, envelope, spent } = useStore()
  const { checkIn } = state.today
  const baseline = state.settings.baseline
  const left = round1(envelope - spent)
  const over = left < 0
  const used = envelope > 0 ? spent / envelope : 0
  const level = CHECK_IN_LEVELS.find((l) => l.level === checkIn)
  const nearing = !over && used > COMFORT_ZONE

  return (
    <section className="card hero" aria-labelledby="hero-title">
      <AnimatePresence mode="wait" initial={false}>
        {checkIn == null ? (
          <motion.div
            key="checkin"
            className="checkin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <p className="eyebrow">{greeting()}</p>
            <h2 id="hero-title" className="display-md">How’s your body today?</h2>
            <p className="muted">A ten-second check-in sets today’s envelope.</p>
            <div className="checkin-grid" role="list">
              {CHECK_IN_LEVELS.map((l) => (
                <button
                  key={l.level}
                  role="listitem"
                  className="checkin-option"
                  onClick={() => dispatch({ type: 'checkIn', level: l.level })}
                >
                  <EmberOrb glow={l.factor * 0.95} size={44} />
                  <span className="checkin-label">{l.label}</span>
                  <span className="checkin-hint">{l.hint}</span>
                  <span className="checkin-spoons">{formatSpoons(envelopeFromCheckIn(l.level, baseline))} spoons</span>
                </button>
              ))}
            </div>
            <p className="hint">
              Until you check in, Ember plans with today’s forecast: <strong>{formatSpoons(envelope)} spoons</strong>.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="energy"
            className="energy"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <EmberOrb
              glow={envelope > 0 ? Math.max(0, left) / envelope : 0}
              size={188}
              ring={{ used, comfort: COMFORT_ZONE }}
              tone={over ? 'risk' : 'ember'}
              label={`${formatSpoons(Math.abs(left))} spoons ${over ? 'over' : 'left'} of ${formatSpoons(envelope)}`}
            />
            <div className="energy-stats">
              <p className="eyebrow">
                Today · {level?.label}
                <button className="link-btn" onClick={() => dispatch({ type: 'checkIn', level: null })}>
                  Change
                </button>
              </p>
              <h2 id="hero-title" className="energy-number">
                <AnimatedNumber value={Math.abs(left)} className={over ? 'text-risk' : ''} />
                <span className="energy-unit">{over ? 'spoons over' : 'spoons left'}</span>
              </h2>
              <div className="energy-meta">
                <span>
                  <strong>{formatSpoons(spent)}</strong> planned
                </span>
                <span className="dot" aria-hidden>·</span>
                <span>
                  <strong>{formatSpoons(envelope)}</strong> envelope
                </span>
              </div>
              <p className={`energy-note ${over ? 'is-risk' : nearing ? 'is-tight' : ''}`}>
                {over
                  ? 'Today will feel fine. The next few days won’t — see the forecast.'
                  : nearing
                    ? 'Past the 80% comfort line. Pacing works best with a little in reserve.'
                    : spent === 0
                      ? 'Add today’s plan below and watch the days ahead respond.'
                      : 'Inside your comfort zone. Nice pacing.'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
