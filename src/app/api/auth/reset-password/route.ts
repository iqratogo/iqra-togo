/* §5.5.1 PRD — Réinitialisation mot de passe */
/* POST : demande de reset (génère token en BDD)         */
/* PATCH : valide token + applique le nouveau mot de passe */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db/prisma"
import { isRateLimited, getClientIp } from "@/lib/rate-limit"
import { isSameOrigin, csrfForbidden } from "@/lib/csrf"
import { passwordSchema } from "@/lib/password-schema"

const requestSchema = z.object({
  email: z.string().email("Adresse email invalide"),
})

const applySchema = z.object({
  token: z.string().min(1, "Token requis"),
  password: passwordSchema,
})

/* POST /api/auth/reset-password — demande de réinitialisation */
export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return csrfForbidden()

  const ip = getClientIp(req)
  if (isRateLimited(ip, "reset-password", 3, 60 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Trop de tentatives. Veuillez patienter 1h." },
      { status: 429 }
    )
  }

  try {
    const body = await req.json()
    const { email } = requestSchema.parse(body)

    /* Toujours répondre OK pour ne pas révéler si l'email existe */
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return NextResponse.json({ success: true })

    /* Supprimer tout token existant pour cet email */
    await prisma.verificationToken.deleteMany({
      where: { identifier: `password_reset:${email}` },
    })

    /* Générer un token opaque — §12.9 crypto sécurisé */
    const tokenBytes = new Uint8Array(32)
    crypto.getRandomValues(tokenBytes)
    const token = Array.from(tokenBytes).map((b) => b.toString(16).padStart(2, "0")).join("")

    /* Expiration 1h */
    const expires = new Date(Date.now() + 60 * 60 * 1000)

    await prisma.verificationToken.create({
      data: {
        identifier: `password_reset:${email}`,
        token,
        expires,
      },
    })

    /* TODO: brancher un service d'email pour envoyer le lien :  */
    /* ${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password/${token} */
    if (process.env.NODE_ENV === "development") {
      console.info(
        `[reset-password] Lien de réinitialisation (dev only) :`,
        `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/auth/reset-password/${token}`
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Données invalides." }, { status: 400 })
    }
    console.error("[API /auth/reset-password POST]", err)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}

/* PATCH /api/auth/reset-password — application du nouveau mot de passe */
export async function PATCH(req: NextRequest) {
  if (!isSameOrigin(req)) return csrfForbidden()

  /* Rate limiting : 5 tentatives par IP par heure (brute-force token) */
  const ip = getClientIp(req)
  if (isRateLimited(ip, "reset-password-apply", 5, 60 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Trop de tentatives. Veuillez patienter 1h." },
      { status: 429 }
    )
  }

  try {
    const body = await req.json()
    const { token, password } = applySchema.parse(body)

    /* Chercher le token en BDD */
    const record = await prisma.verificationToken.findUnique({ where: { token } })

    if (!record || !record.identifier.startsWith("password_reset:")) {
      return NextResponse.json({ error: "Lien invalide ou expiré." }, { status: 400 })
    }

    if (record.expires < new Date()) {
      await prisma.verificationToken.delete({ where: { token } })
      return NextResponse.json({ error: "Lien expiré. Veuillez recommencer." }, { status: 400 })
    }

    const email = record.identifier.replace("password_reset:", "")
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 })

    /* §12.9 — Hash bcrypt salt ≥ 12 */
    const { hash } = await import("bcryptjs")
    const hashedPassword = await hash(password, 12)

    /* Mise à jour et suppression du token (usage unique) */
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      }),
      prisma.verificationToken.delete({ where: { token } }),
      prisma.auditLog.create({
        data: {
          action: "PASSWORD_RESET",
          module: "auth",
          targetId: user.id,
        },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Données invalides." }, { status: 400 })
    }
    console.error("[API /auth/reset-password PATCH]", err)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}
