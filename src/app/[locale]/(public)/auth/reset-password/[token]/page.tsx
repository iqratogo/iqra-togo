"use client"

/* §5.5.1 PRD — Page de réinitialisation du mot de passe */

import { useState } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Eye, EyeOff, CheckCircle, XCircle } from "lucide-react"
import { passwordSchema } from "@/lib/password-schema"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const schema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  })

type FormValues = z.infer<typeof schema>

export default function ResetPasswordPage() {
  const params = useParams<{ token: string }>()
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormValues) => {
    setErrorMessage(null)
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: params.token, password: data.password }),
      })
      const json = await res.json()
      if (!res.ok) {
        setErrorMessage(json.error ?? "Une erreur est survenue.")
        setStatus("error")
        return
      }
      setStatus("success")
    } catch {
      setErrorMessage("Impossible de contacter le serveur. Veuillez réessayer.")
      setStatus("error")
    }
  }

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
          <h1
            className="mt-3 font-[family-name:var(--font-playfair)] text-2xl font-bold"
            style={{ color: "var(--azae-navy)" }}
          >
            Nouveau mot de passe
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Choisissez un mot de passe sécurisé : 8 caractères minimum, une majuscule, un chiffre et un symbole.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-sm">
          {status === "success" ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <CheckCircle className="h-12 w-12" style={{ color: "var(--azae-green)" }} />
              <h2
                className="font-[family-name:var(--font-playfair)] text-lg font-bold"
                style={{ color: "var(--azae-navy)" }}
              >
                Mot de passe mis à jour
              </h2>
              <p className="text-sm text-gray-600">
                Votre mot de passe a été modifié avec succès. Vous pouvez maintenant vous connecter.
              </p>
              <Button
                onClick={() => router.push("/auth/login")}
                className="mt-2 w-full text-white"
                style={{ backgroundColor: "var(--azae-orange-dark)" }}
              >
                Se connecter
              </Button>
            </div>
          ) : status === "error" ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <XCircle className="h-12 w-12 text-red-500" />
              <h2
                className="font-[family-name:var(--font-playfair)] text-lg font-bold"
                style={{ color: "var(--azae-navy)" }}
              >
                Lien invalide ou expiré
              </h2>
              <p className="text-sm text-gray-600">
                {errorMessage ?? "Ce lien de réinitialisation est invalide ou a expiré (1h)."}
              </p>
              <Link
                href="/auth/mot-de-passe-oublie"
                className="mt-2 inline-block text-sm font-medium hover:underline"
                style={{ color: "var(--azae-orange)" }}
              >
                Demander un nouveau lien
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
              <div className="space-y-1">
                <label htmlFor="reset-password" className="block text-sm font-medium text-gray-700">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <Input
                    id="reset-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    aria-invalid={!!errors.password}
                    {...register("password")}
                    className={cn("pr-10", errors.password && "border-red-400")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showPassword ? "Masquer" : "Afficher"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                  Confirmer le mot de passe
                </label>
                <Input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={!!errors.confirmPassword}
                  {...register("confirmPassword")}
                  className={cn(errors.confirmPassword && "border-red-400")}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full text-white"
                style={{ backgroundColor: "var(--azae-orange-dark)" }}
              >
                {isSubmitting ? "Mise à jour…" : "Mettre à jour le mot de passe"}
              </Button>
            </form>
          )}
        </div>

        <div className="mt-4 text-center">
          <Link
            href="/auth/login"
            className="text-sm text-gray-600 transition-colors hover:text-gray-800"
          >
            Retour à la connexion
          </Link>
        </div>
      </div>
    </section>
  )
}
