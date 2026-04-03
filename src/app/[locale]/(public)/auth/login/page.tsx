/* §5.5.1 Page Connexion (/auth/login) */

import type { Metadata } from "next"
import Link from "next/link"
import LoginForm from "./_components/LoginForm"

export const metadata: Metadata = {
  title: "Connexion — IQRA TOGO",
  description: "Connectez-vous à votre espace membre IQRA TOGO.",
}

const ERROR_MESSAGES: Record<string, string> = {
  pending_approval:
    "Votre candidature est en cours d'examen. Vous serez notifié par email lors de la validation.",
  access_denied: "Accès refusé. Votre compte ne dispose pas des droits nécessaires.",
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>
}) {
  const { callbackUrl = "", error = "" } = await searchParams
  /* §12.9 PRD — Valider callbackUrl pour éviter les open redirects */
  const safeCallback = callbackUrl.startsWith("/") ? callbackUrl : ""
  const errorMessage = error && ERROR_MESSAGES[error] ? ERROR_MESSAGES[error] : null

  return (
    <section className="min-h-[80vh] bg-[#F5F5F5] py-16">
      <div className="mx-auto max-w-md px-4">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/">
            <span
              className="font-[family-name:var(--font-playfair)] text-3xl font-bold"
              style={{ color: "var(--azae-orange)" }}
            >
              IQRA TOGO
            </span>
          </Link>
          <h1
            className="mt-3 font-[family-name:var(--font-playfair)] text-2xl font-bold"
            style={{ color: "var(--azae-navy)" }}
          >
            Connexion
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Accédez à votre espace membre ou administration.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {errorMessage}
          </div>
        )}

        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <LoginForm callbackUrl={safeCallback} />

          <div className="mt-6 border-t border-gray-100 pt-5 text-center">
            <p className="text-sm text-gray-600">
              Pas encore membre ?{" "}
              <Link
                href="/auth/signup"
                className="font-medium transition-colors hover:underline"
                style={{ color: "var(--azae-orange)" }}
              >
                Demander l'adhésion
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
