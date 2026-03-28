"use client"

/* §5.5.1 Formulaire connexion — rate limiting 5 tentatives §5.5.1 */

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { Eye, EyeOff, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const schema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
  rememberMe: z.boolean().optional(),
})

type FormValues = z.infer<typeof schema>

/* §5.5.1 Rate limiting client-side — 5 tentatives, blocage 15min */
const ATTEMPT_KEY = "login_attempts"
const LOCK_KEY = "login_locked_until"
const MAX_ATTEMPTS = 5
const LOCK_DURATION_MS = 15 * 60 * 1000

function getAttempts(): number {
  return parseInt(localStorage.getItem(ATTEMPT_KEY) ?? "0", 10)
}

function isLocked(): boolean {
  const lockedUntil = parseInt(localStorage.getItem(LOCK_KEY) ?? "0", 10)
  return Date.now() < lockedUntil
}

function incrementAttempts(): number {
  const attempts = getAttempts() + 1
  localStorage.setItem(ATTEMPT_KEY, String(attempts))
  if (attempts >= MAX_ATTEMPTS) {
    localStorage.setItem(LOCK_KEY, String(Date.now() + LOCK_DURATION_MS))
  }
  return attempts
}

function resetAttempts() {
  localStorage.removeItem(ATTEMPT_KEY)
  localStorage.removeItem(LOCK_KEY)
}

interface LoginFormProps {
  /** §12.9 PRD — callbackUrl déjà validé côté serveur (commence par "/") */
  callbackUrl?: string
}

export default function LoginForm({ callbackUrl = "" }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormValues) => {
    setServerError(null)

    if (isLocked()) {
      setServerError("Trop de tentatives. Veuillez patienter 15 minutes avant de réessayer.")
      return
    }

    let result: Awaited<ReturnType<typeof signIn>> | undefined
    try {
      result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })
    } catch {
      setServerError("Une erreur inattendue s'est produite. Veuillez réessayer.")
      return
    }

    if (!result) {
      setServerError("Impossible de contacter le serveur d'authentification. Veuillez réessayer.")
      return
    }

    if (result.error) {
      const attempts = incrementAttempts()
      const remaining = MAX_ATTEMPTS - attempts
      if (remaining <= 0) {
        setServerError("Compte temporairement bloqué (15 min) après trop de tentatives.")
      } else {
        setServerError(
          `Email ou mot de passe incorrect. ${remaining} tentative${remaining > 1 ? "s" : ""} restante${remaining > 1 ? "s" : ""}.`
        )
      }
      return
    }

    resetAttempts()

    /* §7.6 PRD — Redirection selon le rôle.
       On navigue vers /dashboard/admin ; le middleware RBAC redirige
       automatiquement vers /dashboard/membre si le rôle est insuffisant.
       On évite getSession() ici : race condition — le cookie JWT n'est
       pas encore lisible immédiatement après signIn. */
    const destination = callbackUrl || "/dashboard"

    /* Rechargement complet pour que les Server Components lisent bien le cookie de session */
    window.location.href = destination
  }

  return (
    <form method="post" onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {/* Email */}
      <div className="space-y-1">
        <label htmlFor="login-email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <Input
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder="votre@email.com"
          aria-invalid={!!errors.email}
          {...register("email")}
          className={cn(errors.email && "border-red-400")}
        />
        {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
      </div>

      {/* Mot de passe */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label htmlFor="login-password" className="block text-sm font-medium text-gray-700">
            Mot de passe
          </label>
          {/* §5.5.1 — Lien mot de passe oublié */}
          <Link
            href="/auth/mot-de-passe-oublie"
            className="text-xs transition-colors hover:underline"
            style={{ color: "var(--azae-orange)" }}
          >
            Mot de passe oublié ?
          </Link>
        </div>
        <div className="relative">
          <Input
            id="login-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            aria-invalid={!!errors.password}
            {...register("password")}
            className={cn("pr-10", errors.password && "border-red-400")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
      </div>

      {/* §5.5.1 Se souvenir de moi */}
      <div className="flex items-center gap-2">
        <input
          id="remember-me"
          type="checkbox"
          {...register("rememberMe")}
          className="h-4 w-4 rounded border-gray-300 accent-[var(--azae-orange)]"
        />
        <label htmlFor="remember-me" className="text-sm text-gray-700">
          Se souvenir de moi
        </label>
      </div>

      {/* Erreur serveur */}
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
        className="w-full gap-2 bg-[var(--azae-orange)] text-white hover:bg-[var(--azae-orange-dark)]"
      >
        <LogIn className="h-4 w-4" />
        {isSubmitting ? "Connexion…" : "Se connecter"}
      </Button>
    </form>
  )
}
