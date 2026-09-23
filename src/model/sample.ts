import { addDays } from './dates'
import { round1 } from './activities'
import { CHECK_IN_LEVELS } from './forecast'
import type { CheckInLevel, DayLog } from './types'

/** Small deterministic PRNG so the sample history is the same on every load. */
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const CALM_DAYS = [
  ['Shower', 'Focused work', 'Simple meal', 'Lie-down rest'],
  ['Gentle walk', 'Messages & texts', 'Cook a meal', 'Nap'],
  ['Laundry', 'Reading', 'Simple meal', 'Screen time'],
  ['Shower', 'Audio-only call', 'Simple meal', 'Lie-down rest'],
  ['Focused work', 'Order groceries online', 'Cook a meal', 'Dark, quiet room'],
]

const BOOM_DAYS = [
  ['Shower', 'Grocery run', 'Video call', 'Cook a meal', 'Friend visits'],
  ['Family gathering', 'Drive', 'Shower', 'Busy, noisy place'],
  ['Medical appointment', 'Public transport', 'Errands', 'Cook a meal'],
  ['Housework', 'Laundry', 'Focused work', 'Video call', 'Grocery run'],
]

const CRASH_DAYS = [
  ['Nap', 'Simple meal', 'Dark, quiet room'],
  ['Lie-down rest', 'Screen time', 'Nap'],
]

/** Over-budget "boom" days, counted back from yesterday (1 = yesterday). */
const BOOM_OFFSETS = new Set([20, 16, 12, 9, 5])

/**
 * Generates 21 days of clearly-labelled sample history from a known pattern:
 * payback lands mostly two days later at ~1.7× the overspend. Ember's learner
 * should recover roughly this from the log alone.
 */
export const SAMPLE_TRUTH = { weights: [0.2, 0.65, 0.15] as const, ratio: 1.7 }

export function generateSampleHistory(today: string, baseline = 12, days = 21): DayLog[] {
  const rand = mulberry32(20261026)
  const log: DayLog[] = []
  for (let back = days; back >= 1; back--) {
    const date = addDays(today, -back)
    let owed = 0
    for (let lag = 1; lag <= 3; lag++) {
      const prev = log[log.length - lag]
      if (prev) owed += SAMPLE_TRUTH.ratio * SAMPLE_TRUTH.weights[lag - 1] * Math.max(0, prev.spent - prev.envelope)
    }
    const natural = baseline * (0.86 + (rand() - 0.5) * 0.16)
    const envelope = Math.max(3, Math.round((natural - owed) * 2) / 2)
    const boom = BOOM_OFFSETS.has(back)
    const crashing = envelope < baseline * 0.55
    const spent = boom
      ? round1(envelope + 3 + rand() * 2.5)
      : round1(envelope * (0.72 + rand() * 0.22))
    const pool = boom ? BOOM_DAYS : crashing ? CRASH_DAYS : CALM_DAYS
    const items = pool[Math.floor(rand() * pool.length)]
    log.push({ date, checkIn: levelFor(envelope / baseline), envelope, spent, items })
  }
  return log
}

function levelFor(share: number): CheckInLevel {
  let best = CHECK_IN_LEVELS[0]
  for (const l of CHECK_IN_LEVELS) if (Math.abs(l.factor - share) < Math.abs(best.factor - share)) best = l
  return best.level
}
