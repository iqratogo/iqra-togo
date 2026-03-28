"use client"

import { motion } from "framer-motion"
import Image from "next/image"

interface Partner {
  id: string
  name: string
  logoUrl?: string | null
  websiteUrl?: string | null
}

interface PartnersCarouselProps {
  partners: Partner[]
}

const PLACEHOLDER_PARTNERS = [
  { id: "p1", name: "Partenaire 1" },
  { id: "p2", name: "Partenaire 2" },
  { id: "p3", name: "Partenaire 3" },
  { id: "p4", name: "Partenaire 4" },
  { id: "p5", name: "Partenaire 5" },
  { id: "p6", name: "Partenaire 6" },
]

export default function PartnersCarousel({ partners }: PartnersCarouselProps) {
  const items = partners.length > 0 ? partners : PLACEHOLDER_PARTNERS
  // Duplicate for seamless loop
  const loop = [...items, ...items]

  return (
    <div className="relative overflow-hidden">
      {/* Fade masks */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent" />

      <motion.div
        className="flex items-center gap-12"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          duration: 20,
          ease: "linear",
          repeat: Infinity,
        }}
      >
        {loop.map((partner, i) => (
          <PartnerLogo key={`${partner.id}-${i}`} partner={partner} />
        ))}
      </motion.div>
    </div>
  )
}

function PartnerLogo({ partner }: { partner: Partner }) {
  const content = partner.logoUrl ? (
    <Image
      src={partner.logoUrl}
      alt={partner.name}
      width={120}
      height={48}
      style={{ width: "auto", height: "48px" }}
      className="object-contain transition-all duration-300"
    />
  ) : (
    <span className="whitespace-nowrap text-sm font-semibold text-gray-300 transition-colors group-hover:text-[var(--azae-orange)]">
      {partner.name}
    </span>
  )

  if (partner.websiteUrl) {
    return (
      <a
        href={partner.websiteUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex shrink-0 items-center justify-center px-4"
        aria-label={partner.name}
      >
        {content}
      </a>
    )
  }

  return (
    <div className="group flex shrink-0 items-center justify-center px-4">
      {content}
    </div>
  )
}
