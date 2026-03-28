"use client"

/* §7.2.2 Liste publications admin avec filtres + actions */

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import {
  Plus, Search, Edit, Trash2, Eye, MoreVertical,
  FileText, Globe, Archive, Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type Post = {
  id: string
  title: string
  slug: string
  category: string
  status: string
  featuredImage: string | null
  publishedAt: string | null
  updatedAt: string
  author: { name: string | null }
}

const STATUS_LABELS: Record<string, { label: string; icon: typeof Globe; cls: string }> = {
  PUBLISHED: { label: "Publié", icon: Globe, cls: "bg-green-100 text-green-700" },
  DRAFT: { label: "Brouillon", icon: Clock, cls: "bg-yellow-100 text-yellow-700" },
  ARCHIVED: { label: "Archivé", icon: Archive, cls: "bg-gray-100 text-gray-600" },
}

const CAT_LABELS: Record<string, string> = {
  ACTUALITE: "Actualité",
  PROJET: "Projet",
  COMMUNIQUE: "Communiqué",
  PARTENAIRE: "Partenaire",
}

export default function PublicationsList() {
  const [posts, setPosts] = useState<Post[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")
  const [status, setStatus] = useState("")
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page) })
    if (search) params.set("search", search)
    if (category) params.set("category", category)
    if (status) params.set("status", status)
    const res = await fetch(`/api/admin/publications?${params}`)
    const data = await res.json()
    setPosts(data.posts ?? [])
    setTotal(data.total ?? 0)
    setPages(data.pages ?? 1)
    setLoading(false)
  }, [page, search, category, status])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette publication ?")) return
    await fetch(`/api/admin/publications/${id}`, { method: "DELETE" })
    fetchPosts()
  }

  async function handleStatusChange(id: string, newStatus: string) {
    await fetch(`/api/admin/publications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
    setOpenMenu(null)
    fetchPosts()
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold" style={{ color: "var(--azae-navy)" }}>
            Publications
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">{total} publication{total > 1 ? "s" : ""}</p>
        </div>
        <Link href="/dashboard/admin/publications/new">
          <Button className="gap-2 bg-[var(--azae-orange)] text-white hover:bg-[var(--azae-orange-dark)]">
            <Plus className="h-4 w-4" />
            Nouvelle publication
          </Button>
        </Link>
      </div>

      {/* Filtres */}
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Rechercher…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="pl-9"
          />
        </div>
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1) }}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--azae-orange)]"
        >
          <option value="">Toutes catégories</option>
          {Object.entries(CAT_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1) }}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--azae-orange)]"
        >
          <option value="">Tous les statuts</option>
          <option value="PUBLISHED">Publiés</option>
          <option value="DRAFT">Brouillons</option>
          <option value="ARCHIVED">Archivés</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-sm text-gray-400">Chargement…</div>
        ) : posts.length === 0 ? (
          <div className="py-16 text-center">
            <FileText className="mx-auto mb-3 h-10 w-10 text-gray-300" />
            <p className="text-sm text-gray-500">Aucune publication</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Titre</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-gray-600 md:table-cell">Catégorie</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-gray-600 sm:table-cell">Statut</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-gray-600 lg:table-cell">Auteur</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-gray-600 lg:table-cell">Modifié</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {posts.map((post) => {
                  const s = STATUS_LABELS[post.status] ?? STATUS_LABELS.DRAFT
                  const SIcon = s.icon
                  return (
                    <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-800 line-clamp-1">{post.title}</div>
                        <div className="text-xs text-gray-400 sm:hidden mt-0.5">
                          <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", s.cls)}>
                            <SIcon className="h-3 w-3" />{s.label}
                          </span>
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 md:table-cell">
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                          {CAT_LABELS[post.category] ?? post.category}
                        </span>
                      </td>
                      <td className="hidden px-4 py-3 sm:table-cell">
                        <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", s.cls)}>
                          <SIcon className="h-3 w-3" />{s.label}
                        </span>
                      </td>
                      <td className="hidden px-4 py-3 text-gray-500 lg:table-cell">{post.author?.name ?? "—"}</td>
                      <td className="hidden px-4 py-3 text-gray-400 lg:table-cell">
                        {format(new Date(post.updatedAt), "d MMM yyyy", { locale: fr })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {post.status === "PUBLISHED" && (
                            <a
                              href={`/actualites/${post.category.toLowerCase()}s/${post.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded p-1.5 text-gray-400 hover:text-[var(--azae-orange)] transition-colors"
                              title="Voir"
                            >
                              <Eye className="h-4 w-4" />
                            </a>
                          )}
                          <Link
                            href={`/dashboard/admin/publications/${post.id}`}
                            className="rounded p-1.5 text-gray-400 hover:text-[var(--azae-navy)] transition-colors"
                            title="Modifier"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <div className="relative">
                            <button
                              onClick={() => setOpenMenu(openMenu === post.id ? null : post.id)}
                              className="rounded p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>
                            {openMenu === post.id && (
                              <div className="absolute right-0 z-10 mt-1 w-44 rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
                                {post.status !== "PUBLISHED" && (
                                  <button onClick={() => handleStatusChange(post.id, "PUBLISHED")} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                    <Globe className="h-4 w-4 text-green-600" /> Publier
                                  </button>
                                )}
                                {post.status !== "DRAFT" && (
                                  <button onClick={() => handleStatusChange(post.id, "DRAFT")} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                    <Clock className="h-4 w-4 text-yellow-600" /> Repasser en brouillon
                                  </button>
                                )}
                                {post.status !== "ARCHIVED" && (
                                  <button onClick={() => handleStatusChange(post.id, "ARCHIVED")} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                    <Archive className="h-4 w-4 text-gray-500" /> Archiver
                                  </button>
                                )}
                                <div className="my-1 border-t border-gray-100" />
                                <button onClick={() => handleDelete(post.id)} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                                  <Trash2 className="h-4 w-4" /> Supprimer
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
            Précédent
          </Button>
          <span className="text-sm text-gray-500">Page {page} / {pages}</span>
          <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage(p => p + 1)}>
            Suivant
          </Button>
        </div>
      )}
    </div>
  )
}
