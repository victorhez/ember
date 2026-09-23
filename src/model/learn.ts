import { addDays } from './dates'
import { round1 } from './activities'
import { CRASH_LINE, DEFAULT_PATTERN, overspend } from './forecast'
import type { DayLog, Pattern } from './types'

export const MIN_DAYS_TO_LEARN = 7
const FULL_CONFIDENCE_DAYS = 21
const RIDGE = 0.4

/** Solves A·x = b by Gaussian elimination with partial pivoting. Returns null if singular. */
function solve(A: number[][], b: number[]): number[] | null {
  const n = b.length
  const M = A.map((row, i) => [...row, b[i]])
  for (let col = 0; col < n; col++) {
    let pivot = col
    for (let r = col + 1; r < n; r++) if (Math.abs(M[r][col]) > Math.abs(M[pivot][col])) pivot = r
    if (Math.abs(M[pivot][col]) < 1e-9) return null
    ;[M[col], M[pivot]] = [M[pivot], M[col]]
    for (let r = 0; r < n; r++) {
      if (r === col) continue
      const f = M[r][col] / M[col][col]
      for (let c = col; c <= n; c++) M[r][c] -= f * M[col][c]
    }
  }
  return M.map((row, i) => row[n] / row[i])
}

/**
 * Learns how a person's body sends the bill.
 *
 * For every logged day, the "dip" is how far its envelope fell below the usual
 * budget. We fit   dip(d) ≈ c + β1·over(d−1) + β2·over(d−2) + β3·over(d−3)
 * by ridge least squares, where over() is spend beyond that day's envelope.
 * β tells us when payback lands (the lag) and Σβ how big it is (the ratio).
 * The result is blended with research-informed defaults until there is
 * enough history to trust it.
 */
export function fitPattern(history: DayLog[], baseline: number): Pattern {
  const byDate = new Map(history.map((d) => [d.date, d]))
  const rows: { x: number[]; y: number }[] = []
  for (const day of history) {
    const x = [1, 2, 3].map((lag) => {
      const prev = byDate.get(addDays(day.date, -lag))
      return prev ? overspend(prev.spent, prev.envelope) : 0
    })
    rows.push({ x: [1, ...x], y: baseline - day.envelope })
  }

  const n = rows.length
  if (n < MIN_DAYS_TO_LEARN || !rows.some((r) => r.x.slice(1).some((v) => v > 0))) {
    return { ...DEFAULT_PATTERN, daysUsed: n }
  }

  const A = Array.from({ length: 4 }, () => [0, 0, 0, 0])
  const b = [0, 0, 0, 0]
  for (const { x, y } of rows) {
    for (let i = 0; i < 4; i++) {
      b[i] += x[i] * y
      for (let j = 0; j < 4; j++) A[i][j] += x[i] * x[j]
    }
  }
  for (let i = 1; i < 4; i++) A[i][i] += RIDGE

  const coef = solve(A, b)
  if (!coef) return { ...DEFAULT_PATTERN, daysUsed: n }

  const beta = coef.slice(1).map((v) => Math.max(0, v))
  const fittedRatio = beta.reduce((s, v) => s + v, 0)
  if (fittedRatio < 0.05) return { ...DEFAULT_PATTERN, daysUsed: n }

  const fittedWeights = beta.map((v) => v / fittedRatio)
  const confidence = Math.min(1, n / FULL_CONFIDENCE_DAYS)
  const weights = fittedWeights.map((w, i) => confidence * w + (1 - confidence) * DEFAULT_PATTERN.weights[i]) as [number, number, number]
  const ratio = confidence * Math.min(fittedRatio, 4) + (1 - confidence) * DEFAULT_PATTERN.ratio
  const peak = weights.indexOf(Math.max(...weights)) + 1

  return {
    weights,
    ratio: round1(ratio),
    peakLagDays: peak as 1 | 2 | 3,
    confidence,
    daysUsed: n,
  }
}

export interface PaybackLink {
  from: string
  to: string
  over: number
  dip: number
}

/** Pairs each over-budget day with the deepest dip that followed it within three days. */
export function findPaybackLinks(history: DayLog[], baseline: number): PaybackLink[] {
  const byDate = new Map(history.map((d) => [d.date, d]))
  const links: PaybackLink[] = []
  for (const day of history) {
    const over = overspend(day.spent, day.envelope)
    if (over < 1) continue
    let best: DayLog | undefined
    for (let lag = 1; lag <= 3; lag++) {
      const next = byDate.get(addDays(day.date, lag))
      if (next && (!best || next.envelope < best.envelope)) best = next
    }
    if (best && baseline - best.envelope >= baseline * 0.25) {
      links.push({ from: day.date, to: best.date, over: round1(over), dip: round1(baseline - best.envelope) })
    }
  }
  return links
}

export interface HistoryStats {
  withinPct: number
  crashes: number
  overDays: number
  avgSpent: number
}

export function historyStats(history: DayLog[], baseline: number): HistoryStats {
  if (history.length === 0) return { withinPct: 0, crashes: 0, overDays: 0, avgSpent: 0 }
  const within = history.filter((d) => d.spent <= d.envelope).length
  return {
    withinPct: Math.round((within / history.length) * 100),
    crashes: history.filter((d) => d.envelope < baseline * CRASH_LINE).length,
    overDays: history.length - within,
    avgSpent: round1(history.reduce((s, d) => s + d.spent, 0) / history.length),
  }
}

export function confidenceLabel(p: Pattern): string {
  if (p.daysUsed < MIN_DAYS_TO_LEARN) return 'Using research defaults'
  if (p.confidence < 0.5) return 'Early estimate'
  if (p.confidence < 1) return 'Getting sharper'
  return 'Learned from your log'
}
