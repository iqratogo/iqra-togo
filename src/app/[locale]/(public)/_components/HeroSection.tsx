"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface HeroSectionProps {
  badge: string
  title: string
  subtitle: string
  donateBtnLabel: string
  discoverBtnLabel: string
  statLabels: { families: string; members: string; projectsDone: string }
}

const EASE = [0.25, 0.1, 0.25, 1] as const

function fadeUp(delay: number, mounted: boolean) {
  /* Le texte reste visible (opacity:1) jusqu'à la montée côté client,
     évite l'écran blanc pendant l'hydratation React 19. */
  return {
    initial: mounted ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.55, ease: EASE, delay },
  }
}

export default function HeroSection({
  badge,
  title,
  subtitle,
  donateBtnLabel,
  discoverBtnLabel,
  statLabels,
}: HeroSectionProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const STATS = [
    { value: "1 200+", label: statLabels.families },
    { value: "450+", label: statLabels.members },
    { value: "15 ans", label: statLabels.projectsDone },
  ]

  return (
    <section className="relative flex min-h-screen flex-col">
      {/* Fond */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=1600&q=80')",
        }}
        aria-hidden="true"
      />
      {/* Overlay gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, rgba(26,43,74,0.85) 0%, rgba(26,43,74,0.45) 100%)",
        }}
        aria-hidden="true"
      />

      {/* Contenu */}
      <div className="relative z-10 mx-auto flex max-w-7xl flex-1 flex-col justify-center px-4 py-24 lg:px-8">
        <div className="max-w-3xl">
          <motion.p
            {...fadeUp(0, mounted)}
            className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-green-300"
          >
            {badge}
          </motion.p>

          <motion.h1
            {...fadeUp(0.15, mounted)}
            className="font-[family-name:var(--font-playfair)] text-4xl font-bold leading-tight text-white lg:text-6xl"
          >
            {title}
          </motion.h1>

          <motion.p
            {...fadeUp(0.3, mounted)}
            className="mt-6 max-w-xl text-base leading-relaxed text-white/80 lg:text-lg"
          >
            {subtitle}
          </motion.p>

          <motion.div
            {...fadeUp(0.45, mounted)}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link
              href="/dons"
              className="rounded-lg px-6 py-3 text-sm font-semibold text-white transition-colors"
              style={{ backgroundColor: "var(--azae-orange)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "var(--azae-orange-dark)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "var(--azae-orange)")
              }
            >
              {donateBtnLabel}
            </Link>
            <Link
              href="/a-propos"
              className="rounded-lg border border-white/60 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              {discoverBtnLabel}
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Bande statistiques */}
      <div className="relative z-10 bg-white/10 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <motion.div
            {...fadeUp(0.6, mounted)}
            className="grid grid-cols-3 divide-x divide-white/20"
          >
            {STATS.map(({ value, label }) => (
              <div key={value} className="px-4 py-5 text-center sm:px-8">
                <p className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-white sm:text-3xl">
                  {value}
                </p>
                <p className="mt-1 text-xs text-white/70">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
