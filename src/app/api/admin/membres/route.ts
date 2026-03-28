/* §7.3 API Membres Admin — LIST + workflow validation */

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"
import { NextRequest, NextResponse } from "next/server"

const ALLOWED_ROLES = ["SUPER_ADMIN", "ADMIN"]

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as { role?: string })?.role ?? ""
  if (!ALLOWED_ROLES.includes(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"))
  const limit = 20
  const status = searchParams.get("status") ?? undefined
  /* Limite la longueur de la recherche pour éviter un DoS via requête DB coûteuse */
  const rawSearch = searchParams.get("search") ?? ""
  const search = rawSearch.slice(0, 100) || undefined
  const tab = searchParams.get("tab") ?? "members" // "members" | "applications"

  if (tab === "applications") {
    const appStatus = searchParams.get("appStatus") ?? undefined
    const where = {
      ...(appStatus ? { status: appStatus } : {}),
      ...(search ? {
        OR: [
          { firstName: { contains: search, mode: "insensitive" as const } },
          { lastName: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ]
      } : {}),
    }
    const [applications, total] = await Promise.all([
      prisma.membershipApplication.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: { user: { select: { email: true, name: true } } },
      }),
      prisma.membershipApplication.count({ where }),
    ])
    return NextResponse.json({ applications, total, pages: Math.ceil(total / limit), page })
  }

  const where = {
    ...(status ? { status: status as "PENDING" | "ACTIVE" | "INACTIVE" | "SUSPENDED" | "EXPIRED" } : {}),
    ...(search ? {
      OR: [
        { firstName: { contains: search, mode: "insensitive" as const } },
        { lastName: { contains: search, mode: "insensitive" as const } },
        { user: { email: { contains: search, mode: "insensitive" as const } } },
        { memberNumber: { contains: search, mode: "insensitive" as const } },
      ]
    } : {}),
  }

  const [members, total] = await Promise.all([
    prisma.member.findMany({
      where,
      orderBy: { joinedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { user: { select: { email: true, role: true } } },
    }),
    prisma.member.count({ where }),
  ])

  return NextResponse.json({ members, total, pages: Math.ceil(total / limit), page })
}
