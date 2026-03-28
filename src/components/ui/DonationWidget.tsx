"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

/* ── Types & constantes ── */

const PRESET_AMOUNTS = [1000, 2500, 5000, 10000] as const

const AFFECTATIONS = [
  { value: "GENERAL", label: "Général" },
  { value: "BOURSES_EDUCATION", label: "Éducation" },
  { value: "SOUTIEN_FAMILLES", label: "Familles" },
  { value: "PROJETS_TERRAIN", label: "Terrain" },
] as const

/* ── Schéma Zod ── */

const schema = z
  .object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().optional(),
    anonymous: z.boolean().optional(),
    affectation: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.anonymous) {
      if (!data.firstName || data.firstName.length < 2) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Prénom requis", path: ["firstName"] })
      }
      if (!data.lastName || data.lastName.length < 2) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Nom requis", path: ["lastName"] })
      }
      if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Email invalide", path: ["email"] })
      }
    }
  })

type FormValues = z.infer<typeof schema>

/* ── Component ── */

export default function DonationWidget() {
  const [selectedPreset, setSelectedPreset] = useState<number | null>(2500)
  const [customAmount, setCustomAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { anonymous: false, affectation: "GENERAL" },
  })

  const isAnonymous = watch("anonymous")

  const effectiveAmount = customAmount
    ? parseInt(customAmount, 10)
    : selectedPreset

  const onSubmit = async (data: FormValues) => {
    if (!effectiveAmount || effectiveAmount < 500) {
      setServerError("Montant minimum : 500 FCFA")
      return
    }
    setLoading(true)
    setServerError(null)

    try {
      const res = await fetch("/api/donations/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, amount: effectiveAmount }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Erreur lors du paiement")
      if (json.paymentUrl) window.location.href = json.paymentUrl
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Une erreur est survenue")
    } finally {
      setLoading(false)
    }
  }

  const amountLabel = effectiveAmount
    ? `— ${effectiveAmount.toLocaleString("fr-FR")} FCFA`
    : ""

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5 rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
      noValidate
    >
      <h3
        className="font-[family-name:var(--font-playfair)] text-xl font-bold"
        style={{ color: "var(--azae-navy)" }}
      >
        Faire un don
      </h3>

      {/* Montants preset */}
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-gray-700">Choisissez un montant (FCFA)</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PRESET_AMOUNTS.map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => { setSelectedPreset(amount); setCustomAmount("") }}
              className={cn(
                "rounded-lg border py-2.5 text-sm font-semibold transition-colors",
                selectedPreset === amount && !customAmount
                  ? "border-[var(--azae-orange)] bg-orange-50 text-[var(--azae-orange)]"
                  : "border-gray-200 text-gray-700 hover:border-[var(--azae-orange)] hover:text-[var(--azae-orange)]"
              )}
            >
              {amount.toLocaleString("fr-FR")}
            </button>
          ))}
        </div>
        <Input
          type="number"
          placeholder="Autre montant"
          value={customAmount}
          onChange={(e) => { setCustomAmount(e.target.value); setSelectedPreset(null) }}
          min={500}
          className="mt-2"
          aria-label="Saisir un montant libre"
        />
      </fieldset>

      {/* Affectation */}
      <div className="space-y-2">
        <label htmlFor="affectation" className="text-sm font-medium text-gray-700">
          Affecter à
        </label>
        <select
          id="affectation"
          {...register("affectation")}
          className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--azae-orange)]"
        >
          {AFFECTATIONS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* Don anonyme */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="anonymous"
          {...register("anonymous")}
          className="h-4 w-4 rounded border-gray-300 accent-[var(--azae-orange)]"
        />
        <label htmlFor="anonymous" className="text-sm text-gray-700">
          Don anonyme
        </label>
      </div>

      {/* Champs identité (conditionnels) */}
      {!isAnonymous && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Input placeholder="Prénom" {...register("firstName")} />
              {errors.firstName && (
                <p className="mt-1 text-xs text-red-500">{errors.firstName.message}</p>
              )}
            </div>
            <div>
              <Input placeholder="Nom" {...register("lastName")} />
              {errors.lastName && (
                <p className="mt-1 text-xs text-red-500">{errors.lastName.message}</p>
              )}
            </div>
          </div>
          <Input
            type="email"
            placeholder="Email (optionnel)"
            {...register("email")}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>
      )}

      {/* Erreur serveur */}
      {serverError && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">
          {serverError}
        </p>
      )}

      <Button
        type="submit"
        disabled={loading || !effectiveAmount}
        className="w-full bg-[var(--azae-orange)] text-white hover:bg-[var(--azae-orange-dark)]"
      >
        {loading ? "Traitement en cours…" : `Faire un don ${amountLabel}`}
      </Button>
    </form>
  )
}
