/* §5.4 Hub Actualités — page principale /actualites */

import Link from "next/link"
import { ChevronRight, ArrowRight, FolderOpen, FileText, Handshake } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { prisma } from "@/lib/db/prisma"
import PostCard, { type Post } from "@/components/ui/PostCard"
import SectionHeader from "@/components/ui/SectionHeader"

export const revalidate = 300

export async function generateMetadata() {
  const t = await getTranslations("pages.news")
  return {
    title: `${t("title")} — IQRA TOGO`,
    description: t("subtitle"),
  }
}

async function getLatestByCategory(category: "PROJET" | "COMMUNIQUE", take = 3): Promise<Post[]> {
  try {
    const rows = await prisma.post.findMany({
      where: { status: "PUBLISHED", category },
      orderBy: { publishedAt: "desc" },
      take,
      select: {
        id: true, title: true, slug: true, excerpt: true,
        category: true, featuredImage: true, publishedAt: true,
        author: { select: { name: true } },
      },
    })
    return rows as Post[]
  } catch { return [] }
}

type PartnerItem = { id: string; name: string; logoUrl: string | null; type: string; description: string | null }

async function getLatestPartners(take = 6): Promise<PartnerItem[]> {
  try {
    const rows = await prisma.partner.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
      take,
      select: { id: true, name: true, logoUrl: true, type: true, description: true },
    })
    return rows as PartnerItem[]
  } catch { return [] }
}

export default async function ActualitesPage() {
  const [projects, communiques, partners, t, tNav] = await Promise.all([
    getLatestByCategory("PROJET", 3),
    getLatestByCategory("COMMUNIQUE", 3),
    getLatestPartners(6),
    getTranslations("pages.news"),
    getTranslations("nav"),
  ])

  const SECTIONS = [
    {
      href: "/actualites/projets",
      label: t("section_projects_label"),
      description: t("section_projects_desc"),
      icon: FolderOpen,
      color: "var(--azae-orange)",
    },
    {
      href: "/actualites/communiques",
      label: t("section_communiques_label"),
      description: t("section_communiques_desc"),
      icon: FileText,
      color: "var(--azae-navy)",
    },
    {
      href: "/actualites/partenaires",
      label: t("section_partners_label"),
      description: t("section_partners_desc"),
      icon: Handshake,
      color: "var(--azae-green)",
    },
  ]

  const PARTNER_TYPE_LABELS: Record<string, string> = {
    FINANCIER: t("partner_financial"),
    INSTITUTIONNEL: t("partner_institutional"),
    TECHNIQUE: t("partner_technical"),
  }

  return (
    <>
      {/* Hero */}
      <section
        className="relative py-20 text-white"
        style={{
          background: "linear-gradient(135deg, var(--azae-navy) 0%, var(--azae-navy-light) 100%)",
        }}
      >
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <nav aria-label="Fil d'Ariane" className="mb-6">
            <ol className="flex items-center gap-1.5 text-xs text-white/60">
              <li><Link href="/" className="transition-colors hover:text-white">{tNav("home")}</Link></li>
              <li aria-hidden="true"><ChevronRight className="h-3 w-3" /></li>
              <li className="text-white" aria-current="page">{t("title")}</li>
            </ol>
          </nav>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-bold text-white lg:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-4 max-w-xl text-white/80">
            {t("subtitle")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {SECTIONS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2 rounded-full border border-white/30 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Sous-sections rapides */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            {SECTIONS.map(({ href, label, description, icon: Icon, color }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-start gap-4 rounded-xl border border-gray-100 p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: color, opacity: 0.9 }}
                >
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p
                    className="font-[family-name:var(--font-playfair)] font-bold transition-colors group-hover:text-[var(--azae-orange)]"
                    style={{ color: "var(--azae-navy)" }}
                  >
                    {label}
                  </p>
                  <p className="mt-0.5 text-sm text-gray-500">{description}</p>
                </div>
                <ArrowRight className="ml-auto h-4 w-4 flex-shrink-0 self-center text-gray-300 transition-colors group-hover:text-[var(--azae-orange)]" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Derniers projets */}
      <section className="bg-[#F5F5F5] py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <SectionHeader eyebrow={t("projects_eyebrow")} title={t("projects_section")} />
            <Link
              href="/actualites/projets"
              className="flex shrink-0 items-center gap-1 text-sm font-medium"
              style={{ color: "var(--azae-orange)" }}
            >
              {t("see_projects")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {projects.length > 0 ? (
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((p) => <PostCard key={p.id} post={p} variant="default" />)}
            </div>
          ) : (
            <p className="mt-10 text-center text-gray-400">{t("no_project")}</p>
          )}
        </div>
      </section>

      {/* Derniers communiqués */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <SectionHeader eyebrow={t("communiques_eyebrow")} title={t("communiques_section")} />
            <Link
              href="/actualites/communiques"
              className="flex shrink-0 items-center gap-1 text-sm font-medium"
              style={{ color: "var(--azae-orange)" }}
            >
              {t("see_communiques")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {communiques.length > 0 ? (
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {communiques.map((p) => <PostCard key={p.id} post={p} variant="default" />)}
            </div>
          ) : (
            <p className="mt-10 text-center text-gray-400">{t("no_communique")}</p>
          )}
        </div>
      </section>

      {/* Partenaires */}
      {partners.length > 0 && (
        <section className="bg-[#F5F5F5] py-16">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
              <SectionHeader eyebrow={t("partners_eyebrow")} title={t("partners_section")} />
              <Link
                href="/actualites/partenaires"
                className="flex shrink-0 items-center gap-1 text-sm font-medium"
                style={{ color: "var(--azae-orange)" }}
              >
                {t("see_partners")} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {partners.map((partner) => (
                <div
                  key={partner.id}
                  className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    {partner.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={partner.logoUrl}
                        alt={partner.name}
                        className="h-10 w-auto max-w-[80px] object-contain grayscale"
                      />
                    ) : (
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-xs font-bold text-white"
                        style={{ backgroundColor: "var(--azae-navy)" }}
                      >
                        {partner.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-sm" style={{ color: "var(--azae-navy)" }}>
                        {partner.name}
                      </p>
                      <span className="text-xs text-gray-400">
                        {PARTNER_TYPE_LABELS[partner.type] ?? partner.type}
                      </span>
                    </div>
                  </div>
                  {partner.description && (
                    <p className="mt-3 line-clamp-2 text-sm text-gray-500">
                      {partner.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
