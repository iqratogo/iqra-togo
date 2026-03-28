/* §5.4.3 Partenaires (/actualites/partenaires) — grille partenaires */

import type { Metadata } from "next"
import Link from "next/link"
import { ChevronRight, ExternalLink, Mail } from "lucide-react"
import { prisma } from "@/lib/db/prisma"
import SectionHeader from "@/components/ui/SectionHeader"

export const metadata: Metadata = {
  title: "Partenaires — Azaetogo",
  description:
    "Découvrez les organisations partenaires de l'ONG Azaetogo : partenaires financiers, institutionnels et techniques.",
}

const TYPE_LABELS: Record<string, string> = {
  FINANCIER: "Partenaire financier",
  INSTITUTIONNEL: "Partenaire institutionnel",
  TECHNIQUE: "Partenaire technique",
}

const TYPE_COLORS: Record<string, string> = {
  FINANCIER: "#E8591A",
  INSTITUTIONNEL: "#1A2B4A",
  TECHNIQUE: "#2E7D5E",
}

export default async function PartenairesPage() {
  const results = await Promise.all([
    prisma.partner.findMany({ where: { isActive: true, type: "FINANCIER" }, orderBy: { displayOrder: "asc" } }),
    prisma.partner.findMany({ where: { isActive: true, type: "INSTITUTIONNEL" }, orderBy: { displayOrder: "asc" } }),
    prisma.partner.findMany({ where: { isActive: true, type: "TECHNIQUE" }, orderBy: { displayOrder: "asc" } }),
  ]).catch(() => [[] as Awaited<ReturnType<typeof prisma.partner.findMany>>, [] as Awaited<ReturnType<typeof prisma.partner.findMany>>, [] as Awaited<ReturnType<typeof prisma.partner.findMany>>])
  const [financiers, institutionnels, techniques] = results

  const groups = [
    { label: "Partenaires Financiers", type: "FINANCIER", partners: financiers },
    { label: "Partenaires Institutionnels", type: "INSTITUTIONNEL", partners: institutionnels },
    { label: "Partenaires Techniques", type: "TECHNIQUE", partners: techniques },
  ]

  return (
    <>
      {/* Hero */}
      <section
        className="py-20 text-white"
        style={{
          background: "linear-gradient(135deg, var(--azae-navy) 0%, var(--azae-navy-light) 100%)",
        }}
      >
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <nav aria-label="Fil d'Ariane" className="mb-6">
            <ol className="flex items-center gap-1.5 text-xs text-white/60">
              <li><Link href="/" className="hover:text-white">Accueil</Link></li>
              <li><ChevronRight className="h-3 w-3" /></li>
              <li><Link href="/actualites" className="hover:text-white">Actualités</Link></li>
              <li><ChevronRight className="h-3 w-3" /></li>
              <li className="text-white" aria-current="page">Partenaires</li>
            </ol>
          </nav>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-bold text-white lg:text-5xl">
            Nos Partenaires
          </h1>
          <p className="mt-4 max-w-xl text-white/80">
            Nos actions sont rendues possibles grâce au soutien de partenaires engagés à nos côtés.
          </p>
        </div>
      </section>

      {/* Grille partenaires §5.4.3 — organisée par type */}
      <section className="bg-[#F5F5F5] py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 space-y-16">
          {groups.map(({ label, type, partners }) => {
            if (partners.length === 0) return null
            return (
              <div key={type}>
                <div className="mb-8 flex items-center gap-3">
                  <span
                    className="h-1 w-8 rounded-full"
                    style={{ backgroundColor: TYPE_COLORS[type] }}
                    aria-hidden="true"
                  />
                  <h2
                    className="font-[family-name:var(--font-playfair)] text-2xl font-bold"
                    style={{ color: "var(--azae-navy)" }}
                  >
                    {label}
                  </h2>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {partners.map((partner) => (
                    <article
                      key={partner.id}
                      className="rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                    >
                      {/* Logo + nom §5.4.3 */}
                      <div className="mb-4 flex items-center gap-4">
                        {partner.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={partner.logoUrl}
                            alt={`Logo ${partner.name}`}
                            className="h-14 w-auto max-w-[100px] object-contain"
                          />
                        ) : (
                          <div
                            className="flex h-14 w-14 items-center justify-center rounded-xl text-lg font-bold text-white"
                            style={{ backgroundColor: TYPE_COLORS[type] }}
                          >
                            {partner.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h3
                            className="font-[family-name:var(--font-playfair)] font-bold"
                            style={{ color: "var(--azae-navy)" }}
                          >
                            {partner.name}
                          </h3>
                          {/* Type §5.4.3 */}
                          <span
                            className="inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white"
                            style={{ backgroundColor: TYPE_COLORS[type] }}
                          >
                            {TYPE_LABELS[type]}
                          </span>
                        </div>
                      </div>

                      {/* Description §5.4.3 */}
                      {partner.description && (
                        <p className="line-clamp-3 text-sm text-gray-500 leading-relaxed">
                          {partner.description}
                        </p>
                      )}

                      {/* Lien site web §5.4.3 */}
                      {partner.websiteUrl && (
                        <a
                          href={partner.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
                          style={{ color: "var(--azae-orange)" }}
                        >
                          Visiter le site <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </article>
                  ))}
                </div>
              </div>
            )
          })}

          {groups.every((g) => g.partners.length === 0) && (
            <div className="rounded-xl bg-white py-16 text-center shadow-sm">
              <SectionHeader
                title="Aucun partenaire affiché"
                subtitle="Nos partenaires seront bientôt listés ici."
                centered
              />
            </div>
          )}
        </div>
      </section>

      {/* §5.4.3 — Section "Devenir partenaire" avec formulaire de contact dédié */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-3xl px-4 text-center lg:px-8">
          <SectionHeader
            eyebrow="Partenariat"
            title="Devenez partenaire d'Azaetogo"
            subtitle="Vous souhaitez soutenir notre mission ? Rejoignez notre réseau de partenaires engagés et contribuez à un impact durable au Togo."
            centered
          />
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/contact?sujet=Partenariat"
              className="flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white transition-colors"
              style={{ backgroundColor: "var(--azae-orange)" }}
            >
              <Mail className="h-4 w-4" />
              Nous contacter pour un partenariat
            </Link>
            <Link
              href="/a-propos"
              className="rounded-lg border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-[var(--azae-orange)] hover:text-[var(--azae-orange)]"
            >
              En savoir plus sur l'ONG
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
