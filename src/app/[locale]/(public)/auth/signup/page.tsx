/* §5.5.2 Page Inscription (/auth/signup) — formulaire d'adhésion complet §7.3.3 */

import type { Metadata } from "next"
import Link from "next/link"
import SignupForm from "./_components/SignupForm"

export const metadata: Metadata = {
  title: "Demande d'adhésion — Azaetogo",
  description:
    "Rejoignez l'ONG Azaetogo ! Remplissez le formulaire d'adhésion pour devenir membre et participer à notre mission humanitaire au Togo.",
}

export default function SignupPage() {
  return (
    <section className="bg-[#F5F5F5] py-16">
      <div className="mx-auto max-w-2xl px-4">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/">
            <span
              className="font-[family-name:var(--font-playfair)] text-3xl font-bold"
              style={{ color: "var(--azae-orange)" }}
            >
              AZAETOGO
            </span>
          </Link>
          <h1
            className="mt-3 font-[family-name:var(--font-playfair)] text-2xl font-bold"
            style={{ color: "var(--azae-navy)" }}
          >
            Demande d'adhésion
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Rejoignez notre communauté et participez à notre mission humanitaire.{" "}
            <span className="font-medium" style={{ color: "var(--azae-green)" }}>
              Adhésion gratuite.
            </span>
          </p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <SignupForm />
        </div>

        <p className="mt-4 text-center text-sm text-gray-500">
          Déjà membre ?{" "}
          <Link
            href="/auth/login"
            className="font-medium transition-colors hover:underline"
            style={{ color: "var(--azae-orange)" }}
          >
            Se connecter
          </Link>
        </p>
      </div>
    </section>
  )
}
