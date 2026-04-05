/* API Admin Cotisations — GET liste + POST enregistrer + stats */

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createInvoice } from "@/lib/paydunya"

const ALLOWED_ROLES = ["SUPER_ADMIN", "ADMIN"]

async function checkAuth() {
  const session = await auth()
  if (!session) return null
  const role = (session.user as { role?: string })?.role ?? ""
  if (!ALLOWED_ROLES.includes(role)) return null
  return session
}

/* GET /api/admin/cotisations — liste paginée + stats */
export async function GET(req: NextRequest) {
  const session = await checkAuth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"))
  const limit = Math.min(100, parseInt(searchParams.get("limit") ?? "50"))
  const status = searchParams.get("status")
  const year = searchParams.get("year")
  const q = searchParams.get("q")?.trim()

  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (year) where.period = { contains: year }

  /* Recherche par email/nom de membre */
  if (q) {
    where.member = {
      OR: [
        { firstName: { contains: q, mode: "insensitive" } },
        { lastName: { contains: q, mode: "insensitive" } },
        { memberNumber: { contains: q, mode: "insensitive" } },
      ],
    }
  }

  const [cotisations, total] = await Promise.all([
    prisma.cotisation.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            memberNumber: true,
            cotisationStatus: true,
          },
        },
      },
    }),
    prisma.cotisation.count({ where }),
  ])

  /* Stats globales */
  const currentYear = new Date().getFullYear().toString()
  const [statsRaw, byMethod, byYear] = await Promise.all([
    prisma.cotisation.groupBy({
      by: ["status"],
      _count: { id: true },
      _sum: { amount: true },
    }),
    prisma.cotisation.groupBy({
      by: ["paymentMethod"],
      where: { status: "SUCCESS" },
      _count: { id: true },
      _sum: { amount: true },
    }),
    prisma.cotisation.groupBy({
      by: ["period"],
      where: { status: "SUCCESS", period: { contains: currentYear } },
      _sum: { amount: true },
      _count: { id: true },
      orderBy: { period: "asc" },
    }),
  ])

  const totalCollected = statsRaw.find(s => s.status === "SUCCESS")?._sum.amount ?? 0
  const totalPending = statsRaw.find(s => s.status === "PENDING")?._sum.amount ?? 0
  const countPaid = statsRaw.find(s => s.status === "SUCCESS")?._count.id ?? 0
  const countPending = statsRaw.find(s => s.status === "PENDING")?._count.id ?? 0

  return NextResponse.json({
    cotisations,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    stats: { totalCollected, totalPending, countPaid, countPending },
    byMethod,
    byYear,
  })
}

const recordSchema = z.object({
  memberId: z.string().min(1, "Membre requis"),
  amount: z.number().int().positive("Montant invalide"),
  period: z.string().min(4, "Période requise"),
  paymentMethod: z.enum(["cash", "mobile_money"], { message: "Méthode de paiement invalide" }),
  paymentNote: z.string().max(500).optional(),
  dueDate: z.string().optional(),
})

/* POST /api/admin/cotisations — enregistrer manuellement (cash ou mobile money) */
export async function POST(req: NextRequest) {
  const session = await checkAuth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    const data = recordSchema.parse(body)

    const member = await prisma.member.findUnique({
      where: { id: data.memberId },
      include: { user: { select: { email: true } } },
    })
    if (!member) return NextResponse.json({ error: "Membre introuvable" }, { status: 404 })

    const adminId = (session.user as { id?: string })?.id

    if (data.paymentMethod === "cash") {
      /* Enregistrement direct — statut SUCCESS immédiat */
      const cotisation = await prisma.cotisation.create({
        data: {
          memberId: data.memberId,
          amount: data.amount,
          period: data.period,
          status: "SUCCESS",
          paidAt: new Date(),
          dueDate: data.dueDate ? new Date(data.dueDate) : new Date(),
          paymentMethod: "cash",
          paymentNote: data.paymentNote ?? null,
          recordedById: adminId ?? null,
        },
      })

      /* Mettre à jour le statut de cotisation du membre */
      await prisma.member.update({
        where: { id: data.memberId },
        data: { cotisationStatus: "UP_TO_DATE" },
      })

      await prisma.auditLog.create({
        data: {
          action: "COTISATION_RECORDED_CASH",
          module: "cotisations",
          userId: adminId,
          targetId: cotisation.id,
          details: { memberId: data.memberId, amount: data.amount, period: data.period },
        },
      })

      return NextResponse.json({ success: true, cotisation })
    }

    /* Mobile money — créer la cotisation PENDING puis générer lien PayDunya */
    const cotisation = await prisma.cotisation.create({
      data: {
        memberId: data.memberId,
        amount: data.amount,
        period: data.period,
        status: "PENDING",
        dueDate: data.dueDate ? new Date(data.dueDate) : new Date(),
        paymentMethod: "mobile_money",
        paymentNote: data.paymentNote ?? null,
        recordedById: adminId ?? null,
      },
    })

    const invoiceData = await createInvoice({
      amount: data.amount,
      description: `Cotisation IQRA TOGO — ${data.period}`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/admin/cotisations`,
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/admin/cotisations?paid=1`,
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/paydunya/webhook`,
      customData: { cotisationId: cotisation.id, memberId: member.id, type: "COTISATION" },
    })

    if (invoiceData.success && invoiceData.token) {
      await prisma.cotisation.update({
        where: { id: cotisation.id },
        data: { paydunyaRef: invoiceData.token },
      })
      return NextResponse.json({ success: true, cotisation, paymentUrl: invoiceData.invoiceUrl })
    }

    return NextResponse.json({ success: true, cotisation })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Données invalides." }, { status: 400 })
    }
    console.error("[API /admin/cotisations POST]", err)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}
