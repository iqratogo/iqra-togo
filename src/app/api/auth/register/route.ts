/* §5.5.2 Inscription — POST /api/auth/register */
/* Crée l'utilisateur + la demande d'adhésion */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db/prisma"
import { isRateLimited, getClientIp } from "@/lib/rate-limit"
import { isSameOrigin, csrfForbidden } from "@/lib/csrf"
import { passwordSchema } from "@/lib/password-schema"
import { sendWelcomeEmail, sendNewApplicationAdmin } from "@/lib/email"

const schema = z.object({
  civility: z.enum(["M", "MME", "DR", "PR"]).optional(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  password: passwordSchema,
  phone: z.string().min(8),
  dateOfBirth: z.string().optional(),
  nationality: z.string().optional(),
  country: z.string().default("Togo"),
  city: z.string().optional(),
  neighborhood: z.string().optional(),
  postalBox: z.string().optional(),
  profession: z.string().optional(),
  employer: z.string().optional(),
  motivation: z.string().optional(),
  rgpdConsent: z.boolean().refine((v) => v, "Consentement RGPD requis"),
  rulesAccepted: z.boolean().refine((v) => v, "Acceptation du règlement requise"),
})

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return csrfForbidden()

  /* Bug #10 — Rate limiting : 5 inscriptions par IP par heure */
  const ip = getClientIp(req)
  if (isRateLimited(ip, "register", 5, 60 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Trop de tentatives. Veuillez patienter avant de réessayer." },
      { status: 429 }
    )
  }

  try {
    const body = await req.json()
    const data = schema.parse(body)

    /* Vérification email unique */
    const existing = await prisma.user.findUnique({ where: { email: data.email } })
    if (existing) {
      return NextResponse.json(
        { error: "Un compte avec cet email existe déjà." },
        { status: 409 }
      )
    }

    /* §12.9 — Hash bcrypt salt ≥ 12 */
    const { hash } = await import("bcryptjs")
    const hashedPassword = await hash(data.password, 12)

    /* Numéro de dossier DOSSIER-XXXX §7.3.3 */
    const count = await prisma.membershipApplication.count()
    const dossierNumber = `DOSSIER-${String(count + 1).padStart(4, "0")}`

    /* Création user + demande d'adhésion dans une transaction */
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          password: hashedPassword,
          role: "VISITOR",
          status: "PENDING",
        },
      })

      const application = await tx.membershipApplication.create({
        data: {
          userId: user.id,
          dossierNumber,
          civility: data.civility,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
          nationality: data.nationality,
          country: data.country,
          city: data.city,
          neighborhood: data.neighborhood,
          postalBox: data.postalBox,
          profession: data.profession,
          employer: data.employer,
          motivation: data.motivation,
          rgpdConsent: data.rgpdConsent,
          rulesAccepted: data.rulesAccepted,
          status: "pending",
        },
      })

      /* S13 — Audit log création de compte */
      await tx.auditLog.create({
        data: {
          action: "USER_REGISTER",
          module: "auth",
          targetId: user.id,
          details: { email: user.email, dossierNumber },
        },
      })

      return { user, application }
    })

    /* Notifications email (silencieuses — ne bloquent pas la réponse) */
    const { user, application } = result
    Promise.all([
      sendWelcomeEmail({ email: user.email!, firstName: data.firstName, dossierNumber }),
      sendNewApplicationAdmin({ firstName: data.firstName, lastName: data.lastName, email: user.email!, dossierNumber }),
    ]).catch((err) => console.error("[register] Email send failed:", err))

    return NextResponse.json(
      { success: true, dossierNumber },
      { status: 201 }
    )
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0]?.message ?? "Données invalides." },
        { status: 400 }
      )
    }
    console.error("[API /auth/register]", err instanceof Error ? err.message : err)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}
