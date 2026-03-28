/* §8 Tableau de bord membre */

import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"
import { redirect } from "next/navigation"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { User, CreditCard, Heart, CheckCircle, Clock } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = { title: "Mon espace — Azaetogo" }

export default async function MembreDashboardPage() {
  const session = await auth()
  if (!session) redirect("/auth/login")

  const userId = (session.user as { id: string }).id

  let member = null as Awaited<ReturnType<typeof prisma.member.findUnique>> | null
  let cotisations: Awaited<ReturnType<typeof prisma.cotisation.findMany>> = []
  let dons: Awaited<ReturnType<typeof prisma.donation.findMany>> = []

  try {
    ;[member, cotisations, dons] = await Promise.all([
      prisma.member.findUnique({ where: { userId }, include: { user: { select: { email: true } } } }),
      prisma.cotisation.findMany({ where: { member: { userId } }, orderBy: { dueDate: "desc" }, take: 3 }),
      prisma.donation.findMany({ where: { userId, status: "SUCCESS" }, orderBy: { createdAt: "desc" }, take: 3 }),
    ])
  } catch { /* ignore */ }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1
          className="font-[family-name:var(--font-playfair)] text-2xl font-bold"
          style={{ color: "var(--azae-navy)" }}
        >
          Bonjour, {(session.user as { name?: string })?.name?.split(" ")[0] ?? "Membre"} 👋
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Bienvenue dans votre espace personnel Azaetogo —{" "}
          {format(new Date(), "d MMMM yyyy", { locale: fr })}
        </p>
      </div>

      {/* Carte membre */}
      {member && (
        <div
          className="mb-8 rounded-2xl p-6 text-white"
          style={{ background: "linear-gradient(135deg, var(--azae-navy) 0%, #2a3f6a 100%)" }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider opacity-70">Carte membre</p>
              <p className="mt-1 font-[family-name:var(--font-playfair)] text-2xl font-bold">
                {member.firstName} {member.lastName}
              </p>
              <p className="mt-0.5 text-sm opacity-80">{(member as { user?: { email: string } }).user?.email}</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-sm font-semibold opacity-90">{member.memberNumber}</p>
              {member.joinedAt && (
                <p className="mt-0.5 text-xs opacity-60">
                  Membre depuis {format(new Date(member.joinedAt), "MMMM yyyy", { locale: fr })}
                </p>
              )}
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                member.status === "ACTIVE"
                  ? "bg-green-500/20 text-green-200"
                  : "bg-yellow-500/20 text-yellow-200"
              }`}
            >
              {member.status === "ACTIVE" ? (
                <><CheckCircle className="h-3 w-3" /> Actif</>
              ) : (
                <><Clock className="h-3 w-3" /> {member.status}</>
              )}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                member.cotisationStatus === "UP_TO_DATE"
                  ? "bg-green-500/20 text-green-200"
                  : member.cotisationStatus === "LATE"
                  ? "bg-red-500/20 text-red-200"
                  : "bg-blue-500/20 text-blue-200"
              }`}
            >
              <CreditCard className="h-3 w-3" />
              {member.cotisationStatus === "UP_TO_DATE"
                ? "Cotisation à jour"
                : member.cotisationStatus === "LATE"
                ? "Cotisation en retard"
                : "Exempté"}
            </span>
          </div>
        </div>
      )}

      {/* Accès rapides */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Link
          href="/dashboard/membre/profil"
          className="group rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
        >
          <div
            className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg"
            style={{ backgroundColor: "var(--azae-navy)" }}
          >
            <User className="h-5 w-5 text-white" />
          </div>
          <p className="font-semibold text-gray-800 group-hover:text-[var(--azae-navy)]">Mon profil</p>
          <p className="mt-0.5 text-xs text-gray-500">Mettre à jour mes informations</p>
        </Link>
        <Link
          href="/dashboard/membre/cotisations"
          className="group rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
        >
          <div
            className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg"
            style={{ backgroundColor: "var(--azae-orange)" }}
          >
            <CreditCard className="h-5 w-5 text-white" />
          </div>
          <p className="font-semibold text-gray-800 group-hover:text-[var(--azae-orange)]">Cotisations</p>
          <p className="mt-0.5 text-xs text-gray-500">Régler ma cotisation annuelle</p>
        </Link>
        <Link
          href="/dons"
          className="group rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
        >
          <div
            className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg"
            style={{ backgroundColor: "var(--azae-green)" }}
          >
            <Heart className="h-5 w-5 text-white" />
          </div>
          <p className="font-semibold text-gray-800 group-hover:text-[var(--azae-green)]">Faire un don</p>
          <p className="mt-0.5 text-xs text-gray-500">Soutenir les projets de l'ONG</p>
        </Link>
      </div>

      {/* Dernières cotisations + dons */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Cotisations */}
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-50 px-5 py-4">
            <h2 className="font-semibold text-gray-800">Cotisations récentes</h2>
            <Link href="/dashboard/membre/cotisations" className="text-xs text-[var(--azae-orange)] hover:underline">
              Voir tout
            </Link>
          </div>
          {(cotisations as { id: string; period: string; amount: number; status: string; dueDate: Date }[]).length > 0 ? (
            <ul className="divide-y divide-gray-50">
              {(cotisations as { id: string; period: string; amount: number; status: string; dueDate: Date }[]).map((c) => (
                <li key={c.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{c.period}</p>
                    <p className="text-xs text-gray-400">Échéance: {format(new Date(c.dueDate), "d MMM yyyy", { locale: fr })}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold" style={{ color: "var(--azae-navy)" }}>
                      {c.amount.toLocaleString("fr-FR")} FCFA
                    </p>
                    <span className={`text-xs font-medium ${
                      c.status === "SUCCESS" ? "text-green-600" :
                      c.status === "PENDING" ? "text-yellow-600" : "text-red-600"
                    }`}>
                      {c.status === "SUCCESS" ? "Payée" : c.status === "PENDING" ? "En attente" : "Non payée"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-8 text-center text-sm text-gray-400">Aucune cotisation</p>
          )}
        </div>

        {/* Dons */}
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-50 px-5 py-4">
            <h2 className="font-semibold text-gray-800">Mes dons récents</h2>
            <Link href="/dashboard/membre/dons" className="text-xs text-[var(--azae-orange)] hover:underline">
              Voir tout
            </Link>
          </div>
          {(dons as { id: string; amount: number; affectation: string; createdAt: Date }[]).length > 0 ? (
            <ul className="divide-y divide-gray-50">
              {(dons as { id: string; amount: number; affectation: string; createdAt: Date }[]).map((d) => (
                <li key={d.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{d.affectation ?? "Fonds général"}</p>
                    <p className="text-xs text-gray-400">{format(new Date(d.createdAt), "d MMM yyyy", { locale: fr })}</p>
                  </div>
                  <p className="text-sm font-semibold text-green-600">
                    +{d.amount.toLocaleString("fr-FR")} FCFA
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-8 text-center text-sm text-gray-400">Aucun don pour le moment</p>
          )}
        </div>
      </div>
    </div>
  )
}
