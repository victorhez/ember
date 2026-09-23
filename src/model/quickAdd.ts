import { ACTIVITIES, customItem, planItemFrom } from './activities'
import type { Activity, PlanItem } from './types'

const NUMBER_WORDS: Record<string, number> = {
  a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, half: 0.5,
}

const DURATION = new RegExp(
  String.raw`(?:(\d+(?:\.\d+)?)|\b(a|an|one|two|three|four|five|half)\b)\s*(?:an?\s+)?` +
    String.raw`(h|hr|hrs|hour|hours|m|min|mins|minute|minutes)\b`,
  'i',
)
const HALF_HOUR = /\bhalf\s+an?\s+hour\b/i

/** Extracts a duration in minutes from a phrase, returning the phrase without it. */
export function extractMinutes(phrase: string): { minutes: number | null; rest: string } {
  if (HALF_HOUR.test(phrase)) return { minutes: 30, rest: phrase.replace(HALF_HOUR, ' ') }
  const m = phrase.match(DURATION)
  if (!m) return { minutes: null, rest: phrase }
  const qty = m[1] ? parseFloat(m[1]) : NUMBER_WORDS[m[2].toLowerCase()]
  const unit = m[3].toLowerCase()
  const minutes = unit.startsWith('h') ? qty * 60 : qty
  return { minutes: Math.max(5, Math.round(minutes / 5) * 5), rest: phrase.replace(m[0], ' ') }
}

const KEYWORDS: { keyword: string; activity: Activity }[] = ACTIVITIES.flatMap((activity) =>
  activity.keywords.map((keyword) => ({ keyword, activity })),
).sort((a, b) => b.keyword.length - a.keyword.length)

export function matchActivity(phrase: string): Activity | undefined {
  const text = ` ${phrase.toLowerCase().replace(/[^a-z0-9' -]/g, ' ')} `
  for (const { keyword, activity } of KEYWORDS) {
    if (text.includes(` ${keyword} `) || text.includes(` ${keyword}s `)) return activity
  }
  return undefined
}

function tidy(phrase: string): string {
  const t = phrase
    .replace(/\b(for|of|about|around|maybe|then|a|an|the|my|to|go|going)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return t.charAt(0).toUpperCase() + t.slice(1)
}

/** Turns "shower, groceries, 1h zoom call and cook dinner" into plan items. */
export function parseQuickAdd(input: string): PlanItem[] {
  const phrases = input
    .split(/\s*(?:,|;|\n|\band then\b|\bthen\b|\band\b|\+|&)\s*/i)
    .map((p) => p.trim())
    .filter(Boolean)

  const items: PlanItem[] = []
  for (const phrase of phrases) {
    const { minutes, rest } = extractMinutes(phrase)
    const activity = matchActivity(rest) ?? matchActivity(phrase)
    if (activity) {
      items.push(planItemFrom(activity, activity.minutes == null ? null : (minutes ?? activity.minutes)))
    } else {
      const name = tidy(rest)
      if (name.length > 1) items.push(customItem(name.slice(0, 40), minutes))
    }
  }
  return items
}
