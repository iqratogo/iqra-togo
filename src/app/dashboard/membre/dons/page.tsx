/* §8 Historique des dons membre */

import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"
import { redirect } from "next/navigation"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Heart } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = { title: "Mes dons — Azaetogo" }

export default async function DonsMEmbrePage() {
  const session = await auth()
  if (!session) redirect("/auth/login")

  const userId = (session.user as { id: string }).id
  const dons = await prisma.donation.findMany({
    where: { userId, status: "SUCCESS" },
    orderBy: { createdAt: "desc" },
  })

  const total = dons.reduce((sum: number, d: { amount: number }) => sum + d.amount, 0)

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold" style={{ color: "var(--azae-navy)" }}>
            Mes dons
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">Historique de vos contributions</p>
        </div>
        <Link href="/dons">
          <Button className="gap-2 bg-[var(--azae-orange)] text-white hover:bg-[var(--azae-orange-dark)]">
            <Heart className="h-4 w-4" /> Faire un don
          </Button>
        </Link>
      </div>

      {/* Total */}
      {dons.length > 0 && (
        <div className="mb-6 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-xs text-gray-500">Total de vos contributions</p>
          <p className="mt-1 font-[family-name:var(--font-playfair)] text-2xl font-bold" style={{ color: "var(--azae-orange)" }}>
            {total.toLocaleString("fr-FR")} FCFA
          </p>
          <p className="mt-0.5 text-xs text-gray-400">{dons.length} don{dons.length > 1 ? "s" : ""} au total</p>
        </div>
      )}

      {dons.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-white py-16 text-center shadow-sm">
          <Heart className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm text-gray-500">Vous n'avez pas encore fait de don</p>
          <Link href="/dons" className="mt-4 inline-block text-sm text-[var(--azae-orange)] hover:underline">
            Soutenir Azaetogo →
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <ul className="divide-y divide-gray-50">
            {dons.map((d) => (
              <li key={d.id} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-gray-800">{d.affectation ?? "Fonds général"}</p>
                  <p className="text-xs text-gray-400">
                    {format(new Date(d.createdAt), "d MMMM yyyy", { locale: fr })}
                  </p>
                </div>
                <p className="font-semibold text-green-600">+{d.amount.toLocaleString("fr-FR")} FCFA</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
