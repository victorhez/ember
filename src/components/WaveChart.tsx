import type { CSSProperties, SVGProps } from 'react'
import { motion } from 'motion/react'
import { weekday } from '../model/dates'
import type { DayProjection } from '../model/types'

const W = 640
const H = 190
const PAD = { top: 22, right: 26, bottom: 30, left: 26 }

/** Smooth curve through points (Catmull-Rom converted to cubic Béziers). */
function smooth(points: [number, number][]): string {
  if (points.length < 2) return ''
  let d = `M${points[0][0]},${points[0][1]}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] ?? p2
    const t = 0.18
    const c1 = [p1[0] + (p2[0] - p0[0]) * t, p1[1] + (p2[1] - p0[1]) * t]
    const c2 = [p2[0] - (p3[0] - p1[0]) * t, p2[1] - (p3[1] - p1[1]) * t]
    d += ` C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]}`
  }
  return d
}

const transition = { type: 'spring', stiffness: 80, damping: 18 } as const

/**
 * A path whose shape eases between states via the CSS `d` property.
 * Browsers without CSS `d` support simply jump to the new shape.
 */
function Morph({ d, ...rest }: SVGProps<SVGPathElement> & { d: string }) {
  return <path d={d} style={{ d: `path("${d}")` } as CSSProperties} {...rest} />
}

export function WaveChart({ days, baseline, crashLine }: { days: DayProjection[]; baseline: number; crashLine: number }) {
  const max = baseline * 1.12
  const x = (i: number) => PAD.left + (i * (W - PAD.left - PAD.right)) / (days.length - 1)
  const y = (v: number) => PAD.top + (1 - Math.max(0, v) / max) * (H - PAD.top - PAD.bottom)

  const projected = days.map((d, i) => [x(i), y(d.envelope)] as [number, number])
  const without = days.map((d, i) => [x(i), y(d.envelope + d.owedFromToday)] as [number, number])
  const line = smooth(projected)
  const ghost = smooth(without)
  const bottom = H - PAD.bottom
  const area = `${line} L${x(days.length - 1)},${bottom} L${x(0)},${bottom} Z`
  const back = smooth([...projected].reverse()).replace(/^M/, 'L')
  const hasGap = days.some((d) => d.owedFromToday > 0)
  // With no payback the gap collapses onto the line, keeping the same commands so it can morph.
  const gap = `${hasGap ? ghost : line} ${back} Z`

  return (
    <figure className="wave">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Projected energy envelope over the next three days">
        <defs>
          <linearGradient id="wave-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--ember-2)" stopOpacity="0.42" />
            <stop offset="100%" stopColor="var(--ember-1)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="wave-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--ember-3)" />
            <stop offset="100%" stopColor="var(--ember-1)" />
          </linearGradient>
          <pattern id="crash-hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="7" stroke="var(--risk)" strokeOpacity="0.16" strokeWidth="3" />
          </pattern>
        </defs>

        <rect x={PAD.left} y={y(crashLine)} width={W - PAD.left - PAD.right} height={bottom - y(crashLine)} fill="url(#crash-hatch)" rx="8" />
        <text x={W - PAD.right} y={y(crashLine) + 15} className="wave-label wave-label-risk" textAnchor="end">
          crash zone
        </text>

        <line x1={PAD.left} x2={W - PAD.right} y1={y(baseline)} y2={y(baseline)} className="wave-baseline" />
        <text x={PAD.left} y={y(baseline) - 7} className="wave-label">
          usual good day · {baseline}
        </text>

        <Morph d={area} fill="url(#wave-fill)" />
        <Morph d={gap} className={`wave-gap ${hasGap ? 'is-on' : ''}`} />
        <Morph d={ghost} className={`wave-ghost ${hasGap ? 'is-on' : ''}`} />
        <Morph d={line} className="wave-line" stroke="url(#wave-line)" />

        {days.map((d, i) => (
          <g key={d.date}>
            <motion.circle
              r={5}
              cx={x(i)}
              className={`wave-dot wave-dot-${d.status}`}
              initial={false}
              animate={{ cy: y(d.envelope) }}
              transition={transition}
            />
            <text x={x(i)} y={H - 8} textAnchor="middle" className="wave-axis">
              {i === 0 ? 'Today' : weekday(d.date)}
            </text>
          </g>
        ))}
      </svg>
      {hasGap && (
        <figcaption className="wave-legend">
          <span className="legend-swatch legend-gap" aria-hidden /> Payback from today’s plan
          <span className="legend-swatch legend-ghost" aria-hidden /> Without it
        </figcaption>
      )}
    </figure>
  )
}
