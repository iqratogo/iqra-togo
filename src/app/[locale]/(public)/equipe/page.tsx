import Image from "next/image"
import Link from "next/link"
import { Users } from "lucide-react"
import { prisma } from "@/lib/db/prisma"
import TeamGrid from "./_components/TeamGrid"

/* P3 — Données équipe : revalidation toutes les heures */
export const revalidate = 3600

export const metadata = {
  title: "Notre Équipe — Azaetogo",
  description:
    "Découvrez les membres dévoués de l'équipe Azaetogo qui œuvrent chaque jour pour les familles et étudiants togolais.",
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
  const members = await getTeamMembers()

  return (
    <>
      {/* ══════════════════════════
          SECTION 1 — Hero
      ══════════════════════════ */}
      <section className="relative h-64 overflow-hidden lg:h-80">
        <Image
          src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1600&q=80"
          alt="Équipe Azaetogo"
          fill
          priority
          className="object-cover"
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
                  Accueil
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-white">Équipe</li>
            </ol>
          </nav>
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-white lg:text-5xl">
            Notre Équipe
          </h1>
          <p className="max-w-xl text-sm text-white/75">
            Des hommes et des femmes engagés, unis par la même conviction : agir concrètement
            pour le Togo.
          </p>
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
            /* État vide */
            <div className="flex flex-col items-center gap-4 py-20 text-center">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full"
                style={{ backgroundColor: "rgba(232,89,26,0.1)" }}
              >
                <Users className="h-8 w-8" style={{ color: "var(--azae-orange)" }} />
              </div>
              <p className="text-gray-400">
                Les membres de l'équipe seront affichés ici prochainement.
              </p>
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
            style={{ backgroundColor: "rgba(232,89,26,0.1)" }}
          >
            <Users className="h-6 w-6" style={{ color: "var(--azae-orange)" }} />
          </div>
          <h2
            className="font-[family-name:var(--font-playfair)] text-2xl font-bold lg:text-3xl"
            style={{ color: "var(--azae-navy)" }}
          >
            Rejoindre l'équipe
          </h2>
          <p className="mt-3 text-gray-500">
            Vous souhaitez contribuer à notre mission en tant que bénévole, expert ou
            partenaire ? Nous serions ravis d'étudier votre candidature.
          </p>
          <Link
            href="/contact?sujet=benevolat"
            className="mt-6 inline-flex items-center rounded-lg px-6 py-3 text-sm font-semibold text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: "var(--azae-orange)" }}
          >
            Nous contacter
          </Link>
        </div>
      </section>
    </>
  )
}
