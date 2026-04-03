/* GET /api/admin/newsletter/campaigns — historique des campagnes */

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"

const ALLOWED_ROLES = ["SUPER_ADMIN", "ADMIN"]

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as { role?: string })?.role ?? ""
  if (!ALLOWED_ROLES.includes(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const campaigns = await prisma.newsletterCampaign.findMany({
    orderBy: { sentAt: "desc" },
    take: 100,
    select: {
      id: true,
      subject: true,
      previewText: true,
      recipients: true,
      status: true,
      segment: true,
      sentAt: true,
    },
  })

  return NextResponse.json({ campaigns })
}
