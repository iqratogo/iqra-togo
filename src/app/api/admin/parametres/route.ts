/* §7.7 API Paramètres Admin — GET + PATCH */

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"
import { NextRequest, NextResponse } from "next/server"

const ALLOWED_ROLES = ["SUPER_ADMIN", "ADMIN"]

/* Bug #18/#40 — Whitelist des clés de paramètres autorisées */
const ALLOWED_SETTING_KEYS = new Set([
  "site_name",
  "site_description",
  "contact_email",
  "contact_phone",
  "contact_address",
  "social_facebook",
  "social_instagram",
  "social_twitter",
  "social_youtube",
  "social_whatsapp",
  "don_objectif_annuel",
  "don_message_merci",
  "cotisation_montant",
  "cotisation_date_limite",
  "maintenance_mode",
  "registration_open",
])

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as { role?: string })?.role ?? ""
  if (!ALLOWED_ROLES.includes(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const settings = await prisma.setting.findMany({ orderBy: { key: "asc" } })
  const map: Record<string, string> = {}
  for (const s of settings) map[s.key] = s.value
  return NextResponse.json(map)
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as { role?: string })?.role ?? ""
  if (!["SUPER_ADMIN"].includes(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body: Record<string, string> = await req.json()

  /* Bug #18/#40 — Rejeter les clés non autorisées */
  const invalidKeys = Object.keys(body).filter((k) => !ALLOWED_SETTING_KEYS.has(k))
  if (invalidKeys.length > 0) {
    return NextResponse.json(
      { error: `Clés non autorisées : ${invalidKeys.join(", ")}` },
      { status: 400 }
    )
  }

  await Promise.all(
    Object.entries(body).map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
    )
  )

  await prisma.auditLog.create({
    data: {
      action: "SETTINGS_UPDATED",
      module: "PARAMETRES",
      userId: (session.user as { id: string }).id,
    },
  })

  return NextResponse.json({ success: true })
}
