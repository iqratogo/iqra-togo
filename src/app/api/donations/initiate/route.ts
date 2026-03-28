/* §9.2 Flux paiement don — POST /api/donations/initiate */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db/prisma"
import { createInvoice } from "@/lib/paydunya"
import { isSameOrigin, csrfForbidden } from "@/lib/csrf"

const schema = z.object({
  amount: z.number().int().min(500, "Montant minimum : 500 FCFA"),
  affectation: z
    .enum(["GENERAL", "BOURSES_EDUCATION", "SOUTIEN_FAMILLES", "PROJETS_TERRAIN"])
    .default("GENERAL"),
  anonymous: z.boolean().default(false),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
})

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return csrfForbidden()

  try {
    const body = await req.json()
    const data = schema.parse(body)

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

    /* 1. Créer l'enregistrement en BDD avec statut PENDING §9.2 */
    const donation = await prisma.donation.create({
      data: {
        amount: data.amount,
        affectation: data.affectation,
        isAnonymous: data.anonymous,
        donorFirstName: data.anonymous ? null : (data.firstName ?? null),
        donorLastName: data.anonymous ? null : (data.lastName ?? null),
        donorEmail: data.anonymous ? null : (data.email || null),
        status: "PENDING",
      },
    })

    /* 2. Créer la facture PayDunya §9.2 */
    const AFFECTATION_LABELS: Record<string, string> = {
      GENERAL: "Fonds général",
      BOURSES_EDUCATION: "Bourses éducation",
      SOUTIEN_FAMILLES: "Soutien familles",
      PROJETS_TERRAIN: "Projets terrain",
    }

    const result = await createInvoice({
      amount: data.amount,
      description: `Don Azaetogo — ${AFFECTATION_LABELS[data.affectation] ?? "Général"}`,
      returnUrl: `${appUrl}/dons/merci?ref=${donation.id}`,
      cancelUrl: `${appUrl}/dons/echec?ref=${donation.id}`,
      callbackUrl: `${appUrl}/api/paydunya/webhook`,
      customData: {
        donation_id: donation.id,
        affectation: data.affectation,
        donor_email: data.email || "",
      },
    })

    if (!result.success || !result.invoiceUrl) {
      /* Marquer la donation comme échouée */
      await prisma.donation.update({
        where: { id: donation.id },
        data: { status: "FAILED" },
      })
      /* Clé PayDunya non configurée → message explicite en dev */
      const paydunyaKey = process.env.PAYDUNYA_MASTER_KEY
      const notConfigured = !paydunyaKey || paydunyaKey.startsWith("your-")
      const errorMsg = notConfigured
        ? "Paiement en ligne non configuré pour le moment. Contactez-nous directement."
        : (result.error ?? "Impossible d'initier le paiement.")
      return NextResponse.json({ error: errorMsg }, { status: 502 })
    }

    /* 3. Stocker le token PayDunya §9.2 */
    await prisma.donation.update({
      where: { id: donation.id },
      data: {
        paydunyaToken: result.token,
        paymentUrl: result.invoiceUrl,
      },
    })

    return NextResponse.json({ paymentUrl: result.invoiceUrl, donationId: donation.id })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0]?.message ?? "Données invalides." },
        { status: 400 }
      )
    }
    console.error("[API /donations/initiate]", err)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
}
