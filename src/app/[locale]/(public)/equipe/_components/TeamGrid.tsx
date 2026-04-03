"use client"

import { useState } from "react"
import Image from "next/image"
import { Link } from "@/i18n/navigation"
import { UserRound, ArrowRight } from "lucide-react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

/* ── Types ── */

export interface TeamMember {
  id: string
  firstName: string
  lastName: string
  position: string
  department: "DIRECTION" | "PROGRAMMES" | "COMMUNICATION" | "FINANCE"
  bio?: string | null
  bioFull?: string | null
  photoUrl?: string | null
  email?: string | null
  facebookUrl?: string | null
  linkedinUrl?: string | null
  twitterUrl?: string | null
}

/* ── Component principal ── */

export default function TeamGrid({ members }: { members: TeamMember[] }) {
  const t = useTranslations("pages.team")
  const [activeDept, setActiveDept] = useState<TeamMember["department"] | "ALL">("ALL")

  const DEPARTMENTS: { value: TeamMember["department"] | "ALL"; label: string }[] = [
    { value: "ALL", label: t("dept_all") },
    { value: "DIRECTION", label: t("dept_direction") },
    { value: "PROGRAMMES", label: t("dept_programmes") },
    { value: "COMMUNICATION", label: t("dept_communication") },
    { value: "FINANCE", label: t("dept_finance") },
  ]

  const DEPT_LABELS: Record<TeamMember["department"], string> = {
    DIRECTION: t("dept_direction"),
    PROGRAMMES: t("dept_programmes"),
    COMMUNICATION: t("dept_communication"),
    FINANCE: t("dept_finance"),
  }

  const filtered =
    activeDept === "ALL" ? members : members.filter((m) => m.department === activeDept)

  return (
    <>
      {/* ── Filtres département ── */}
      <div className="flex flex-wrap justify-center gap-2">
        {DEPARTMENTS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setActiveDept(value)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              activeDept === value
                ? "border-[var(--azae-orange)] bg-[var(--azae-orange)] text-white"
                : "border-gray-200 text-gray-600 hover:border-[var(--azae-orange)] hover:text-[var(--azae-orange)]"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Grille membres ── */}
      {filtered.length > 0 ? (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((member) => (
            <MemberCard key={member.id} member={member} deptLabels={DEPT_LABELS} viewProfileLabel={t("view_profile")} />
          ))}
        </div>
      ) : (
        <p className="mt-10 text-center text-gray-400">
          {t("no_members_dept")}
        </p>
      )}
    </>
  )
}

/* ── Card membre rectangulaire verticale ── */

function MemberCard({
  member,
  deptLabels,
  viewProfileLabel,
}: {
  member: TeamMember
  deptLabels: Record<TeamMember["department"], string>
  viewProfileLabel: string
}) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg">
      {/* Photo grande — ratio 4/5 */}
      <div className="relative w-full overflow-hidden" style={{ paddingBottom: "125%" }}>
        {member.photoUrl ? (
          <Image
            src={member.photoUrl}
            alt={`${member.firstName} ${member.lastName}`}
            fill
            className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <UserRound className="h-20 w-20 text-gray-300" />
          </div>
        )}

        {/* Badge département flottant */}
        <span
          className="absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-semibold text-white shadow"
          style={{ backgroundColor: "var(--azae-navy)" }}
        >
          {deptLabels[member.department]}
        </span>
      </div>

      {/* Infos texte */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <p
            className="font-[family-name:var(--font-playfair)] text-base font-bold leading-tight"
            style={{ color: "var(--azae-navy)" }}
          >
            {member.firstName} {member.lastName}
          </p>
          <p className="mt-1 text-sm text-gray-500 leading-snug">{member.position}</p>
        </div>

        {/* Bouton voir détails */}
        <Link
          href={`/equipe/${member.id}` as `/equipe/${string}`}
          className="mt-auto inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--azae-orange)] px-4 py-2 text-sm font-semibold transition-colors hover:bg-[var(--azae-orange)] hover:text-white"
          style={{ color: "var(--azae-orange)" }}
        >
          {viewProfileLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
