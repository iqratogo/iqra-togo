/* P1 — Async server component : section "Dernières actualités" avec ses propres données */

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { prisma } from "@/lib/db/prisma"
import SectionHeader from "@/components/ui/SectionHeader"
import PostCard, { type Post } from "@/components/ui/PostCard"

async function getLatestPosts(): Promise<Post[]> {
  try {
    const rows = await prisma.post.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 3,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        category: true,
        featuredImage: true,
        publishedAt: true,
        author: { select: { name: true } },
      },
    })
    return rows as Post[]
  } catch {
    return []
  }
}

export default async function LatestPostsSection() {
  const posts = await getLatestPosts()

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <SectionHeader eyebrow="Actualités" title="Dernières nouvelles" />
          <Link
            href="/actualites"
            className="flex shrink-0 items-center gap-1 text-sm font-medium transition-colors"
            style={{ color: "var(--azae-orange)" }}
          >
            Toutes les actualités <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {posts.length > 0 ? (
          <div className="mt-10 space-y-5 md:grid md:grid-cols-3 md:gap-6 md:space-y-0">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} variant="compact" />
            ))}
          </div>
        ) : (
          <p className="mt-10 text-center text-gray-400">
            Aucune actualité disponible pour le moment.
          </p>
        )}
      </div>
    </section>
  )
}

export function LatestPostsSkeleton() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-10 h-16 w-64 animate-pulse rounded-lg bg-gray-200" />
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl bg-gray-200" />
          ))}
        </div>
      </div>
    </section>
  )
}
