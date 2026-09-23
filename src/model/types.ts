export type Kind = 'physical' | 'mental' | 'social' | 'sensory' | 'rest'

export type CheckInLevel = 1 | 2 | 3 | 4 | 5

export interface Activity {
  id: string
  name: string
  kind: Kind
  /** Spoons for `minutes` (or per occurrence when minutes is null). Negative for rest. */
  cost: number
  minutes: number | null
  keywords: string[]
  /** A lighter way to do the same thing. */
  lighter?: string
}

export interface PlanItem {
  id: string
  activityId: string | null
  name: string
  kind: Kind
  minutes: number | null
  cost: number
}

export interface DayLog {
  date: string
  checkIn: CheckInLevel
  envelope: number
  spent: number
  items: string[]
}

export interface Pattern {
  /** Share of payback landing 1, 2 and 3 days later. Sums to 1. */
  weights: [number, number, number]
  /** Spoons of payback per spoon over the envelope. */
  ratio: number
  peakLagDays: 1 | 2 | 3
  /** 0..1 — how much of the pattern comes from the user's own log. */
  confidence: number
  daysUsed: number
}

export type DayStatus = 'comfortable' | 'tight' | 'crash'

export interface DayProjection {
  offset: number
  date: string
  envelope: number
  /** Payback landing on this day from days already lived. */
  owedFromPast: number
  /** Payback landing on this day from today's plan. */
  owedFromToday: number
  status: DayStatus
}
