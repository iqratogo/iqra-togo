"use client"

/* Page désabonnement newsletter — /newsletter/desabonnement?id=... */

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { CheckCircle, XCircle, Loader2, MailX } from "lucide-react"

function DesabonnementContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get("id")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "already">("idle")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Confirmation explicite avant désabonnement
  async function handleUnsubscribe() {
    if (!id) {
      setStatus("error")
      setErrorMsg("Lien de désabonnement invalide.")
      return
    }
    setStatus("loading")
    try {
      const res = await fetch("/api/newsletter/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      const json = await res.json()
      if (res.ok) {
        setStatus(json.alreadyUnsubscribed ? "already" : "success")
      } else {
        setStatus("error")
        setErrorMsg(json.error ?? "Une erreur est survenue.")
      }
    } catch {
      setStatus("error")
      setErrorMsg("Impossible de contacter le serveur.")
    }
  }

  const hasId = !!id

  return (
    <section className="min-h-[80vh] bg-[#F5F5F5] py-16">
      <div className="mx-auto max-w-md px-4">

        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/">
            <span className="font-[family-name:var(--font-playfair)] text-3xl font-bold"
              style={{ color: "var(--azae-navy)" }}>
              IQRA TOGO
            </span>
          </Link>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-sm text-center">

          {/* Chargement */}
          {status === "loading" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="h-12 w-12 animate-spin" style={{ color: "var(--azae-orange)" }} />
              <p className="text-gray-600">Traitement en cours…</p>
            </div>
          )}

          {/* Confirmation demandée */}
          {status === "idle" && (
            <div className="flex flex-col items-center gap-5 py-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <MailX className="h-8 w-8 text-gray-500" />
              </div>
              <div>
                <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold"
                  style={{ color: "var(--azae-navy)" }}>
                  Se désabonner
                </h1>
                <p className="mt-3 text-gray-600 leading-relaxed">
                  {hasId
                    ? "Êtes-vous sûr(e) de vouloir vous désabonner de la newsletter d'IQRA TOGO ? Vous ne recevrez plus nos actualités."
                    : "Ce lien de désabonnement est invalide ou a expiré."
                  }
                </p>
              </div>

              {hasId ? (
                <div className="flex w-full flex-col gap-3 pt-2">
                  <button
                    onClick={handleUnsubscribe}
                    className="w-full rounded-xl bg-gray-800 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    Oui, me désabonner
                  </button>
                  <Link
                    href="/"
                    className="w-full rounded-xl border border-gray-200 py-3 text-center text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
                  >
                    Non, garder mon inscription
                  </Link>
                </div>
              ) : (
                <Link
                  href="/"
                  className="rounded-xl px-6 py-3 text-sm font-semibold text-white"
                  style={{ backgroundColor: "var(--azae-orange)" }}
                >
                  Retour à l'accueil
                </Link>
              )}
            </div>
          )}

          {/* Succès */}
          {status === "success" && (
            <div className="flex flex-col items-center gap-4 py-4">
              <CheckCircle className="h-14 w-14 text-gray-400" />
              <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold"
                style={{ color: "var(--azae-navy)" }}>
                Désabonnement effectué
              </h1>
              <p className="text-gray-600 leading-relaxed">
                Vous avez bien été retiré(e) de notre liste de diffusion.
                Vous ne recevrez plus nos newsletters.
              </p>
              <p className="text-sm text-gray-500">
                Vous pouvez vous réinscrire à tout moment depuis notre{" "}
                <Link href="/" className="font-medium hover:underline" style={{ color: "var(--azae-orange)" }}>
                  page d'accueil
                </Link>.
              </p>
              <Link
                href="/"
                className="mt-2 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: "var(--azae-orange)" }}
              >
                Retour à l'accueil
              </Link>
            </div>
          )}

          {/* Déjà désabonné */}
          {status === "already" && (
            <div className="flex flex-col items-center gap-4 py-4">
              <CheckCircle className="h-14 w-14 text-gray-300" />
              <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold"
                style={{ color: "var(--azae-navy)" }}>
                Déjà désabonné(e)
              </h1>
              <p className="text-gray-600">
                Vous êtes déjà retiré(e) de notre liste de diffusion.
              </p>
              <Link
                href="/"
                className="mt-2 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white"
                style={{ backgroundColor: "var(--azae-orange)" }}
              >
                Retour à l'accueil
              </Link>
            </div>
          )}

          {/* Erreur */}
          {status === "error" && (
            <div className="flex flex-col items-center gap-4 py-4">
              <XCircle className="h-14 w-14 text-red-400" />
              <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold"
                style={{ color: "var(--azae-navy)" }}>
                Lien invalide
              </h1>
              <p className="text-gray-600">
                {errorMsg ?? "Ce lien est invalide ou a expiré."}
              </p>
              <p className="text-sm text-gray-500">
                Pour vous désabonner, contactez-nous à{" "}
                <a href="mailto:contact@iqra-togo.com" className="font-medium hover:underline"
                  style={{ color: "var(--azae-orange)" }}>
                  contact@iqra-togo.com
                </a>
              </p>
            </div>
          )}

        </div>

        {/* Lien politique de confidentialité */}
        <p className="mt-6 text-center text-xs text-gray-400">
          <Link href="/confidentialite" className="hover:underline">
            Politique de confidentialité
          </Link>
          {" · "}
          <Link href="/contact" className="hover:underline">
            Nous contacter
          </Link>
        </p>

      </div>
    </section>
  )
}

export default function DesabonnementPage() {
  return (
    <Suspense fallback={null}>
      <DesabonnementContent />
    </Suspense>
  )
}
