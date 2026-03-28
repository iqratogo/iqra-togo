/* API Équipe Admin — PATCH (modifier) + DELETE */

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const ALLOWED_ROLES = ["SUPER_ADMIN", "ADMIN"]

const updateSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  position: z.string().min(1).optional(),
  department: z.enum(["DIRECTION", "PROGRAMMES", "COMMUNICATION", "FINANCE"]).optional(),
  bio: z.string().optional().nullable(),
  bioFull: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
  email: z.string().email().optional().or(z.literal("")).nullable(),
  phone: z.string().optional().nullable(),
  facebookUrl: z.string().url().optional().or(z.literal("")).nullable(),
  linkedinUrl: z.string().url().optional().or(z.literal("")).nullable(),
  twitterUrl: z.string().url().optional().or(z.literal("")).nullable(),
  displayOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as { role?: string })?.role ?? ""
  if (!ALLOWED_ROLES.includes(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  const member = await prisma.teamMember.update({ where: { id }, data: parsed.data })
  return NextResponse.json(member)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as { role?: string })?.role ?? ""
  if (!ALLOWED_ROLES.includes(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  await prisma.teamMember.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
