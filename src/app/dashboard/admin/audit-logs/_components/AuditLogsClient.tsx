"use client"

/* §9.3 Interface admin audit logs — filtres, table, pagination */

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, RotateCcw, Eye, ChevronLeft, ChevronRight } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import AuditLogModal, { ActionBadge } from "@/components/admin/AuditLogModal"
import type { AuditLogRow } from "@/components/admin/AuditLogModal"

const MODULES = ["MEMBRES", "PUBLICATIONS", "PARAMETRES", "AUTH", "COTISATIONS", "NEWSLETTER"]

const KNOWN_ACTIONS = [
  "APPLICATION_APPROVED",
  "APPLICATION_REJECTED",
  "SETTINGS_UPDATED",
  "POST_CREATED",
  "POST_UPDATED",
  "POST_DELETED",
]

interface Props {
  logs: AuditLogRow[]
  total: number
  totalPages: number
  currentPage: number
  currentParams: {
    module?: string
    action?: string
    dateFrom?: string
    dateTo?: string
    search?: string
  }
}

export default function AuditLogsClient({
  logs,
  total,
  totalPages,
  currentPage,
  currentParams,
}: Props) {
  const router = useRouter()

  const [filters, setFilters] = useState({
    module: currentParams.module ?? "",
    action: currentParams.action ?? "",
    dateFrom: currentParams.dateFrom ?? "",
    dateTo: currentParams.dateTo ?? "",
    search: currentParams.search ?? "",
  })

  const [selectedLog, setSelectedLog] = useState<AuditLogRow | null>(null)

  function buildQuery(overrides: Record<string, string | number> = {}) {
    const p: Record<string, string> = {}
    if (filters.module) p.module = filters.module
    if (filters.action) p.action = filters.action
    if (filters.dateFrom) p.dateFrom = filters.dateFrom
    if (filters.dateTo) p.dateTo = filters.dateTo
    if (filters.search) p.search = filters.search
    p.page = String(currentPage)
    Object.entries(overrides).forEach(([k, v]) => {
      if (v) p[k] = String(v)
      else delete p[k]
    })
    return new URLSearchParams(p).toString()
  }

  function applyFilters() {
    router.push(`?${buildQuery({ page: 1 })}`)
  }

  function resetFilters() {
    setFilters({ module: "", action: "", dateFrom: "", dateTo: "", search: "" })
    router.push("?")
  }

  function goToPage(page: number) {
    router.push(`?${buildQuery({ page })}`)
  }

  return (
    <>
      {/* ——— Filtres ——— */}
      <div className="mb-6 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-3">
          {/* Module */}
          <select
            value={filters.module}
            onChange={(e) => setFilters((f) => ({ ...f, module: e.target.value }))}
            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:border-[var(--azae-orange)] focus:outline-none"
          >
            <option value="">Tous les modules</option>
            {MODULES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          {/* Action */}
          <select
            value={filters.action}
            onChange={(e) => setFilters((f) => ({ ...f, action: e.target.value }))}
            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:border-[var(--azae-orange)] focus:outline-none"
          >
            <option value="">Toutes les actions</option>
            {KNOWN_ACTIONS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>

          {/* Date de */}
          <div className="flex items-center gap-1">
            <label className="text-xs text-gray-500">Du</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))}
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:border-[var(--azae-orange)] focus:outline-none"
            />
          </div>

          {/* Date au */}
          <div className="flex items-center gap-1">
            <label className="text-xs text-gray-500">Au</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))}
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:border-[var(--azae-orange)] focus:outline-none"
            />
          </div>

          {/* Recherche */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="userId ou targetId…"
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-700 focus:border-[var(--azae-orange)] focus:outline-none"
            />
          </div>

          {/* Boutons */}
          <button
            onClick={applyFilters}
            className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
            style={{ backgroundColor: "var(--azae-orange)" }}
          >
            Filtrer
          </button>
          <button
            onClick={resetFilters}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Réinitialiser
          </button>
        </div>
      </div>

      {/* ——— Table ——— */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        {logs.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-gray-400">Aucun log trouvé.</p>
            <p className="mt-1 text-xs text-gray-300">Essayez de modifier vos filtres.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                  <th className="px-4 py-3">Date/Heure</th>
                  <th className="px-4 py-3">Utilisateur</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Module</th>
                  <th className="px-4 py-3">IP</th>
                  <th className="px-4 py-3 text-right">Détails</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="transition-colors hover:bg-orange-50/30"
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-gray-600">
                      {format(new Date(log.createdAt), "dd/MM/yyyy HH:mm", { locale: fr })}
                    </td>
                    <td className="px-4 py-3">
                      {log.user ? (
                        <div>
                          <p className="text-xs font-medium text-gray-700">{log.user.email}</p>
                          <RoleBadge role={log.user.role} />
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">
                          {log.userId ? (
                            <span className="font-mono">{log.userId.slice(0, 8)}…</span>
                          ) : (
                            "Système"
                          )}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <ActionBadge action={log.action} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                        {log.module}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-gray-500">
                      {log.ipAddress ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 transition-colors hover:border-[var(--azae-orange)] hover:text-[var(--azae-orange)]"
                      >
                        <Eye className="h-3 w-3" />
                        Voir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ——— Pagination ——— */}
        {totalPages > 1 && (
          <div className="flex flex-col items-center justify-between gap-2 border-t border-gray-100 px-4 py-3 sm:flex-row">
            <p className="text-xs text-gray-400">
              Page <span className="font-semibold text-gray-700">{currentPage}</span> sur{" "}
              <span className="font-semibold text-gray-700">{totalPages}</span> —{" "}
              <span className="font-semibold text-gray-700">{total}</span> résultat
              {total > 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Précédent
              </button>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Suivant
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ——— Modal ——— */}
      {selectedLog && (
        <AuditLogModal log={selectedLog} onClose={() => setSelectedLog(null)} />
      )}
    </>
  )
}

function RoleBadge({ role }: { role: string }) {
  const colors: Record<string, string> = {
    SUPER_ADMIN: "bg-red-100 text-red-700",
    ADMIN: "bg-orange-100 text-orange-700",
    EDITOR: "bg-blue-100 text-blue-700",
    MEMBER: "bg-green-100 text-green-700",
    VISITOR: "bg-gray-100 text-gray-600",
  }
  const cls = colors[role] ?? "bg-gray-100 text-gray-600"
  return (
    <span className={`mt-0.5 inline-block rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${cls}`}>
      {role}
    </span>
  )
}
