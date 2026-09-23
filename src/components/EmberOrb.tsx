import { motion } from 'motion/react'
import type { CSSProperties } from 'react'

interface Props {
  /** 0 = cold ash, 1 = full flame. */
  glow: number
  size: number
  /** Optional ring showing how much of the envelope the plan uses. */
  ring?: { used: number; comfort?: number }
  tone?: 'ember' | 'risk'
  label?: string
}

const spring = { type: 'spring', stiffness: 90, damping: 18, mass: 0.9 } as const

export function EmberOrb({ glow, size, ring, tone = 'ember', label }: Props) {
  const g = Math.max(0, Math.min(1, glow))
  const stroke = Math.max(3, size * 0.028)
  const r = size / 2 - stroke
  const c = 2 * Math.PI * r
  const used = ring ? Math.max(0, ring.used) : 0
  const over = used > 1
  const comfortAngle = ring?.comfort != null ? ring.comfort * 360 - 90 : null

  return (
    <div
      className={`orb orb--${tone} ${g < 0.08 ? 'orb--ash' : ''}`}
      style={{ width: size, height: size, '--glow': g } as CSSProperties}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <motion.div className="orb-halo" animate={{ opacity: 0.18 + g * 0.82, scale: 0.75 + g * 0.35 }} transition={spring} />
      <motion.div className="orb-core-wrap" animate={{ scale: 0.52 + g * 0.3 }} transition={spring}>
        <div className="orb-core" />
        <div className="orb-sheen" />
      </motion.div>
      {ring && (
        <svg className="orb-ring" viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
          <defs>
            <linearGradient id={`ring-grad-${size}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--ember-3)" />
              <stop offset="100%" stopColor="var(--ember-1)" />
            </linearGradient>
          </defs>
          <circle cx={size / 2} cy={size / 2} r={r} className="orb-ring-track" strokeWidth={stroke} />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={over ? 'var(--risk)' : `url(#ring-grad-${size})`}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            initial={false}
            animate={{ strokeDashoffset: c * (1 - Math.min(1, used)) }}
            transition={spring}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
          {comfortAngle != null && (
            <g transform={`rotate(${comfortAngle} ${size / 2} ${size / 2})`}>
              <line
                x1={size / 2 + r - stroke * 1.4}
                x2={size / 2 + r + stroke * 1.4}
                y1={size / 2}
                y2={size / 2}
                className="orb-ring-tick"
                strokeWidth={2}
              />
            </g>
          )}
        </svg>
      )}
    </div>
  )
}
