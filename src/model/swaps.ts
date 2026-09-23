import { getActivity, planItemFrom, round1, uid, withMinutes, ACTIVITIES } from './activities'
import { overspend, planCost, projectDays, worstFutureEnvelope, type ForecastInput } from './forecast'
import type { DayProjection, PlanItem } from './types'

export type SwapKind = 'lighter' | 'split' | 'move'

export interface Swap {
  id: string
  kind: SwapKind
  itemId: string
  title: string
  detail: string
  /** Improvement to the worst of the next three days, in spoons. */
  gain: number
  /** The day that benefits most. */
  gainDate: string
  plan: PlanItem[]
  moved?: PlanItem
}

const REST = ACTIVITIES.find((a) => a.id === 'lie-down')!

/**
 * Tries every sensible change to today's plan, runs each through the forecast,
 * and keeps the ones that most improve the hardest day ahead.
 */
export function suggestSwaps(input: ForecastInput, limit = 3): Swap[] {
  const base = projectDays(input)
  const envelope = base[0].envelope
  if (overspend(planCost(input.plan), envelope) <= 0) return []
  const baseWorst = worstFutureEnvelope(base)

  const candidates: Omit<Swap, 'gain' | 'gainDate'>[] = []
  for (const item of input.plan) {
    if (item.kind === 'rest' || item.cost <= 0.5) continue
    const activity = getActivity(item.activityId)
    const lighter = getActivity(activity?.lighter)

    if (lighter) {
      const next = planItemFrom(lighter, lighter.minutes == null ? null : (item.minutes ?? lighter.minutes))
      candidates.push({
        id: `lighter-${item.id}`,
        kind: 'lighter',
        itemId: item.id,
        title: `${lighter.name} instead of ${item.name.toLowerCase()}`,
        detail: `Saves ${fmt(item.cost - next.cost)} spoons today`,
        plan: input.plan.map((p) => (p.id === item.id ? next : p)),
      })
    }

    if (item.minutes != null && item.minutes >= 40) {
      const half = Math.max(15, Math.round(item.minutes / 2 / 5) * 5)
      const shorter = withMinutes(item, half)
      const rest = planItemFrom(REST)
      const plan = input.plan.flatMap((p) => (p.id === item.id ? [shorter, rest] : [p]))
      candidates.push({
        id: `split-${item.id}`,
        kind: 'split',
        itemId: item.id,
        title: `Halve ${item.name.toLowerCase()}, then rest`,
        detail: `${half} min plus a 20-minute lie-down`,
        plan,
      })
    }

    candidates.push({
      id: `move-${item.id}`,
      kind: 'move',
      itemId: item.id,
      title: `Move ${item.name.toLowerCase()} to another day`,
      detail: `Frees ${fmt(item.cost)} spoons today`,
      plan: input.plan.filter((p) => p.id !== item.id),
      moved: { ...item, id: uid() },
    })
  }

  const scored: Swap[] = candidates.map((c) => {
    const days = projectDays({ ...input, plan: c.plan })
    const gain = round1(worstFutureEnvelope(days) - baseWorst)
    return { ...c, gain, gainDate: mostImproved(base, days) }
  })

  const kept = scored
    .filter((s) => s.gain > 0.05)
    .sort((a, b) => b.gain - a.gain || kindRank(a) - kindRank(b))

  // One suggestion per activity keeps the list varied.
  const seen = new Set<string>()
  const result: Swap[] = []
  for (const s of kept) {
    if (seen.has(s.itemId)) continue
    seen.add(s.itemId)
    result.push(s)
    if (result.length === limit) break
  }
  return result
}

function kindRank(s: Swap): number {
  return s.kind === 'lighter' ? 0 : s.kind === 'split' ? 1 : 2
}

function mostImproved(before: DayProjection[], after: DayProjection[]): string {
  let best = after[1]
  let bestGain = -Infinity
  for (let i = 1; i < after.length; i++) {
    const g = after[i].envelope - before[i].envelope
    if (g > bestGain) {
      bestGain = g
      best = after[i]
    }
  }
  return best.date
}

function fmt(n: number): string {
  const v = round1(n)
  return Number.isInteger(v) ? String(v) : v.toFixed(1)
}
