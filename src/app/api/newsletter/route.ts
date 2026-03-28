/* §5.1.9 API Newsletter — inscription + double opt-in */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db/prisma"
import { isSameOrigin, csrfForbidden } from "@/lib/csrf"

const schema = z.object({
  email: z.string().email("Adresse email invalide"),
})

export async function GET(req: NextRequest) {
  /* Confirmation double opt-in via token */
  const { searchParams } = new URL(req.url)
  const token = searchParams.get("token")

  /* S12 — Valider le format : token hex 64 chars généré par crypto.getRandomValues */
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

    /* Vérification doublon */
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    })

    if (existing) {
      /* Déjà inscrit : on répond OK sans erreur côté client */
      return NextResponse.json({ success: true, alreadySubscribed: true })
    }

    /* Bug #19 — Générer un token opaque au lieu d'utiliser l'email en clair */
    const tokenBytes = new Uint8Array(32)
    crypto.getRandomValues(tokenBytes)
    const confirmToken = Array.from(tokenBytes).map((b) => b.toString(16).padStart(2, "0")).join("")

    /* Création en BDD — statut pending jusqu'à confirmation */
    await prisma.newsletterSubscriber.create({
      data: { email, confirmToken },
    })

    /* TODO: brancher un service d'email (ex: nodemailer, Brevo, Mailgun)      */
    /* pour envoyer le lien de confirmation double opt-in :                     */
    /* ${process.env.NEXT_PUBLIC_APP_URL}/newsletter/confirmer?token=${confirmToken} */

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
