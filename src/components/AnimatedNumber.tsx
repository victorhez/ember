import { useEffect, useRef } from 'react'
import { animate, useReducedMotion } from 'motion/react'

function format(n: number, decimals: number) {
  const v = Math.round(n * 10 ** decimals) / 10 ** decimals
  if (decimals === 0 || Number.isInteger(v)) return String(Math.round(v))
  return v.toFixed(decimals)
}

/** A number that eases between values instead of jumping. */
export function AnimatedNumber({ value, decimals = 1, className }: { value: number; decimals?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const prev = useRef(value)
  const reduced = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (reduced) {
      el.textContent = format(value, decimals)
      prev.current = value
      return
    }
    const controls = animate(prev.current, value, {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        el.textContent = format(v, decimals)
      },
    })
    prev.current = value
    return () => controls.stop()
  }, [value, decimals, reduced])

  return (
    <span ref={ref} className={className}>
      {format(value, decimals)}
    </span>
  )
}
