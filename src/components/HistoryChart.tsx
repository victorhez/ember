import { useState } from 'react'
import { motion } from 'motion/react'
import type { DayLog } from '../model/types'
import type { PaybackLink } from '../model/learn'
import { CHECK_IN_LEVELS, CRASH_LINE } from '../model/forecast'
import { formatSpoons } from '../model/activities'
import { shortDate, weekday } from '../model/dates'

const H = 300
const PAD = { top: 56, right: 16, bottom: 34, left: 16 }
const COL = 34

export function HistoryChart({ history, links, baseline }: { history: DayLog[]; links: PaybackLink[]; baseline: number }) {
  const [active, setActive] = useState<number | null>(null)
  const W = PAD.left + PAD.right + history.length * COL
  const max = Math.max(baseline * 1.25, ...history.map((d) => d.spent)) * 1.02
  const y = (v: number) => PAD.top + (1 - v / max) * (H - PAD.top - PAD.bottom)
  const cx = (i: number) => PAD.left + i * COL + COL / 2
  const index = new Map(history.map((d, i) => [d.date, i]))
  const bw = COL * 0.46
  const bottom = H - PAD.bottom

  const envPath = history.map((d, i) => `${i === 0 ? 'M' : 'L'}${cx(i) - COL / 2 + 3},${y(d.envelope)} L${cx(i) + COL / 2 - 3},${y(d.envelope)}`).join(' ')
  const day = active != null ? history[active] : null

  return (
    <div className="history-chart">
      <div className="history-scroll">
        <svg viewBox={`0 0 ${W} ${H}`} style={{ minWidth: W }} role="img" aria-label={`Spend against envelope for the last ${history.length} days, with ${links.length} over-budget days linked to the crash that followed`}>
          <defs>
            <linearGradient id="bar-grad" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="var(--ember-1)" stopOpacity="0.55" />
              <stop offset="100%" stopColor="var(--ember-3)" />
            </linearGradient>
            <marker id="arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,1 L9,5 L0,9 Z" fill="var(--risk)" />
            </marker>
          </defs>

          <line x1={PAD.left} x2={W - PAD.right} y1={y(baseline)} y2={y(baseline)} className="wave-baseline" />
          <rect x={PAD.left} y={y(baseline * CRASH_LINE)} width={W - PAD.left - PAD.right} height={bottom - y(baseline * CRASH_LINE)} className="history-crashzone" />

          {history.map((d, i) => {
            const within = Math.min(d.spent, d.envelope)
            const over = Math.max(0, d.spent - d.envelope)
            const x = cx(i) - bw / 2
            return (
              <g
                key={d.date}
                className={`history-col ${active === i ? 'is-active' : ''}`}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                tabIndex={0}
                role="button"
                aria-label={`${weekday(d.date, 'long')} ${shortDate(d.date)}: spent ${formatSpoons(d.spent)} of ${formatSpoons(d.envelope)}`}
              >
                <rect x={cx(i) - COL / 2} y={PAD.top - 20} width={COL} height={bottom - PAD.top + 20} className="history-hit" />
                <motion.rect
                  x={x}
                  width={bw}
                  rx={bw / 2.4}
                  fill="url(#bar-grad)"
                  initial={{ y: bottom, height: 0 }}
                  animate={{ y: y(within), height: bottom - y(within) }}
                  transition={{ delay: i * 0.02, type: 'spring', stiffness: 80, damping: 16 }}
                />
                {over > 0 && (
                  <motion.rect
                    x={x}
                    width={bw}
                    rx={bw / 2.4}
                    className="history-over"
                    initial={{ opacity: 0, y: y(within), height: 0 }}
                    animate={{ opacity: 1, y: y(d.spent), height: y(within) - y(d.spent) + bw / 2.4 }}
                    transition={{ delay: 0.35 + i * 0.02, type: 'spring', stiffness: 80, damping: 16 }}
                  />
                )}
                <text x={cx(i)} y={H - 12} textAnchor="middle" className="wave-axis">
                  {weekday(d.date).slice(0, 1)}
                </text>
              </g>
            )
          })}

          <path d={envPath} className="history-env" />
          {history.map((d, i) =>
            d.envelope < baseline * CRASH_LINE ? <circle key={d.date} cx={cx(i)} cy={y(d.envelope)} r={4.5} className="history-crashdot" /> : null,
          )}

          {links.map((l, k) => {
            const a = index.get(l.from)!
            const b = index.get(l.to)!
            const x1 = cx(a)
            const y1 = y(history[a].spent) - 6
            const x2 = cx(b)
            const y2 = y(history[b].envelope) - 8
            const top = Math.min(y1, y2) - 26 - (b - a) * 6
            const midX = (x1 + x2) / 2
            return (
              <g key={l.from}>
                <motion.path
                  d={`M${x1},${y1} C${x1},${top} ${x2},${top} ${x2},${y2}`}
                  className="history-arc"
                  markerEnd="url(#arrow)"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ delay: 0.8 + k * 0.15, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                />
                <motion.text
                  x={midX}
                  y={top + 2}
                  textAnchor="middle"
                  className="history-arc-label"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 + k * 0.15 }}
                >
                  +{formatSpoons(l.over)} → −{formatSpoons(l.dip)}
                </motion.text>
              </g>
            )
          })}
        </svg>
      </div>

      <div className="history-detail" aria-live="polite">
        {day ? (
          <>
            <strong>
              {weekday(day.date, 'long')}, {shortDate(day.date)}
            </strong>
            <span>Check-in: {CHECK_IN_LEVELS.find((l) => l.level === day.checkIn)?.label}</span>
            <span>
              Spent {formatSpoons(day.spent)} of {formatSpoons(day.envelope)}
              {day.spent > day.envelope && <em className="text-risk"> · {formatSpoons(day.spent - day.envelope)} over</em>}
            </span>
            {day.items.length > 0 && <span className="history-items">{day.items.join(' · ')}</span>}
          </>
        ) : (
          <span className="muted">Hover or focus a day for details. Arcs link an over-budget day to the dip it caused.</span>
        )}
      </div>
    </div>
  )
}
