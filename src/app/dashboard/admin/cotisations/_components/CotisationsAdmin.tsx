"use client"

/* Registre des cotisations — Admin IQRA TOGO */

import { useState, useEffect, useCallback } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts"
import {
  Plus, Download, Search, CheckCircle, Clock, AlertCircle,
  Banknote, Smartphone, X, Users, TrendingUp, CreditCard, AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type Member = { id: string; firstName: string; lastName: string; memberNumber: string }
type Cotisation = {
  id: string
  period: string
  amount: number
  status: string
  paymentMethod: string | null
  paymentNote: string | null
  paidAt: string | null
  dueDate: string
  createdAt: string
  member: { id: string; firstName: string; lastName: string; memberNumber: string }
}
type Stats = { totalCollected: number; totalPending: number; countPaid: number; countPending: number }
type ByMethod = { paymentMethod: string | null; _count: { id: number }; _sum: { amount: number | null } }[]
type ByYear = { period: string; _sum: { amount: number | null }; _count: { id: number } }[]

const STATUS_CONFIG = {
  SUCCESS: { label: "Payée", icon: CheckCircle, cls: "bg-green-100 text-green-700" },
  PENDING: { label: "En attente", icon: Clock, cls: "bg-yellow-100 text-yellow-700" },
  FAILED:  { label: "Échouée",  icon: AlertCircle, cls: "bg-red-100 text-red-700" },
} as const

const METHOD_LABELS: Record<string, string> = {
  cash: "Cash",
  mobile_money: "Mobile Money",
  paydunya: "Mobile Money",
}

const CHART_COLORS = ["#22c55e", "#1a2b4a", "#f59e0b", "#6b7280"]

export default function CotisationsAdmin() {
  const [cotisations, setCotisations] = useState<Cotisation[]>([])
  const [stats, setStats] = useState<Stats>({ totalCollected: 0, totalPending: 0, countPaid: 0, countPending: 0 })
  const [byMethod, setByMethod] = useState<ByMethod>([])
  const [byYear, setByYear] = useState<ByYear>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [showModal, setShowModal] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: "50" })
    if (q) params.set("q", q)
    if (statusFilter) params.set("status", statusFilter)
    const res = await fetch(`/api/admin/cotisations?${params}`)
    const d = await res.json()
    setCotisations(d.cotisations ?? [])
    setStats(d.stats ?? {})
    setByMethod(d.byMethod ?? [])
    setByYear(d.byYear ?? [])
    setTotal(d.pagination?.total ?? 0)
    setLoading(false)
  }, [page, q, statusFilter])

  useEffect(() => { fetchData() }, [fetchData])

  /* Export CSV */
  function exportCSV() {
    const headers = ["Membre", "N° Membre", "Période", "Montant (FCFA)", "Méthode", "Statut", "Date paiement", "Note"]
    const rows = cotisations.map(c => [
      `${c.member.firstName} ${c.member.lastName}`,
      c.member.memberNumber,
      c.period,
      c.amount,
      METHOD_LABELS[c.paymentMethod ?? ""] ?? c.paymentMethod ?? "",
      c.status,
      c.paidAt ? format(new Date(c.paidAt), "dd/MM/yyyy") : "",
      c.paymentNote ?? "",
    ])
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(";")).join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `cotisations-iqra-togo-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  /* Pie data */
  const pieData = byMethod.map(m => ({
    name: METHOD_LABELS[m.paymentMethod ?? ""] ?? "Autre",
    value: m._count.id,
    amount: m._sum.amount ?? 0,
  }))

  /* Bar data */
  const barData = byYear.map(b => ({
    period: b.period,
    montant: b._sum.amount ?? 0,
    count: b._count.id,
  }))

  return (
    <div className="p-6 lg:p-8">
      {/* En-tête */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold" style={{ color: "var(--azae-navy)" }}>
            Registre des cotisations
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">{total} cotisation{total > 1 ? "s" : ""} au total</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV} className="gap-2 text-sm">
            <Download className="h-4 w-4" /> Exporter CSV
          </Button>
          <Button onClick={() => setShowModal(true)} className="gap-2 bg-[var(--azae-orange)] text-white hover:bg-[var(--azae-orange-dark)] text-sm">
            <Plus className="h-4 w-4" /> Enregistrer
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Collecté", value: `${stats.totalCollected.toLocaleString("fr-FR")} FCFA`, icon: TrendingUp, color: "var(--azae-orange)" },
          { label: "En attente", value: `${stats.totalPending.toLocaleString("fr-FR")} FCFA`, icon: AlertTriangle, color: "#f59e0b" },
          { label: "Cotisations payées", value: stats.countPaid, icon: CheckCircle, color: "var(--azae-orange)" },
          { label: "Non réglées", value: stats.countPending, icon: CreditCard, color: "var(--azae-navy)" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: `${color}18` }}>
                <Icon className="h-4 w-4" style={{ color }} />
              </div>
              <div>
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-lg font-bold" style={{ color: "var(--azae-navy)" }}>{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Graphiques */}
      {(barData.length > 0 || pieData.length > 0) && (
        <div className="mb-6 grid gap-4 lg:grid-cols-3">
          {/* Bar chart */}
          <div className="lg:col-span-2 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="mb-4 text-sm font-semibold text-gray-700">Montants collectés — {new Date().getFullYear()}</p>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData} margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: unknown) => [`${Number(v ?? 0).toLocaleString("fr-FR")} FCFA`, "Montant"]} />
                  <Bar dataKey="montant" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[220px] items-center justify-center text-sm text-gray-400">Aucune donnée</div>
            )}
          </div>

          {/* Pie chart */}
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="mb-4 text-sm font-semibold text-gray-700">Méthodes de paiement</p>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3}>
                    {pieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number, _: string, p) => [`${v} (${p.payload.amount?.toLocaleString("fr-FR")} FCFA)`, p.payload.name]} />
                  <Legend iconType="circle" iconSize={10} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[220px] items-center justify-center text-sm text-gray-400">Aucune donnée</div>
            )}
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Rechercher un membre…"
            value={q}
            onChange={e => { setQ(e.target.value); setPage(1) }}
            className="pl-9 text-sm"
          />
        </div>
        {(["", "SUCCESS", "PENDING", "FAILED"] as const).map(s => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1) }}
            className={cn(
              "rounded-lg px-3 py-2 text-xs font-medium transition-colors",
              statusFilter === s ? "bg-[var(--azae-navy)] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {s === "" ? "Tous" : STATUS_CONFIG[s as keyof typeof STATUS_CONFIG]?.label ?? s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-sm text-gray-400">Chargement…</div>
        ) : cotisations.length === 0 ? (
          <div className="py-12 text-center">
            <Users className="mx-auto mb-3 h-10 w-10 text-gray-300" />
            <p className="text-sm text-gray-500">Aucune cotisation trouvée</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50 text-xs font-medium text-gray-500">
                <tr>
                  {["Membre", "Période", "Montant", "Méthode", "Statut", "Date paiement", "Note"].map(h => (
                    <th key={h} className="px-4 py-3 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {cotisations.map(c => {
                  const S = STATUS_CONFIG[c.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.PENDING
                  const SIcon = S.icon
                  return (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">{c.member.firstName} {c.member.lastName}</p>
                        <p className="text-xs text-gray-400 font-mono">{c.member.memberNumber}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{c.period}</td>
                      <td className="px-4 py-3 font-semibold" style={{ color: "var(--azae-navy)" }}>
                        {c.amount.toLocaleString("fr-FR")} FCFA
                      </td>
                      <td className="px-4 py-3">
                        {c.paymentMethod ? (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                            {c.paymentMethod === "cash"
                              ? <Banknote className="h-3.5 w-3.5 text-green-600" />
                              : <Smartphone className="h-3.5 w-3.5 text-blue-600" />
                            }
                            {METHOD_LABELS[c.paymentMethod] ?? c.paymentMethod}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium", S.cls)}>
                          <SIcon className="h-3 w-3" />{S.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {c.paidAt ? format(new Date(c.paidAt), "d MMM yyyy", { locale: fr }) : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 max-w-[150px] truncate">
                        {c.paymentNote ?? "—"}
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
      {total > 50 && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <p>Page {page} / {Math.ceil(total / 50)}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Précédent</Button>
            <Button variant="outline" size="sm" disabled={page >= Math.ceil(total / 50)} onClick={() => setPage(p => p + 1)}>Suivant</Button>
          </div>
        </div>
      )}

      {/* Modal — enregistrer une cotisation */}
      {showModal && <RecordModal onClose={() => setShowModal(false)} onSuccess={() => { setShowModal(false); fetchData() }} />}
    </div>
  )
}

/* ── Modal d'enregistrement ── */
function RecordModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [members, setMembers] = useState<Member[]>([])
  const [memberId, setMemberId] = useState("")
  const [period, setPeriod] = useState(new Date().getFullYear().toString())
  const [amount, setAmount] = useState("5000")
  const [method, setMethod] = useState<"cash" | "mobile_money">("cash")
  const [note, setNote] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [memberQ, setMemberQ] = useState("")

  useEffect(() => {
    fetch("/api/admin/membres?limit=200")
      .then(r => r.json())
      .then(d => setMembers(d.members ?? []))
  }, [])

  const filtered = memberQ
    ? members.filter(m =>
        `${m.firstName} ${m.lastName} ${m.memberNumber}`.toLowerCase().includes(memberQ.toLowerCase())
      )
    : members

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    const res = await fetch("/api/admin/cotisations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        memberId,
        amount: parseInt(amount),
        period,
        paymentMethod: method,
        paymentNote: note || undefined,
      }),
    })
    const d = await res.json()
    if (!res.ok) {
      setError(d.error ?? "Erreur lors de l'enregistrement")
      setSaving(false)
      return
    }
    if (d.paymentUrl) {
      window.open(d.paymentUrl, "_blank")
    }
    onSuccess()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="font-semibold text-gray-800">Enregistrer une cotisation</h2>
          <button onClick={onClose} className="rounded p-1 text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          {/* Recherche membre */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Membre *</label>
            <Input
              placeholder="Rechercher un membre…"
              value={memberQ}
              onChange={e => setMemberQ(e.target.value)}
              className="mb-1 text-sm"
            />
            <select
              value={memberId}
              onChange={e => setMemberId(e.target.value)}
              required
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--azae-orange)]"
            >
              <option value="">Sélectionner un membre</option>
              {filtered.slice(0, 50).map(m => (
                <option key={m.id} value={m.id}>
                  {m.firstName} {m.lastName} ({m.memberNumber})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Période *</label>
              <Input value={period} onChange={e => setPeriod(e.target.value)} placeholder="2026" required />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Montant (FCFA) *</label>
              <Input type="number" min="100" value={amount} onChange={e => setAmount(e.target.value)} required />
            </div>
          </div>

          {/* Méthode de paiement */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Méthode de paiement *</label>
            <div className="grid grid-cols-2 gap-2">
              {(["cash", "mobile_money"] as const).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-lg border py-3 text-sm font-medium transition-colors",
                    method === m
                      ? "border-[var(--azae-orange)] bg-green-50 text-[var(--azae-orange)]"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  )}
                >
                  {m === "cash" ? <Banknote className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
                  {m === "cash" ? "Cash" : "Mobile Money"}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {method === "cash" ? "Note / référence reçu" : "Numéro mobile money"}
            </label>
            <Input
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder={method === "cash" ? "Ex : Reçu n°123" : "Ex : +228 90 00 00 00"}
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>
          )}

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Annuler</Button>
            <Button
              type="submit"
              disabled={saving || !memberId}
              className="flex-1 bg-[var(--azae-orange)] text-white hover:bg-[var(--azae-orange-dark)]"
            >
              {saving ? "Enregistrement…" : method === "cash" ? "Enregistrer" : "Générer lien paiement"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
