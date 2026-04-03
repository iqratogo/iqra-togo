/* §9.2 + §9.4 Webhook PayDunya — POST /api/paydunya/webhook */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db/prisma"
import { verifyWebhookSignature, getInvoiceStatus } from "@/lib/paydunya"
import { sendDonationThankYou } from "@/lib/email"

/* Schéma Zod strict du payload PayDunya */
const webhookSchema = z.object({
  data: z
    .object({
      bill: z
        .object({
          token: z.string().min(1).optional(),
          payment_method: z.string().optional(),
          total_amount: z.number().optional(),
          description: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
  token: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get("x-paydunya-signature") ?? ""

    /* §9.4 — Vérification signature HMAC — bloque si secret non configuré */
    if (!process.env.PAYDUNYA_WEBHOOK_SECRET) {
      console.error("[PayDunya webhook] PAYDUNYA_WEBHOOK_SECRET non configuré — webhook rejeté")
      return NextResponse.json({ error: "Configuration serveur incomplète" }, { status: 500 })
    }
    const isValid = await verifyWebhookSignature(rawBody, signature)
    if (!isValid) {
      console.warn("[PayDunya webhook] Signature invalide")
      return NextResponse.json({ error: "Signature invalide" }, { status: 401 })
    }

    /* Bug #33 — Valider la structure du payload avant utilisation */
    let rawParsed: unknown
    try {
      rawParsed = JSON.parse(rawBody)
    } catch {
      return NextResponse.json({ error: "Payload JSON invalide" }, { status: 400 })
    }

    const parsed = webhookSchema.safeParse(rawParsed)
    if (!parsed.success) {
      console.warn("[PayDunya webhook] Payload invalide:", parsed.error.issues)
      return NextResponse.json({ error: "Payload invalide" }, { status: 400 })
    }

    const payload = parsed.data
    const bill = payload.data?.bill
    const token = bill?.token ?? payload.token

    if (!token) {
      return NextResponse.json({ error: "Token manquant ou invalide" }, { status: 400 })
    }

    /* §9.4 — Idempotence : vérifier si déjà traité */
    const existingPayment = await prisma.payment.findUnique({
      where: { paydunyaRef: token },
    })
    if (existingPayment) {
      return NextResponse.json({ message: "Déjà traité" })
    }

    /* Récupérer le statut depuis l'API PayDunya */
    const invoiceStatus = await getInvoiceStatus(token)

    /* Trouver la donation via le token */
    const donation = await prisma.donation.findFirst({
      where: { paydunyaToken: token },
    })

    if (!donation) {
      console.error("[PayDunya webhook] Donation introuvable pour token:", token)
      return NextResponse.json({ error: "Donation introuvable" }, { status: 404 })
    }

    const newStatus =
      invoiceStatus.status === "completed"
        ? "SUCCESS"
        : invoiceStatus.status === "cancelled"
        ? "CANCELLED"
        : "FAILED"

    /* §9.2 + §9.4 — Mise à jour BDD dans une transaction */
    await prisma.$transaction([
      prisma.donation.update({
        where: { id: donation.id },
        data: {
          status: newStatus,
          paydunyaRef: token,
        },
      }),
      prisma.payment.create({
        data: {
          type: "DON",
          amount: donation.amount,
          status: newStatus,
          paydunyaRef: token,
          paymentMethod: bill?.payment_method ?? null,
          webhookPayload: payload as import("@prisma/client").Prisma.InputJsonValue,
          donationId: donation.id,
          processedAt: newStatus === "SUCCESS" ? new Date() : null,
        },
      }),
      prisma.auditLog.create({
        data: {
          action: "PAYDUNYA_WEBHOOK",
          module: "donations",
          targetId: donation.id,
          details: { token, status: newStatus, amount: donation.amount },
        },
      }),
    ])

    /* Email de remerciement au donateur (si succès + non anonyme + email fourni) */
    if (newStatus === "SUCCESS" && !donation.isAnonymous && donation.donorEmail) {
      const AFFECTATION_LABELS: Record<string, string> = {
        GENERAL: "Fonds général",
        BOURSES_EDUCATION: "Bourses éducation",
        SOUTIEN_FAMILLES: "Soutien familles",
        PROJETS_TERRAIN: "Projets terrain",
      }
      sendDonationThankYou({
        email: donation.donorEmail,
        firstName: donation.donorFirstName ?? "Donateur",
        amount: donation.amount,
        affectation: AFFECTATION_LABELS[donation.affectation] ?? donation.affectation,
      }).catch((err) => console.error("[webhook] Email remerciement:", err))
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[PayDunya webhook]", err)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
