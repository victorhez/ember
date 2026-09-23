import { addDays, daysBetween } from './dates'
import { round1 } from './activities'
import type { CheckInLevel, DayLog, DayProjection, DayStatus, Pattern, PlanItem } from './types'

export const CHECK_IN_LEVELS: { level: CheckInLevel; label: string; hint: string; factor: number }[] = [
  { level: 1, label: 'Depleted', hint: 'Everything feels heavy. Mostly resting today.', factor: 0.4 },
  { level: 2, label: 'Low', hint: 'Foggy or achy. Small things only.', factor: 0.6 },
  { level: 3, label: 'Steady', hint: 'Not great, not bad. A usual day.', factor: 0.8 },
  { level: 4, label: 'Good', hint: 'Clearer than usual. Some room to move.', factor: 0.92 },
  { level: 5, label: 'Strong', hint: 'A genuinely good day. Still pace it.', factor: 1 },
]

/** Thresholds as a share of the usual good-day budget. */
export const CRASH_LINE = 0.65
export const TIGHT_LINE = 0.85
/** Pacing guidance: aim to use about 80% of the envelope. */
export const COMFORT_ZONE = 0.8

export const DEFAULT_PATTERN: Pattern = {
  weights: [0.45, 0.4, 0.15],
  ratio: 1.5,
  peakLagDays: 1,
  confidence: 0,
  daysUsed: 0,
}

function roundHalf(n: number): number {
  return Math.round(n * 2) / 2
}

export function envelopeFromCheckIn(level: CheckInLevel, baseline: number): number {
  const entry = CHECK_IN_LEVELS.find((l) => l.level === level) ?? CHECK_IN_LEVELS[2]
  return Math.max(1, roundHalf(baseline * entry.factor))
}

export function planCost(plan: PlanItem[]): number {
  return round1(plan.reduce((sum, item) => sum + item.cost, 0))
}

/** Spend over the envelope counts; rest can pull the day back but never below zero. */
export function overspend(spent: number, envelope: number): number {
  return Math.max(0, spent - envelope)
}

export function statusFor(envelope: number, baseline: number): DayStatus {
  if (envelope < baseline * CRASH_LINE) return 'crash'
  if (envelope < baseline * TIGHT_LINE) return 'tight'
  return 'comfortable'
}

/** Payback from logged days that is still due to land on `date`. */
export function owedFromHistory(history: DayLog[], date: string, pattern: Pattern): number {
  let owed = 0
  for (const day of history) {
    const lag = daysBetween(day.date, date)
    if (lag < 1 || lag > 3) continue
    owed += pattern.ratio * pattern.weights[lag - 1] * overspend(day.spent, day.envelope)
  }
  return owed
}

export interface ForecastInput {
  today: string
  baseline: number
  todayEnvelope: number | null
  plan: PlanItem[]
  history: DayLog[]
  pattern: Pattern
}

export function todayEnvelope(input: Omit<ForecastInput, 'plan'>): number {
  if (input.todayEnvelope != null) return input.todayEnvelope
  const owed = owedFromHistory(input.history, input.today, input.pattern)
  return Math.max(1, roundHalf(input.baseline - owed))
}

/** Projects today and the next three days. The heart of Ember. */
export function projectDays(input: ForecastInput): DayProjection[] {
  const envelope = todayEnvelope(input)
  const over = overspend(planCost(input.plan), envelope)
  const days: DayProjection[] = []
  for (let offset = 0; offset <= 3; offset++) {
    const date = addDays(input.today, offset)
    if (offset === 0) {
      days.push({
        offset,
        date,
        envelope,
        owedFromPast: round1(owedFromHistory(input.history, date, input.pattern)),
        owedFromToday: 0,
        status: statusFor(envelope, input.baseline),
      })
      continue
    }
    const fromPast = owedFromHistory(input.history, date, input.pattern)
    const fromToday = input.pattern.ratio * input.pattern.weights[offset - 1] * over
    const projected = Math.max(0, round1(input.baseline - fromPast - fromToday))
    days.push({
      offset,
      date,
      envelope: projected,
      owedFromPast: round1(fromPast),
      owedFromToday: round1(fromToday),
      status: statusFor(projected, input.baseline),
    })
  }
  return days
}

export function worstFutureEnvelope(days: DayProjection[]): number {
  return Math.min(...days.slice(1).map((d) => d.envelope))
}

export interface Explanation {
  tone: 'calm' | 'watch' | 'warn'
  headline: string
  detail: string
}

const LAG_WORDS: Record<number, string> = { 1: 'about 24 hours', 2: 'about 48 hours', 3: 'about 72 hours' }

export function explain(input: ForecastInput, days: DayProjection[], dayName: (iso: string) => string): Explanation {
  const envelope = days[0].envelope
  const spent = planCost(input.plan)
  const over = overspend(spent, envelope)
  const future = days.slice(1)
  const hit = future.reduce((a, b) => (b.owedFromToday > a.owedFromToday ? b : a), future[0])
  const worst = future.reduce((a, b) => (b.envelope < a.envelope ? b : a), future[0])

  if (over > 0) {
    const biggest = [...input.plan].sort((a, b) => b.cost - a.cost)[0]
    const total = round1(future.reduce((s, d) => s + d.owedFromToday, 0))
    const crash = worst.status === 'crash'
    return {
      tone: crash ? 'warn' : 'watch',
      headline: crash
        ? `Crash likely on ${dayName(worst.date)}`
        : `${dayName(hit.date)} will feel it`,
      detail:
        `This plan is ${fmt(over)} over today's envelope. Your body sends the bill later: ` +
        `about ${fmt(total)} spoons of payback, mostly landing ${dayName(hit.date)} — ${LAG_WORDS[hit.offset]} from now.` +
        (biggest ? ` The biggest cost is ${biggest.name.toLowerCase()} (${fmt(biggest.cost)}).` : ''),
    }
  }

  const pastHit = future.reduce((a, b) => (b.owedFromPast > a.owedFromPast ? b : a), future[0])
  if (pastHit.owedFromPast >= 1) {
    return {
      tone: pastHit.status === 'crash' ? 'warn' : 'watch',
      headline: `Earlier days are still landing`,
      detail: `About ${fmt(pastHit.owedFromPast)} spoons of payback from recent days arrive ${dayName(pastHit.date)}. Today's plan adds nothing to it — good pacing.`,
    }
  }

  const left = round1(envelope - spent)
  return {
    tone: 'calm',
    headline: spent === 0 ? 'A clear runway' : 'Pacing well',
    detail:
      spent === 0
        ? `You have ${fmt(envelope)} spoons today. Add what you're planning and Ember will show how the next three days respond.`
        : `${fmt(left)} spoons to spare and no payback coming. The next three days stay as they are.`,
  }
}

function fmt(n: number): string {
  const v = round1(n)
  return Number.isInteger(v) ? String(v) : v.toFixed(1)
}
