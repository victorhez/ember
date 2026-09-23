import { useMemo } from 'react'
import { motion } from 'motion/react'
import { useStore } from '../state/store'
import { confidenceLabel, findPaybackLinks, historyStats, MIN_DAYS_TO_LEARN } from '../model/learn'
import { formatSpoons } from '../model/activities'
import { HistoryChart } from './HistoryChart'

const LAG_LABELS = ['24h', '48h', '72h']

export function Pattern() {
  const { state, pattern, dispatch } = useStore()
  const { history, settings } = state
  const links = useMemo(() => findPaybackLinks(history, settings.baseline), [history, settings.baseline])
  const stats = useMemo(() => historyStats(history, settings.baseline), [history, settings.baseline])
  const learning = pattern.daysUsed < MIN_DAYS_TO_LEARN

  const cards = [
    {
      label: 'Payback lands',
      value: `~${pattern.peakLagDays} ${pattern.peakLagDays === 1 ? 'day' : 'days'}`,
      sub: 'after an over-budget day',
      extra: (
        <div className="lag-bars" aria-label="Share of payback by delay">
          {pattern.weights.map((w, i) => (
            <div key={i} className="lag-bar">
              <motion.span
                className={`lag-fill ${i + 1 === pattern.peakLagDays ? 'is-peak' : ''}`}
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(6, w * 100)}%` }}
                transition={{ delay: 0.2 + i * 0.08, type: 'spring', stiffness: 90, damping: 16 }}
              />
              <span className="lag-label">{LAG_LABELS[i]}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      label: 'Payback ratio',
      value: `${pattern.ratio.toFixed(1)}×`,
      sub: `Every spoon over costs about ${pattern.ratio.toFixed(1)} later`,
    },
    {
      label: 'Inside your envelope',
      value: history.length ? `${stats.withinPct}%` : '—',
      sub: history.length ? `of the last ${history.length} days` : 'No days logged yet',
    },
    {
      label: 'Crash days',
      value: history.length ? String(stats.crashes) : '—',
      sub: history.length ? `${links.length} traced back to an over-budget day` : 'Nothing to trace yet',
    },
  ]

  return (
    <div className="pattern">
      <section className="pattern-intro">
        <p className="eyebrow">
          Your body’s pattern <span className={`badge ${learning ? '' : 'badge-calm'}`}>{confidenceLabel(pattern)}</span>
        </p>
        <h1 className="display-lg">
          {learning ? (
            <>Ember is still getting to know you.</>
          ) : (
            <>
              Your crashes arrive <em>{pattern.peakLagDays === 1 ? 'the next day' : `${pattern.peakLagDays} days later`}</em>.
            </>
          )}
        </h1>
        <p className="lede">
          {learning
            ? `Until there are ${MIN_DAYS_TO_LEARN} days in your log, the forecast uses research-based defaults: most payback lands 24–48 hours after overexertion. Every day you plan here sharpens it.`
            : `Learned from ${pattern.daysUsed} logged days. Each spoon you spend past your envelope comes back as roughly ${pattern.ratio.toFixed(1)} fewer spoons later — mostly ${pattern.peakLagDays * 24} hours on. The forecast on Today uses exactly this.`}
        </p>
      </section>

      <section className="stat-grid" aria-label="Learned pattern">
        {cards.map((c, i) => (
          <motion.article
            key={c.label}
            className="card stat"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="stat-label">{c.label}</p>
            <p className="stat-value">{c.value}</p>
            <p className="stat-sub">{c.sub}</p>
            {c.extra}
          </motion.article>
        ))}
      </section>

      <section className="card history" aria-labelledby="history-title">
        <div className="card-head">
          <div>
            <p className="eyebrow">History</p>
            <h2 id="history-title" className="card-title">Every boom, and the bust that followed</h2>
          </div>
          <div className="legend">
            <span><i className="legend-swatch legend-spent" /> Spent</span>
            <span><i className="legend-swatch legend-over" /> Over envelope</span>
            <span><i className="legend-swatch legend-env" /> Envelope</span>
            <span><i className="legend-swatch legend-arc" /> Payback</span>
          </div>
        </div>
        {history.length > 0 ? (
          <HistoryChart history={history} links={links} baseline={settings.baseline} />
        ) : (
          <div className="history-empty">
            <p>
              No days logged yet. Each evening, today’s plan and check-in become part of your history automatically.
            </p>
            <button className="btn btn-ghost" onClick={() => dispatch({ type: 'loadSample' })}>
              Load 21 days of sample history
            </button>
          </div>
        )}
      </section>

      <section className="how" aria-labelledby="how-title">
        <h2 id="how-title" className="card-title">How Ember learns</h2>
        <ol className="how-steps">
          <li>
            <span className="how-num">1</span>
            <div>
              <strong>It measures the dip.</strong> Each morning’s check-in shows how far below your usual{' '}
              {formatSpoons(settings.baseline)} spoons you woke up.
            </div>
          </li>
          <li>
            <span className="how-num">2</span>
            <div>
              <strong>It looks back.</strong> It compares each dip with how far over budget you went one, two and three days
              earlier.
            </div>
          </li>
          <li>
            <span className="how-num">3</span>
            <div>
              <strong>It finds your lag.</strong> A small least-squares fit finds which delay explains your dips best, and how
              big the bill is. No cloud, no black box — it runs on this device.
            </div>
          </li>
        </ol>
      </section>
    </div>
  )
}
