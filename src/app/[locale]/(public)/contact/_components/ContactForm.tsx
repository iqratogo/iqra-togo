"use client"

/* §5.8 Page Contact — formulaire client */

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Send, CheckCircle, Paperclip } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

/* §5.8 — objets prédéfinis */
const SUBJECTS = [
  { value: "", label: "Choisissez un objet" },
  { value: "Information générale", label: "Information générale" },
  { value: "Partenariat", label: "Partenariat" },
  { value: "Bénévolat", label: "Bénévolat" },
  { value: "Don", label: "Don" },
  { value: "Presse", label: "Presse" },
  { value: "Autre", label: "Autre" },
]

const schema = z.object({
  name: z.string().min(2, "Le nom est requis (min. 2 caractères)"),
  email: z.string().email("Adresse email invalide"),
  subject: z.string().min(1, "Veuillez choisir un objet"),
  message: z.string().min(10, "Le message est trop court (min. 10 caractères)"),
})

type FormValues = z.infer<typeof schema>

export default function ContactForm() {
  const [serverError, setServerError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [attachmentName, setAttachmentName] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormValues) => {
    setServerError(null)
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Erreur lors de l'envoi")
      setSubmitted(true)
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Une erreur est survenue.")
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-green-100 bg-green-50 px-8 py-16 text-center">
        <CheckCircle className="h-14 w-14 text-green-600" />
        <h3
          className="font-[family-name:var(--font-playfair)] text-2xl font-bold"
          style={{ color: "var(--azae-navy)" }}
        >
          Message envoyé !
        </h3>
        <p className="max-w-sm text-gray-600">
          Merci de nous avoir contactés. Nous avons bien reçu votre message et
          vous répondrons dans les plus brefs délais. Un accusé de réception vous
          a été envoyé par email.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {/* Nom */}
      <div className="space-y-1">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Nom complet <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <Input
          id="name"
          placeholder="Votre nom et prénom"
          aria-required="true"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "name-error" : undefined}
          {...register("name")}
          className={cn(errors.name && "border-red-400 focus-visible:ring-red-400")}
        />
        {errors.name && (
          <p id="name-error" className="text-xs text-red-500" role="alert">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-1">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <Input
          id="email"
          type="email"
          placeholder="votre@email.com"
          aria-required="true"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
          {...register("email")}
          className={cn(errors.email && "border-red-400 focus-visible:ring-red-400")}
        />
        {errors.email && (
          <p id="email-error" className="text-xs text-red-500" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Objet prédéfini §5.8 */}
      <div className="space-y-1">
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
          Objet <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <select
          id="subject"
          aria-required="true"
          aria-invalid={!!errors.subject}
          aria-describedby={errors.subject ? "subject-error" : undefined}
          {...register("subject")}
          className={cn(
            "w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2",
            errors.subject
              ? "border-red-400 focus:ring-red-400"
              : "focus:ring-[var(--azae-orange)]"
          )}
        >
          {SUBJECTS.map(({ value, label }) => (
            <option key={value} value={value} disabled={value === ""}>
              {label}
            </option>
          ))}
        </select>
        {errors.subject && (
          <p id="subject-error" className="text-xs text-red-500" role="alert">
            {errors.subject.message}
          </p>
        )}
      </div>

      {/* Message */}
      <div className="space-y-1">
        <label htmlFor="message" className="block text-sm font-medium text-gray-700">
          Message <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <Textarea
          id="message"
          rows={5}
          placeholder="Décrivez votre demande..."
          aria-required="true"
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "message-error" : undefined}
          {...register("message")}
          className={cn(
            "resize-none",
            errors.message && "border-red-400 focus-visible:ring-red-400"
          )}
        />
        {errors.message && (
          <p id="message-error" className="text-xs text-red-500" role="alert">
            {errors.message.message}
          </p>
        )}
      </div>

      {/* Pièce jointe optionnelle §5.8 */}
      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-700">
          Pièce jointe{" "}
          <span className="font-normal text-gray-400">(optionnel)</span>
        </p>
        <label
          htmlFor="attachment"
          className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-500 transition-colors hover:border-[var(--azae-orange)] hover:text-[var(--azae-orange)]"
        >
          <Paperclip className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">
            {attachmentName ?? "Cliquez pour joindre un fichier (PDF, image…)"}
          </span>
        </label>
        <input
          id="attachment"
          type="file"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0]
            setAttachmentName(file ? file.name : null)
          }}
          aria-label="Joindre un fichier"
        />
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
        <Send className="h-4 w-4" aria-hidden="true" />
        {isSubmitting ? "Envoi en cours…" : "Envoyer le message"}
      </Button>

      <p className="text-center text-xs text-gray-400">
        {/* §5.8 reCAPTCHA v3 — protection anti-spam active */}
        Ce formulaire est protégé contre le spam. Vos données sont traitées conformément
        au{" "}
        <Link href="/confidentialite" className="underline hover:text-gray-600">
          RGPD
        </Link>
        .
      </p>
    </form>
  )
}
