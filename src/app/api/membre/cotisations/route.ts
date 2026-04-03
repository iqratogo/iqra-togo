/* §8 + §7.4 API Cotisations Membre */

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createInvoice } from "@/lib/paydunya"
import { isRateLimited, getClientIp } from "@/lib/rate-limit"
import { isSameOrigin, csrfForbidden } from "@/lib/csrf"

const schema = z.object({
  cotisationId: z.string().cuid("ID de cotisation invalide"),
})

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = (session.user as { id: string }).id
  const member = await prisma.member.findUnique({
    where: { userId },
    include: { cotisations: { orderBy: { dueDate: "desc" } } },
  })
  if (!member) return NextResponse.json({ error: "Membre introuvable" }, { status: 404 })

  return NextResponse.json({
    cotisations: member.cotisations,
    cotisationStatus: member.cotisationStatus,
  })
}

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return csrfForbidden()

  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  /* Rate limiting : 5 tentatives / 10 min par IP */
  const ip = getClientIp(req)
  if (isRateLimited(ip, "cotisation-pay", 5, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Trop de tentatives. Veuillez patienter quelques minutes." },
      { status: 429 }
    )
  }

  try {
    const body = await req.json()
    const { cotisationId } = schema.parse(body)

    const userId = (session.user as { id: string }).id
    const member = await prisma.member.findUnique({
      where: { userId },
      include: { user: { select: { email: true, name: true } } },
    })
    if (!member) return NextResponse.json({ error: "Membre introuvable" }, { status: 404 })

    const cotisation = await prisma.cotisation.findFirst({
      where: { id: cotisationId, memberId: member.id },
    })
    if (!cotisation) return NextResponse.json({ error: "Cotisation introuvable" }, { status: 404 })
    if (cotisation.status === "SUCCESS") {
      return NextResponse.json({ error: "Cotisation déjà payée" }, { status: 400 })
    }
    /* Bloquer une cotisation PENDING qui a déjà un token PayDunya actif */
    if (cotisation.status === "PENDING" && cotisation.paydunyaRef) {
      return NextResponse.json({ error: "Un paiement est déjà en cours pour cette cotisation" }, { status: 409 })
    }

    const invoiceData = await createInvoice({
      amount: cotisation.amount,
      description: `Cotisation IQRA TOGO — ${cotisation.period}`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/membre/cotisations`,
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/membre/cotisations?paid=1`,
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/paydunya/webhook`,
      customData: { cotisationId: cotisation.id, memberId: member.id, type: "COTISATION" },
    })

    if (!invoiceData.success || !invoiceData.token) {
      return NextResponse.json({ error: invoiceData.error ?? "Erreur PayDunya" }, { status: 502 })
    }

    await prisma.cotisation.update({
      where: { id: cotisation.id },
      data: { paydunyaRef: invoiceData.token, status: "PENDING" },
    })

    return NextResponse.json({ paymentUrl: invoiceData.invoiceUrl })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Données invalides." }, { status: 400 })
    }
    console.error("[API /membre/cotisations POST]", err)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}
