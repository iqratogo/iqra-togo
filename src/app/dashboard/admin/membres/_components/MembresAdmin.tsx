"use client"

/* §7.3 Gestion des membres — liste + workflow validation candidatures */

import { useState, useEffect, useCallback } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import {
  Users, Search, CheckCircle, XCircle, Clock,
  UserCheck, UserX, AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type Member = {
  id: string
  memberNumber: string
  firstName: string
  lastName: string
  status: string
  cotisationStatus: string
  joinedAt: string | null
  user: { email: string; role: string }
}

type Application = {
  id: string
  dossierNumber: string
  firstName: string
  lastName: string
  email: string
  status: string
  createdAt: string
  motivation: string | null
}

const STATUS_MEMBER: Record<string, { label: string; cls: string }> = {
  ACTIVE: { label: "Actif", cls: "bg-green-100 text-green-700" },
  PENDING: { label: "En attente", cls: "bg-yellow-100 text-yellow-700" },
  SUSPENDED: { label: "Suspendu", cls: "bg-red-100 text-red-700" },
  INACTIVE: { label: "Inactif", cls: "bg-gray-100 text-gray-600" },
  EXPIRED: { label: "Expiré", cls: "bg-orange-100 text-orange-600" },
}

const STATUS_APP: Record<string, { label: string; icon: typeof Clock; cls: string }> = {
  pending: { label: "En attente", icon: Clock, cls: "bg-yellow-100 text-yellow-700" },
  approved: { label: "Approuvé", icon: CheckCircle, cls: "bg-green-100 text-green-700" },
  rejected: { label: "Rejeté", icon: XCircle, cls: "bg-red-100 text-red-700" },
}

export default function MembresAdmin() {
  const [tab, setTab] = useState<"members" | "applications">("applications")
  const [members, setMembers] = useState<Member[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [rejectTarget, setRejectTarget] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ tab, page: String(page) })
    if (search) params.set("search", search)
    if (statusFilter) {
      if (tab === "applications") params.set("appStatus", statusFilter)
      else params.set("status", statusFilter)
    }
    const res = await fetch(`/api/admin/membres?${params}`)
    const data = await res.json()
    if (tab === "members") {
      setMembers(data.members ?? [])
    } else {
      setApplications(data.applications ?? [])
    }
    setTotal(data.total ?? 0)
    setPages(data.pages ?? 1)
    setLoading(false)
  }, [tab, page, search, statusFilter])

  useEffect(() => { fetchData() }, [fetchData])

  async function handleApprove(id: string) {
    setActionLoading(id)
    await fetch(`/api/admin/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve" }),
    })
    setActionLoading(null)
    fetchData()
  }

  async function handleReject(id: string) {
    setActionLoading(id)
    await fetch(`/api/admin/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reject", reason: rejectReason }),
    })
    setActionLoading(null)
    setRejectTarget(null)
    setRejectReason("")
    fetchData()
  }

  async function handleMemberStatus(id: string, status: string) {
    await fetch(`/api/admin/membres/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    fetchData()
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold" style={{ color: "var(--azae-navy)" }}>
          Membres
        </h1>
        <p className="mt-0.5 text-sm text-gray-500">{total} entrée{total > 1 ? "s" : ""}</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 w-fit">
        {(["applications", "members"] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setPage(1); setStatusFilter("") }}
            className={cn(
              "rounded-md px-4 py-2 text-sm font-medium transition-colors",
              tab === t ? "bg-white text-[var(--azae-navy)] shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            {t === "applications" ? "Candidatures" : "Membres actifs"}
          </button>
        ))}
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
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--azae-orange)]"
        >
          <option value="">Tous les statuts</option>
          {tab === "applications" ? (
            <>
              <option value="pending">En attente</option>
              <option value="approved">Approuvé</option>
              <option value="rejected">Rejeté</option>
            </>
          ) : (
            <>
              <option value="ACTIVE">Actifs</option>
              <option value="PENDING">En attente</option>
              <option value="SUSPENDED">Suspendus</option>
              <option value="INACTIVE">Inactifs</option>
            </>
          )}
        </select>
      </div>

      {/* Table Candidatures */}
      {tab === "applications" && (
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-sm text-gray-400">Chargement…</div>
          ) : applications.length === 0 ? (
            <div className="py-16 text-center">
              <Clock className="mx-auto mb-3 h-10 w-10 text-gray-300" />
              <p className="text-sm text-gray-500">Aucune candidature</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Candidat</th>
                    <th className="hidden px-4 py-3 text-left font-medium text-gray-600 md:table-cell">Dossier</th>
                    <th className="hidden px-4 py-3 text-left font-medium text-gray-600 sm:table-cell">Statut</th>
                    <th className="hidden px-4 py-3 text-left font-medium text-gray-600 lg:table-cell">Date</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {applications.map((app) => {
                    const s = STATUS_APP[app.status] ?? STATUS_APP.pending
                    const SIcon = s.icon
                    return (
                      <tr key={app.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-800">{app.firstName} {app.lastName}</div>
                          <div className="text-xs text-gray-400">{app.email}</div>
                        </td>
                        <td className="hidden px-4 py-3 text-gray-500 font-mono md:table-cell">{app.dossierNumber}</td>
                        <td className="hidden px-4 py-3 sm:table-cell">
                          <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", s.cls)}>
                            <SIcon className="h-3 w-3" />{s.label}
                          </span>
                        </td>
                        <td className="hidden px-4 py-3 text-gray-400 lg:table-cell">
                          {format(new Date(app.createdAt), "d MMM yyyy", { locale: fr })}
                        </td>
                        <td className="px-4 py-3">
                          {app.status === "pending" ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleApprove(app.id)}
                                disabled={actionLoading === app.id}
                                className="flex items-center gap-1 rounded-lg bg-green-100 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-200 transition-colors disabled:opacity-50"
                              >
                                <UserCheck className="h-3.5 w-3.5" /> Approuver
                              </button>
                              <button
                                onClick={() => setRejectTarget(app.id)}
                                disabled={actionLoading === app.id}
                                className="flex items-center gap-1 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200 transition-colors disabled:opacity-50"
                              >
                                <UserX className="h-3.5 w-3.5" /> Rejeter
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">Traité</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Table Membres */}
      {tab === "members" && (
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-sm text-gray-400">Chargement…</div>
          ) : members.length === 0 ? (
            <div className="py-16 text-center">
              <Users className="mx-auto mb-3 h-10 w-10 text-gray-300" />
              <p className="text-sm text-gray-500">Aucun membre</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Membre</th>
                    <th className="hidden px-4 py-3 text-left font-medium text-gray-600 md:table-cell">N° Membre</th>
                    <th className="hidden px-4 py-3 text-left font-medium text-gray-600 sm:table-cell">Statut</th>
                    <th className="hidden px-4 py-3 text-left font-medium text-gray-600 lg:table-cell">Cotisation</th>
                    <th className="hidden px-4 py-3 text-left font-medium text-gray-600 lg:table-cell">Adhésion</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {members.map((m) => {
                    const s = STATUS_MEMBER[m.status] ?? STATUS_MEMBER.INACTIVE
                    return (
                      <tr key={m.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-800">{m.firstName} {m.lastName}</div>
                          <div className="text-xs text-gray-400">{m.user.email}</div>
                        </td>
                        <td className="hidden px-4 py-3 font-mono text-gray-600 md:table-cell">{m.memberNumber}</td>
                        <td className="hidden px-4 py-3 sm:table-cell">
                          <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", s.cls)}>{s.label}</span>
                        </td>
                        <td className="hidden px-4 py-3 lg:table-cell">
                          <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium",
                            m.cotisationStatus === "UP_TO_DATE" ? "bg-green-100 text-green-700" :
                            m.cotisationStatus === "LATE" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                          )}>
                            {m.cotisationStatus === "UP_TO_DATE" ? "À jour" : m.cotisationStatus === "LATE" ? "En retard" : "Exempté"}
                          </span>
                        </td>
                        <td className="hidden px-4 py-3 text-gray-400 lg:table-cell">
                          {m.joinedAt ? format(new Date(m.joinedAt), "d MMM yyyy", { locale: fr }) : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            {m.status === "ACTIVE" && (
                              <button
                                onClick={() => handleMemberStatus(m.id, "SUSPENDED")}
                                className="rounded p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                                title="Suspendre"
                              >
                                <UserX className="h-4 w-4" />
                              </button>
                            )}
                            {m.status === "SUSPENDED" && (
                              <button
                                onClick={() => handleMemberStatus(m.id, "ACTIVE")}
                                className="rounded p-1.5 text-gray-400 hover:text-green-600 transition-colors"
                                title="Réactiver"
                              >
                                <UserCheck className="h-4 w-4" />
                              </button>
                            )}
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
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Précédent</Button>
          <span className="text-sm text-gray-500">Page {page} / {pages}</span>
          <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage(p => p + 1)}>Suivant</Button>
        </div>
      )}

      {/* Modal rejet */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 text-red-500 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-800">Rejeter la candidature</h3>
                <p className="mt-1 text-sm text-gray-500">Indiquez un motif (optionnel). Un email sera envoyé au candidat.</p>
              </div>
            </div>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Motif du refus…"
              rows={3}
              className="w-full rounded-lg border border-gray-200 p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setRejectTarget(null); setRejectReason("") }}>Annuler</Button>
              <Button
                onClick={() => handleReject(rejectTarget)}
                className="bg-red-600 text-white hover:bg-red-700"
                disabled={actionLoading === rejectTarget}
              >
                Confirmer le rejet
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
