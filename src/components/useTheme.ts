import { useEffect, useState } from 'react'
import type { ThemeChoice } from '../state/store'

const query = '(prefers-color-scheme: light)'

export function useResolvedTheme(choice: ThemeChoice): 'night' | 'day' {
  const [prefersDay, setPrefersDay] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches)

  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = () => setPrefersDay(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  if (choice === 'system') return prefersDay ? 'day' : 'night'
  return choice
}
