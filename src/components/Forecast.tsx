import { motion } from 'motion/react'
import { ArrowUpRight, CloudRain, Flame, Sunrise } from 'lucide-react'
import { useStore } from '../state/store'
import { CRASH_LINE, type Explanation } from '../model/forecast'
import { formatSpoons } from '../model/activities'
import { shortDate, weekday } from '../model/dates'
import { confidenceLabel } from '../model/learn'
import type { DayProjection, DayStatus } from '../model/types'
import { EmberOrb } from './EmberOrb'
import { AnimatedNumber } from './AnimatedNumber'
import { WaveChart } from './WaveChart'

export const STATUS_LABEL: Record<DayStatus, string> = {
  comfortable: 'Comfortable',
  tight: 'Tight',
  crash: 'Crash likely',
}

const LAG_TEXT = { 1: '~1 day later', 2: '~2 days later', 3: '~3 days later' } as const

export function Forecast({ days, explanation, onOpenPattern }: { days: DayProjection[]; explanation: Explanation; onOpenPattern: () => void }) {
  const { state, pattern, spent } = useStore()
  const baseline = state.settings.baseline

  return (
    <section className="card forecast" aria-labelledby="forecast-title">
      <div className="card-head">
        <div>
          <p className="eyebrow">Payback forecast</p>
          <h2 id="forecast-title" className="card-title">How the next three days respond</h2>
        </div>
        <button className="pattern-chip" onClick={onOpenPattern}>
          <span className="pattern-chip-dot" aria-hidden />
          <span className="pattern-chip-main">Payback lands {LAG_TEXT[pattern.peakLagDays]}</span>
          <ArrowUpRight size={14} className="pattern-chip-arrow" />
          <span className="pattern-chip-sub">{confidenceLabel(pattern)}</span>
        </button>
      </div>

      <div className="daycards">
        {days.map((d) => (
          <DayCard key={d.date} day={d} baseline={baseline} spent={spent} moved={state.today.moved.filter((m) => m.toDate === d.date)} />
        ))}
      </div>

      <WaveChart days={days} baseline={baseline} crashLine={baseline * CRASH_LINE} />

      <motion.div
        key={explanation.headline}
        className={`callout callout-${explanation.tone}`}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        role="status"
      >
        <span className="callout-icon" aria-hidden>
          {explanation.tone === 'warn' ? <CloudRain size={20} /> : explanation.tone === 'watch' ? <Flame size={20} /> : <Sunrise size={20} />}
        </span>
        <div>
          <p className="callout-title">{explanation.headline}</p>
          <p className="callout-body">{explanation.detail}</p>
        </div>
      </motion.div>
    </section>
  )
}

function DayCard({ day, baseline, spent, moved }: { day: DayProjection; baseline: number; spent: number; moved: { id: string; name: string; cost: number }[] }) {
  const isToday = day.offset === 0
  const share = day.envelope / baseline
  // Today's ember shows what's left after the plan; future embers show the forecast envelope.
  const glow = isToday
    ? Math.max(0, Math.min(1, (day.envelope - spent) / day.envelope))
    : Math.max(0, Math.min(1, (share - 0.4) / 0.6))
  const over = isToday && spent > day.envelope
  const pill = isToday
    ? over
      ? { cls: 'crash', text: `${formatSpoons(spent - day.envelope)} over` }
      : { cls: 'comfortable', text: `${formatSpoons(day.envelope - spent)} left` }
    : { cls: day.status, text: STATUS_LABEL[day.status] }

  return (
    <motion.article layout className={`daycard status-${day.status} ${isToday ? 'is-today' : ''}`} aria-label={`${isToday ? 'Today' : weekday(day.date, 'long')}: ${formatSpoons(day.envelope)} spoons, ${pill.text}`}>
      <header className="daycard-head">
        <span className="daycard-day">{isToday ? 'Today' : weekday(day.date)}</span>
        <span className="daycard-date">{shortDate(day.date)}</span>
      </header>
      <div className="daycard-orb">
        <EmberOrb glow={glow} size={64} tone={(isToday ? over : day.status === 'crash') ? 'risk' : 'ember'} />
      </div>
      <p className="daycard-value">
        <AnimatedNumber value={day.envelope} />
        <span>{isToday ? 'envelope' : 'spoons'}</span>
      </p>
      <span className={`status-pill status-pill-${pill.cls}`}>{pill.text}</span>
      <div className="daycard-notes">
        {day.owedFromToday > 0 && <span className="note note-risk">−{formatSpoons(day.owedFromToday)} from today</span>}
        {day.owedFromPast > 0.2 && <span className="note">−{formatSpoons(day.owedFromPast)} from earlier</span>}
        {moved.map((m) => (
          <span key={m.id} className="note note-moved">
            + {m.name} ({formatSpoons(m.cost)})
          </span>
        ))}
      </div>
    </motion.article>
  )
}
