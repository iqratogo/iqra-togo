"use client"

/* §7.5 Gestion des dons admin */

import { useState, useEffect, useCallback } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Heart, Search, TrendingUp, CheckCircle, XCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type Donation = {
  id: string
  paydunyaRef: string | null
  donorFirstName: string | null
  donorLastName: string | null
  donorEmail: string | null
  amount: number
  status: string
  affectation: string
  isAnonymous: boolean
  createdAt: string
}

const STATUS: Record<string, { label: string; icon: typeof Clock; cls: string }> = {
  SUCCESS: { label: "Succès", icon: CheckCircle, cls: "bg-green-100 text-green-700" },
  PENDING: { label: "En attente", icon: Clock, cls: "bg-yellow-100 text-yellow-700" },
  FAILED: { label: "Échoué", icon: XCircle, cls: "bg-red-100 text-red-700" },
  REFUNDED: { label: "Remboursé", icon: XCircle, cls: "bg-gray-100 text-gray-600" },
}

export default function DonsAdmin() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [totalAmount, setTotalAmount] = useState(0)
  const [successCount, setSuccessCount] = useState(0)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page) })
    if (search) params.set("search", search)
    if (statusFilter) params.set("status", statusFilter)
    const res = await fetch(`/api/admin/dons?${params}`)
    const data = await res.json()
    setDonations(data.donations ?? [])
    setTotal(data.total ?? 0)
    setPages(data.pages ?? 1)
    setTotalAmount(data.totalAmount ?? 0)
    setSuccessCount(data.successCount ?? 0)
    setLoading(false)
  }, [page, search, statusFilter])

  useEffect(() => { fetchData() }, [fetchData])

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold" style={{ color: "var(--azae-navy)" }}>
          Dons
        </h1>
        <p className="mt-0.5 text-sm text-gray-500">{total} don{total > 1 ? "s" : ""}</p>
      </div>

      {/* KPI summary */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: "var(--azae-orange)" }}>
              <Heart className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold" style={{ color: "var(--azae-navy)" }}>
                {totalAmount.toLocaleString("fr-FR")} FCFA
              </p>
              <p className="text-xs text-gray-500">Total dons validés (filtre actif)</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: "var(--azae-green)" }}>
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold" style={{ color: "var(--azae-navy)" }}>
                {successCount}
              </p>
              <p className="text-xs text-gray-500">Transactions réussies</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Nom, email ou référence…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--azae-orange)]"
        >
          <option value="">Tous les statuts</option>
          <option value="SUCCESS">Succès</option>
          <option value="PENDING">En attente</option>
          <option value="FAILED">Échoué</option>
          <option value="REFUNDED">Remboursé</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-sm text-gray-400">Chargement…</div>
        ) : donations.length === 0 ? (
          <div className="py-16 text-center">
            <Heart className="mx-auto mb-3 h-10 w-10 text-gray-300" />
            <p className="text-sm text-gray-500">Aucun don trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Donateur</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-gray-600 md:table-cell">Référence</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Montant</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-gray-600 sm:table-cell">Statut</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-gray-600 lg:table-cell">Affectation</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-gray-600 lg:table-cell">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {donations.map((d) => {
                  const s = STATUS[d.status] ?? STATUS.PENDING
                  const SIcon = s.icon
                  return (
                    <tr key={d.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-800">
                          {d.isAnonymous ? "Anonyme" : `${d.donorFirstName ?? ""} ${d.donorLastName ?? ""}`.trim() || "—"}
                        </div>
                        {!d.isAnonymous && d.donorEmail && (
                          <div className="text-xs text-gray-400">{d.donorEmail}</div>
                        )}
                      </td>
                      <td className="hidden px-4 py-3 font-mono text-xs text-gray-500 md:table-cell">{d.paydunyaRef ?? "—"}</td>
                      <td className="px-4 py-3 font-semibold" style={{ color: "var(--azae-navy)" }}>
                        {d.amount.toLocaleString("fr-FR")} FCFA
                      </td>
                      <td className="hidden px-4 py-3 sm:table-cell">
                        <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", s.cls)}>
                          <SIcon className="h-3 w-3" />{s.label}
                        </span>
                      </td>
                      <td className="hidden px-4 py-3 text-gray-500 lg:table-cell">{d.affectation || "Général"}</td>
                      <td className="hidden px-4 py-3 text-gray-400 lg:table-cell">
                        {format(new Date(d.createdAt), "d MMM yyyy", { locale: fr })}
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
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Précédent</Button>
          <span className="text-sm text-gray-500">Page {page} / {pages}</span>
          <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage(p => p + 1)}>Suivant</Button>
        </div>
      )}
    </div>
  )
}
