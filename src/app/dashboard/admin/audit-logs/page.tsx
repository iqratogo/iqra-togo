/* §9.3 Page admin — Logs d'audit */

import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db/prisma"
import { Activity, TrendingUp, Users, Zap } from "lucide-react"
import AuditLogsClient from "./_components/AuditLogsClient"
import type { AuditLogRow } from "@/components/admin/AuditLogModal"

export const metadata: Metadata = { title: "Logs d'audit — Admin IQRA TOGO" }

const PAGE_SIZE = 20

async function getStats() {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  /* Lundi de la semaine courante */
  const day = now.getDay() === 0 ? 6 : now.getDay() - 1
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day)

  const [todayCount, weekCount, mostFrequentRaw, mostActiveRaw] = await Promise.all([
    prisma.auditLog.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.auditLog.count({ where: { createdAt: { gte: startOfWeek } } }),
    prisma.auditLog.groupBy({
      by: ["action"],
      _count: { action: true },
      orderBy: { _count: { action: "desc" } },
      take: 1,
    }),
    prisma.auditLog.groupBy({
      by: ["userId"],
      _count: { userId: true },
      orderBy: { _count: { userId: "desc" } },
      take: 1,
      where: { userId: { not: null } },
    }),
  ])

  const mostFrequentAction = mostFrequentRaw[0]?.action ?? "—"

  const mostActiveUserId = mostActiveRaw[0]?.userId
  let mostActiveUserLabel = "—"
  if (mostActiveUserId) {
    const u = await prisma.user.findUnique({
      where: { id: mostActiveUserId },
      select: { email: true },
    })
    mostActiveUserLabel = u?.email ?? mostActiveUserId
  }

  return { todayCount, weekCount, mostFrequentAction, mostActiveUserLabel }
}

async function getLogs(params: {
  module?: string
  action?: string
  dateFrom?: string
  dateTo?: string
  search?: string
  page: number
}) {
  const { module, action, dateFrom, dateTo, search, page } = params

  const where = {
    ...(module ? { module } : {}),
    ...(action ? { action } : {}),
    ...(dateFrom || dateTo
      ? {
          createdAt: {
            ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
            ...(dateTo ? { lte: new Date(`${dateTo}T23:59:59.999Z`) } : {}),
          },
        }
      : {}),
    ...(search
      ? {
          OR: [
            { userId: { contains: search } },
            { targetId: { contains: search } },
          ],
        }
      : {}),
  }

  const [rawLogs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { user: { select: { email: true, role: true } } },
    }),
    prisma.auditLog.count({ where }),
  ])

  /* Sérialisation pour les Client Components (Date → string) */
  const logs: AuditLogRow[] = rawLogs.map((log) => ({
    id: log.id,
    action: log.action,
    module: log.module,
    targetId: log.targetId ?? null,
    details: log.details ?? null,
    ipAddress: log.ipAddress ?? null,
    userAgent: log.userAgent ?? null,
    createdAt: log.createdAt.toISOString(),
    userId: log.userId ?? null,
    user: log.user
      ? { email: log.user.email, role: String(log.user.role) }
      : null,
  }))

  return { logs, total, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) }
}

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  /* §7.6 RBAC — réservé SUPER_ADMIN et ADMIN */
  const session = await auth()
  if (!session) redirect("/auth/login")
  const role = (session.user as { role?: string })?.role ?? "VISITOR"
  if (!["SUPER_ADMIN", "ADMIN"].includes(role)) {
    redirect("/dashboard/admin")
  }

  const sp = await searchParams
  const currentPage = Math.max(1, parseInt((sp.page as string) ?? "1"))
  const filterParams = {
    module: (sp.module as string) || undefined,
    action: (sp.action as string) || undefined,
    dateFrom: (sp.dateFrom as string) || undefined,
    dateTo: (sp.dateTo as string) || undefined,
    search: (sp.search as string) || undefined,
    page: currentPage,
  }

  const [stats, { logs, total, totalPages }] = await Promise.all([
    getStats(),
    getLogs(filterParams),
  ])

  return (
    <div className="p-6 lg:p-8">
      {/* En-tête */}
      <div className="mb-8">
        <h1
          className="font-[family-name:var(--font-playfair)] text-2xl font-bold"
          style={{ color: "var(--azae-navy)" }}
        >
          Logs d'audit
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Traçabilité de toutes les actions effectuées dans l'administration.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Actions aujourd'hui"
          value={String(stats.todayCount)}
          icon={Activity}
          color="var(--azae-orange)"
        />
        <StatCard
          label="Actions cette semaine"
          value={String(stats.weekCount)}
          icon={TrendingUp}
          color="var(--azae-navy)"
        />
        <StatCard
          label="Action la + fréquente"
          value={stats.mostFrequentAction}
          icon={Zap}
          color="var(--azae-green)"
          small
        />
        <StatCard
          label="Utilisateur le + actif"
          value={stats.mostActiveUserLabel}
          icon={Users}
          color="#7C3AED"
          small
        />
      </div>

      {/* Table avec filtres */}
      <AuditLogsClient
        logs={logs}
        total={total}
        totalPages={totalPages}
        currentPage={currentPage}
        currentParams={{
          module: filterParams.module,
          action: filterParams.action,
          dateFrom: filterParams.dateFrom,
          dateTo: filterParams.dateTo,
          search: filterParams.search,
        }}
      />
    </div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  small,
}: {
  label: string
  value: string
  icon: typeof Activity
  color: string
  small?: boolean
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div
        className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg"
        style={{ backgroundColor: color, opacity: 0.9 }}
      >
        <Icon className="h-5 w-5 text-white" aria-hidden="true" />
      </div>
      <p
        className={`font-[family-name:var(--font-playfair)] font-bold ${small ? "truncate text-base" : "text-2xl"}`}
        style={{ color: "var(--azae-navy)" }}
        title={value}
      >
        {value}
      </p>
      <p className="mt-0.5 text-xs text-gray-400">{label}</p>
    </div>
  )
}
