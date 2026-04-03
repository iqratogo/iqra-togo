"use client"

/* §5.1.9 PRD — Page de confirmation double opt-in newsletter */
/* Accessible via /newsletter/confirmer?token=... */

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

function ConfirmerContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("Lien de confirmation invalide.")
      return
    }

    fetch(`/api/newsletter?token=${encodeURIComponent(token)}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setStatus("success")
        } else {
          setStatus("error")
          setMessage(json.error ?? "Lien invalide ou expiré.")
        }
      })
      .catch(() => {
        setStatus("error")
        setMessage("Impossible de confirmer votre inscription. Veuillez réessayer.")
      })
  }, [token])

  return (
    <section className="min-h-[80vh] bg-[#F5F5F5] py-16">
      <div className="mx-auto max-w-md px-4">
        <div className="mb-8 text-center">
          <Link href="/">
            <span
              className="font-[family-name:var(--font-playfair)] text-3xl font-bold"
              style={{ color: "var(--azae-orange)" }}
            >
              IQRA TOGO
            </span>
          </Link>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-sm text-center">
          {status === "loading" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2
                className="h-12 w-12 animate-spin"
                style={{ color: "var(--azae-orange)" }}
              />
              <p className="text-gray-600">Confirmation en cours…</p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center gap-4 py-4">
              <CheckCircle className="h-14 w-14" style={{ color: "var(--azae-green)" }} />
              <h1
                className="font-[family-name:var(--font-playfair)] text-2xl font-bold"
                style={{ color: "var(--azae-navy)" }}
              >
                Inscription confirmée !
              </h1>
              <p className="text-gray-600">
                Merci ! Vous recevrez désormais les actualités d'IQRA TOGO dans votre boîte mail.
              </p>
              <Button
                asChild
                className="mt-4 text-white"
                style={{ backgroundColor: "var(--azae-orange-dark)" }}
              >
                <Link href="/">Retour à l'accueil</Link>
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-4 py-4">
              <XCircle className="h-14 w-14 text-red-500" />
              <h1
                className="font-[family-name:var(--font-playfair)] text-2xl font-bold"
                style={{ color: "var(--azae-navy)" }}
              >
                Lien invalide
              </h1>
              <p className="text-gray-600">
                {message ?? "Ce lien de confirmation est invalide ou a expiré (48h)."}
              </p>
              <p className="text-sm text-gray-500">
                Pour vous inscrire à nouveau, rendez-vous sur la{" "}
                <Link
                  href="/"
                  className="font-medium hover:underline"
                  style={{ color: "var(--azae-orange)" }}
                >
                  page d'accueil
                </Link>
                .
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default function ConfirmerPage() {
  return (
    <Suspense fallback={null}>
      <ConfirmerContent />
    </Suspense>
  )
}
