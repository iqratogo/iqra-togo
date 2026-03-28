"use client"

/* §5.1.5 Section Témoignages — carrousel autoplay 5s, dots + flèches */

import { useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight, Quote } from "lucide-react"
import { cn } from "@/lib/utils"

interface Testimonial {
  id: number
  name: string
  role: string
  location: string
  quote: string
  initials: string
  color: string
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: "Ama Kodjovi",
    role: "Bénéficiaire — Bourse éducation",
    location: "Lomé, Togo",
    quote:
      "Grâce à Azaetogo, j'ai pu financer mes études de droit à l'université de Lomé. Sans leur soutien, ma famille n'en aurait jamais eu les moyens. Aujourd'hui, je suis avocate et je veux à mon tour aider les autres.",
    initials: "AK",
    color: "#E8591A",
  },
  {
    id: 2,
    name: "Koffi Mensah",
    role: "Parent bénéficiaire",
    location: "Kpalimé, Togo",
    quote:
      "Mon fils avait abandonné l'école faute de moyens. L'association nous a contactés et a pris en charge tous ses frais de scolarité. Il vient de terminer son baccalauréat avec mention. C'est un miracle pour notre famille.",
    initials: "KM",
    color: "#1A2B4A",
  },
  {
    id: 3,
    name: "Efua Asante",
    role: "Étudiante en médecine",
    location: "Sokodé, Togo",
    quote:
      "Le programme de soutien d'Azaetogo m'a permis de suivre mes études de médecine sans interruption. Leur accompagnement va bien au-delà du financier : ils croient en nous et cela fait toute la différence.",
    initials: "EA",
    color: "#2E7D5E",
  },
  {
    id: 4,
    name: "Yawa Agbeko",
    role: "Mère de famille",
    location: "Atakpamé, Togo",
    quote:
      "L'aide alimentaire et le soutien médical d'Azaetogo nous ont sauvé la vie lors d'une période très difficile. Cette organisation incarne la solidarité vraie, celle qui ne demande rien en retour.",
    initials: "YA",
    color: "#E8591A",
  },
  {
    id: 5,
    name: "Kossi Dodzi",
    role: "Jeune entrepreneur",
    location: "Tsévié, Togo",
    quote:
      "La formation professionnelle que j'ai suivie grâce à Azaetogo m'a permis de lancer ma propre activité. Trois ans après, j'emploie quatre personnes de mon quartier. L'espoir, ça se transmet.",
    initials: "KD",
    color: "#1A2B4A",
  },
]

export default function TestimonialsCarousel() {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  const next = useCallback(() => {
    setActive((i) => (i + 1) % TESTIMONIALS.length)
  }, [])

  const prev = useCallback(() => {
    setActive((i) => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)
  }, [])

  /* Autoplay 5s — §5.1.5 */
  useEffect(() => {
    if (paused) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [paused, next])

  const current = TESTIMONIALS[active]

  return (
    <section className="bg-[#F5F5F5] py-20">
      <div className="mx-auto max-w-4xl px-4 lg:px-8">
        {/* En-tête */}
        <div className="mb-12 text-center">
          <p
            className="mb-2 text-xs font-semibold uppercase tracking-[0.15em]"
            style={{ color: "var(--azae-orange)" }}
          >
            Témoignages
          </p>
          <h2
            className="font-[family-name:var(--font-playfair)] text-3xl font-bold lg:text-4xl"
            style={{ color: "var(--azae-navy)" }}
          >
            Ils ont changé grâce à vous
          </h2>
        </div>

        {/* Card témoignage */}
        <div
          className="relative rounded-2xl bg-white p-8 shadow-sm lg:p-12"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          aria-live="polite"
          aria-atomic="true"
        >
          {/* Icône quote */}
          <Quote
            className="absolute right-8 top-8 h-10 w-10 opacity-10"
            style={{ color: "var(--azae-orange)" }}
            aria-hidden="true"
          />

          {/* Citation */}
          <blockquote className="mb-8 text-center text-base leading-relaxed text-gray-600 italic lg:text-lg">
            &ldquo;{current.quote}&rdquo;
          </blockquote>

          {/* Auteur */}
          <div className="flex flex-col items-center gap-3">
            {/* Avatar initiales */}
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-white"
              style={{ backgroundColor: current.color }}
              aria-hidden="true"
            >
              {current.initials}
            </div>
            <div className="text-center">
              <p
                className="font-[family-name:var(--font-playfair)] font-bold"
                style={{ color: "var(--azae-navy)" }}
              >
                {current.name}
              </p>
              <p className="text-sm text-gray-500">{current.role}</p>
              <p className="text-xs text-gray-400">{current.location}</p>
            </div>
          </div>

          {/* Flèches navigation */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={prev}
              aria-label="Témoignage précédent"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-400 transition-colors hover:border-[var(--azae-orange)] hover:text-[var(--azae-orange)]"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Dots */}
            <div className="flex gap-2" role="tablist" aria-label="Navigation témoignages">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  role="tab"
                  aria-selected={i === active}
                  aria-label={`Témoignage ${i + 1}`}
                  onClick={() => setActive(i)}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    i === active ? "w-6 bg-[var(--azae-orange)]" : "w-2 bg-gray-300"
                  )}
                />
              ))}
            </div>

            <button
              onClick={next}
              aria-label="Témoignage suivant"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-400 transition-colors hover:border-[var(--azae-orange)] hover:text-[var(--azae-orange)]"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
