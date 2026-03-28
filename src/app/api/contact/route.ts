/* §5.8 API Contact — validation + rate limiting */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { isRateLimited, getClientIp } from "@/lib/rate-limit"
import { isSameOrigin, csrfForbidden } from "@/lib/csrf"

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(1),
  message: z.string().min(10),
})

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return csrfForbidden()

  /* Bug #11 — Rate limiting : 3 messages par IP par 10 minutes */
  const ip = getClientIp(req)
  if (isRateLimited(ip, "contact", 3, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Trop de messages envoyés. Veuillez patienter quelques minutes." },
      { status: 429 }
    )
  }

  try {
    const body = await req.json()
    const data = schema.parse(body)

    /* TODO: brancher un service d'email (ex: nodemailer, Brevo, Mailgun) */
    /* pour envoyer la notification admin et l'accusé de réception          */
    console.info("[Contact]", {
      from: data.email,
      name: data.name,
      subject: data.subject,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Données invalides." }, { status: 400 })
    }
    console.error("[API /contact]", err)
    return NextResponse.json(
      { error: "Erreur lors de l'envoi. Veuillez réessayer." },
      { status: 500 }
    )
  }
}
