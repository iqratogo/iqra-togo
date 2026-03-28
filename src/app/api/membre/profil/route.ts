/* §8 API Profil Membre — GET + PATCH */

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const schema = z.object({
  /* Bug #14 — Contraintes de longueur et format sur chaque champ */
  phone: z.string().min(8).max(20).regex(/^[+\d\s()-]+$/, "Format téléphone invalide").optional(),
  country: z.string().min(2).max(100).optional(),
  city: z.string().min(2).max(100).optional(),
  neighborhood: z.string().max(200).optional(),
  profession: z.string().max(200).optional(),
  employer: z.string().max(200).optional(),
})

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = (session.user as { id: string }).id
  const member = await prisma.member.findUnique({
    where: { userId },
    include: { cotisations: { orderBy: { dueDate: "desc" }, take: 1 } },
  })
  if (!member) return NextResponse.json({ error: "Membre introuvable" }, { status: 404 })

  return NextResponse.json(member)
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = (session.user as { id: string }).id
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  const member = await prisma.member.findUnique({ where: { userId } })
  if (!member) return NextResponse.json({ error: "Membre introuvable" }, { status: 404 })

  const updated = await prisma.member.update({
    where: { userId },
    data: parsed.data,
  })

  return NextResponse.json(updated)
}
