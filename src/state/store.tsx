import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import { planCost, envelopeFromCheckIn, todayEnvelope, DEFAULT_PATTERN } from '../model/forecast'
import { fitPattern } from '../model/learn'
import { generateSampleHistory } from '../model/sample'
import { todayIso, daysBetween } from '../model/dates'
import type { CheckInLevel, DayLog, Pattern, PlanItem } from '../model/types'

export type ThemeChoice = 'system' | 'night' | 'day'

export interface MovedItem extends PlanItem {
  toDate: string
}

export interface State {
  version: 1
  onboarded: boolean
  sample: boolean
  settings: { baseline: number; theme: ThemeChoice }
  today: { date: string; checkIn: CheckInLevel | null; plan: PlanItem[]; moved: MovedItem[] }
  history: DayLog[]
}

const STORAGE_KEY = 'ember:v1'
const HISTORY_LIMIT = 60

function freshToday(date = todayIso()): State['today'] {
  return { date, checkIn: null, plan: [], moved: [] }
}

export const initialState: State = {
  version: 1,
  onboarded: false,
  sample: false,
  settings: { baseline: 12, theme: 'system' },
  today: freshToday(),
  history: [],
}

type Action =
  | { type: 'start'; sample: boolean; baseline: number }
  | { type: 'checkIn'; level: CheckInLevel | null }
  | { type: 'add'; items: PlanItem[] }
  | { type: 'update'; item: PlanItem }
  | { type: 'remove'; id: string }
  | { type: 'setPlan'; plan: PlanItem[]; moved?: MovedItem }
  | { type: 'restoreMoved'; id: string }
  | { type: 'clearPlan' }
  | { type: 'baseline'; value: number }
  | { type: 'theme'; value: ThemeChoice }
  | { type: 'loadSample' }
  | { type: 'reset' }
  | { type: 'rollover'; date: string }

/** Moves a finished day into history and opens a new one, bringing moved items along. */
export function rollover(state: State, date: string): State {
  if (state.today.date === date) return state
  const t = state.today
  const history = [...state.history]
  if (t.checkIn != null || t.plan.length > 0) {
    const envelope =
      t.checkIn != null
        ? envelopeFromCheckIn(t.checkIn, state.settings.baseline)
        : todayEnvelope({ today: t.date, baseline: state.settings.baseline, todayEnvelope: null, history, pattern: DEFAULT_PATTERN })
    history.push({
      date: t.date,
      checkIn: t.checkIn ?? 3,
      envelope,
      spent: Math.max(0, planCost(t.plan)),
      items: t.plan.map((p) => p.name),
    })
  }
  const arriving = t.moved.filter((m) => m.toDate === date)
  const stillMoved = t.moved.filter((m) => daysBetween(date, m.toDate) > 0)
  return {
    ...state,
    history: history.slice(-HISTORY_LIMIT),
    today: { ...freshToday(date), plan: arriving.map(({ toDate: _toDate, ...p }) => p), moved: stillMoved },
  }
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'start':
      return {
        ...initialState,
        onboarded: true,
        sample: action.sample,
        settings: { ...state.settings, baseline: action.baseline },
        today: freshToday(),
        history: action.sample ? generateSampleHistory(todayIso(), action.baseline) : [],
      }
    case 'checkIn':
      return { ...state, today: { ...state.today, checkIn: action.level } }
    case 'add':
      return { ...state, today: { ...state.today, plan: [...state.today.plan, ...action.items] } }
    case 'update':
      return { ...state, today: { ...state.today, plan: state.today.plan.map((p) => (p.id === action.item.id ? action.item : p)) } }
    case 'remove':
      return { ...state, today: { ...state.today, plan: state.today.plan.filter((p) => p.id !== action.id) } }
    case 'setPlan':
      return {
        ...state,
        today: {
          ...state.today,
          plan: action.plan,
          moved: action.moved ? [...state.today.moved, action.moved] : state.today.moved,
        },
      }
    case 'restoreMoved': {
      const item = state.today.moved.find((m) => m.id === action.id)
      if (!item) return state
      const { toDate: _toDate, ...plain } = item
      return {
        ...state,
        today: { ...state.today, plan: [...state.today.plan, plain], moved: state.today.moved.filter((m) => m.id !== action.id) },
      }
    }
    case 'clearPlan':
      return { ...state, today: { ...state.today, plan: [], moved: [] } }
    case 'baseline':
      return { ...state, settings: { ...state.settings, baseline: action.value } }
    case 'theme':
      return { ...state, settings: { ...state.settings, theme: action.value } }
    case 'loadSample':
      return { ...state, onboarded: true, sample: true, history: generateSampleHistory(todayIso(), state.settings.baseline) }
    case 'reset':
      return { ...initialState, settings: { ...initialState.settings, theme: state.settings.theme }, today: freshToday() }
    case 'rollover':
      return rollover(state, action.date)
  }
}

function load(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialState
    const parsed = JSON.parse(raw) as State
    if (parsed?.version !== 1 || !parsed.today || !Array.isArray(parsed.history)) return initialState
    return rollover(parsed, todayIso())
  } catch {
    return initialState
  }
}

interface Store {
  state: State
  dispatch: (a: Action) => void
  pattern: Pattern
  envelope: number
  spent: number
}

const StoreContext = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Storage can be unavailable (private mode). Ember keeps working for the session.
    }
  }, [state])

  const checkDate = useCallback(() => dispatch({ type: 'rollover', date: todayIso() }), [])
  useEffect(() => {
    window.addEventListener('focus', checkDate)
    const t = window.setInterval(checkDate, 60_000)
    return () => {
      window.removeEventListener('focus', checkDate)
      window.clearInterval(t)
    }
  }, [checkDate])

  const pattern = useMemo(() => fitPattern(state.history, state.settings.baseline), [state.history, state.settings.baseline])

  const envelope = useMemo(
    () =>
      todayEnvelope({
        today: state.today.date,
        baseline: state.settings.baseline,
        todayEnvelope: state.today.checkIn != null ? envelopeFromCheckIn(state.today.checkIn, state.settings.baseline) : null,
        history: state.history,
        pattern,
      }),
    [state.today.date, state.today.checkIn, state.settings.baseline, state.history, pattern],
  )

  const spent = planCost(state.today.plan)

  const value = useMemo(() => ({ state, dispatch, pattern, envelope, spent }), [state, pattern, envelope, spent])
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): Store {
  const s = useContext(StoreContext)
  if (!s) throw new Error('useStore must be used inside StoreProvider')
  return s
}
