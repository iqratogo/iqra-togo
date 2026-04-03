/* §7.1 Dashboard Admin — KPIs + graphiques + activité récente */

import type { Metadata } from "next"
import { prisma } from "@/lib/db/prisma"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import {
  Users, Heart, FileText, TrendingUp, Clock,
} from "lucide-react"

export const metadata: Metadata = { title: "Tableau de bord — Admin IQRA TOGO" }

async function getDashboardData() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const [
    totalMembers,
    pendingApplications,
    donsMonth,
    donsPrevMonth,
    publishedPosts,
    draftPosts,
    recentActivity,
  ] = await Promise.all([
    prisma.member.count({ where: { status: "ACTIVE" } }),
    prisma.membershipApplication.count({ where: { status: "pending" } }),
    prisma.donation.aggregate({
      where: { status: "SUCCESS", createdAt: { gte: startOfMonth } },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.donation.aggregate({
      where: {
        status: "SUCCESS",
        createdAt: { gte: startOfPrevMonth, lt: startOfMonth },
      },
      _sum: { amount: true },
    }),
    prisma.post.count({ where: { status: "PUBLISHED" } }),
    prisma.post.count({ where: { status: "DRAFT" } }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { user: { select: { name: true } } },
    }),
  ]).catch(() => [0, 0, { _sum: { amount: 0 }, _count: 0 }, { _sum: { amount: 0 } }, 0, 0, []])

  const donsMonthTotal = (donsMonth as { _sum: { amount: number | null }; _count: number })._sum.amount ?? 0
  const donsPrevMonthTotal = (donsPrevMonth as { _sum: { amount: number | null } })._sum.amount ?? 0
  const evolution =
    donsPrevMonthTotal > 0
      ? Math.round(((donsMonthTotal - donsPrevMonthTotal) / donsPrevMonthTotal) * 100)
      : 0

  return {
    totalMembers: totalMembers as number,
    pendingApplications: pendingApplications as number,
    donsMonth: donsMonthTotal,
    donsMonthCount: (donsMonth as { _count: number })._count,
    evolution,
    publishedPosts: publishedPosts as number,
    draftPosts: draftPosts as number,
    recentActivity: recentActivity as Array<{
      id: string; action: string; module: string; createdAt: Date;
      user: { name?: string | null } | null;
    }>,
  }
}

export default async function AdminDashboardPage() {
  const data = await getDashboardData()

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1
          className="font-[family-name:var(--font-playfair)] text-2xl font-bold"
          style={{ color: "var(--azae-navy)" }}
        >
          Tableau de bord
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Vue d'ensemble de l'activité IQRA TOGO —{" "}
          {format(new Date(), "d MMMM yyyy", { locale: fr })}
        </p>
      </div>

      {/* §7.1.1 KPIs en temps réel */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Dons ce mois"
          value={`${data.donsMonth.toLocaleString("fr-FR")} FCFA`}
          sub={`${data.donsMonthCount} transaction${data.donsMonthCount > 1 ? "s" : ""}`}
          icon={Heart}
          color="var(--azae-orange)"
          badge={data.evolution !== 0
            ? { value: `${data.evolution > 0 ? "+" : ""}${data.evolution}%`, positive: data.evolution > 0 }
            : undefined}
        />
        <KPICard
          title="Membres actifs"
          value={String(data.totalMembers)}
          sub={`${data.pendingApplications} demande${data.pendingApplications > 1 ? "s" : ""} en attente`}
          icon={Users}
          color="var(--azae-navy)"
        />
        <KPICard
          title="Publications"
          value={String(data.publishedPosts)}
          sub={`${data.draftPosts} brouillon${data.draftPosts > 1 ? "s" : ""}`}
          icon={FileText}
          color="var(--azae-green)"
        />
        <KPICard
          title="Évolution dons"
          value={`${data.evolution > 0 ? "+" : ""}${data.evolution}%`}
          sub="vs mois précédent"
          icon={TrendingUp}
          color={data.evolution >= 0 ? "var(--azae-green)" : "#DC2626"}
        />
      </div>

      {/* §7.1.3 Activité récente */}
      <div className="mt-8">
        <h2
          className="mb-4 font-[family-name:var(--font-playfair)] text-lg font-bold"
          style={{ color: "var(--azae-navy)" }}
        >
          Activité récente
        </h2>
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
          {data.recentActivity.length > 0 ? (
            <ul className="divide-y divide-gray-50">
              {data.recentActivity.map((log) => (
                <li key={log.id} className="flex items-start gap-3 px-5 py-3">
                  <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-100">
                    <Clock className="h-3.5 w-3.5 text-gray-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-700">
                      {log.action.replaceAll("_", " ")}
                    </p>
                    <p className="text-xs text-gray-400">
                      {log.user?.name ?? "Système"} —{" "}
                      {format(new Date(log.createdAt), "d MMM yyyy, HH:mm", { locale: fr })}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-8 text-center text-sm text-gray-400">Aucune activité récente.</p>
          )}
        </div>
      </div>
    </div>
  )
}

/* KPI Card */
function KPICard({
  title, value, sub, icon: Icon, color, badge,
}: {
  title: string
  value: string
  sub: string
  icon: typeof Heart
  color: string
  badge?: { value: string; positive: boolean }
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: color, opacity: 0.9 }}
        >
          <Icon className="h-5 w-5 text-white" aria-hidden="true" />
        </div>
        {badge && (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              badge.positive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {badge.value}
          </span>
        )}
      </div>
      <p
        className="mt-4 font-[family-name:var(--font-playfair)] text-2xl font-bold"
        style={{ color: "var(--azae-navy)" }}
      >
        {value}
      </p>
      <p className="mt-0.5 text-xs text-gray-500">{title}</p>
      <p className="mt-1 text-xs text-gray-400">{sub}</p>
    </div>
  )
}
