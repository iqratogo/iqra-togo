import Image from "next/image"
import Link from "next/link"
import { Users } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { prisma } from "@/lib/db/prisma"
import TeamGrid from "./_components/TeamGrid"

export const revalidate = 3600

export async function generateMetadata() {
  const t = await getTranslations("pages.team")
  return {
    title: `${t("title")} — IQRA TOGO`,
    description: t("subtitle"),
  }
}

async function getTeamMembers() {
  try {
    return await prisma.teamMember.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        position: true,
        department: true,
        bio: true,
        bioFull: true,
        photoUrl: true,
        email: true,
        facebookUrl: true,
        linkedinUrl: true,
        twitterUrl: true,
      },
    })
  } catch {
    return []
  }
}

export default async function TeamPage() {
  const [members, t, tNav] = await Promise.all([
    getTeamMembers(),
    getTranslations("pages.team"),
    getTranslations("nav"),
  ])

  return (
    <>
      {/* ══════════════════════════
          SECTION 1 — Hero
      ══════════════════════════ */}
      <section className="relative h-64 overflow-hidden lg:h-80">
        <Image
          src="https://images.unsplash.com/photo-1509099955921-f0b4ed0c175c?w=1600&q=80"
          alt="Équipe IQRA TOGO"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(26,43,74,0.75) 0%, rgba(26,43,74,0.45) 100%)",
          }}
        />
        <div className="relative z-10 flex h-full flex-col items-center justify-center gap-3 px-4 text-center">
          <nav aria-label="Fil d'Ariane" className="text-xs text-white/60">
            <ol className="flex items-center gap-1.5">
              <li>
                <Link href="/" className="hover:text-white">
                  {tNav("home")}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-white">{t("breadcrumb")}</li>
            </ol>
          </nav>
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-white lg:text-5xl">
            {t("title")}
          </h1>
          <p className="max-w-xl text-sm text-white/75">{t("subtitle")}</p>
        </div>
      </section>

      {/* ══════════════════════════
          SECTION 2 — Filtres + Grille
      ══════════════════════════ */}
      <section className="bg-[#F5F5F5] py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          {members.length > 0 ? (
            <TeamGrid members={members} />
          ) : (
            <div className="flex flex-col items-center gap-4 py-20 text-center">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full"
                style={{ backgroundColor: "rgba(34,197,94,0.1)" }}
              >
                <Users className="h-8 w-8" style={{ color: "var(--azae-orange)" }} />
              </div>
              <p className="text-gray-400">{t("empty")}</p>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════
          SECTION 3 — CTA bénévolat
      ══════════════════════════ */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-3xl px-4 text-center lg:px-8">
          <div
            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
            style={{ backgroundColor: "rgba(34,197,94,0.1)" }}
          >
            <Users className="h-6 w-6" style={{ color: "var(--azae-orange)" }} />
          </div>
          <h2
            className="font-[family-name:var(--font-playfair)] text-2xl font-bold lg:text-3xl"
            style={{ color: "var(--azae-navy)" }}
          >
            {t("join_title")}
          </h2>
          <p className="mt-3 text-gray-500">{t("join_subtitle")}</p>
          <Link
            href="/contact?sujet=benevolat"
            className="mt-6 inline-flex items-center rounded-lg px-6 py-3 text-sm font-semibold text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: "var(--azae-orange)" }}
          >
            {t("join_btn")}
          </Link>
        </div>
      </section>
    </>
  )
}
