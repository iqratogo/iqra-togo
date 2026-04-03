/* §5.1.9 API Newsletter — inscription + double opt-in + email Resend */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db/prisma"
import { isSameOrigin, csrfForbidden } from "@/lib/csrf"
import { sendNewsletterConfirmation } from "@/lib/email"

const schema = z.object({
  email: z.string().email("Adresse email invalide"),
})

export async function GET(req: NextRequest) {
  /* Confirmation double opt-in via token */
  const { searchParams } = new URL(req.url)
  const token = searchParams.get("token")

  if (!token || !/^[0-9a-f]{64}$/.test(token)) {
    return NextResponse.json({ error: "Token invalide." }, { status: 400 })
  }

  const subscriber = await prisma.newsletterSubscriber.findFirst({
    where: { confirmToken: token },
  })

  if (!subscriber) {
    return NextResponse.json({ error: "Token invalide ou expiré." }, { status: 404 })
  }

  await prisma.newsletterSubscriber.update({
    where: { id: subscriber.id },
    data: { isConfirmed: true, confirmToken: null, confirmedAt: new Date() },
  })

  return NextResponse.json({ success: true })
}

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return csrfForbidden()

  try {
    const body = await req.json()
    const { email } = schema.parse(body)

    /* Déjà inscrit : on répond OK sans erreur côté client */
    const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ success: true, alreadySubscribed: true })
    }

    /* Générer un token opaque 64 chars hex */
    const tokenBytes = new Uint8Array(32)
    crypto.getRandomValues(tokenBytes)
    const confirmToken = Array.from(tokenBytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")

    /* Création en BDD — statut pending jusqu'à confirmation */
    await prisma.newsletterSubscriber.create({
      data: { email, confirmToken },
    })

    /* Envoi de l'email de confirmation double opt-in */
    await sendNewsletterConfirmation({ email, confirmToken })

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 })
    }
    console.error("[API /newsletter]", err)
    return NextResponse.json(
      { error: "Erreur lors de l'inscription. Réessayez." },
      { status: 500 }
    )
  }
}
