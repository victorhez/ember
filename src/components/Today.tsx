import { useEffect, useMemo, useRef } from 'react'
import { useStore } from '../state/store'
import { envelopeFromCheckIn, explain, projectDays, type ForecastInput } from '../model/forecast'
import { suggestSwaps } from '../model/swaps'
import { weekday } from '../model/dates'
import { EnergyHero } from './EnergyHero'
import { PlanBuilder } from './PlanBuilder'
import { Forecast } from './Forecast'
import { Swaps } from './Swaps'

export function dayName(today: string) {
  return (iso: string) => {
    if (iso === today) return 'today'
    return weekday(iso, 'long')
  }
}

export function Today({ onOpenPattern }: { onOpenPattern: () => void }) {
  const { state, pattern } = useStore()
  const { today, settings, history } = state

  const input: ForecastInput = useMemo(
    () => ({
      today: today.date,
      baseline: settings.baseline,
      todayEnvelope: today.checkIn != null ? envelopeFromCheckIn(today.checkIn, settings.baseline) : null,
      plan: today.plan,
      history,
      pattern,
    }),
    [today.date, today.checkIn, today.plan, settings.baseline, history, pattern],
  )

  const days = useMemo(() => projectDays(input), [input])
  const explanation = useMemo(() => explain(input, days, dayName(today.date)), [input, days, today.date])
  const swaps = useMemo(() => suggestSwaps(input), [input])

  // Keep the forecast in view while planning. If the column is taller than the
  // window, it sticks by its bottom edge instead so nothing is ever cut off.
  const rightCol = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = rightCol.current
    if (!el) return
    const update = () => {
      const top = Math.min(96, window.innerHeight - el.offsetHeight - 24)
      el.style.setProperty('--stick-top', `${top}px`)
    }
    const ro = new ResizeObserver(update)
    ro.observe(el)
    window.addEventListener('resize', update)
    update()
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <div className="today">
      <div className="col col-left">
        <EnergyHero />
        <PlanBuilder />
      </div>
      <div className="col col-right" ref={rightCol}>
        <Forecast days={days} explanation={explanation} onOpenPattern={onOpenPattern} />
        <Swaps swaps={swaps} days={days} />
      </div>
    </div>
  )
}
