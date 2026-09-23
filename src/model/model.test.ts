import { describe, expect, it } from 'vitest'
import { ACTIVITIES, planItemFrom } from './activities'
import { DEFAULT_PATTERN, envelopeFromCheckIn, projectDays, type ForecastInput } from './forecast'
import { findPaybackLinks, fitPattern } from './learn'
import { parseQuickAdd, extractMinutes } from './quickAdd'
import { generateSampleHistory } from './sample'
import { suggestSwaps } from './swaps'

const TODAY = '2026-10-20'
const act = (id: string) => ACTIVITIES.find((a) => a.id === id)!

function input(ids: string[], extra: Partial<ForecastInput> = {}): ForecastInput {
  return {
    today: TODAY,
    baseline: 12,
    todayEnvelope: envelopeFromCheckIn(3, 12),
    plan: ids.map((id) => planItemFrom(act(id))),
    history: [],
    pattern: DEFAULT_PATTERN,
    ...extra,
  }
}

describe('forecast', () => {
  it('leaves the next days untouched when the plan fits the envelope', () => {
    const days = projectDays(input(['shower', 'work', 'simple-meal']))
    expect(days).toHaveLength(4)
    expect(days.slice(1).every((d) => d.envelope === 12 && d.status === 'comfortable')).toBe(true)
  })

  it('pushes an over-budget plan onto the following days, not today', () => {
    const pattern = fitPattern(generateSampleHistory(TODAY), 12)
    const days = projectDays(input(['shower', 'groceries', 'video-call', 'family-event', 'cook'], { pattern }))
    expect(days[0].envelope).toBe(9.5)
    expect(days[1].owedFromToday).toBeGreaterThan(0)
    expect(days[2].owedFromToday).toBeGreaterThan(0)
    expect(days.slice(1).some((d) => d.status === 'crash')).toBe(true)
  })

  it('carries payback still owed from logged days', () => {
    const history = [{ date: '2026-10-19', checkIn: 3 as const, envelope: 9, spent: 14, items: [] }]
    const days = projectDays(input([], { history }))
    expect(days[1].owedFromPast).toBeGreaterThan(0)
  })
})

describe('learning', () => {
  it('recovers the true lag and ratio from noisy sample history', () => {
    const history = generateSampleHistory(TODAY)
    const p = fitPattern(history, 12)
    expect(p.peakLagDays).toBe(2)
    expect(Math.abs(p.ratio - 1.7)).toBeLessThanOrEqual(0.5)
    expect(p.confidence).toBe(1)
  })

  it('falls back to defaults with too little data', () => {
    const p = fitPattern(generateSampleHistory(TODAY).slice(-4), 12)
    expect(p.weights).toEqual(DEFAULT_PATTERN.weights)
  })

  it('links over-budget days to the dip that followed', () => {
    const links = findPaybackLinks(generateSampleHistory(TODAY), 12)
    expect(links.length).toBeGreaterThanOrEqual(3)
  })
})

describe('quick add', () => {
  it('parses a sentence into activities with durations', () => {
    const items = parseQuickAdd('shower, 1h zoom call and groceries')
    expect(items.map((i) => i.activityId)).toEqual(['shower', 'video-call', 'groceries'])
    expect(items[1].minutes).toBe(60)
  })

  it('understands spoken durations', () => {
    expect(extractMinutes('2 hours of work').minutes).toBe(120)
    expect(extractMinutes('half an hour walk').minutes).toBe(30)
    expect(extractMinutes('45 min call').minutes).toBe(45)
  })

  it('keeps unknown phrases as custom activities', () => {
    const [item] = parseQuickAdd('repot the monstera')
    expect(item.activityId).toBeNull()
    expect(item.name).toBe('Repot monstera')
  })
})

describe('swaps', () => {
  it('suggests changes that improve the hardest day ahead', () => {
    const i = input(['shower', 'groceries', 'video-call', 'family-event', 'cook'])
    const swaps = suggestSwaps(i)
    expect(swaps.length).toBeGreaterThan(0)
    expect(swaps.length).toBeLessThanOrEqual(3)
    expect(swaps.every((s) => s.gain > 0)).toBe(true)
    const worstBefore = Math.min(...projectDays(i).slice(1).map((d) => d.envelope))
    const worstAfter = Math.min(...projectDays({ ...i, plan: swaps[0].plan }).slice(1).map((d) => d.envelope))
    expect(worstAfter).toBeGreaterThan(worstBefore)
  })

  it('stays quiet when the plan fits', () => {
    expect(suggestSwaps(input(['shower', 'reading']))).toEqual([])
  })
})
