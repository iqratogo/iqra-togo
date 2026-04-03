/* CRM Newsletter Admin — GET liste + POST campagne */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"
import { sendNewsletterCampaign } from "@/lib/email"

const ALLOWED_ROLES = ["SUPER_ADMIN", "ADMIN"]

async function checkAuth() {
  const session = await auth()
  if (!session) return null
  const role = (session.user as { role?: string })?.role ?? ""
  if (!ALLOWED_ROLES.includes(role)) return null
  return session
}

/* GET /api/admin/newsletter — liste paginée des abonnés + stats */
export async function GET(req: NextRequest) {
  if (!(await checkAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"))
  const limit = Math.min(100, parseInt(searchParams.get("limit") ?? "50"))
  const status = searchParams.get("status") // "confirmed" | "pending" | "unsubscribed"
  const q = searchParams.get("q")?.trim()
  const tag = searchParams.get("tag")?.trim()

  const where: Record<string, unknown> = {}
  if (status === "confirmed") { where.isConfirmed = true; where.unsubscribedAt = null }
  if (status === "pending") { where.isConfirmed = false; where.unsubscribedAt = null }
  if (status === "unsubscribed") where.unsubscribedAt = { not: null }
  if (q) where.email = { contains: q, mode: "insensitive" }
  if (tag) where.tags = { has: tag }

  const [subscribers, total, stats] = await Promise.all([
    prisma.newsletterSubscriber.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        email: true,
        isConfirmed: true,
        confirmedAt: true,
        unsubscribedAt: true,
        tags: true,
        createdAt: true,
      },
    }),
    prisma.newsletterSubscriber.count({ where }),
    prisma.newsletterSubscriber.groupBy({
      by: ["isConfirmed"],
      _count: { id: true },
    }),
  ])

  const confirmed = stats.find((s) => s.isConfirmed)?._count.id ?? 0
  const totalAll = await prisma.newsletterSubscriber.count()
  const unsubscribed = await prisma.newsletterSubscriber.count({ where: { unsubscribedAt: { not: null } } })

  return NextResponse.json({
    subscribers,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    stats: {
      total: totalAll,
      confirmed,
      pending: totalAll - confirmed - unsubscribed,
      unsubscribed,
    },
  })
}

/* POST /api/admin/newsletter — envoyer une campagne email */
const campaignSchema = z.object({
  subject: z.string().min(3, "Objet requis (min 3 caractères)"),
  previewText: z.string().optional(),
  htmlContent: z.string().min(10, "Contenu requis (min 10 caractères)"),
  targetAll: z.boolean().default(true),
  testEmail: z.string().email().optional(),
  segment: z.string().optional(), // tag name ou undefined = tous
})

export async function POST(req: NextRequest) {
  const session = await checkAuth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    const data = campaignSchema.parse(body)

    /* Mode test */
    if (!data.targetAll && data.testEmail) {
      await sendNewsletterCampaign({
        emails: [data.testEmail],
        subject: `[TEST] ${data.subject}`,
        htmlContent: data.htmlContent,
        previewText: data.previewText,
      })

      await prisma.newsletterCampaign.create({
        data: {
          subject: data.subject,
          previewText: data.previewText,
          htmlContent: data.htmlContent,
          recipients: 1,
          status: "test",
          segment: data.segment ?? null,
        },
      })

      return NextResponse.json({ success: true, sent: 1, mode: "test" })
    }

    /* Envoi réel — abonnés confirmés non désabonnés, filtrés par segment si précisé */
    const where: Record<string, unknown> = { isConfirmed: true, unsubscribedAt: null }
    if (data.segment) where.tags = { has: data.segment }

    const subscribers = await prisma.newsletterSubscriber.findMany({
      where,
      select: { email: true },
    })

    if (subscribers.length === 0) {
      return NextResponse.json({ error: "Aucun abonné confirmé dans ce segment." }, { status: 400 })
    }

    const emails = subscribers.map((s) => s.email)
    const result = await sendNewsletterCampaign({
      emails,
      subject: data.subject,
      htmlContent: data.htmlContent,
      previewText: data.previewText,
    })

    await Promise.all([
      prisma.newsletterCampaign.create({
        data: {
          subject: data.subject,
          previewText: data.previewText,
          htmlContent: data.htmlContent,
          recipients: emails.length,
          status: "sent",
          segment: data.segment ?? null,
        },
      }),
      prisma.auditLog.create({
        data: {
          action: "NEWSLETTER_CAMPAIGN_SENT",
          module: "newsletter",
          userId: (session.user as { id?: string })?.id,
          details: { subject: data.subject, recipients: emails.length, segment: data.segment ?? "all" },
        },
      }),
    ])

    return NextResponse.json({ success: true, sent: result.sent })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Données invalides." }, { status: 400 })
    }
    console.error("[API /admin/newsletter POST]", err)
    return NextResponse.json({ error: "Erreur lors de l'envoi." }, { status: 500 })
  }
}
