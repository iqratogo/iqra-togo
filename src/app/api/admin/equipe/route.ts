/* API Équipe Admin — GET (liste) + POST (créer) */

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const ALLOWED_ROLES = ["SUPER_ADMIN", "ADMIN"]

const memberSchema = z.object({
  firstName: z.string().min(1, "Prénom requis"),
  lastName: z.string().min(1, "Nom requis"),
  position: z.string().min(1, "Poste requis"),
  department: z.enum(["DIRECTION", "PROGRAMMES", "COMMUNICATION", "FINANCE"]),
  bio: z.string().optional().nullable(),
  bioFull: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
  email: z.string().email("Email invalide").optional().or(z.literal("")).nullable(),
  phone: z.string().optional().nullable(),
  facebookUrl: z.string().url("URL invalide").optional().or(z.literal("")).nullable(),
  linkedinUrl: z.string().url("URL invalide").optional().or(z.literal("")).nullable(),
  twitterUrl: z.string().url("URL invalide").optional().or(z.literal("")).nullable(),
  displayOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as { role?: string })?.role ?? ""
  if (!ALLOWED_ROLES.includes(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const search = searchParams.get("search") ?? undefined
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"))
  const limit = 20

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = search
    ? {
        OR: [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { position: { contains: search, mode: "insensitive" } },
        ],
      }
    : {}

  const [members, total] = await Promise.all([
    prisma.teamMember.findMany({
      where,
      orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.teamMember.count({ where }),
  ])

  return NextResponse.json({ members, total, pages: Math.ceil(total / limit), page })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as { role?: string })?.role ?? ""
  if (!ALLOWED_ROLES.includes(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = await req.json()
  const parsed = memberSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  const member = await prisma.teamMember.create({ data: parsed.data })

  return NextResponse.json(member, { status: 201 })
}
