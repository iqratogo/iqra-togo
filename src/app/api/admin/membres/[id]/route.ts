/* §7.3 API Membres Admin — GET + PATCH (status workflow) */

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const ALLOWED_ROLES = ["SUPER_ADMIN", "ADMIN"]

function generateMemberNumber() {
  /* Bug #13 — Utiliser crypto.getRandomValues, évite les collisions Math.random */
  const arr = new Uint32Array(1)
  crypto.getRandomValues(arr)
  const num = 1000 + (arr[0] % 9000)
  return `AZAE-${String(num).padStart(4, "0")}`
}

const updateSchema = z.object({
  status: z.enum(["PENDING", "ACTIVE", "INACTIVE", "SUSPENDED", "EXPIRED"]).optional(),
  suspendedReason: z.string().optional().nullable(),
  cotisationStatus: z.enum(["UP_TO_DATE", "LATE", "EXEMPTED"]).optional(),
})

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as { role?: string })?.role ?? ""
  if (!ALLOWED_ROLES.includes(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  const member = await prisma.member.findUnique({
    where: { id },
    include: {
      user: { select: { email: true, role: true, createdAt: true } },
      cotisations: { orderBy: { dueDate: "desc" }, take: 5 },
    },
  })
  if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(member)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as { role?: string })?.role ?? ""
  if (!ALLOWED_ROLES.includes(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  const existing = await prisma.member.findUnique({ where: { id }, include: { user: true } })
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const d = parsed.data
  let memberNumber = existing.memberNumber
  let joinedAt = existing.joinedAt

  // Activation workflow: PENDING → ACTIVE
  if (d.status === "ACTIVE" && existing.status === "PENDING") {
    if (!memberNumber || memberNumber.startsWith("APP-")) {
      memberNumber = generateMemberNumber()
      // ensure unique
      const taken = await prisma.member.findFirst({ where: { memberNumber } })
      if (taken) memberNumber = `AZAE-${Date.now()}`
    }
    joinedAt = new Date()
    // Promote user role to MEMBER
    await prisma.user.update({
      where: { id: existing.userId },
      data: { role: "MEMBER", status: "ACTIVE" },
    })
  }

  const updated = await prisma.member.update({
    where: { id },
    data: {
      ...d,
      memberNumber,
      joinedAt,
      suspendedAt: d.status === "SUSPENDED" ? new Date() : existing.suspendedAt,
    },
  })

  await prisma.auditLog.create({
    data: {
      action: `MEMBER_${d.status ?? "UPDATED"}`,
      module: "MEMBRES",
      targetId: id,
      userId: (session.user as { id: string }).id,
    },
  })

  return NextResponse.json(updated)
}
