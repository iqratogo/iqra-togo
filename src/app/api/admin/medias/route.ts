/* §7.2.4 API Médiathèque Admin — LIST + CREATE */

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const ALLOWED_ROLES = ["SUPER_ADMIN", "ADMIN", "EDITOR"]

const createSchema = z.object({
  name: z.string().min(1, "Le titre est requis"),
  type: z.enum(["IMAGE", "VIDEO", "DOCUMENT"]),
  url: z.string().url("URL invalide"),
  alt: z.string().optional().nullable(),
  size: z.number().optional().nullable(),
  mimeType: z.string().optional().nullable(),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as { role?: string })?.role ?? ""
  if (!ALLOWED_ROLES.includes(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"))
  const limit = 24
  const type = searchParams.get("type") ?? undefined
  const search = searchParams.get("search") ?? undefined

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    ...(type ? { type } : {}),
    ...(search ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { alt: { contains: search, mode: "insensitive" } }] } : {}),
  }

  const [medias, total] = await Promise.all([
    prisma.media.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit }),
    prisma.media.count({ where }),
  ])

  return NextResponse.json({ medias, total, pages: Math.ceil(total / limit), page })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as { role?: string })?.role ?? ""
  if (!ALLOWED_ROLES.includes(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  const media = await prisma.media.create({
    data: {
      ...parsed.data,
      uploadedById: (session.user as { id: string }).id,
    },
  })

  return NextResponse.json(media, { status: 201 })
}
