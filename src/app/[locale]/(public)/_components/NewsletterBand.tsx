"use client"

/* §5.1.9 Section Newsletter — double opt-in via /api/newsletter */

import { useState } from "react"
import Link from "next/link"
import { Send, CheckCircle } from "lucide-react"

export default function NewsletterBand() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setStatus("loading")
    setError(null)

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const json = await res.json()

      if (!res.ok) {
        setError(json.error ?? "Une erreur est survenue.")
        setStatus("error")
        return
      }

      setStatus("success")
      setEmail("")
    } catch {
      setError("Impossible de traiter votre inscription. Réessayez.")
      setStatus("error")
    }
  }

  return (
    <section style={{ backgroundColor: "var(--azae-navy)" }} className="py-14">
      <div className="mx-auto max-w-3xl px-4 text-center lg:px-8">
        {status === "success" ? (
          <div className="flex flex-col items-center gap-4">
            <CheckCircle
              className="h-12 w-12"
              style={{ color: "var(--azae-orange)" }}
            />
            <p className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-white">
              Merci pour votre inscription !
            </p>
            <p className="text-gray-300">
              Un email de confirmation vous a été envoyé. Vérifiez votre boîte de réception.
            </p>
          </div>
        ) : (
          <>
            <p
              className="mb-2 text-xs font-semibold uppercase tracking-[0.15em]"
              style={{ color: "var(--azae-orange)" }}
            >
              Restez informé
            </p>
            <h2 className="mb-3 font-[family-name:var(--font-playfair)] text-2xl font-bold text-white lg:text-3xl">
              Recevez nos actualités
            </h2>
            <p className="mb-8 text-sm text-gray-300">
              Projets, communiqués et actions sur le terrain — directement dans votre boîte mail.
              Pas de spam, désabonnement en un clic.
            </p>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-3 sm:flex-row sm:gap-0"
              noValidate
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Votre adresse email
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                disabled={status === "loading"}
                className="flex-1 rounded-lg border border-white/40 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-white/80 focus:outline-none sm:rounded-r-none"
                aria-describedby={error ? "newsletter-error" : undefined}
              />
              <button
                type="submit"
                disabled={status === "loading" || !email}
                className="flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white transition-colors disabled:opacity-60 sm:rounded-l-none"
                style={{ backgroundColor: "var(--azae-orange)" }}
              >
                <Send className="h-4 w-4" aria-hidden="true" />
                {status === "loading" ? "Inscription…" : "S'inscrire"}
              </button>
            </form>

            {error && (
              <p
                id="newsletter-error"
                className="mt-3 text-sm text-red-400"
                role="alert"
              >
                {error}
              </p>
            )}

            <p className="mt-4 text-xs text-gray-500">
              En vous inscrivant, vous acceptez notre{" "}
              <Link href="/confidentialite" className="underline hover:text-gray-300">
                politique de confidentialité
              </Link>
              . Conformément au RGPD, vos données ne seront jamais cédées à des tiers.
            </p>
          </>
        )}
      </div>
    </section>
  )
}
