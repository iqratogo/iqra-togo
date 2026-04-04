/* POST /api/newsletter/unsubscribe — désabonnement public */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db/prisma"

const schema = z.object({
  id: z.string().cuid("Identifiant invalide"),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { id } = schema.parse(body)

    const subscriber = await prisma.newsletterSubscriber.findUnique({ where: { id } })
    if (!subscriber) {
      return NextResponse.json({ error: "Abonné introuvable." }, { status: 404 })
    }

    if (subscriber.unsubscribedAt) {
      return NextResponse.json({ success: true, alreadyUnsubscribed: true })
    }

    await prisma.newsletterSubscriber.update({
      where: { id },
      data: { unsubscribedAt: new Date() },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Lien invalide." }, { status: 400 })
    }
    console.error("[API /newsletter/unsubscribe]", err)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}
