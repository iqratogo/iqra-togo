"use client"

/* §7.2.1+7.2.3 Formulaire création/édition publication avec TipTap + SEO */

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import dynamic from "next/dynamic"
import { Globe, Clock, ChevronDown, ChevronUp, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import FileUpload from "@/components/ui/FileUpload"
import { cn } from "@/lib/utils"

/* P2 — TipTap est un bundle lourd (~300 Ko) : chargement différé côté client uniquement */
const RichTextEditor = dynamic(() => import("../../_components/RichTextEditor"), {
  ssr: false,
  loading: () => (
    <div className="h-[380px] animate-pulse rounded-xl border border-gray-200 bg-gray-50" />
  ),
})

const schema = z.object({
  title: z.string().min(3, "Titre requis (min. 3 caractères)"),
  excerpt: z.string().optional(),
  category: z.enum(["ACTUALITE", "PROJET", "COMMUNIQUE", "PARTENAIRE"]),
  featuredImage: z.string().url("URL invalide").optional().or(z.literal("")),
  pdfUrl: z.string().url("URL invalide").optional().or(z.literal("")),
  seoTitle: z.string().optional(),
  seoDescription: z.string().max(160, "Max. 160 caractères").optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  postId?: string
  initialData?: Partial<FormValues & { content: string; status: string }>
}

export default function PublicationForm({ postId, initialData }: Props) {
  const router = useRouter()
  const [content, setContent] = useState(initialData?.content ?? "")
  const [status, setStatus] = useState(initialData?.status ?? "DRAFT")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSeo, setShowSeo] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initialData?.title ?? "",
      excerpt: initialData?.excerpt ?? "",
      category: (initialData?.category as FormValues["category"]) ?? "ACTUALITE",
      featuredImage: initialData?.featuredImage ?? "",
      pdfUrl: initialData?.pdfUrl ?? "",
      seoTitle: initialData?.seoTitle ?? "",
      seoDescription: initialData?.seoDescription ?? "",
    },
  })

  const seoTitle = watch("seoTitle")
  const seoDesc = watch("seoDescription")

  const save = async (data: FormValues, targetStatus: string) => {
    setSaving(true)
    setError(null)
    const payload = { ...data, content, status: targetStatus }

    const res = postId
      ? await fetch(`/api/admin/publications/${postId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch("/api/admin/publications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })

    const json = await res.json()
    if (!res.ok) {
      setError(json.error ?? "Erreur lors de la sauvegarde")
      setSaving(false)
      return
    }
    setStatus(targetStatus)
    setSaving(false)
    if (!postId) router.push(`/dashboard/admin/publications/${json.id}`)
  }

  const onDraft = handleSubmit((d) => save(d, "DRAFT"))
  const onPublish = handleSubmit((d) => save(d, "PUBLISHED"))

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold" style={{ color: "var(--azae-navy)" }}>
            {postId ? "Modifier la publication" : "Nouvelle publication"}
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Statut actuel : {status === "PUBLISHED" ? "Publié" : status === "DRAFT" ? "Brouillon" : "Archivé"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onDraft} disabled={saving} className="gap-2">
            <Clock className="h-4 w-4" />
            Enregistrer brouillon
          </Button>
          <Button onClick={onPublish} disabled={saving} className="gap-2 bg-[var(--azae-orange)] text-white hover:bg-[var(--azae-orange-dark)]">
            <Globe className="h-4 w-4" />
            {status === "PUBLISHED" ? "Mettre à jour" : "Publier"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Contenu principal */}
        <div className="space-y-4 lg:col-span-2">
          {/* Titre */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Titre <span className="text-red-500">*</span>
            </label>
            <Input
              {...register("title")}
              placeholder="Titre de la publication"
              className={cn("text-lg font-medium", errors.title && "border-red-400")}
            />
            {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
          </div>

          {/* Excerpt */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Résumé</label>
            <Textarea
              {...register("excerpt")}
              placeholder="Courte description affichée dans les listes…"
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Éditeur TipTap */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Contenu</label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Rédigez votre article ici…"
            />
          </div>

          {/* SEO (collapsible) §7.2.3 */}
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowSeo(v => !v)}
              className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <span>Optimisation SEO</span>
              {showSeo ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {showSeo && (
              <div className="space-y-4 border-t border-gray-100 p-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Titre SEO</label>
                  <Input {...register("seoTitle")} placeholder="Titre pour les moteurs de recherche" />
                  <p className={cn("text-xs", (seoTitle?.length ?? 0) > 60 ? "text-red-500" : "text-gray-400")}>
                    {seoTitle?.length ?? 0}/60 caractères
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Description SEO</label>
                  <Textarea
                    {...register("seoDescription")}
                    placeholder="Description pour les moteurs de recherche (max. 160 car.)"
                    rows={3}
                    className="resize-none"
                  />
                  <p className={cn("text-xs", (seoDesc?.length ?? 0) > 160 ? "text-red-500" : "text-gray-400")}>
                    {seoDesc?.length ?? 0}/160 caractères
                  </p>
                  {errors.seoDescription && <p className="text-xs text-red-500">{errors.seoDescription.message}</p>}
                </div>
                {/* Aperçu Google */}
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="mb-1 text-xs text-gray-500">Aperçu Google</p>
                  <p className="text-sm font-medium text-blue-700 line-clamp-1">{seoTitle || "Titre de la page"}</p>
                  <p className="text-xs text-green-700">iqratogo.org › actualites › …</p>
                  <p className="mt-0.5 text-xs text-gray-600 line-clamp-2">{seoDesc || "Description de la page…"}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Panneau latéral */}
        <div className="space-y-4">
          {/* Catégorie */}
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">Catégorie</label>
            <select
              {...register("category")}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--azae-orange)]"
            >
              <option value="ACTUALITE">Actualité</option>
              <option value="PROJET">Projet</option>
              <option value="COMMUNIQUE">Communiqué</option>
              <option value="PARTENAIRE">Partenaire</option>
            </select>
          </div>

          {/* Image à la une */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
            <label className="block text-sm font-medium text-gray-700">Image à la une</label>
            <FileUpload
              accept="image/*"
              label="Téléverser une image"
              currentUrl={watch("featuredImage")}
              onUpload={(url) => setValue("featuredImage", url, { shouldValidate: true })}
            />
            <Input
              {...register("featuredImage")}
              placeholder="ou coller une URL https://…"
              className={cn(errors.featuredImage && "border-red-400")}
            />
            {errors.featuredImage && <p className="text-xs text-red-500">{errors.featuredImage.message}</p>}
          </div>

          {/* PDF (pour communiqués) */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
            <label className="block text-sm font-medium text-gray-700">Fichier PDF</label>
            <p className="text-xs text-gray-400">Optionnel — pour les communiqués officiels</p>
            <FileUpload
              accept=".pdf"
              label="Téléverser un PDF"
              currentUrl={watch("pdfUrl")}
              onUpload={(url) => setValue("pdfUrl", url, { shouldValidate: true })}
            />
            <Input
              {...register("pdfUrl")}
              placeholder="ou coller une URL https://…"
              className={cn(errors.pdfUrl && "border-red-400")}
            />
            {errors.pdfUrl && <p className="text-xs text-red-500">{errors.pdfUrl.message}</p>}
          </div>

          {/* Actions mobiles */}
          <div className="space-y-2 lg:hidden">
            <Button variant="outline" onClick={onDraft} disabled={saving} className="w-full gap-2">
              <Clock className="h-4 w-4" /> Enregistrer brouillon
            </Button>
            <Button onClick={onPublish} disabled={saving} className="w-full gap-2 bg-[var(--azae-orange)] text-white">
              <Globe className="h-4 w-4" /> {status === "PUBLISHED" ? "Mettre à jour" : "Publier"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
