"use client"

/* §10 PRD — Page d'erreur globale (error boundary Next.js) */

import { useEffect } from "react"
import Link from "next/link"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    /* Log côté client en développement */
    if (process.env.NODE_ENV === "development") {
      console.error("[GlobalError]", error)
    }
  }, [error])

  return (
    <section className="flex min-h-[80vh] flex-col items-center justify-center bg-[#F5F5F5] px-4 py-16 text-center">
      <p
        className="font-[family-name:var(--font-playfair)] text-8xl font-bold"
        style={{ color: "var(--azae-orange)" }}
        aria-hidden="true"
      >
        500
      </p>

      <h1
        className="mt-4 font-[family-name:var(--font-playfair)] text-3xl font-bold"
        style={{ color: "var(--azae-navy)" }}
      >
        Une erreur est survenue
      </h1>

      <p className="mt-3 max-w-md text-gray-600">
        Un problème inattendu s'est produit. Notre équipe technique a été informée. Veuillez
        réessayer ou revenir plus tard.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center rounded-md px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "var(--azae-orange-dark)" }}
        >
          Réessayer
        </button>
        <Link
          href="/"
          className="inline-flex items-center rounded-md border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-gray-100"
          style={{ borderColor: "var(--azae-navy)", color: "var(--azae-navy)" }}
        >
          Retour à l'accueil
        </Link>
      </div>
    </section>
  )
}
