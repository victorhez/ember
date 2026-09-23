import type { Activity, Kind, PlanItem } from './types'

export const KIND_LABEL: Record<Kind, string> = {
  physical: 'Physical',
  mental: 'Mental',
  social: 'Social',
  sensory: 'Sensory',
  rest: 'Rest',
}

export const KIND_ORDER: Kind[] = ['physical', 'mental', 'social', 'sensory', 'rest']

/**
 * Costs are in spoons for a typical moderate day of ~12 spoons, calibrated
 * loosely against community pacing charts. They are starting points, not rules.
 */
export const ACTIVITIES: Activity[] = [
  // Physical
  { id: 'shower', name: 'Shower', kind: 'physical', cost: 2, minutes: null, keywords: ['shower', 'wash hair', 'bath'], lighter: 'seated-shower' },
  { id: 'seated-shower', name: 'Seated shower', kind: 'physical', cost: 1, minutes: null, keywords: ['seated shower', 'shower stool'] },
  { id: 'get-dressed', name: 'Get dressed', kind: 'physical', cost: 0.5, minutes: null, keywords: ['get dressed', 'dress', 'dressed'] },
  { id: 'cook', name: 'Cook a meal', kind: 'physical', cost: 2, minutes: 45, keywords: ['cook', 'cooking', 'dinner', 'lunch', 'meal', 'bake'], lighter: 'simple-meal' },
  { id: 'simple-meal', name: 'Simple meal', kind: 'physical', cost: 0.5, minutes: 15, keywords: ['simple meal', 'sandwich', 'microwave', 'leftovers'] },
  { id: 'groceries', name: 'Grocery run', kind: 'physical', cost: 3, minutes: 60, keywords: ['grocery', 'groceries', 'supermarket', 'shopping', 'shop'], lighter: 'grocery-delivery' },
  { id: 'grocery-delivery', name: 'Order groceries online', kind: 'mental', cost: 0.5, minutes: 20, keywords: ['delivery', 'order groceries', 'online order'] },
  { id: 'chores', name: 'Housework', kind: 'physical', cost: 2, minutes: 30, keywords: ['clean', 'cleaning', 'housework', 'chores', 'tidy', 'vacuum', 'hoover', 'mop'] },
  { id: 'laundry', name: 'Laundry', kind: 'physical', cost: 1.5, minutes: 30, keywords: ['laundry', 'washing', 'fold clothes'] },
  { id: 'walk', name: 'Gentle walk', kind: 'physical', cost: 1.5, minutes: 20, keywords: ['walk', 'stroll', 'dog'] },
  { id: 'exercise', name: 'Exercise', kind: 'physical', cost: 4, minutes: 30, keywords: ['exercise', 'gym', 'workout', 'run', 'yoga', 'swim', 'physio'], lighter: 'walk' },
  { id: 'drive', name: 'Drive', kind: 'physical', cost: 1.5, minutes: 30, keywords: ['drive', 'driving', 'car', 'commute', 'school run'] },
  { id: 'errands', name: 'Errands', kind: 'physical', cost: 2.5, minutes: 45, keywords: ['errand', 'errands', 'post office', 'pharmacy', 'bank', 'pick up'] },

  // Mental
  { id: 'work', name: 'Focused work', kind: 'mental', cost: 2, minutes: 60, keywords: ['work', 'working', 'emails', 'email', 'study', 'studying', 'homework', 'writing', 'admin'] },
  { id: 'video-call', name: 'Video call', kind: 'mental', cost: 2, minutes: 60, keywords: ['zoom', 'video call', 'teams', 'meet', 'meeting', 'call', 'interview'], lighter: 'audio-call' },
  { id: 'audio-call', name: 'Audio-only call', kind: 'mental', cost: 1.5, minutes: 60, keywords: ['phone call', 'audio call', 'phone'] },
  { id: 'paperwork', name: 'Forms & paperwork', kind: 'mental', cost: 2.5, minutes: 45, keywords: ['paperwork', 'forms', 'form', 'taxes', 'bills', 'insurance', 'benefits', 'claim'] },
  { id: 'appointment', name: 'Medical appointment', kind: 'mental', cost: 3, minutes: 60, keywords: ['doctor', 'appointment', 'gp', 'clinic', 'hospital', 'dentist', 'therapy'] },
  { id: 'reading', name: 'Reading', kind: 'mental', cost: 0.5, minutes: 30, keywords: ['read', 'reading', 'book'] },

  // Social
  { id: 'friend-visit', name: 'Friend visits', kind: 'social', cost: 2.5, minutes: 60, keywords: ['friend', 'friends', 'visit', 'visitor', 'coffee', 'catch up'] },
  { id: 'family-event', name: 'Family gathering', kind: 'social', cost: 5, minutes: 120, keywords: ['birthday', 'party', 'family', 'gathering', 'wedding', 'celebration', 'christmas', 'dinner party'], lighter: 'short-visit' },
  { id: 'short-visit', name: 'Short visit, seated', kind: 'social', cost: 2, minutes: 45, keywords: ['short visit', 'drop by', 'pop in'] },
  { id: 'childcare', name: 'Childcare', kind: 'social', cost: 3, minutes: 60, keywords: ['kids', 'children', 'childcare', 'babysit', 'niece', 'nephew', 'grandkids'] },
  { id: 'texting', name: 'Messages & texts', kind: 'social', cost: 0.5, minutes: 20, keywords: ['text', 'texts', 'messages', 'message', 'chat'] },

  // Sensory
  { id: 'busy-place', name: 'Busy, noisy place', kind: 'sensory', cost: 3, minutes: 60, keywords: ['restaurant', 'mall', 'cafe', 'pub', 'bar', 'concert', 'crowd', 'busy', 'noisy', 'cinema'], lighter: 'quiet-place' },
  { id: 'quiet-place', name: 'Quiet venue, off-peak', kind: 'sensory', cost: 1.5, minutes: 60, keywords: ['quiet', 'off-peak'] },
  { id: 'screen', name: 'Screen time', kind: 'sensory', cost: 0.5, minutes: 60, keywords: ['tv', 'netflix', 'screen', 'scrolling', 'phone scroll', 'gaming', 'game'] },
  { id: 'transit', name: 'Public transport', kind: 'sensory', cost: 2, minutes: 45, keywords: ['bus', 'train', 'tube', 'subway', 'metro', 'transit', 'travel'] },

  // Rest
  { id: 'lie-down', name: 'Lie-down rest', kind: 'rest', cost: -1, minutes: 20, keywords: ['rest', 'lie down', 'lying down', 'break'] },
  { id: 'nap', name: 'Nap', kind: 'rest', cost: -1.5, minutes: 45, keywords: ['nap', 'sleep', 'snooze'] },
  { id: 'breathing', name: 'Breathing / NSDR', kind: 'rest', cost: -0.5, minutes: 10, keywords: ['breathing', 'meditate', 'meditation', 'nsdr', 'yoga nidra'] },
  { id: 'dark-room', name: 'Dark, quiet room', kind: 'rest', cost: -1, minutes: 30, keywords: ['dark room', 'eye mask', 'quiet room'] },
]

const BY_ID = new Map(ACTIVITIES.map((a) => [a.id, a]))

export function getActivity(id: string | null | undefined): Activity | undefined {
  return id ? BY_ID.get(id) : undefined
}

let counter = 0
export function uid(): string {
  counter += 1
  return `${Date.now().toString(36)}-${counter.toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

export function round1(n: number): number {
  return Math.round(n * 10) / 10
}

/** Cost scales linearly with duration, never dropping below a quarter spoon of effort. */
export function costFor(activity: Activity, minutes: number | null): number {
  if (activity.minutes == null || minutes == null) return activity.cost
  const scaled = activity.cost * (minutes / activity.minutes)
  if (activity.cost < 0) return round1(Math.min(scaled, -0.25))
  return round1(Math.max(scaled, 0.25))
}

export function planItemFrom(activity: Activity, minutes: number | null = activity.minutes): PlanItem {
  return {
    id: uid(),
    activityId: activity.id,
    name: activity.name,
    kind: activity.kind,
    minutes,
    cost: costFor(activity, minutes),
  }
}

/** A custom activity costs a moderate 2 spoons per hour. */
export function customItem(name: string, minutes: number | null): PlanItem {
  const m = minutes ?? 30
  return {
    id: uid(),
    activityId: null,
    name,
    kind: 'mental',
    minutes: m,
    cost: round1(Math.max(0.5, (2 * m) / 60)),
  }
}

export function withMinutes(item: PlanItem, minutes: number): PlanItem {
  const activity = getActivity(item.activityId)
  if (activity) return { ...item, minutes, cost: costFor(activity, minutes) }
  const perMinute = item.minutes ? item.cost / item.minutes : 2 / 60
  return { ...item, minutes, cost: round1(Math.max(0.25, perMinute * minutes)) }
}

export function formatMinutes(m: number | null): string {
  if (m == null) return ''
  if (m < 60) return `${m} min`
  const h = Math.floor(m / 60)
  const r = m % 60
  return r ? `${h} h ${r} min` : `${h} h`
}

export function formatSpoons(n: number): string {
  const v = round1(Math.abs(n))
  return Number.isInteger(v) ? String(v) : v.toFixed(1)
}
