import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  Mail,
  Phone,
  ChevronLeft,
  UserRound,
  ExternalLink,
} from "lucide-react"
import { getTranslations } from "next-intl/server"
import { prisma } from "@/lib/db/prisma"

export const revalidate = 3600

async function getMember(id: string) {
  try {
    return await prisma.teamMember.findUnique({
      where: { id, isActive: true },
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
        phone: true,
        facebookUrl: true,
        linkedinUrl: true,
        twitterUrl: true,
      },
    })
  } catch {
    return null
  }
}

const DEPT_LABELS: Record<string, string> = {
  DIRECTION: "Direction",
  PROGRAMMES: "Programmes",
  COMMUNICATION: "Communication",
  FINANCE: "Finance",
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const member = await getMember(id)
  if (!member) return {}
  return {
    title: `${member.firstName} ${member.lastName} — IQRA TOGO`,
    description: member.bio ?? `Membre de l'équipe IQRA TOGO — ${member.position}`,
  }
}

export default async function TeamMemberPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [member, t, tNav] = await Promise.all([
    getMember(id),
    getTranslations("pages.team"),
    getTranslations("nav"),
  ])
  if (!member) notFound()

  const bio = member.bioFull ?? member.bio

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* ── Hero banner ── */}
      <div
        className="py-10 text-white"
        style={{ backgroundColor: "var(--azae-navy)" }}
      >
        <div className="mx-auto max-w-4xl px-4 lg:px-8">
          <nav aria-label="Fil d'Ariane" className="mb-4">
            <ol className="flex items-center gap-1.5 text-xs text-white/60">
              <li><Link href="/" className="hover:text-white">{tNav("home")}</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link href="/equipe" className="hover:text-white">{t("title")}</Link></li>
              <li aria-hidden="true">/</li>
              <li className="text-white">{member.firstName} {member.lastName}</li>
            </ol>
          </nav>
          <Link
            href="/equipe"
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/30 px-3 py-1.5 text-xs font-medium text-white/80 transition-colors hover:border-white hover:text-white"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            {t("member.back")}
          </Link>
        </div>
      </div>

      {/* ── Contenu profil ── */}
      <div className="mx-auto max-w-4xl px-4 py-12 lg:px-8">
        <div className="grid gap-8 md:grid-cols-[300px_1fr]">

          {/* ── Colonne gauche : photo + contact ── */}
          <div className="space-y-6">
            {/* Photo */}
            <div className="overflow-hidden rounded-2xl shadow-md">
              <div className="relative w-full" style={{ paddingBottom: "125%" }}>
                {member.photoUrl ? (
                  <Image
                    src={member.photoUrl}
                    alt={`${member.firstName} ${member.lastName}`}
                    fill
                    className="object-cover object-top"
                    sizes="300px"
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <UserRound className="h-24 w-24 text-gray-300" />
                  </div>
                )}
              </div>
            </div>

            {/* Carte contact */}
            <div className="rounded-2xl bg-white p-5 shadow-sm space-y-3">
              <h3
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: "var(--azae-orange)" }}
              >
                {t("member.contact_label")}
              </h3>

              {member.email && (
                <a
                  href={`mailto:${member.email}`}
                  className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 text-sm text-gray-600 transition-colors hover:border-[var(--azae-orange)] hover:text-[var(--azae-orange)]"
                >
                  <Mail className="h-4 w-4 shrink-0" style={{ color: "var(--azae-orange)" }} />
                  <span className="truncate">{member.email}</span>
                </a>
              )}

              {member.phone && (
                <a
                  href={`tel:${member.phone}`}
                  className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 text-sm text-gray-600 transition-colors hover:border-[var(--azae-orange)] hover:text-[var(--azae-orange)]"
                >
                  <Phone className="h-4 w-4 shrink-0" style={{ color: "var(--azae-orange)" }} />
                  {member.phone}
                </a>
              )}

              {/* Réseaux sociaux */}
              {(member.facebookUrl || member.linkedinUrl || member.twitterUrl) && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {member.facebookUrl && (
                    <SocialLink href={member.facebookUrl} label="Facebook" />
                  )}
                  {member.linkedinUrl && (
                    <SocialLink href={member.linkedinUrl} label="LinkedIn" />
                  )}
                  {member.twitterUrl && (
                    <SocialLink href={member.twitterUrl} label="Twitter/X" />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Colonne droite : identité + missions ── */}
          <div className="space-y-6">
            {/* En-tête identité */}
            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1
                    className="font-[family-name:var(--font-playfair)] text-3xl font-bold leading-tight lg:text-4xl"
                    style={{ color: "var(--azae-navy)" }}
                  >
                    {member.firstName} {member.lastName}
                  </h1>
                  <p className="mt-2 text-lg text-gray-500">{member.position}</p>
                </div>
                <span
                  className="rounded-full px-4 py-1.5 text-sm font-semibold text-white"
                  style={{ backgroundColor: "var(--azae-orange)" }}
                >
                  {DEPT_LABELS[member.department] ?? member.department}
                </span>
              </div>

              {/* Séparateur décoratif */}
              <div
                className="mt-6 h-1 w-16 rounded-full"
                style={{ backgroundColor: "var(--azae-orange)" }}
              />
            </div>

            {/* Missions / Bio */}
            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <h2
                className="mb-4 font-[family-name:var(--font-playfair)] text-xl font-bold"
                style={{ color: "var(--azae-navy)" }}
              >
                {t("member.missions_title")}
              </h2>
              {bio ? (
                <p className="leading-relaxed text-gray-600">{bio}</p>
              ) : (
                <p className="italic text-gray-400">{t("member.no_bio")}</p>
              )}
            </div>

            {/* CTA rejoindre */}
            <div
              className="rounded-2xl p-6 text-white"
              style={{ backgroundColor: "var(--azae-navy)" }}
            >
              <p className="text-sm font-medium text-white/80">
                {t("member.cta_text")}
              </p>
              <Link
                href="/contact?sujet=benevolat"
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[var(--azae-orange)] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                {t("member.cta_btn")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Helper ── */

function SocialLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:border-[var(--azae-orange)] hover:text-[var(--azae-orange)]"
    >
      <ExternalLink className="h-3 w-3" />
      {label}
    </a>
  )
}
