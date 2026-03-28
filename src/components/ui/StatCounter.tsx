"use client"

import { useEffect, useRef, useState } from "react"

interface StatCounterProps {
  value: number
  label: string
  suffix?: string
  /** Utilisé sur fond sombre — libellé en blanc */
  dark?: boolean
}

export default function StatCounter({ value, label, suffix = "", dark = false }: StatCounterProps) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const hasStarted = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasStarted.current) return

        hasStarted.current = true
        observer.disconnect()

        const DURATION = 2000
        const STEPS = 60
        const increment = value / STEPS
        const intervalMs = DURATION / STEPS

        let current = 0
        const timer = setInterval(() => {
          current += increment
          if (current >= value) {
            setCount(value)
            clearInterval(timer)
          } else {
            setCount(Math.floor(current))
          }
        }, intervalMs)
      },
      { threshold: 0.1 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [value])

  return (
    <div ref={ref} className="text-center">
      <p
        className="font-[family-name:var(--font-playfair)] text-5xl font-bold lg:text-6xl"
        style={{ color: dark ? "#f07a45" : "var(--azae-orange)" }}
      >
        {count.toLocaleString("fr-FR")}
        {suffix}
      </p>
      <p
        className="mt-2 text-base font-semibold uppercase tracking-wide"
        style={{ color: dark ? "rgba(255,255,255,0.85)" : "var(--azae-navy)" }}
      >
        {label}
      </p>
    </div>
  )
}
