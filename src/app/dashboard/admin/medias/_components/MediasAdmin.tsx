"use client"

/* §7.2.4 Médiathèque Admin — upload + liste */

import { useState, useEffect, useCallback } from "react"
import { Image as ImageIcon, Film, FileText, Plus, Trash2, Search, X, Link as LinkIcon, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import NextImage from "next/image"
import FileUpload from "@/components/ui/FileUpload"

type Media = {
  id: string
  name: string
  type: string
  url: string
  alt: string | null
  createdAt: string
}

const TYPE_ICONS = {
  IMAGE: ImageIcon,
  VIDEO: Film,
  DOCUMENT: FileText,
}

export default function MediasAdmin() {
  const [medias, setMedias] = useState<Media[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState("")
  const [search, setSearch] = useState("")
  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState({ name: "", type: "IMAGE", url: "", alt: "" })
  const [addError, setAddError] = useState("")
  const [adding, setAdding] = useState(false)
  const [uploadMode, setUploadMode] = useState<"url" | "upload">("upload")

  const fetchData = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page) })
    if (typeFilter) params.set("type", typeFilter)
    if (search) params.set("search", search)
    const res = await fetch(`/api/admin/medias?${params}`)
    const data = await res.json()
    setMedias(data.medias ?? [])
    setTotal(data.total ?? 0)
    setPages(data.pages ?? 1)
    setLoading(false)
  }, [page, typeFilter, search])

  useEffect(() => { fetchData() }, [fetchData])

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce média ?")) return
    await fetch(`/api/admin/medias/${id}`, { method: "DELETE" })
    fetchData()
  }

  async function handleAdd() {
    if (!addForm.name || !addForm.url) { setAddError("Titre et URL requis"); return }
    setAdding(true)
    setAddError("")
    const res = await fetch("/api/admin/medias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addForm),
    })
    const json = await res.json()
    if (!res.ok) { setAddError(json.error); setAdding(false); return }
    setAdding(false)
    setShowAdd(false)
    setAddForm({ name: "", type: "IMAGE", url: "", alt: "" })
    fetchData()
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold" style={{ color: "var(--azae-navy)" }}>
            Médiathèque
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">{total} média{total > 1 ? "s" : ""}</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="gap-2 bg-[var(--azae-orange)] text-white hover:bg-[var(--azae-orange-dark)]">
          <Plus className="h-4 w-4" /> Ajouter un média
        </Button>
      </div>

      {/* Filtres */}
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input placeholder="Rechercher…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="pl-9" />
        </div>
        {(["", "IMAGE", "VIDEO", "DOCUMENT"] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTypeFilter(t); setPage(1) }}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              typeFilter === t ? "text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
            style={typeFilter === t ? { backgroundColor: "var(--azae-orange)" } : {}}
          >
            {t === "" ? "Tous" : t === "IMAGE" ? "Photos" : t === "VIDEO" ? "Vidéos" : "Documents"}
          </button>
        ))}
      </div>

      {/* Grille */}
      {loading ? (
        <div className="py-16 text-center text-sm text-gray-400">Chargement…</div>
      ) : medias.length === 0 ? (
        <div className="py-16 text-center">
          <ImageIcon className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm text-gray-500">Aucun média</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {medias.map((m) => {
            const Icon = TYPE_ICONS[m.type as keyof typeof TYPE_ICONS] ?? ImageIcon
            return (
              <div key={m.id} className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                {m.type === "IMAGE" ? (
                  <div className="relative aspect-video overflow-hidden bg-gray-100">
                    <NextImage
                      src={m.url}
                      alt={m.alt ?? m.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="flex aspect-video items-center justify-center bg-gray-100">
                    <Icon className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-800 line-clamp-1">{m.name}</p>
                  <p className="mt-0.5 text-xs text-gray-400">{m.type === "IMAGE" ? "Photo" : m.type === "VIDEO" ? "Vidéo" : "Document"}</p>
                </div>
                <button
                  onClick={() => handleDelete(m.id)}
                  className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-red-500 opacity-0 shadow transition-opacity group-hover:opacity-100 hover:bg-red-50"
                  title="Supprimer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Précédent</Button>
          <span className="text-sm text-gray-500">Page {page} / {pages}</span>
          <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage(p => p + 1)}>Suivant</Button>
        </div>
      )}

      {/* Modal ajout */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Ajouter un média</h3>
              <button onClick={() => setShowAdd(false)} className="rounded p-1 text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
            </div>

            <div className="space-y-3">
              {/* Mode URL / Upload */}
              <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setUploadMode("upload")}
                  className={cn("flex flex-1 items-center justify-center gap-1.5 py-2 text-sm font-medium transition-colors", uploadMode === "upload" ? "bg-[var(--azae-orange)] text-white" : "text-gray-500 hover:bg-gray-50")}
                >
                  <Upload className="h-3.5 w-3.5" /> Téléverser
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode("url")}
                  className={cn("flex flex-1 items-center justify-center gap-1.5 py-2 text-sm font-medium transition-colors", uploadMode === "url" ? "bg-[var(--azae-orange)] text-white" : "text-gray-500 hover:bg-gray-50")}
                >
                  <LinkIcon className="h-3.5 w-3.5" /> URL
                </button>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Type</label>
                <select
                  value={addForm.type}
                  onChange={(e) => setAddForm(f => ({ ...f, type: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--azae-orange)]"
                >
                  <option value="IMAGE">Photo / Image</option>
                  <option value="VIDEO">Vidéo</option>
                  <option value="DOCUMENT">Document (PDF, Word, Excel…)</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Titre *</label>
                <Input value={addForm.name} onChange={(e) => setAddForm(f => ({ ...f, name: e.target.value }))} placeholder="Titre du média" />
              </div>

              {uploadMode === "upload" ? (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Fichier *</label>
                  <FileUpload
                    accept={
                      addForm.type === "IMAGE"
                        ? "image/*"
                        : addForm.type === "VIDEO"
                        ? "video/mp4,video/webm"
                        : ".pdf,.doc,.docx,.xls,.xlsx,.md,.txt"
                    }
                    label="Choisir un fichier"
                    currentUrl={addForm.url || undefined}
                    onUpload={(url, name) => setAddForm(f => ({ ...f, url, name: f.name || name }))}
                  />
                  {addForm.url && <p className="mt-1 truncate text-xs text-green-600">✓ {addForm.url}</p>}
                </div>
              ) : (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">URL *</label>
                  <Input value={addForm.url} onChange={(e) => setAddForm(f => ({ ...f, url: e.target.value }))} placeholder="https://…" />
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Texte alternatif</label>
                <Input value={addForm.alt} onChange={(e) => setAddForm(f => ({ ...f, alt: e.target.value }))} placeholder="Description pour l'accessibilité" />
              </div>
              {addError && <p className="text-xs text-red-500">{addError}</p>}
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAdd(false)}>Annuler</Button>
              <Button onClick={handleAdd} disabled={adding} className="bg-[var(--azae-orange)] text-white hover:bg-[var(--azae-orange-dark)]">
                {adding ? "Ajout…" : "Ajouter"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
