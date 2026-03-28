/* §8 + §7.4 API Cotisations Membre */

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"
import { NextRequest, NextResponse } from "next/server"
import { createInvoice } from "@/lib/paydunya"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = (session.user as { id: string }).id
  const member = await prisma.member.findUnique({
    where: { userId },
    include: { cotisations: { orderBy: { dueDate: "desc" } } },
  })
  if (!member) return NextResponse.json({ error: "Membre introuvable" }, { status: 404 })

  return NextResponse.json({ cotisations: member.cotisations, cotisationStatus: member.cotisationStatus })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = (session.user as { id: string }).id
  const { cotisationId } = await req.json()

  const member = await prisma.member.findUnique({
    where: { userId },
    include: { user: { select: { email: true, name: true } } },
  })
  if (!member) return NextResponse.json({ error: "Membre introuvable" }, { status: 404 })

  const cotisation = await prisma.cotisation.findFirst({
    where: { id: cotisationId, memberId: member.id },
  })
  if (!cotisation) return NextResponse.json({ error: "Cotisation introuvable" }, { status: 404 })
  if (cotisation.status === "SUCCESS") return NextResponse.json({ error: "Cotisation déjà payée" }, { status: 400 })

  const invoiceData = await createInvoice({
    amount: cotisation.amount,
    description: `Cotisation Azaetogo — ${cotisation.period}`,
    cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/membre/cotisations`,
    returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/membre/cotisations?paid=1`,
    callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/paydunya/webhook`,
    customData: { cotisationId: cotisation.id, memberId: member.id, type: "COTISATION" },
  })

  if (!invoiceData.success || !invoiceData.token) {
    return NextResponse.json({ error: invoiceData.error ?? "Erreur PayDunya" }, { status: 500 })
  }

  await prisma.cotisation.update({
    where: { id: cotisation.id },
    data: { paydunyaRef: invoiceData.token },
  })

  return NextResponse.json({ paymentUrl: invoiceData.invoiceUrl })
}
