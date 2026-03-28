"use client"

import { useState } from "react"
import Image from "next/image"
import { Mail, UserRound } from "lucide-react"
import { FacebookIcon, LinkedinIcon, TwitterXIcon } from "@/components/ui/SocialIcons"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
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

/* ── Constantes ── */

const DEPARTMENTS: { value: TeamMember["department"] | "ALL"; label: string }[] = [
  { value: "ALL", label: "Tous" },
  { value: "DIRECTION", label: "Direction" },
  { value: "PROGRAMMES", label: "Programmes" },
  { value: "COMMUNICATION", label: "Communication" },
  { value: "FINANCE", label: "Finance" },
]

const DEPT_LABELS: Record<TeamMember["department"], string> = {
  DIRECTION: "Direction",
  PROGRAMMES: "Programmes",
  COMMUNICATION: "Communication",
  FINANCE: "Finance",
}

/* ── Component principal ── */

export default function TeamGrid({ members }: { members: TeamMember[] }) {
  const [activeDept, setActiveDept] = useState<TeamMember["department"] | "ALL">("ALL")
  const [selected, setSelected] = useState<TeamMember | null>(null)

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
            <MemberCard key={member.id} member={member} onSelect={setSelected} />
          ))}
        </div>
      ) : (
        <p className="mt-10 text-center text-gray-400">
          Aucun membre dans ce département pour le moment.
        </p>
      )}

      {/* ── Dialog bio ── */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        {selected && (
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="mb-4 flex items-center gap-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-[var(--azae-orange)]">
                  {selected.photoUrl ? (
                    <Image
                      src={selected.photoUrl}
                      alt={`${selected.firstName} ${selected.lastName}`}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-100">
                      <UserRound className="h-8 w-8 text-gray-300" />
                    </div>
                  )}
                </div>
                <div>
                  <DialogTitle className="font-[family-name:var(--font-playfair)] text-lg font-bold text-[var(--azae-navy)]">
                    {selected.firstName} {selected.lastName}
                  </DialogTitle>
                  <DialogDescription className="text-sm text-gray-500">
                    {selected.position}
                  </DialogDescription>
                  <span
                    className="mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white"
                    style={{ backgroundColor: "var(--azae-orange)" }}
                  >
                    {DEPT_LABELS[selected.department]}
                  </span>
                </div>
              </div>
            </DialogHeader>

            {/* Bio */}
            <div className="space-y-3 text-sm leading-relaxed text-gray-600">
              {selected.bioFull ? (
                <p>{selected.bioFull}</p>
              ) : selected.bio ? (
                <p>{selected.bio}</p>
              ) : (
                <p className="italic text-gray-400">Aucune biographie disponible.</p>
              )}
            </div>

            {/* Liens */}
            <div className="mt-4 flex items-center gap-3 border-t pt-4">
              {selected.email && (
                <a
                  href={`mailto:${selected.email}`}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-[var(--azae-orange)] hover:text-[var(--azae-orange)]"
                >
                  <Mail className="h-3.5 w-3.5" />
                  Contacter
                </a>
              )}
              {selected.facebookUrl && (
                <SocialBtn href={selected.facebookUrl} icon={FacebookIcon} label="Facebook" />
              )}
              {selected.linkedinUrl && (
                <SocialBtn href={selected.linkedinUrl} icon={LinkedinIcon} label="LinkedIn" />
              )}
              {selected.twitterUrl && (
                <SocialBtn href={selected.twitterUrl} icon={TwitterXIcon} label="Twitter" />
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  )
}

/* ── Card membre ── */

function MemberCard({
  member,
  onSelect,
}: {
  member: TeamMember
  onSelect: (m: TeamMember) => void
}) {
  return (
    <button
      onClick={() => onSelect(member)}
      className="group relative flex flex-col items-center rounded-xl border border-gray-100 bg-white p-6 text-center shadow-sm transition-shadow duration-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--azae-orange)]"
    >
      {/* Photo ronde */}
      <div className="relative mb-4 h-24 w-24 overflow-hidden rounded-full border-2 border-[var(--azae-orange)] transition-transform duration-300 group-hover:scale-105">
        {member.photoUrl ? (
          <Image
            src={member.photoUrl}
            alt={`${member.firstName} ${member.lastName}`}
            fill
            className="object-cover"
            sizes="96px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100">
            <UserRound className="h-10 w-10 text-gray-300" />
          </div>
        )}

        {/* Overlay hover */}
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--azae-navy)]/70 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="text-xs font-semibold text-white">Voir le profil</span>
        </div>
      </div>

      {/* Infos */}
      <p className="font-[family-name:var(--font-playfair)] font-bold text-[var(--azae-navy)]">
        {member.firstName} {member.lastName}
      </p>
      <p className="mt-0.5 text-sm text-gray-500">{member.position}</p>
      <span
        className="mt-2 rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
        style={{ backgroundColor: "var(--azae-orange)", opacity: 0.85 }}
      >
        {DEPT_LABELS[member.department]}
      </span>

      {/* Icônes réseaux */}
      {(member.facebookUrl || member.linkedinUrl || member.twitterUrl) && (
        <div className="mt-3 flex items-center justify-center gap-2">
          {member.facebookUrl && <SocialDot icon={FacebookIcon} />}
          {member.linkedinUrl && <SocialDot icon={LinkedinIcon} />}
          {member.twitterUrl && <SocialDot icon={TwitterXIcon} />}
        </div>
      )}
    </button>
  )
}

/* ── Helpers ── */

function SocialBtn({
  href,
  icon: Icon,
  label,
}: {
  href: string
  icon: React.ElementType
  label: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      onClick={(e) => e.stopPropagation()}
      className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:border-[var(--azae-orange)] hover:text-[var(--azae-orange)]"
    >
      <Icon className="h-3.5 w-3.5" />
    </a>
  )
}

function SocialDot({ icon: Icon }: { icon: React.ElementType }) {
  return (
    <span className="flex h-5 w-5 items-center justify-center text-gray-300">
      <Icon className="h-3 w-3" />
    </span>
  )
}
