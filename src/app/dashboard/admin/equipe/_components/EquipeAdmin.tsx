"use client"

/* §7 Gestion Équipe Admin — CRUD membres d'administration */

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { Plus, Pencil, Trash2, Search, UserRound, X, ToggleLeft, ToggleRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import FileUpload from "@/components/ui/FileUpload"
import { cn } from "@/lib/utils"

type Department = "DIRECTION" | "PROGRAMMES" | "COMMUNICATION" | "FINANCE"

type TeamMember = {
  id: string
  firstName: string
  lastName: string
  position: string
  department: Department
  bio: string | null
  bioFull: string | null
  photoUrl: string | null
  email: string | null
  phone: string | null
  facebookUrl: string | null
  linkedinUrl: string | null
  twitterUrl: string | null
  displayOrder: number
  isActive: boolean
}

const DEPT_LABELS: Record<Department, string> = {
  DIRECTION: "Direction",
  PROGRAMMES: "Programmes",
  COMMUNICATION: "Communication",
  FINANCE: "Finance",
}

const DEPT_COLORS: Record<Department, string> = {
  DIRECTION: "var(--azae-navy)",
  PROGRAMMES: "var(--azae-orange)",
  COMMUNICATION: "#7C3AED",
  FINANCE: "var(--azae-green)",
}

const EMPTY_FORM: Omit<TeamMember, "id"> = {
  firstName: "",
  lastName: "",
  position: "",
  department: "DIRECTION",
  bio: "",
  bioFull: "",
  photoUrl: "",
  email: "",
  phone: "",
  facebookUrl: "",
  linkedinUrl: "",
  twitterUrl: "",
  displayOrder: 0,
  isActive: true,
}

export default function EquipeAdmin() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<TeamMember | null>(null)
  const [form, setForm] = useState<Omit<TeamMember, "id">>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState("")

  const fetchData = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page) })
    if (search) params.set("search", search)
    const res = await fetch(`/api/admin/equipe?${params}`)
    const data = await res.json()
    setMembers(data.members ?? [])
    setTotal(data.total ?? 0)
    setPages(data.pages ?? 1)
    setLoading(false)
  }, [page, search])

  useEffect(() => { fetchData() }, [fetchData])

  function openAdd() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setFormError("")
    setShowModal(true)
  }

  function openEdit(m: TeamMember) {
    setEditing(m)
    setForm({
      firstName: m.firstName,
      lastName: m.lastName,
      position: m.position,
      department: m.department,
      bio: m.bio ?? "",
      bioFull: m.bioFull ?? "",
      photoUrl: m.photoUrl ?? "",
      email: m.email ?? "",
      phone: m.phone ?? "",
      facebookUrl: m.facebookUrl ?? "",
      linkedinUrl: m.linkedinUrl ?? "",
      twitterUrl: m.twitterUrl ?? "",
      displayOrder: m.displayOrder,
      isActive: m.isActive,
    })
    setFormError("")
    setShowModal(true)
  }

  async function handleSave() {
    if (!form.firstName || !form.lastName || !form.position) {
      setFormError("Prénom, nom et poste sont obligatoires")
      return
    }
    setSaving(true)
    setFormError("")

    const payload = {
      ...form,
      bio: form.bio || null,
      bioFull: form.bioFull || null,
      photoUrl: form.photoUrl || null,
      email: form.email || null,
      phone: form.phone || null,
      facebookUrl: form.facebookUrl || null,
      linkedinUrl: form.linkedinUrl || null,
      twitterUrl: form.twitterUrl || null,
    }

    const res = editing
      ? await fetch(`/api/admin/equipe/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch("/api/admin/equipe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })

    const json = await res.json()
    setSaving(false)
    if (!res.ok) { setFormError(json.error ?? "Erreur serveur"); return }
    setShowModal(false)
    fetchData()
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Supprimer ${name} de l'équipe ?`)) return
    await fetch(`/api/admin/equipe/${id}`, { method: "DELETE" })
    fetchData()
  }

  async function toggleActive(m: TeamMember) {
    await fetch(`/api/admin/equipe/${m.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !m.isActive }),
    })
    fetchData()
  }

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }))

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold" style={{ color: "var(--azae-navy)" }}>
            Équipe d'administration
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">{total} membre{total > 1 ? "s" : ""}</p>
        </div>
        <Button onClick={openAdd} className="gap-2 bg-[var(--azae-orange)] text-white hover:bg-[var(--azae-orange-dark)]">
          <Plus className="h-4 w-4" /> Ajouter un membre
        </Button>
      </div>

      {/* Recherche */}
      <div className="mb-4 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Rechercher…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="pl-9"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-16 text-center text-sm text-gray-400">Chargement…</div>
      ) : members.length === 0 ? (
        <div className="py-16 text-center">
          <UserRound className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm text-gray-500">Aucun membre dans l'équipe</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-600">Membre</th>
                <th className="px-4 py-3 font-medium text-gray-600">Poste</th>
                <th className="px-4 py-3 font-medium text-gray-600">Département</th>
                <th className="px-4 py-3 font-medium text-gray-600 text-center">Ordre</th>
                <th className="px-4 py-3 font-medium text-gray-600 text-center">Visible</th>
                <th className="px-4 py-3 font-medium text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {members.map((m) => (
                <tr key={m.id} className="transition-colors hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-gray-200">
                        {m.photoUrl ? (
                          <Image
                            src={m.photoUrl}
                            alt={`${m.firstName} ${m.lastName}`}
                            fill
                            className="object-cover"
                            sizes="36px"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gray-100">
                            <UserRound className="h-4 w-4 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <span className="font-medium text-gray-800">
                        {m.firstName} {m.lastName}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{m.position}</td>
                  <td className="px-4 py-3">
                    <span
                      className="rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
                      style={{ backgroundColor: DEPT_COLORS[m.department] }}
                    >
                      {DEPT_LABELS[m.department]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-500">{m.displayOrder}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleActive(m)}
                      title={m.isActive ? "Masquer" : "Afficher"}
                      className={cn("transition-colors", m.isActive ? "text-green-500 hover:text-green-600" : "text-gray-300 hover:text-gray-400")}
                    >
                      {m.isActive ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(m)}
                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                        title="Modifier"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(m.id, `${m.firstName} ${m.lastName}`)}
                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

      {/* Modal ajout / édition */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl">
            {/* Header modal */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h3 className="font-semibold text-gray-800">
                {editing ? "Modifier le profil" : "Nouveau membre"}
              </h3>
              <button onClick={() => setShowModal(false)} className="rounded-lg p-1 text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Corps modal scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Photo */}
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-gray-200">
                  {form.photoUrl ? (
                    <Image
                      src={form.photoUrl}
                      alt="Photo"
                      fill
                      className="object-cover"
                      sizes="64px"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-100">
                      <UserRound className="h-7 w-7 text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <label className="text-xs font-medium text-gray-600">Photo de profil</label>
                  <FileUpload
                    accept="image/*"
                    label="Téléverser une photo"
                    currentUrl={form.photoUrl ?? undefined}
                    onUpload={(url) => setForm(f => ({ ...f, photoUrl: url }))}
                  />
                  <Input
                    value={form.photoUrl ?? ""}
                    onChange={set("photoUrl")}
                    placeholder="ou coller une URL…"
                    className="text-xs"
                  />
                </div>
              </div>

              {/* Prénom / Nom */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">Prénom *</label>
                  <Input value={form.firstName} onChange={set("firstName")} placeholder="Jean" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">Nom *</label>
                  <Input value={form.lastName} onChange={set("lastName")} placeholder="Dupont" />
                </div>
              </div>

              {/* Poste */}
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Poste *</label>
                <Input value={form.position} onChange={set("position")} placeholder="Directeur Exécutif" />
              </div>

              {/* Département */}
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Département</label>
                <select
                  value={form.department}
                  onChange={set("department")}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--azae-orange)]"
                >
                  <option value="DIRECTION">Direction</option>
                  <option value="PROGRAMMES">Programmes</option>
                  <option value="COMMUNICATION">Communication</option>
                  <option value="FINANCE">Finance</option>
                </select>
              </div>

              {/* Bio courte */}
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Bio courte</label>
                <Textarea
                  value={form.bio ?? ""}
                  onChange={set("bio")}
                  placeholder="Résumé en 1-2 phrases…"
                  rows={2}
                  className="resize-none text-sm"
                />
              </div>

              {/* Bio complète */}
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Bio complète</label>
                <Textarea
                  value={form.bioFull ?? ""}
                  onChange={set("bioFull")}
                  placeholder="Biographie détaillée affichée dans le profil…"
                  rows={4}
                  className="resize-none text-sm"
                />
              </div>

              {/* Email / Téléphone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">Email</label>
                  <Input type="email" value={form.email ?? ""} onChange={set("email")} placeholder="jean@azaetogo.com" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">Téléphone</label>
                  <Input value={form.phone ?? ""} onChange={set("phone")} placeholder="+228 00 00 00 00" />
                </div>
              </div>

              {/* Réseaux sociaux */}
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">LinkedIn</label>
                <Input value={form.linkedinUrl ?? ""} onChange={set("linkedinUrl")} placeholder="https://linkedin.com/in/…" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Facebook</label>
                <Input value={form.facebookUrl ?? ""} onChange={set("facebookUrl")} placeholder="https://facebook.com/…" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Twitter / X</label>
                <Input value={form.twitterUrl ?? ""} onChange={set("twitterUrl")} placeholder="https://x.com/…" />
              </div>

              {/* Ordre + Visible */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">Ordre d'affichage</label>
                  <Input
                    type="number"
                    value={form.displayOrder}
                    onChange={(e) => setForm(f => ({ ...f, displayOrder: parseInt(e.target.value) || 0 }))}
                    min={0}
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm(f => ({ ...f, isActive: e.target.checked }))}
                      className="h-4 w-4 rounded accent-[var(--azae-orange)]"
                    />
                    Visible sur le site
                  </label>
                </div>
              </div>

              {formError && <p className="text-xs text-red-500">{formError}</p>}
            </div>

            {/* Footer modal */}
            <div className="flex justify-end gap-2 border-t border-gray-100 px-6 py-4">
              <Button variant="outline" onClick={() => setShowModal(false)}>Annuler</Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-[var(--azae-orange)] text-white hover:bg-[var(--azae-orange-dark)]"
              >
                {saving ? "Enregistrement…" : editing ? "Mettre à jour" : "Créer le profil"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
