"use client"

/* §8 Formulaire profil membre */

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Save, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const schema = z.object({
  phone: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  neighborhood: z.string().optional(),
  profession: z.string().optional(),
  employer: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  member: {
    id: string
    firstName: string
    lastName: string
    email: string
    memberNumber: string
    phone: string
    country: string
    city: string
    neighborhood: string
    profession: string
    employer: string
  }
}

export default function ProfilForm({ member }: Props) {
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      phone: member.phone,
      country: member.country,
      city: member.city,
      neighborhood: member.neighborhood,
      profession: member.profession,
      employer: member.employer,
    },
  })

  const onSubmit = async (data: FormValues) => {
    setError(null)
    const res = await fetch(`/api/membre/profil`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const d = await res.json()
      setError(d.error ?? "Erreur lors de la sauvegarde")
      return
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Infos non modifiables */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3">
        <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Informations fixes</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs text-gray-500">Prénom</label>
            <p className="mt-0.5 text-sm font-medium text-gray-800">{member.firstName}</p>
          </div>
          <div>
            <label className="text-xs text-gray-500">Nom</label>
            <p className="mt-0.5 text-sm font-medium text-gray-800">{member.lastName}</p>
          </div>
          <div>
            <label className="text-xs text-gray-500">Email</label>
            <p className="mt-0.5 text-sm font-medium text-gray-800">{member.email}</p>
          </div>
          <div>
            <label className="text-xs text-gray-500">N° Membre</label>
            <p className="mt-0.5 font-mono text-sm font-medium" style={{ color: "var(--azae-orange)" }}>{member.memberNumber}</p>
          </div>
        </div>
      </div>

      {/* Infos modifiables */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Téléphone</label>
          <Input {...register("phone")} placeholder="+228 XX XX XX XX" />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Pays</label>
          <Input {...register("country")} />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Ville</label>
          <Input {...register("city")} placeholder="Lomé" />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Quartier</label>
          <Input {...register("neighborhood")} />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Profession</label>
          <Input {...register("profession")} />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Employeur</label>
          <Input {...register("employer")} />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="gap-2 bg-[var(--azae-navy)] text-white hover:bg-[var(--azae-navy)]/90"
      >
        {saved ? <CheckCircle className="h-4 w-4" /> : <Save className="h-4 w-4" />}
        {saved ? "Enregistré !" : isSubmitting ? "Enregistrement…" : "Enregistrer les modifications"}
      </Button>
    </form>
  )
}
