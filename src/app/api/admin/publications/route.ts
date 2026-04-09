/* §7.2 API Publications Admin — LIST + CREATE */

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { logAudit, getRequestContext } from "@/lib/audit"

const ALLOWED_ROLES = ["SUPER_ADMIN", "ADMIN", "EDITOR"]

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

const createSchema = z.object({
  title: z.string().min(3),
  excerpt: z.string().optional(),
  content: z.string().default(""),
  category: z.enum(["ACTUALITE", "PROJET", "COMMUNIQUE", "PARTENAIRE"]).default("ACTUALITE"),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  featuredImage: z.string().url().optional().or(z.literal("")),
  pdfUrl: z.string().url().optional().or(z.literal("")),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  scheduledAt: z.string().datetime().optional(),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as { role?: string })?.role ?? ""
  if (!ALLOWED_ROLES.includes(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"))
  const limit = 20
  const category = searchParams.get("category") ?? undefined
  const status = searchParams.get("status") ?? undefined
  const search = searchParams.get("search") ?? undefined

  const where = {
    ...(category ? { category: category as "ACTUALITE" | "PROJET" | "COMMUNIQUE" | "PARTENAIRE" } : {}),
    ...(status ? { status: status as "DRAFT" | "PUBLISHED" | "ARCHIVED" } : {}),
    ...(search ? { OR: [{ title: { contains: search, mode: "insensitive" as const } }, { excerpt: { contains: search, mode: "insensitive" as const } }] } : {}),
  }

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true, title: true, slug: true, category: true, status: true,
        featuredImage: true, publishedAt: true, createdAt: true, updatedAt: true,
        author: { select: { name: true } },
      },
    }),
    prisma.post.count({ where }),
  ])

  return NextResponse.json({ posts, total, pages: Math.ceil(total / limit), page })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as { role?: string })?.role ?? ""
  if (!ALLOWED_ROLES.includes(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  const d = parsed.data
  let slug = slugify(d.title)

  // ensure unique slug
  const existing = await prisma.post.findUnique({ where: { slug } })
  if (existing) slug = `${slug}-${Date.now()}`

  const post = await prisma.post.create({
    data: {
      title: d.title,
      slug,
      excerpt: d.excerpt || null,
      content: d.content,
      category: d.category,
      status: d.status,
      featuredImage: d.featuredImage || null,
      pdfUrl: d.pdfUrl || null,
      seoTitle: d.seoTitle || null,
      seoDescription: d.seoDescription || null,
      scheduledAt: d.scheduledAt ? new Date(d.scheduledAt) : null,
      publishedAt: d.status === "PUBLISHED" ? new Date() : null,
      authorId: (session.user as { id: string }).id,
    },
  })

  await logAudit({
    action: "POST_CREATED",
    module: "PUBLICATIONS",
    targetId: post.id,
    userId: (session.user as { id: string }).id,
    details: {
      title: post.title,
      slug: post.slug,
      status: post.status.toLowerCase() as "draft" | "published",
    },
    ...getRequestContext(req),
  })

  return NextResponse.json(post, { status: 201 })
}
