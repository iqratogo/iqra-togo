/* §7.3.4 API Applications — PATCH (approve/reject) */

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { sendApplicationApproved, sendApplicationRejected } from "@/lib/email"
import { logAudit, getRequestContext } from "@/lib/audit"

const ALLOWED_ROLES = ["SUPER_ADMIN", "ADMIN"]

const schema = z.object({
  action: z.enum(["approve", "reject"]),
  reason: z.string().optional(),
})

function generateMemberNumber() {
  /* Bug #13 — crypto.getRandomValues pour éviter les collisions Math.random */
  const arr = new Uint32Array(1)
  crypto.getRandomValues(arr)
  const num = 1000 + (arr[0] % 9000)
  return `IQRA-${String(num).padStart(4, "0")}`
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as { role?: string })?.role ?? ""
  if (!ALLOWED_ROLES.includes(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  const application = await prisma.membershipApplication.findUnique({
    where: { id },
    include: { user: true },
  })
  if (!application) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const { action } = parsed.data

  if (action === "approve") {
    let memberNumber = generateMemberNumber()
    const taken = await prisma.member.findFirst({ where: { memberNumber } })
    if (taken) memberNumber = `AZAE-${Date.now()}`

    await prisma.$transaction(async (tx) => {
      await tx.membershipApplication.update({
        where: { id },
        data: { status: "approved" },
      })

      const existingMember = await tx.member.findUnique({ where: { userId: application.userId } })
      if (existingMember) {
        await tx.member.update({
          where: { userId: application.userId },
          data: { status: "ACTIVE", memberNumber, joinedAt: new Date() },
        })
      } else {
        await tx.member.create({
          data: {
            userId: application.userId,
            memberNumber,
            civility: application.civility ?? undefined,
            firstName: application.firstName,
            lastName: application.lastName,
            dateOfBirth: application.dateOfBirth ?? undefined,
            nationality: application.nationality ?? undefined,
            phone: application.phone ?? undefined,
            country: application.country ?? "Togo",
            city: application.city ?? undefined,
            neighborhood: application.neighborhood ?? undefined,
            postalBox: application.postalBox ?? undefined,
            profession: application.profession ?? undefined,
            employer: application.employer ?? undefined,
            motivation: application.motivation ?? undefined,
            photoUrl: application.photoUrl ?? undefined,
            status: "ACTIVE",
            joinedAt: new Date(),
          },
        })
      }

      await tx.user.update({
        where: { id: application.userId },
        data: { role: "MEMBER", status: "ACTIVE" },
      })
    })

    await logAudit({
      action: "APPLICATION_APPROVED",
      module: "MEMBRES",
      targetId: id,
      userId: (session.user as { id: string }).id,
      details: {
        memberName: `${application.firstName} ${application.lastName}`,
        dossierNumber: memberNumber,
        email: application.user.email!,
        decidedAt: new Date().toISOString(),
      },
      ...getRequestContext(req),
    })

    sendApplicationApproved({
      email: application.user.email!,
      firstName: application.firstName,
      memberNumber,
    }).catch((err) => console.error("[applications] Email approbation:", err))

    return NextResponse.json({ success: true, action: "approved" })
  }

  // Reject
  await prisma.$transaction(async (tx) => {
    await tx.membershipApplication.update({
      where: { id },
      data: { status: "rejected" },
    })
  })

  await logAudit({
    action: "APPLICATION_REJECTED",
    module: "MEMBRES",
    targetId: id,
    userId: (session.user as { id: string }).id,
    details: {
      memberName: `${application.firstName} ${application.lastName}`,
      dossierNumber: id,
      email: application.user.email!,
      decidedAt: new Date().toISOString(),
    },
    ...getRequestContext(req),
  })

  sendApplicationRejected({
    email: application.user.email!,
    firstName: application.firstName,
    reason: parsed.data.reason,
  }).catch((err) => console.error("[applications] Email refus:", err))

  return NextResponse.json({ success: true, action: "rejected" })
}
