"use client"

/* §9.4 Modal détails d'un log d'audit */

import { useEffect } from "react"
import { X, User, Zap, Box, Globe, Monitor, Calendar } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export interface AuditLogRow {
  id: string
  action: string
  module: string
  targetId: string | null
  details: unknown
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
  userId: string | null
  user: { email: string; role: string } | null
}

interface Props {
  log: AuditLogRow
  onClose: () => void
}

export default function AuditLogModal({ log, onClose }: Props) {
  /* Fermeture au clic Échap */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [onClose])

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Détails du log d'audit"
    >
      {/* Panneau */}
      <div
        className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête */}
        <div
          className="flex items-center justify-between rounded-t-2xl px-6 py-4"
          style={{ backgroundColor: "var(--azae-navy)" }}
        >
          <div>
            <h2 className="font-[family-name:var(--font-playfair)] text-lg font-bold text-white">
              Détails du log
            </h2>
            <p className="mt-0.5 text-xs text-white/60">ID : {log.id}</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Corps */}
        <div className="max-h-[70vh] overflow-y-auto p-6">
          {/* Infos principales */}
          <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InfoRow
              icon={<Zap className="h-4 w-4" />}
              label="Action"
              value={<ActionBadge action={log.action} />}
            />
            <InfoRow
              icon={<Box className="h-4 w-4" />}
              label="Module"
              value={
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                  {log.module}
                </span>
              }
            />
            <InfoRow
              icon={<User className="h-4 w-4" />}
              label="Utilisateur"
              value={
                <span className="text-sm text-gray-700">
                  {log.user?.email ?? log.userId ?? "Système"}
                  {log.user?.role && (
                    <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                      {log.user.role}
                    </span>
                  )}
                </span>
              }
            />
            <InfoRow
              icon={<Calendar className="h-4 w-4" />}
              label="Date"
              value={
                <span className="text-sm text-gray-700">
                  {format(new Date(log.createdAt), "dd/MM/yyyy HH:mm:ss", { locale: fr })}
                </span>
              }
            />
            <InfoRow
              icon={<Globe className="h-4 w-4" />}
              label="Adresse IP"
              value={<span className="text-sm text-gray-700">{log.ipAddress ?? "—"}</span>}
            />
            <InfoRow
              icon={<Monitor className="h-4 w-4" />}
              label="User Agent"
              value={
                <span className="max-w-xs truncate text-sm text-gray-700" title={log.userAgent ?? ""}>
                  {log.userAgent ?? "—"}
                </span>
              }
            />
            {log.targetId && (
              <InfoRow
                icon={<Box className="h-4 w-4" />}
                label="Cible (targetId)"
                value={<span className="font-mono text-xs text-gray-600">{log.targetId}</span>}
              />
            )}
          </div>

          {/* Détails JSON */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Données contextuelles (details)
            </p>
            {log.details != null ? (
              <pre className="overflow-auto rounded-xl bg-gray-900 p-4 text-xs leading-relaxed text-green-400">
                {JSON.stringify(log.details, null, 2)}
              </pre>
            ) : (
              <p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-400">
                Aucun détail enregistré.
              </p>
            )}
          </div>
        </div>

        {/* Pied */}
        <div className="rounded-b-2xl border-t border-gray-100 px-6 py-3">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-3">
      <span className="mt-0.5 text-gray-400">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-400">{label}</p>
        <div className="mt-0.5">{value}</div>
      </div>
    </div>
  )
}

export function ActionBadge({ action }: { action: string }) {
  const a = action.toUpperCase()

  let cls = "bg-gray-100 text-gray-700"
  if (a.includes("CREATE") || a.includes("APPROVED") || a.includes("INSERT")) {
    cls = "bg-green-100 text-green-700"
  } else if (a.includes("UPDATE") || a.includes("UPDATED")) {
    cls = "bg-blue-100 text-blue-700"
  } else if (a.includes("DELETE") || a.includes("REJECTED") || a.includes("REMOVED")) {
    cls = "bg-red-100 text-red-700"
  } else if (a.includes("SENT") || a.includes("SEND")) {
    cls = "bg-purple-100 text-purple-700"
  } else if (a.includes("REGISTER") || a.includes("SIGNUP") || a.includes("JOINED")) {
    cls = "bg-yellow-100 text-yellow-700"
  }

  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>
      {action}
    </span>
  )
}
