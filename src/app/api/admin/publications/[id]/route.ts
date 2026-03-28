/* §7.2 API Publications Admin — GET + PATCH + DELETE par ID */

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import type { Session } from "next-auth"

const ALLOWED_ROLES = ["SUPER_ADMIN", "ADMIN", "EDITOR"]

const updateSchema = z.object({
  title: z.string().min(3).optional(),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  category: z.enum(["ACTUALITE", "PROJET", "COMMUNIQUE", "PARTENAIRE"]).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  featuredImage: z.string().url().optional().or(z.literal("")).nullable(),
  pdfUrl: z.string().url().optional().or(z.literal("")).nullable(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  ogImage: z.string().optional().nullable(),
  scheduledAt: z.string().datetime().optional().nullable(),
})

function checkAuth(session: Session | null): boolean {
  if (!session) return false
  const role = (session.user as { role?: string })?.role ?? ""
  return ALLOWED_ROLES.includes(role)
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!checkAuth(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const post = await prisma.post.findUnique({
    where: { id },
    include: { author: { select: { name: true, email: true } } },
  })
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(post)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!checkAuth(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  const d = parsed.data
  const existing = await prisma.post.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const updated = await prisma.post.update({
    where: { id },
    data: {
      ...d,
      publishedAt:
        d.status === "PUBLISHED" && existing.status !== "PUBLISHED"
          ? new Date()
          : existing.publishedAt,
    },
  })

  await prisma.auditLog.create({
    data: {
      action: "POST_UPDATED",
      module: "PUBLICATIONS",
      targetId: id,
      userId: (session!.user as { id: string }).id,
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!checkAuth(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const role = (session!.user as { role?: string })?.role ?? ""
  if (!["SUPER_ADMIN", "ADMIN"].includes(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  await prisma.post.delete({ where: { id } })

  await prisma.auditLog.create({
    data: {
      action: "POST_DELETED",
      module: "PUBLICATIONS",
      targetId: id,
      userId: (session!.user as { id: string }).id,
    },
  })

  return NextResponse.json({ success: true })
}
