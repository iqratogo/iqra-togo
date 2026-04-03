"use client"

import { useState, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Mail, Users, CheckCircle, Clock, UserMinus, Search, Trash2, UserX,
  Send, Download, X, History, PenLine, Tag, Plus, Eye, Code2,
  Heading2, AlignLeft, Highlighter, MousePointerClick, Minus, ImageIcon,
  ChevronDown, ChevronUp,
} from "lucide-react"
import { cn } from "@/lib/utils"

/* ─── Types ──────────────────────────────────────────────────── */

type Subscriber = {
  id: string
  email: string
  isConfirmed: boolean
  confirmedAt: Date | null
  unsubscribedAt: Date | null
  tags: string[]
  createdAt: Date
}

type Campaign = {
  id: string
  subject: string
  previewText: string | null
  recipients: number
  status: string
  segment: string | null
  sentAt: Date
}

type Stats = {
  total: number
  confirmed: number
  pending: number
  unsubscribed: number
}

type StatusFilter = "all" | "confirmed" | "pending" | "unsubscribed"

type Tab = "subscribers" | "campaigns" | "compose"

/* ─── Block editor types ─────────────────────────────────────── */

type BlockType = "heading" | "paragraph" | "highlight" | "button" | "divider" | "image"

type Block = {
  id: string
  type: BlockType
  content: string
  url?: string
}

/* ─── Helpers ────────────────────────────────────────────────── */

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

function getStatus(s: Subscriber): StatusFilter {
  if (s.unsubscribedAt) return "unsubscribed"
  if (s.isConfirmed) return "confirmed"
  return "pending"
}

function fmtDate(d: Date | null | string) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
}

function fmtDateTime(d: Date | string) {
  return new Date(d).toLocaleString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

function blocksToHtml(blocks: Block[]): string {
  return blocks.map((b) => {
    switch (b.type) {
      case "heading":
        return `<h2 style="margin:0 0 16px;color:#1a2b4a;font-size:22px;font-weight:700;font-family:Georgia,serif;">${b.content}</h2>`
      case "paragraph":
        return `<p style="margin:0 0 16px;color:#4b5563;font-size:15px;line-height:1.7;">${b.content}</p>`
      case "highlight":
        return `<div style="background:#f0fdf4;border-left:4px solid #22c55e;padding:14px 18px;margin:0 0 16px;border-radius:0 6px 6px 0;"><p style="margin:0;color:#166534;font-size:14px;line-height:1.6;">${b.content}</p></div>`
      case "button":
        return `<p style="margin:0 0 24px;text-align:center;"><a href="${b.url || "#"}" style="background:#22c55e;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:700;display:inline-block;">${b.content}</a></p>`
      case "divider":
        return `<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />`
      case "image":
        return `<p style="margin:0 0 16px;text-align:center;"><img src="${b.url || ""}" alt="${b.content}" style="max-width:100%;border-radius:10px;" /></p>`
    }
  }).join("\n")
}

const BLOCK_PALETTE: { type: BlockType; icon: React.ElementType; label: string }[] = [
  { type: "heading", icon: Heading2, label: "Titre" },
  { type: "paragraph", icon: AlignLeft, label: "Paragraphe" },
  { type: "highlight", icon: Highlighter, label: "Encadré vert" },
  { type: "button", icon: MousePointerClick, label: "Bouton CTA" },
  { type: "divider", icon: Minus, label: "Séparateur" },
  { type: "image", icon: ImageIcon, label: "Image" },
]

/* ─── Sous-composants ────────────────────────────────────────── */

function TagBadge({ tag, onRemove }: { tag: string; onRemove?: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
      {tag}
      {onRemove && (
        <button onClick={onRemove} className="ml-0.5 text-blue-400 hover:text-blue-700">
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  )
}

function BlockEditor({
  blocks,
  onChange,
}: {
  blocks: Block[]
  onChange: (blocks: Block[]) => void
}) {
  function addBlock(type: BlockType) {
    const defaults: Partial<Block> = {}
    if (type === "button") { defaults.content = "Cliquez ici"; defaults.url = "https://iqra-togo.com" }
    if (type === "heading") defaults.content = "Titre de section"
    if (type === "paragraph") defaults.content = "Saisissez votre texte..."
    if (type === "highlight") defaults.content = "Information importante à mettre en avant."
    if (type === "image") { defaults.content = "Description de l'image"; defaults.url = "" }
    onChange([...blocks, { id: uid(), type, content: "", ...defaults }])
  }

  function updateBlock(id: string, patch: Partial<Block>) {
    onChange(blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)))
  }

  function removeBlock(id: string) {
    onChange(blocks.filter((b) => b.id !== id))
  }

  function moveBlock(id: string, dir: -1 | 1) {
    const idx = blocks.findIndex((b) => b.id === id)
    if (idx < 0) return
    const next = idx + dir
    if (next < 0 || next >= blocks.length) return
    const arr = [...blocks]
    ;[arr[idx], arr[next]] = [arr[next], arr[idx]]
    onChange(arr)
  }

  return (
    <div className="space-y-3">
      {/* Palette */}
      <div className="flex flex-wrap gap-1.5">
        {BLOCK_PALETTE.map(({ type, icon: Icon, label }) => (
          <button
            key={type}
            onClick={() => addBlock(type)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-[var(--azae-orange)] hover:text-[var(--azae-orange)]"
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Blocs */}
      {blocks.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-gray-200 py-10 text-center text-sm text-gray-400">
          <PenLine className="mx-auto mb-2 h-6 w-6 text-gray-300" />
          Cliquez sur un type de bloc ci-dessus pour commencer
        </div>
      )}
      {blocks.map((block, i) => (
        <div key={block.id} className="group relative rounded-xl border border-gray-200 bg-white p-4">
          {/* Controls */}
          <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={() => moveBlock(block.id, -1)}
              disabled={i === 0}
              className="rounded p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-30"
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => moveBlock(block.id, 1)}
              disabled={i === blocks.length - 1}
              className="rounded p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-30"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => removeBlock(block.id)}
              className="rounded p-1 text-red-400 hover:bg-red-50"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Label */}
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
            {BLOCK_PALETTE.find((p) => p.type === block.type)?.label}
          </p>

          {block.type === "divider" ? (
            <hr className="border-gray-200" />
          ) : (
            <div className="space-y-2">
              <textarea
                value={block.content}
                onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                rows={block.type === "paragraph" ? 3 : 1}
                placeholder={block.type === "button" ? "Libellé du bouton" : "Contenu..."}
                className="w-full resize-none rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm focus:border-[var(--azae-orange)] focus:outline-none"
              />
              {(block.type === "button" || block.type === "image") && (
                <input
                  type="url"
                  value={block.url ?? ""}
                  onChange={(e) => updateBlock(block.id, { url: e.target.value })}
                  placeholder={block.type === "button" ? "https://..." : "URL de l'image"}
                  className="w-full rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm focus:border-[var(--azae-orange)] focus:outline-none"
                />
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

/* ─── Composant principal ────────────────────────────────────── */

export default function NewsletterCRM({
  initialSubscribers,
  initialCampaigns,
  stats,
}: {
  initialSubscribers: Subscriber[]
  initialCampaigns: Campaign[]
  stats: Stats
}) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>("subscribers")
  const [subscribers, setSubscribers] = useState(initialSubscribers)
  const [campaigns] = useState(initialCampaigns)

  /* Abonnés */
  const [filter, setFilter] = useState<StatusFilter>("all")
  const [q, setQ] = useState("")
  const [tagFilter, setTagFilter] = useState<string>("")
  const [loading, setLoading] = useState<string | null>(null)

  /* Tags inline */
  const [editingTagsId, setEditingTagsId] = useState<string | null>(null)
  const [newTag, setNewTag] = useState("")

  /* Composer */
  const [subject, setSubject] = useState("")
  const [previewText, setPreviewText] = useState("")
  const [blocks, setBlocks] = useState<Block[]>([])
  const [segment, setSegment] = useState<string>("")
  const [testEmail, setTestEmail] = useState("")
  const [sending, setSending] = useState(false)
  const [campaignMsg, setCampaignMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [previewMode, setPreviewMode] = useState<"edit" | "preview" | "html">("edit")

  /* Tous les tags uniques */
  const allTags = useMemo(() => {
    const set = new Set<string>()
    subscribers.forEach((s) => s.tags.forEach((t) => set.add(t)))
    return Array.from(set).sort()
  }, [subscribers])

  /* Abonnés confirmés dans le segment sélectionné */
  const segmentCount = useMemo(() => {
    if (!segment) return stats.confirmed
    return subscribers.filter((s) => s.isConfirmed && !s.unsubscribedAt && s.tags.includes(segment)).length
  }, [subscribers, segment, stats.confirmed])

  /* Filtrage abonnés */
  const filtered = useMemo(() => {
    let list = subscribers
    if (filter !== "all") list = list.filter((s) => getStatus(s) === filter)
    if (q) list = list.filter((s) => s.email.toLowerCase().includes(q.toLowerCase()))
    if (tagFilter) list = list.filter((s) => s.tags.includes(tagFilter))
    return list
  }, [subscribers, filter, q, tagFilter])

  /* HTML généré depuis les blocs */
  const generatedHtml = useMemo(() => blocksToHtml(blocks), [blocks])

  /* Actions abonnés */
  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Supprimer définitivement cet abonné ?")) return
    setLoading(id)
    const res = await fetch(`/api/admin/newsletter/${id}`, { method: "DELETE" })
    if (res.ok) setSubscribers((prev) => prev.filter((s) => s.id !== id))
    setLoading(null)
  }, [])

  const handleUnsubscribe = useCallback(async (id: string) => {
    if (!confirm("Désabonner cet abonné ?")) return
    setLoading(id)
    const res = await fetch(`/api/admin/newsletter/${id}`, { method: "PATCH" })
    if (res.ok) setSubscribers((prev) => prev.map((s) => (s.id === id ? { ...s, unsubscribedAt: new Date() } : s)))
    setLoading(null)
  }, [])

  /* Gestion des tags */
  async function handleAddTag(id: string, tag: string) {
    const trimmed = tag.trim().toLowerCase()
    if (!trimmed) return
    const sub = subscribers.find((s) => s.id === id)
    if (!sub || sub.tags.includes(trimmed)) return
    const newTags = [...sub.tags, trimmed]
    const res = await fetch(`/api/admin/newsletter/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tags: newTags }),
    })
    if (res.ok) {
      setSubscribers((prev) => prev.map((s) => (s.id === id ? { ...s, tags: newTags } : s)))
      setNewTag("")
    }
  }

  async function handleRemoveTag(id: string, tag: string) {
    const sub = subscribers.find((s) => s.id === id)
    if (!sub) return
    const newTags = sub.tags.filter((t) => t !== tag)
    const res = await fetch(`/api/admin/newsletter/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tags: newTags }),
    })
    if (res.ok) setSubscribers((prev) => prev.map((s) => (s.id === id ? { ...s, tags: newTags } : s)))
  }

  /* Export CSV */
  function handleExport() {
    const rows = [
      ["Email", "Statut", "Tags", "Date inscription", "Date confirmation"],
      ...filtered.map((s) => [s.email, getStatus(s), s.tags.join(";"), fmtDate(s.createdAt), fmtDate(s.confirmedAt)]),
    ]
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `newsletter-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  /* Envoi campagne */
  async function handleSendCampaign(isTest: boolean) {
    if (!subject.trim() || blocks.length === 0) {
      setCampaignMsg({ type: "error", text: "Objet et au moins un bloc de contenu requis." })
      return
    }
    if (isTest && !testEmail.trim()) {
      setCampaignMsg({ type: "error", text: "Saisissez un email de test." })
      return
    }
    setSending(true)
    setCampaignMsg(null)
    const res = await fetch("/api/admin/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject,
        previewText: previewText || undefined,
        htmlContent: generatedHtml,
        targetAll: !isTest,
        testEmail: isTest ? testEmail : undefined,
        segment: segment || undefined,
      }),
    })
    const data = await res.json()
    setSending(false)
    if (res.ok) {
      setCampaignMsg({
        type: "success",
        text: isTest ? "Email test envoyé !" : `Campagne envoyée à ${data.sent} abonnés !`,
      })
      if (!isTest) {
        setSubject("")
        setPreviewText("")
        setBlocks([])
        setSegment("")
        router.refresh()
      }
    } else {
      setCampaignMsg({ type: "error", text: data.error ?? "Erreur lors de l'envoi." })
    }
  }

  /* ─── RENDU ─────────────────────────────────────────────────── */

  const STAT_CARDS = [
    { label: "Total abonnés", value: stats.total, icon: Users, color: "var(--azae-navy)" },
    { label: "Confirmés", value: stats.confirmed, icon: CheckCircle, color: "var(--azae-orange)" },
    { label: "En attente", value: stats.pending, icon: Clock, color: "#f59e0b" },
    { label: "Désabonnés", value: stats.unsubscribed, icon: UserMinus, color: "#6b7280" },
  ]

  const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "subscribers", label: "Abonnés", icon: Users },
    { id: "campaigns", label: `Campagnes (${campaigns.length})`, icon: History },
    { id: "compose", label: "Composer", icon: PenLine },
  ]

  const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "Tous" },
    { value: "confirmed", label: "Confirmés" },
    { value: "pending", label: "En attente" },
    { value: "unsubscribed", label: "Désabonnés" },
  ]

  return (
    <div className="p-6 lg:p-8">
      {/* En-tête */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold" style={{ color: "var(--azae-navy)" }}>
            Newsletter CRM
          </h1>
          <p className="mt-1 text-sm text-gray-500">Gérez vos abonnés, campagnes et segments</p>
        </div>
        <button
          onClick={() => setActiveTab("compose")}
          className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "var(--azae-orange)" }}
        >
          <Send className="h-4 w-4" />
          Nouvelle campagne
        </button>
      </div>

      {/* Stat cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STAT_CARDS.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: color + "20" }}>
                <Icon className="h-5 w-5" style={{ color }} />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: "var(--azae-navy)" }}>{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Onglets */}
      <div className="mb-6 flex gap-1 rounded-xl border border-gray-100 bg-gray-50 p-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
              activeTab === id
                ? "bg-white text-[var(--azae-navy)] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* ══════════ ONGLET ABONNÉS ══════════ */}
      {activeTab === "subscribers" && (
        <div>
          {/* Barre filtres */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <div className="relative min-w-48 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par email..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-[var(--azae-orange)] focus:outline-none"
              />
            </div>

            {/* Filtre statut */}
            <div className="flex gap-1">
              {STATUS_FILTERS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    filter === value
                      ? "border-[var(--azae-orange)] bg-[var(--azae-orange)] text-white"
                      : "border-gray-200 text-gray-600 hover:border-[var(--azae-orange)] hover:text-[var(--azae-orange)]"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Filtre segment/tag */}
            {allTags.length > 0 && (
              <select
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-600 focus:border-[var(--azae-orange)] focus:outline-none"
              >
                <option value="">Tous les segments</option>
                {allTags.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            )}

            <button
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 transition-colors hover:border-[var(--azae-navy)] hover:text-[var(--azae-navy)]"
            >
              <Download className="h-3.5 w-3.5" />
              CSV ({filtered.length})
            </button>

            <button
              onClick={() => router.refresh()}
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-500 hover:text-gray-800"
              title="Actualiser"
            >
              ↺
            </button>
          </div>

          {/* Tableau */}
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-500">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-500">Statut</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-500 md:table-cell">Segments</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-500 lg:table-cell">Inscrit le</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-400">
                      <Mail className="mx-auto mb-2 h-8 w-8 text-gray-200" />
                      Aucun abonné trouvé
                    </td>
                  </tr>
                ) : (
                  filtered.map((s) => {
                    const status = getStatus(s)
                    const isEditingTags = editingTagsId === s.id
                    return (
                      <tr key={s.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-medium text-gray-800">{s.email}</td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                            status === "confirmed" && "bg-green-50 text-green-700",
                            status === "pending" && "bg-amber-50 text-amber-700",
                            status === "unsubscribed" && "bg-gray-100 text-gray-500"
                          )}>
                            {status === "confirmed" && "✓ Confirmé"}
                            {status === "pending" && "⏳ En attente"}
                            {status === "unsubscribed" && "Désabonné"}
                          </span>
                        </td>
                        <td className="hidden px-4 py-3 md:table-cell">
                          <div className="flex flex-wrap items-center gap-1">
                            {s.tags.map((t) => (
                              <TagBadge key={t} tag={t} onRemove={() => handleRemoveTag(s.id, t)} />
                            ))}
                            {isEditingTags ? (
                              <form
                                onSubmit={(e) => { e.preventDefault(); handleAddTag(s.id, newTag) }}
                                className="flex items-center gap-1"
                              >
                                <input
                                  autoFocus
                                  value={newTag}
                                  onChange={(e) => setNewTag(e.target.value)}
                                  placeholder="nouveau tag"
                                  className="w-24 rounded border border-gray-200 px-2 py-0.5 text-xs focus:border-blue-400 focus:outline-none"
                                />
                                <button type="submit" className="text-green-600 hover:text-green-800">
                                  <CheckCircle className="h-3.5 w-3.5" />
                                </button>
                                <button type="button" onClick={() => setEditingTagsId(null)} className="text-gray-400 hover:text-gray-600">
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </form>
                            ) : (
                              <button
                                onClick={() => { setEditingTagsId(s.id); setNewTag("") }}
                                className="inline-flex items-center gap-0.5 rounded-full border border-dashed border-gray-300 px-2 py-0.5 text-xs text-gray-400 hover:border-blue-400 hover:text-blue-600"
                              >
                                <Plus className="h-3 w-3" /> tag
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="hidden px-4 py-3 text-gray-500 lg:table-cell">{fmtDate(s.createdAt)}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {status !== "unsubscribed" && (
                              <button
                                onClick={() => handleUnsubscribe(s.id)}
                                disabled={loading === s.id}
                                title="Désabonner"
                                className="rounded p-1.5 text-gray-400 transition-colors hover:bg-amber-50 hover:text-amber-600 disabled:opacity-50"
                              >
                                <UserX className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(s.id)}
                              disabled={loading === s.id}
                              title="Supprimer"
                              className="rounded p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════ ONGLET CAMPAGNES ══════════ */}
      {activeTab === "campaigns" && (
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          {campaigns.length === 0 ? (
            <div className="py-16 text-center">
              <History className="mx-auto mb-3 h-10 w-10 text-gray-200" />
              <p className="text-sm text-gray-400">Aucune campagne envoyée pour l'instant</p>
              <button
                onClick={() => setActiveTab("compose")}
                className="mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white"
                style={{ backgroundColor: "var(--azae-orange)" }}
              >
                <PenLine className="h-4 w-4" /> Créer la première campagne
              </button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-500">Objet</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-500 md:table-cell">Segment</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-500">Envoyé à</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-500">Statut</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-500 lg:table-cell">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{c.subject}</p>
                      {c.previewText && (
                        <p className="mt-0.5 truncate text-xs text-gray-400">{c.previewText}</p>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      {c.segment ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                          <Tag className="h-3 w-3" /> {c.segment}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Tous</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-gray-800">{c.recipients}</span>
                      <span className="text-gray-400"> dest.</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        c.status === "sent" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                      )}>
                        {c.status === "sent" ? "✓ Envoyée" : "Test"}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-gray-500 lg:table-cell">{fmtDateTime(c.sentAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ══════════ ONGLET COMPOSER ══════════ */}
      {activeTab === "compose" && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Colonne gauche — paramètres + éditeur */}
          <div className="space-y-5">
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold text-gray-800">Paramètres de la campagne</h3>

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">Objet *</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Ex : Rapport d'impact 2024 — IQRA TOGO"
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-[var(--azae-orange)] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Texte de prévisualisation
                    <span className="ml-1 font-normal normal-case text-gray-400">(affiché dans la boîte mail avant ouverture)</span>
                  </label>
                  <input
                    type="text"
                    value={previewText}
                    onChange={(e) => setPreviewText(e.target.value)}
                    placeholder="Découvrez notre bilan de l'année…"
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-[var(--azae-orange)] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Segment destinataires
                  </label>
                  <select
                    value={segment}
                    onChange={(e) => setSegment(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-700 focus:border-[var(--azae-orange)] focus:outline-none"
                  >
                    <option value="">Tous les abonnés confirmés ({stats.confirmed})</option>
                    {allTags.map((t) => {
                      const count = subscribers.filter((s) => s.isConfirmed && !s.unsubscribedAt && s.tags.includes(t)).length
                      return (
                        <option key={t} value={t}>{t} ({count} abonnés)</option>
                      )
                    })}
                  </select>
                  <p className="mt-1.5 text-xs text-gray-400">
                    <strong className="text-[var(--azae-orange)]">{segmentCount}</strong> abonnés recevront cette campagne
                  </p>
                </div>
              </div>
            </div>

            {/* Éditeur par blocs */}
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-800">Contenu de l'email</h3>
                <div className="flex gap-1 rounded-lg border border-gray-100 p-0.5">
                  {([
                    { id: "edit", icon: PenLine, label: "Blocs" },
                    { id: "preview", icon: Eye, label: "Aperçu" },
                    { id: "html", icon: Code2, label: "HTML" },
                  ] as const).map(({ id, icon: Icon, label }) => (
                    <button
                      key={id}
                      onClick={() => setPreviewMode(id)}
                      className={cn(
                        "flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-all",
                        previewMode === id ? "bg-white text-[var(--azae-navy)] shadow-sm" : "text-gray-500 hover:text-gray-700"
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {previewMode === "edit" && (
                <BlockEditor blocks={blocks} onChange={setBlocks} />
              )}

              {previewMode === "html" && (
                <pre className="max-h-80 overflow-auto rounded-lg bg-gray-900 p-4 text-xs leading-relaxed text-green-400">
                  {generatedHtml || <span className="text-gray-500">Ajoutez des blocs pour générer le HTML</span>}
                </pre>
              )}

              {previewMode === "preview" && (
                <div className="overflow-hidden rounded-xl border border-gray-100">
                  {generatedHtml ? (
                    <div
                      className="max-h-96 overflow-y-auto bg-[#f5f5f5] p-4"
                      dangerouslySetInnerHTML={{ __html: generatedHtml }}
                    />
                  ) : (
                    <div className="py-10 text-center text-sm text-gray-400">Aucun bloc à prévisualiser</div>
                  )}
                </div>
              )}
            </div>

            {/* Test + envoi */}
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold text-gray-800">Envoi</h3>

              <div className="mb-4 flex gap-2">
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="email.test@exemple.com"
                  className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-[var(--azae-orange)] focus:outline-none"
                />
                <button
                  onClick={() => handleSendCampaign(true)}
                  disabled={sending || !testEmail || !subject || blocks.length === 0}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-[var(--azae-navy)] hover:text-[var(--azae-navy)] disabled:opacity-50"
                >
                  Tester
                </button>
              </div>

              {campaignMsg && (
                <div className={cn(
                  "mb-4 rounded-lg px-4 py-3 text-sm font-medium",
                  campaignMsg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                )}>
                  {campaignMsg.text}
                </div>
              )}

              <button
                onClick={() => handleSendCampaign(false)}
                disabled={sending || !subject || blocks.length === 0}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: "var(--azae-orange)" }}
              >
                <Send className="h-4 w-4" />
                {sending ? "Envoi en cours…" : `Envoyer à ${segmentCount} abonnés`}
              </button>
            </div>
          </div>

          {/* Colonne droite — aperçu email complet */}
          <div className="hidden lg:block">
            <div className="sticky top-6 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
                <Eye className="h-4 w-4 text-gray-400" />
                Aperçu de l'email
              </div>
              {/* Simulation client mail */}
              <div className="rounded-xl border border-gray-200 overflow-hidden text-xs">
                {/* Faux en-tête client mail */}
                <div className="border-b border-gray-100 bg-gray-50 px-4 py-3 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 w-12">De :</span>
                    <span className="font-medium text-gray-700">IQRA TOGO &lt;noreply@iqra-togo.com&gt;</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 w-12">Objet :</span>
                    <span className="font-semibold text-gray-800">{subject || <span className="text-gray-300 font-normal">Saisissez un objet...</span>}</span>
                  </div>
                  {previewText && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 w-12">Aperçu :</span>
                      <span className="text-gray-500 truncate">{previewText}</span>
                    </div>
                  )}
                </div>
                {/* Corps */}
                <div className="max-h-[480px] overflow-y-auto">
                  {generatedHtml ? (
                    <div
                      className="bg-[#f5f5f5] p-3"
                      dangerouslySetInnerHTML={{ __html: generatedHtml }}
                    />
                  ) : (
                    <div className="py-16 text-center text-gray-300">
                      <Mail className="mx-auto mb-2 h-8 w-8" />
                      Ajoutez des blocs pour voir l'aperçu
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
