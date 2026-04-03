/* §5.6 Page Don (/dons) — collecte optimisée pour la conversion */

import Link from "next/link"
import { ChevronRight, Shield, Heart, PieChart } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { prisma } from "@/lib/db/prisma"
import DonationWidget from "@/components/ui/DonationWidget"

export const revalidate = 300

export async function generateMetadata() {
  const t = await getTranslations("pages.donate")
  return {
    title: `${t("title")} — IQRA TOGO`,
    description: t("subtitle"),
  }
}

type DonorMin = { donorFirstName: string | null; amount: number; affectation: string | null; createdAt: Date }

async function getRecentDonors(): Promise<DonorMin[]> {
  try {
    const rows = await prisma.donation.findMany({
      where: { status: "SUCCESS", isAnonymous: false },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { donorFirstName: true, amount: true, affectation: true, createdAt: true },
    })
    return rows as DonorMin[]
  } catch { return [] }
}

async function getDonationStats() {
  try {
    const result = await prisma.donation.aggregate({
      where: { status: "SUCCESS" },
      _sum: { amount: true },
      _count: true,
    })
    return { total: result._sum.amount ?? 0, count: result._count }
  } catch { return { total: 0, count: 0 } }
}

export default async function DonsPage() {
  const [recentDonors, stats, t, tNav] = await Promise.all([
    getRecentDonors(),
    getDonationStats(),
    getTranslations("pages.donate"),
    getTranslations("nav"),
  ])

  const ALLOCATION = [
    { label: t("alloc_education"), pct: 40, color: "#22c55e" },
    { label: t("alloc_families"), pct: 30, color: "#1A2B4A" },
    { label: t("alloc_projects"), pct: 20, color: "#2E7D5E" },
    { label: t("alloc_operating"), pct: 10, color: "#6B7280" },
  ]

  const BULLETS = [
    { icon: Shield, text: t("bullet1") },
    { icon: Heart, text: t("bullet2") },
    { icon: PieChart, text: t("bullet3") },
  ]

  return (
    <>
      {/* §5.6.1 En-tête Impact */}
      <section
        className="relative py-20 text-white"
        style={{
          background: "linear-gradient(135deg, var(--azae-navy) 0%, var(--azae-navy-light) 100%)",
        }}
      >
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <nav aria-label="Fil d'Ariane" className="mb-6">
            <ol className="flex items-center gap-1.5 text-xs text-white/60">
              <li><Link href="/" className="hover:text-white">{tNav("home")}</Link></li>
              <li><ChevronRight className="h-3 w-3" /></li>
              <li className="text-white" aria-current="page">{t("title")}</li>
            </ol>
          </nav>

          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <p
                className="mb-3 text-xs font-semibold uppercase tracking-widest"
                style={{ color: "var(--azae-orange)" }}
              >
                {t("eyebrow")}
              </p>
              <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-bold leading-tight lg:text-5xl">
                {t("hero_title")}
              </h1>
              <p className="mt-4 text-lg text-white/80">
                {t("hero_subtitle")}
              </p>

              <ul className="mt-6 space-y-2">
                {BULLETS.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-2.5 text-sm text-white/80">
                    <Icon
                      className="h-4 w-4 flex-shrink-0"
                      style={{ color: "var(--azae-orange)" }}
                    />
                    {text}
                  </li>
                ))}
              </ul>

              {stats.count > 0 && (
                <div className="mt-8 flex gap-8">
                  <div>
                    <p className="font-[family-name:var(--font-playfair)] text-3xl font-bold" style={{ color: "var(--azae-orange)" }}>
                      {stats.count}
                    </p>
                    <p className="text-xs text-white/60">{t("donors")}</p>
                  </div>
                  <div>
                    <p className="font-[family-name:var(--font-playfair)] text-3xl font-bold" style={{ color: "var(--azae-orange)" }}>
                      {stats.total.toLocaleString("fr-FR")}
                    </p>
                    <p className="text-xs text-white/60">{t("collected")}</p>
                  </div>
                </div>
              )}
            </div>

            {/* §5.6.2 Widget de Don */}
            <div className="rounded-2xl bg-white p-1">
              <DonationWidget />
            </div>
          </div>
        </div>
      </section>

      {/* §5.6.4 Transparence */}
      <section className="bg-[#F5F5F5] py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <h2
            className="mb-10 text-center font-[family-name:var(--font-playfair)] text-3xl font-bold"
            style={{ color: "var(--azae-navy)" }}
          >
            {t("allocation_title")}
          </h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {ALLOCATION.map(({ label, pct, color }) => (
              <div key={label} className="rounded-xl bg-white p-6 shadow-sm text-center">
                <div
                  className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white"
                  style={{ backgroundColor: color }}
                >
                  {pct}%
                </div>
                <p className="font-semibold" style={{ color: "var(--azae-navy)" }}>{label}</p>
              </div>
            ))}
          </div>

          {recentDonors.length > 0 && (
            <div className="mt-12">
              <h3
                className="mb-6 text-center font-[family-name:var(--font-playfair)] text-xl font-bold"
                style={{ color: "var(--azae-navy)" }}
              >
                {t("recent_donors")}
              </h3>
              <div className="flex flex-wrap justify-center gap-3">
                {recentDonors.map((donor, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm shadow-sm"
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: "var(--azae-green)" }}
                      aria-hidden="true"
                    />
                    <span className="font-medium" style={{ color: "var(--azae-navy)" }}>
                      {donor.donorFirstName}
                    </span>
                    <span className="text-gray-400">—</span>
                    <span style={{ color: "var(--azae-orange)" }}>
                      {donor.amount.toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-12 rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
            <p className="font-[family-name:var(--font-playfair)] text-lg font-bold" style={{ color: "var(--azae-navy)" }}>
              {t("reports_title")}
            </p>
            <p className="mt-2 text-sm text-gray-500">
              {t("reports_subtitle")}
            </p>
            <Link
              href="/medias"
              className="mt-4 inline-block rounded-lg border border-gray-200 px-5 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-[var(--azae-orange)] hover:text-[var(--azae-orange)]"
            >
              {t("reports_link")}
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
