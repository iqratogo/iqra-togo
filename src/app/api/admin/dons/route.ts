/* §7.5 API Dons Admin — LIST */

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    ...(status ? { status } : {}),
    ...(search ? {
      OR: [
        { donorFirstName: { contains: search, mode: "insensitive" } },
        { donorLastName: { contains: search, mode: "insensitive" } },
        { donorEmail: { contains: search, mode: "insensitive" } },
        { paydunyaRef: { contains: search, mode: "insensitive" } },
      ]
    } : {}),
  }

  const [donations, total, aggregate] = await Promise.all([
    prisma.donation.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        amount: true,
        affectation: true,
        status: true,
        isAnonymous: true,
        donorFirstName: true,
        donorLastName: true,
        donorEmail: true,
        paydunyaRef: true,
        createdAt: true,
      },
    }),
    prisma.donation.count({ where }),
    prisma.donation.aggregate({
      where: { ...where, status: "SUCCESS" },
      _sum: { amount: true },
      _count: true,
    }),
  ])

  return NextResponse.json({
    donations,
    total,
    pages: Math.ceil(total / limit),
    page,
    totalAmount: aggregate._sum.amount ?? 0,
    successCount: aggregate._count,
  })
}
