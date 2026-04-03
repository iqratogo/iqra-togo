"use client"

/* §5.5.2 + §7.3.3 Formulaire d'adhésion complet */

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { passwordSchema } from "@/lib/password-schema"
import { CheckCircle, Eye, EyeOff, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

const schema = z
  .object({
    civility: z.enum(["M", "MME", "DR", "PR"]).optional(),
    firstName: z.string().min(2, "Prénom requis"),
    lastName: z.string().min(2, "Nom requis"),
    email: z.string().email("Email invalide"),
    password: passwordSchema,
    confirmPassword: z.string(),
    phone: z.string().min(8, "Téléphone requis"),
    dateOfBirth: z.string().optional(),
    nationality: z.string().optional(),
    country: z.string().optional(),
    city: z.string().optional(),
    neighborhood: z.string().optional(),
    profession: z.string().optional(),
    employer: z.string().optional(),
    motivation: z.string().optional(),
    rgpdConsent: z.boolean().refine((v) => v, "Consentement RGPD obligatoire"),
    rulesAccepted: z.boolean().refine((v) => v, "Acceptation du règlement obligatoire"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  })

type FormValues = z.infer<typeof schema>

export default function SignupForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [dossierNumber, setDossierNumber] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormValues) => {
    setServerError(null)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Erreur lors de l'inscription")
      setDossierNumber(json.dossierNumber)
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Une erreur est survenue.")
    }
  }

  /* §5.5.2 — Confirmation soumission */
  if (dossierNumber) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <CheckCircle className="h-14 w-14" style={{ color: "var(--azae-green)" }} />
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold" style={{ color: "var(--azae-navy)" }}>
          Demande soumise !
        </h2>
        <div className="rounded-xl border border-green-100 bg-green-50 px-6 py-4">
          <p className="text-sm text-green-700">
            Votre dossier <strong>{dossierNumber}</strong> est en cours d'examen.
            Vous recevrez un email de confirmation sous 48h ouvrées.
          </p>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Statut : <strong>En attente de validation</strong> par l'équipe IQRA TOGO.
        </p>
        <Button
          onClick={() => router.push("/")}
          className="mt-4 bg-[var(--azae-orange)] text-white hover:bg-[var(--azae-orange-dark)]"
        >
          Retour à l'accueil
        </Button>
      </div>
    )
  }

  const field = (name: keyof FormValues, label: string, required = false) => (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}{required && <span className="ml-0.5 text-red-500" aria-hidden="true">*</span>}
      </label>
      <Input
        id={name}
        aria-invalid={!!errors[name]}
        {...register(name as Parameters<typeof register>[0])}
        className={cn(errors[name] && "border-red-400")}
      />
      {errors[name] && (
        <p className="text-sm text-red-600">{errors[name]?.message as string}</p>
      )}
    </div>
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {/* Civilité */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Civilité</label>
        <div className="flex flex-wrap gap-3">
          {(["M", "MME", "DR", "PR"] as const).map((c) => (
            <label key={c} className="flex cursor-pointer items-center gap-1.5 text-sm">
              <input type="radio" value={c} {...register("civility")} className="accent-[var(--azae-orange)]" />
              {c === "M" ? "M." : c === "MME" ? "Mme" : c}
            </label>
          ))}
        </div>
      </div>

      {/* Identité §7.3.3 */}
      <div className="grid gap-4 sm:grid-cols-2">
        {field("firstName", "Prénom", true)}
        {field("lastName", "Nom", true)}
      </div>

      {/* Contact §7.3.3 */}
      <div className="grid gap-4 sm:grid-cols-2">
        {field("email", "Email", true)}
        {field("phone", "Téléphone", true)}
      </div>

      {/* Mot de passe §12.9 */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Mot de passe <span className="text-red-500">*</span>
            <span className="ml-2 text-xs font-normal text-gray-400">8 car. min, maj, chiffre, symbole</span>
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              {...register("password")}
              className={cn("pr-10", errors.password && "border-red-400")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              aria-label={showPassword ? "Masquer" : "Afficher"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
        </div>
        <div className="space-y-1">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Confirmer le mot de passe <span className="text-red-500">*</span>
          </label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            {...register("confirmPassword")}
            className={cn(errors.confirmPassword && "border-red-400")}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>
      </div>

      {/* Naissance + Nationalité §7.3.3 */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
            Date de naissance
          </label>
          <Input id="dateOfBirth" type="date" {...register("dateOfBirth")} />
        </div>
        {field("nationality", "Nationalité")}
      </div>

      {/* Adresse §7.3.3 */}
      <div className="grid gap-4 sm:grid-cols-3">
        {field("country", "Pays")}
        {field("city", "Ville")}
        {field("neighborhood", "Quartier")}
      </div>

      {/* Profession §7.3.3 */}
      <div className="grid gap-4 sm:grid-cols-2">
        {field("profession", "Profession")}
        {field("employer", "Employeur")}
      </div>

      {/* Motivation §7.3.3 */}
      <div className="space-y-1">
        <label htmlFor="motivation" className="block text-sm font-medium text-gray-700">
          Pourquoi souhaitez-vous rejoindre IQRA TOGO ?
        </label>
        <Textarea
          id="motivation"
          rows={4}
          placeholder="Décrivez votre motivation et comment vous souhaitez contribuer à la mission de l'ONG..."
          {...register("motivation")}
          className="resize-none"
        />
      </div>

      {/* §7.3.3 Consentements */}
      <div className="space-y-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
        <div className="flex items-start gap-2">
          <input
            id="rgpdConsent"
            type="checkbox"
            {...register("rgpdConsent")}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-[var(--azae-orange)]"
          />
          <label htmlFor="rgpdConsent" className="text-sm text-gray-700">
            J'accepte que mes données soient traitées conformément à la{" "}
            <Link href="/confidentialite" className="underline" style={{ color: "var(--azae-orange)" }}>
              politique de confidentialité
            </Link>{" "}
            (RGPD) <span className="text-red-500">*</span>
          </label>
        </div>
        {errors.rgpdConsent && (
          <p className="ml-6 text-xs text-red-500">{errors.rgpdConsent.message}</p>
        )}

        <div className="flex items-start gap-2">
          <input
            id="rulesAccepted"
            type="checkbox"
            {...register("rulesAccepted")}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-[var(--azae-orange)]"
          />
          <label htmlFor="rulesAccepted" className="text-sm text-gray-700">
            J'accepte le{" "}
            <a href="#" className="underline" style={{ color: "var(--azae-orange)" }}>
              règlement intérieur d'IQRA TOGO
            </a>{" "}
            <span className="text-red-500">*</span>
          </label>
        </div>
        {errors.rulesAccepted && (
          <p className="ml-6 text-xs text-red-500">{errors.rulesAccepted.message}</p>
        )}
      </div>

      {serverError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {serverError}
        </div>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full gap-2 bg-[var(--azae-orange)] text-white hover:bg-[var(--azae-orange-dark)]"
      >
        <UserPlus className="h-4 w-4" />
        {isSubmitting ? "Envoi en cours…" : "Soumettre ma demande d'adhésion"}
      </Button>

      <p className="text-center text-xs text-gray-400">
        Adhésion gratuite. Votre dossier sera examiné sous 48h ouvrées.
      </p>
    </form>
  )
}
