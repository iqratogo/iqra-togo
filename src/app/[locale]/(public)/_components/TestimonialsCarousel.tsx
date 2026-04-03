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
    role: "Bénéficiaire — Orientation scolaire",
    location: "Quartier Limamwa, Tchamba",
    quote:
      "Grâce à IQRA TOGO, j'ai été bien orientée vers la filière qui correspond vraiment à mes aptitudes. Aujourd'hui je prépare un master en informatique et je sais exactement pourquoi je travaille. Le savoir m'a libérée.",
    initials: "AK",
    color: "#22c55e",
  },
  {
    id: 2,
    name: "Koffi Mensah",
    role: "Tuteur d'un orphelin soutenu",
    location: "Kpalimé, Togo",
    quote:
      "Mon neveu orphelin allait abandonner l'école. IQRA TOGO a pris en charge ses fournitures et ses frais de scolarité. Il vient de terminer son baccalauréat avec mention. Sans eux, cela n'aurait jamais été possible.",
    initials: "KM",
    color: "#1A2B4A",
  },
  {
    id: 3,
    name: "Efua Asante",
    role: "Bénéficiaire — Renforcement de capacités",
    location: "Sokodé, Togo",
    quote:
      "La formation en gestion de projet que j'ai suivie avec IQRA TOGO a transformé ma façon de travailler. J'ai pu décrocher un emploi stable trois mois après. Leur devise, je la vis maintenant : le savoir, c'est vraiment la liberté.",
    initials: "EA",
    color: "#2E7D5E",
  },
  {
    id: 4,
    name: "Yawa Agbeko",
    role: "Mère d'un orphelin accompagné",
    location: "Atakpamé, Togo",
    quote:
      "IQRA TOGO a pris soin de mon fils après le décès de mon mari. Au-delà du soutien matériel, ils lui ont apporté un suivi scolaire régulier. Cette association incarne une solidarité vraie et généreuse.",
    initials: "YA",
    color: "#22c55e",
  },
  {
    id: 5,
    name: "Kossi Dodzi",
    role: "Jeune professionnel orienté",
    location: "Tsévié, Togo",
    quote:
      "Sans le programme d'orientation d'IQRA TOGO, j'aurais suivi une filière qui ne me correspondait pas. Leur accompagnement m'a aidé à trouver ma voie. Aujourd'hui j'exerce un métier que j'aime vraiment.",
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
            Le savoir les a libérés
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
