/* DELETE/PATCH/PUT /api/admin/newsletter/[id] — gestion abonné */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"

const ALLOWED_ROLES = ["SUPER_ADMIN", "ADMIN"]

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as { role?: string })?.role ?? ""
  if (!ALLOWED_ROLES.includes(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params

  try {
    await prisma.newsletterSubscriber.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Abonné introuvable." }, { status: 404 })
  }
}

/* PUT /api/admin/newsletter/[id] — mettre à jour les tags */
const tagsSchema = z.object({ tags: z.array(z.string().min(1).max(30)).max(10) })

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as { role?: string })?.role ?? ""
  if (!ALLOWED_ROLES.includes(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  const body = await req.json()
  const parsed = tagsSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Tags invalides." }, { status: 400 })

  try {
    const updated = await prisma.newsletterSubscriber.update({
      where: { id },
      data: { tags: parsed.data.tags },
      select: { id: true, tags: true },
    })
    return NextResponse.json({ success: true, tags: updated.tags })
  } catch {
    return NextResponse.json({ error: "Abonné introuvable." }, { status: 404 })
  }
}

/* PATCH /api/admin/newsletter/[id] — désabonner (soft delete) */
export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as { role?: string })?.role ?? ""
  if (!ALLOWED_ROLES.includes(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params

  try {
    await prisma.newsletterSubscriber.update({
      where: { id },
      data: { unsubscribedAt: new Date() },
    })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Abonné introuvable." }, { status: 404 })
  }
}
