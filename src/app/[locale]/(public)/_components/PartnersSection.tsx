/* P1 — Async server component : section "Partenaires" avec ses propres données */

import { prisma } from "@/lib/db/prisma"
import PartnersCarousel from "./PartnersCarousel"

type PartnerMin = { id: string; name: string; logoUrl: string | null; websiteUrl: string | null }

async function getPartners(): Promise<PartnerMin[]> {
  try {
    const rows = await prisma.partner.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
      select: { id: true, name: true, logoUrl: true, websiteUrl: true },
    })
    return rows as PartnerMin[]
  } catch {
    return []
  }
}

export default async function PartnersSection() {
  const partners = await getPartners()

  if (partners.length === 0) return null

  return (
    <section className="border-t border-gray-100 bg-white py-14">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <p
          className="mb-8 text-center text-xs font-semibold uppercase tracking-[0.15em]"
          style={{ color: "var(--azae-orange)" }}
        >
          Ils nous font confiance
        </p>
        <PartnersCarousel partners={partners} />
      </div>
    </section>
  )
}

export function PartnersSkeleton() {
  return (
    <section className="border-t border-gray-100 bg-white py-14">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex justify-center gap-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 w-24 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </div>
      </div>
    </section>
  )
}
