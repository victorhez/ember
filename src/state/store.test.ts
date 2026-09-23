import { describe, expect, it } from 'vitest'
import { initialState, rollover, type State } from './store'
import { ACTIVITIES, planItemFrom } from '../model/activities'

const act = (id: string) => ACTIVITIES.find((a) => a.id === id)!

describe('rollover', () => {
  const base: State = {
    ...initialState,
    onboarded: true,
    today: {
      date: '2026-10-20',
      checkIn: 3,
      plan: [planItemFrom(act('groceries')), planItemFrom(act('family-event'))],
      moved: [{ ...planItemFrom(act('laundry')), toDate: '2026-10-21' }, { ...planItemFrom(act('errands')), toDate: '2026-10-23' }],
    },
  }

  it('moves a finished day into history', () => {
    const next = rollover(base, '2026-10-21')
    expect(next.history).toHaveLength(1)
    expect(next.history[0]).toMatchObject({ date: '2026-10-20', checkIn: 3, envelope: 9.5, spent: 8 })
    expect(next.today.checkIn).toBeNull()
  })

  it('brings moved items into the plan on the day they were moved to', () => {
    const next = rollover(base, '2026-10-21')
    expect(next.today.plan.map((p) => p.activityId)).toEqual(['laundry'])
    expect(next.today.moved.map((m) => m.activityId)).toEqual(['errands'])
  })

  it('does nothing on the same day', () => {
    expect(rollover(base, '2026-10-20')).toBe(base)
  })

  it('skips empty days', () => {
    const empty = { ...base, today: { date: '2026-10-20', checkIn: null, plan: [], moved: [] } }
    expect(rollover(empty, '2026-10-21').history).toHaveLength(0)
  })
})
