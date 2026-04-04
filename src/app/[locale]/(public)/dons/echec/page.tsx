/* §9.2 Page échec don — /dons/echec?ref=XXX */

import type { Metadata } from "next"
import Link from "next/link"
import { XCircle, RefreshCw, Home } from "lucide-react"

export const metadata: Metadata = {
  title: "Paiement non abouti — IQRA TOGO",
  robots: { index: false, follow: false },
}

export default function DonsEchecPage() {
  return (
    <section className="min-h-[70vh] bg-[#F5F5F5] py-20">
      <div className="mx-auto max-w-lg px-4 text-center">
        <div
          className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-100"
        >
          <XCircle className="h-12 w-12 text-red-500" />
        </div>

        <h1
          className="font-[family-name:var(--font-playfair)] text-3xl font-bold"
          style={{ color: "var(--azae-navy)" }}
        >
          Paiement non abouti
        </h1>

        <p className="mt-4 text-gray-600">
          Votre paiement n'a pas pu être finalisé. Cela peut arriver pour diverses raisons
          (délai expiré, annulation, erreur réseau). Aucun montant n'a été débité.
        </p>

        <div className="mt-8 rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800">
          Vous pouvez réessayer à tout moment. Si le problème persiste,
          contactez-nous à{" "}
          <a href="mailto:contact@iqra-togo.com" className="font-medium underline">
            contact@iqra-togo.com
          </a>
        </div>

        {/* §9.2 — Bouton réessayer */}
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/dons"
            className="flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold text-white"
            style={{ backgroundColor: "var(--azae-orange)" }}
          >
            <RefreshCw className="h-4 w-4" />
            Réessayer
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-[var(--azae-orange)] hover:text-[var(--azae-orange)]"
          >
            <Home className="h-4 w-4" />
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </section>
  )
}
