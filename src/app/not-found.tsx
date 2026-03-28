/* §6.3 PRD SEO — Page 404 personnalisée */

import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Page introuvable — Azaetogo",
  description: "La page que vous cherchez n'existe pas ou a été déplacée.",
}

export default function NotFound() {
  return (
    <section className="flex min-h-[80vh] flex-col items-center justify-center bg-[#F5F5F5] px-4 py-16 text-center">
      <p
        className="font-[family-name:var(--font-playfair)] text-8xl font-bold"
        style={{ color: "var(--azae-orange)" }}
        aria-hidden="true"
      >
        404
      </p>

      <h1
        className="mt-4 font-[family-name:var(--font-playfair)] text-3xl font-bold"
        style={{ color: "var(--azae-navy)" }}
      >
        Page introuvable
      </h1>

      <p className="mt-3 max-w-md text-gray-600">
        La page que vous cherchez n'existe pas, a été déplacée ou son URL a changé.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center rounded-md px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "var(--azae-orange-dark)" }}
        >
          Retour à l'accueil
        </Link>
        <Link
          href="/contact"
          className="inline-flex items-center rounded-md border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-gray-100"
          style={{ borderColor: "var(--azae-navy)", color: "var(--azae-navy)" }}
        >
          Nous contacter
        </Link>
      </div>
    </section>
  )
}
