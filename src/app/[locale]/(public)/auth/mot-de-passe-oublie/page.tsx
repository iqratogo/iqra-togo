"use client"

/* §5.5.1 PRD — Mot de passe oublié → appel POST /api/auth/reset-password */

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Mail, ArrowLeft, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const schema = z.object({
  email: z.string().email("Adresse email invalide"),
})
type FormValues = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormValues) => {
    setServerError(null)
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      })
      const json = await res.json()
      if (!res.ok) {
        setServerError(json.error ?? "Une erreur est survenue.")
        return
      }
      setSent(true)
    } catch {
      setServerError("Impossible de contacter le serveur. Veuillez réessayer.")
    }
  }

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
              AZAETOGO
            </span>
          </Link>
          <h1
            className="mt-3 font-[family-name:var(--font-playfair)] text-2xl font-bold"
            style={{ color: "var(--azae-navy)" }}
          >
            Mot de passe oublié
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Saisissez votre email pour recevoir un lien de réinitialisation.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-sm">
          {sent ? (
            /* État succès */
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <CheckCircle className="h-12 w-12" style={{ color: "var(--azae-green)" }} />
              <h2
                className="font-[family-name:var(--font-playfair)] text-lg font-bold"
                style={{ color: "var(--azae-navy)" }}
              >
                Email envoyé
              </h2>
              <p className="text-sm text-gray-600">
                Si un compte est associé à cette adresse, vous recevrez un lien de
                réinitialisation dans les prochaines minutes. Pensez à vérifier vos spams.
              </p>
              <Link
                href="/auth/login"
                className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:underline"
                style={{ color: "var(--azae-orange)" }}
              >
                <ArrowLeft className="h-4 w-4" />
                Retour à la connexion
              </Link>
            </div>
          ) : (
            /* Formulaire */
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
              <div className="space-y-1">
                <label
                  htmlFor="forgot-email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Adresse email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    placeholder="votre@email.com"
                    aria-invalid={!!errors.email}
                    {...register("email")}
                    className={cn("pl-9", errors.email && "border-red-400")}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {serverError && (
                <div
                  className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  role="alert"
                >
                  {serverError}
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full text-white"
                style={{ backgroundColor: "var(--azae-orange-dark)" }}
              >
                {isSubmitting ? "Envoi en cours…" : "Envoyer le lien"}
              </Button>
            </form>
          )}
        </div>

        <div className="mt-4 text-center">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-1 text-sm text-gray-600 transition-colors hover:text-gray-800"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Retour à la connexion
          </Link>
        </div>
      </div>
    </section>
  )
}
