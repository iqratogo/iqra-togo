/* §5.4.2 Communiqués (/actualites/communiques) — liste chronologique */

import type { Metadata } from "next"
import Link from "next/link"
import { ChevronRight, Download, ArrowRight } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { prisma } from "@/lib/db/prisma"
import SectionHeader from "@/components/ui/SectionHeader"
import ShareButtons from "./_components/ShareButtons"

export const metadata: Metadata = {
  title: "Communiqués — IQRA TOGO",
  description:
    "Consultez les communiqués officiels et prises de position de l'association IQRA TOGO.",
}

const ITEMS_PER_PAGE = 10

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

interface CommuniquePost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  pdfUrl: string | null
  publishedAt: Date | null
}

export default async function CommuniquesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? "1", 10))

  const where = { status: "PUBLISHED" as const, category: "COMMUNIQUE" as const }

  const [rows, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
      select: { id: true, title: true, slug: true, excerpt: true, pdfUrl: true, publishedAt: true },
    }),
    prisma.post.count({ where }),
  ]).catch(() => [[], 0])

  const posts = rows as CommuniquePost[]
  const totalPages = Math.ceil((total as number) / ITEMS_PER_PAGE)

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
              <li className="text-white" aria-current="page">Communiqués</li>
            </ol>
          </nav>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-bold text-white lg:text-5xl">
            Communiqués
          </h1>
          <p className="mt-4 max-w-xl text-white/80">
            Prises de position, annonces officielles et déclarations de l'association IQRA TOGO.
          </p>
        </div>
      </section>

      <section className="bg-[#F5F5F5] py-16">
        <div className="mx-auto max-w-4xl px-4 lg:px-8">
          {posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map((post) => {
                const dateFormatted = post.publishedAt
                  ? format(new Date(post.publishedAt), "d MMMM yyyy", { locale: fr })
                  : null
                const href = `/actualites/communiques/${post.slug}`
                const fullUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}${href}`

                return (
                  /* §5.4.2 — Format card : date mise en avant, titre, résumé, PDF */
                  <article
                    key={post.id}
                    className="rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
                      {/* Date mise en avant §5.4.2 */}
                      {dateFormatted && (
                        <time
                          dateTime={post.publishedAt?.toISOString()}
                          className="flex-shrink-0 text-center sm:w-24"
                        >
                          <span
                            className="block font-[family-name:var(--font-playfair)] text-3xl font-bold leading-none"
                            style={{ color: "var(--azae-orange)" }}
                          >
                            {format(new Date(post.publishedAt!), "d", { locale: fr })}
                          </span>
                          <span className="block text-xs font-medium uppercase text-gray-400">
                            {format(new Date(post.publishedAt!), "MMM yyyy", { locale: fr })}
                          </span>
                        </time>
                      )}

                      <div className="flex-1 min-w-0">
                        <span
                          className="mb-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
                          style={{ backgroundColor: "var(--azae-navy)" }}
                        >
                          Communiqué
                        </span>
                        <h2 className="font-[family-name:var(--font-playfair)] text-lg font-bold leading-snug"
                          style={{ color: "var(--azae-navy)" }}
                        >
                          <Link href={href} className="hover:text-[var(--azae-orange)] transition-colors">
                            {post.title}
                          </Link>
                        </h2>
                        {post.excerpt && (
                          <p className="mt-2 line-clamp-2 text-sm text-gray-500">{post.excerpt}</p>
                        )}

                        {/* Actions §5.4.2 */}
                        <div className="mt-3 flex flex-wrap items-center gap-3">
                          <Link
                            href={href}
                            className="flex items-center gap-1 text-sm font-medium transition-colors"
                            style={{ color: "var(--azae-orange)" }}
                          >
                            Lire la suite <ArrowRight className="h-3.5 w-3.5" />
                          </Link>

                          {/* Lien PDF optionnel §5.4.2 */}
                          {post.pdfUrl && (
                            <a
                              href={post.pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              download
                              className="flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-[var(--azae-navy)]"
                            >
                              <Download className="h-3.5 w-3.5" />
                              Télécharger PDF
                            </a>
                          )}

                          {/* Partage social §5.4.2 */}
                          <ShareButtons url={fullUrl} title={post.title} />
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="rounded-xl bg-white py-16 text-center shadow-sm">
              <SectionHeader
                title="Aucun communiqué disponible"
                subtitle="Revenez bientôt pour consulter nos derniers communiqués officiels."
                centered
              />
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <nav aria-label="Pagination" className="mt-10 flex justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/actualites/communiques?page=${p}`}
                  aria-current={p === page ? "page" : undefined}
                  className={
                    p === page
                      ? "flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold text-white"
                      : "flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-sm text-gray-600 transition-colors hover:border-[var(--azae-orange)]"
                  }
                  style={p === page ? { backgroundColor: "var(--azae-orange)" } : {}}
                >
                  {p}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </section>
    </>
  )
}
