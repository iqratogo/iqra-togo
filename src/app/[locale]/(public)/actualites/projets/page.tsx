/* §5.4.1 Projets (/actualites/projets) — liste paginée avec filtres */

import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { prisma } from "@/lib/db/prisma"
import PostCard, { type Post } from "@/components/ui/PostCard"
import SectionHeader from "@/components/ui/SectionHeader"
import ProjetsFilters from "./_components/ProjetsFilters"

export const metadata: Metadata = {
  title: "Projets — IQRA TOGO",
  description:
    "Découvrez tous les projets de terrain de l'association IQRA TOGO au Togo : éducation, soutien social et intégration.",
}

const ITEMS_PER_PAGE = 9

interface PageProps {
  searchParams: Promise<{ page?: string; annee?: string }>
}

export default async function ProjetsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? "1", 10))
  const annee = params.annee ? parseInt(params.annee, 10) : undefined

  /* Plage de dates pour le filtre année §5.4.1 */
  const dateFilter =
    annee
      ? {
          gte: new Date(`${annee}-01-01`),
          lte: new Date(`${annee}-12-31`),
        }
      : undefined

  const where = {
    status: "PUBLISHED" as const,
    category: "PROJET" as const,
    ...(dateFilter ? { publishedAt: dateFilter } : {}),
  }

  const [rows, total, years] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
      select: {
        id: true, title: true, slug: true, excerpt: true,
        category: true, featuredImage: true, publishedAt: true,
        author: { select: { name: true } },
      },
    }),
    prisma.post.count({ where }),
    /* Années disponibles pour le filtre */
    prisma.post.findMany({
      where: { status: "PUBLISHED", category: "PROJET" },
      select: { publishedAt: true },
      distinct: ["publishedAt"],
    }),
  ]).catch(() => [[], 0, []])

  const posts = rows as Post[]
  const totalPages = Math.ceil((total as number) / ITEMS_PER_PAGE)

  const availableYears = [
    ...new Set(
      (years as { publishedAt: Date | null }[])
        .filter((r) => r.publishedAt)
        .map((r) => new Date(r.publishedAt!).getFullYear())
    ),
  ].sort((a, b) => b - a)

  return (
    <>
      {/* Hero */}
      <section
        className="py-20 text-white"
        style={{
          background: "linear-gradient(135deg, var(--azae-navy) 0%, var(--azae-navy-light) 100%)",
        }}
      >
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <nav aria-label="Fil d'Ariane" className="mb-6">
            <ol className="flex items-center gap-1.5 text-xs text-white/60">
              <li><Link href="/" className="hover:text-white">Accueil</Link></li>
              <li><ChevronRight className="h-3 w-3" /></li>
              <li><Link href="/actualites" className="hover:text-white">Actualités</Link></li>
              <li><ChevronRight className="h-3 w-3" /></li>
              <li className="text-white" aria-current="page">Projets</li>
            </ol>
          </nav>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-bold text-white lg:text-5xl">
            Nos Projets
          </h1>
          <p className="mt-4 max-w-xl text-white/80">
            Découvrez toutes nos actions sur le terrain : projets en cours, réalisés et à venir.
          </p>
        </div>
      </section>

      <section className="bg-[#F5F5F5] py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          {/* Filtres §5.4.1 */}
          <Suspense fallback={null}>
            <ProjetsFilters availableYears={availableYears} currentAnnee={annee} />
          </Suspense>

          {/* Grille projets */}
          {posts.length > 0 ? (
            <>
              <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} variant="default" />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav
                  aria-label="Pagination"
                  className="mt-12 flex items-center justify-center gap-2"
                >
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <Link
                      key={p}
                      href={`/actualites/projets?page=${p}${annee ? `&annee=${annee}` : ""}`}
                      aria-current={p === page ? "page" : undefined}
                      className={
                        p === page
                          ? "flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold text-white"
                          : "flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-sm text-gray-600 transition-colors hover:border-[var(--azae-orange)] hover:text-[var(--azae-orange)]"
                      }
                      style={p === page ? { backgroundColor: "var(--azae-orange)" } : {}}
                    >
                      {p}
                    </Link>
                  ))}
                </nav>
              )}
            </>
          ) : (
            <div className="mt-8 rounded-xl bg-white py-16 text-center shadow-sm">
              <SectionHeader
                title="Aucun projet disponible"
                subtitle="Revenez bientôt pour découvrir nos nouvelles actions sur le terrain."
                centered
              />
            </div>
          )}
        </div>
      </section>
    </>
  )
}
