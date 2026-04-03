"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  Mail,
  Users,
  CheckCircle,
  Clock,
  UserMinus,
  Search,
  Trash2,
  UserX,
  Send,
  Download,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

type Subscriber = {
  id: string
  email: string
  isConfirmed: boolean
  confirmedAt: Date | null
  unsubscribedAt: Date | null
  createdAt: Date
}

type Stats = {
  total: number
  confirmed: number
  pending: number
  unsubscribed: number
}

type StatusFilter = "all" | "confirmed" | "pending" | "unsubscribed"

/* ── Helpers ─────────────────────────────────────────────────── */

function getStatus(s: Subscriber): StatusFilter {
  if (s.unsubscribedAt) return "unsubscribed"
  if (s.isConfirmed) return "confirmed"
  return "pending"
}

function fmtDate(d: Date | null) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
}

/* ── Composant principal ─────────────────────────────────────── */

export default function NewsletterCRM({
  initialSubscribers,
  stats,
}: {
  initialSubscribers: Subscriber[]
  stats: Stats
}) {
  const router = useRouter()
  const [subscribers, setSubscribers] = useState(initialSubscribers)
  const [filter, setFilter] = useState<StatusFilter>("all")
  const [q, setQ] = useState("")
  const [loading, setLoading] = useState<string | null>(null)

  /* Modal campagne */
  const [showCampaign, setShowCampaign] = useState(false)
  const [subject, setSubject] = useState("")
  const [htmlContent, setHtmlContent] = useState("")
  const [testEmail, setTestEmail] = useState("")
  const [sending, setSending] = useState(false)
  const [campaignMsg, setCampaignMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

  /* Filtrage */
  const filtered = useMemo(() => {
    let list = subscribers
    if (filter !== "all") list = list.filter((s) => getStatus(s) === filter)
    if (q) list = list.filter((s) => s.email.toLowerCase().includes(q.toLowerCase()))
    return list
  }, [subscribers, filter, q])

  /* Supprimer */
  async function handleDelete(id: string) {
    if (!confirm("Supprimer définitivement cet abonné ?")) return
    setLoading(id)
    const res = await fetch(`/api/admin/newsletter/${id}`, { method: "DELETE" })
    if (res.ok) {
      setSubscribers((prev) => prev.filter((s) => s.id !== id))
    }
    setLoading(null)
  }

  /* Désabonner (soft) */
  async function handleUnsubscribe(id: string) {
    if (!confirm("Désabonner cet abonné ?")) return
    setLoading(id)
    const res = await fetch(`/api/admin/newsletter/${id}`, { method: "PATCH" })
    if (res.ok) {
      setSubscribers((prev) =>
        prev.map((s) => (s.id === id ? { ...s, unsubscribedAt: new Date() } : s))
      )
    }
    setLoading(null)
  }

  /* Export CSV */
  function handleExport() {
    const rows = [
      ["Email", "Statut", "Date inscription", "Date confirmation"],
      ...filtered.map((s) => [
        s.email,
        getStatus(s),
        fmtDate(s.createdAt),
        fmtDate(s.confirmedAt),
      ]),
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

  /* Envoyer campagne */
  async function handleSendCampaign(targetAll: boolean) {
    if (!subject.trim() || !htmlContent.trim()) {
      setCampaignMsg({ type: "error", text: "Objet et contenu requis." })
      return
    }
    setSending(true)
    setCampaignMsg(null)
    const res = await fetch("/api/admin/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, htmlContent, targetAll, testEmail: testEmail || undefined }),
    })
    const data = await res.json()
    setSending(false)
    if (res.ok) {
      setCampaignMsg({
        type: "success",
        text: `${data.mode === "test" ? "Email test envoyé !" : `Campagne envoyée à ${data.sent} abonnés !`}`,
      })
      if (data.mode !== "test") {
        setSubject("")
        setHtmlContent("")
        setTimeout(() => setShowCampaign(false), 2000)
      }
    } else {
      setCampaignMsg({ type: "error", text: data.error ?? "Erreur lors de l'envoi." })
    }
  }

  /* ─── STAT CARDS ─────────────────────────────────────────────── */
  const STAT_CARDS = [
    { label: "Total abonnés", value: stats.total, icon: Users, color: "var(--azae-navy)" },
    { label: "Confirmés", value: stats.confirmed, icon: CheckCircle, color: "var(--azae-orange)" },
    { label: "En attente", value: stats.pending, icon: Clock, color: "#f59e0b" },
    { label: "Désabonnés", value: stats.unsubscribed, icon: UserMinus, color: "#6b7280" },
  ]

  const FILTERS: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "Tous" },
    { value: "confirmed", label: "Confirmés" },
    { value: "pending", label: "En attente" },
    { value: "unsubscribed", label: "Désabonnés" },
  ]

  return (
    <div className="p-6 lg:p-8">
      {/* ── En-tête ── */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="font-[family-name:var(--font-playfair)] text-2xl font-bold"
            style={{ color: "var(--azae-navy)" }}
          >
            Newsletter CRM
          </h1>
          <p className="mt-1 text-sm text-gray-500">Gérez vos abonnés et envoyez des campagnes</p>
        </div>
        <button
          onClick={() => setShowCampaign(true)}
          className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "var(--azae-orange)" }}
        >
          <Send className="h-4 w-4" />
          Envoyer une campagne
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STAT_CARDS.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: color, opacity: 0.12 }}
              >
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

      {/* ── Barre d'actions ── */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {/* Recherche */}
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par email..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-[var(--azae-orange)] focus:outline-none"
          />
        </div>

        {/* Filtres */}
        <div className="flex gap-1.5">
          {FILTERS.map(({ value, label }) => (
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

        {/* Export */}
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

      {/* ── Tableau ── */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-500">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-500">Statut</th>
              <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-500 md:table-cell">Inscrit le</th>
              <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-500 lg:table-cell">Confirmé le</th>
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
                return (
                  <tr key={s.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-gray-800">{s.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          status === "confirmed" && "bg-green-50 text-green-700",
                          status === "pending" && "bg-amber-50 text-amber-700",
                          status === "unsubscribed" && "bg-gray-100 text-gray-500"
                        )}
                      >
                        {status === "confirmed" && "✓ Confirmé"}
                        {status === "pending" && "⏳ En attente"}
                        {status === "unsubscribed" && "Désabonné"}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-gray-500 md:table-cell">{fmtDate(s.createdAt)}</td>
                    <td className="hidden px-4 py-3 text-gray-500 lg:table-cell">{fmtDate(s.confirmedAt)}</td>
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
                          title="Supprimer définitivement"
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

      {/* ── Modal campagne ── */}
      {showCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold" style={{ color: "var(--azae-navy)" }}>
                Nouvelle campagne
              </h2>
              <button onClick={() => setShowCampaign(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Destinataires info */}
              <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
                <strong>{stats.confirmed}</strong> abonnés confirmés recevront cette campagne
              </div>

              {/* Objet */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">Objet de l'email *</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ex : Rapport d'impact 2024 — IQRA TOGO"
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-[var(--azae-orange)] focus:outline-none"
                />
              </div>

              {/* Contenu HTML */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">Contenu (HTML) *</label>
                <p className="mb-2 text-xs text-gray-400">Le contenu sera encadré dans le template email IQRA TOGO.</p>
                <textarea
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  rows={8}
                  placeholder="<p>Chers abonnés,</p><p>Voici nos nouvelles...</p>"
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 font-mono text-sm focus:border-[var(--azae-orange)] focus:outline-none"
                />
              </div>

              {/* Email test */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">Envoyer un test à</label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-[var(--azae-orange)] focus:outline-none"
                  />
                  <button
                    onClick={() => handleSendCampaign(false)}
                    disabled={sending || !testEmail}
                    className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-[var(--azae-navy)] hover:text-[var(--azae-navy)] disabled:opacity-50"
                  >
                    Test
                  </button>
                </div>
              </div>

              {/* Message feedback */}
              {campaignMsg && (
                <div
                  className={cn(
                    "rounded-lg px-4 py-3 text-sm font-medium",
                    campaignMsg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                  )}
                >
                  {campaignMsg.text}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
              <button
                onClick={() => setShowCampaign(false)}
                className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={() => handleSendCampaign(true)}
                disabled={sending || !subject || !htmlContent}
                className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: "var(--azae-orange)" }}
              >
                <Send className="h-4 w-4" />
                {sending ? "Envoi en cours..." : `Envoyer à ${stats.confirmed} abonnés`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
