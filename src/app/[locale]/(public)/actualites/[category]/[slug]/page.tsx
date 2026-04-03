/* §5.4 Page détail article — /actualites/[category]/[slug] */

import type { Metadata } from "next"
import { sanitizeCmsHtml } from "@/lib/sanitize"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ChevronRight, Download, Calendar, User } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { prisma } from "@/lib/db/prisma"
import ShareButtons from "../../communiques/_components/ShareButtons"

export const revalidate = 1800 // ISR 30 min

const CATEGORY_MAP: Record<string, "PROJET" | "COMMUNIQUE"> = {
  projets: "PROJET",
  communiques: "COMMUNIQUE",
}

interface PageProps {
  params: Promise<{ category: string; slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category, slug } = await params
  const dbCategory = CATEGORY_MAP[category]
  if (!dbCategory) return {}

  const post = await prisma.post.findFirst({
    where: { slug, category: dbCategory, status: "PUBLISHED" },
    select: { title: true, seoTitle: true, seoDescription: true, excerpt: true, ogImage: true, featuredImage: true, canonical: true },
  }).catch(() => null)

  if (!post) return { title: "Article introuvable" }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://iqratogo.org"
  const canonicalUrl = post.canonical ?? `${appUrl}/actualites/${category}/${slug}`

  return {
    title: post.seoTitle ?? `${post.title} — IQRA TOGO`,
    description: post.seoDescription ?? post.excerpt ?? undefined,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        fr: `${appUrl}/actualites/${category}/${slug}`,
        en: `${appUrl}/en/actualites/${category}/${slug}`,
      },
    },
    openGraph: {
      title: post.seoTitle ?? post.title,
      description: post.seoDescription ?? post.excerpt ?? undefined,
      url: canonicalUrl,
      images: post.ogImage ?? post.featuredImage ? [{ url: (post.ogImage ?? post.featuredImage)! }] : [],
    },
  }
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { category, slug } = await params
  const dbCategory = CATEGORY_MAP[category]

  if (!dbCategory) notFound()

  const post = await prisma.post.findFirst({
    where: { slug, category: dbCategory, status: "PUBLISHED" },
    select: {
      id: true, title: true, slug: true, content: true, excerpt: true,
      category: true, featuredImage: true, pdfUrl: true,
      publishedAt: true, author: { select: { name: true } },
      seoTitle: true, seoDescription: true,
    },
  }).catch(() => null)

  if (!post) notFound()

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  const fullUrl = `${appUrl}/actualites/${category}/${slug}`
  const dateFormatted = post.publishedAt
    ? format(new Date(post.publishedAt), "d MMMM yyyy", { locale: fr })
    : null

  const CATEGORY_LABELS: Record<string, string> = {
    PROJET: "Projet",
    COMMUNIQUE: "Communiqué",
  }

  const BACK_HREFS: Record<string, string> = {
    projets: "/actualites/projets",
    communiques: "/actualites/communiques",
  }

  return (
    <>
      {/* Hero */}
      <section
        className="relative py-16 text-white"
        style={{
          background: "linear-gradient(135deg, var(--azae-navy) 0%, var(--azae-navy-light) 100%)",
        }}
      >
        <div className="mx-auto max-w-4xl px-4 lg:px-8">
          <nav aria-label="Fil d'Ariane" className="mb-6">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs text-white/60">
              <li><Link href="/" className="hover:text-white">Accueil</Link></li>
              <li><ChevronRight className="h-3 w-3" /></li>
              <li><Link href="/actualites" className="hover:text-white">Actualités</Link></li>
              <li><ChevronRight className="h-3 w-3" /></li>
              <li>
                <Link href={BACK_HREFS[category] ?? "/actualites"} className="hover:text-white">
                  {CATEGORY_LABELS[post.category]}s
                </Link>
              </li>
              <li><ChevronRight className="h-3 w-3" /></li>
              <li className="text-white line-clamp-1">{post.title}</li>
            </ol>
          </nav>

          {/* Badge catégorie */}
          <span
            className="mb-4 inline-block rounded-full px-3 py-1 text-xs font-semibold"
            style={{ backgroundColor: "var(--azae-orange)", color: "white" }}
          >
            {CATEGORY_LABELS[post.category]}
          </span>

          <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold leading-tight lg:text-4xl">
            {post.title}
          </h1>

          {/* Méta : date + auteur */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/70">
            {dateFormatted && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {dateFormatted}
              </span>
            )}
            {post.author?.name && (
              <span className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                {post.author.name}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Contenu */}
      <section className="bg-[#F5F5F5] py-12">
        <div className="mx-auto max-w-4xl px-4 lg:px-8">
          <div className="rounded-2xl bg-white p-6 shadow-sm lg:p-10">
            {/* Image principale */}
            {post.featuredImage && (
              <div className="relative mb-8 h-64 w-full overflow-hidden rounded-xl lg:h-96">
                <Image
                  src={post.featuredImage}
                  alt={post.title}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 800px, 100vw"
                  priority
                />
              </div>
            )}

            {/* Extrait mis en avant */}
            {post.excerpt && (
              <p
                className="mb-6 border-l-4 pl-4 text-base font-medium italic text-gray-600"
                style={{ borderColor: "var(--azae-orange)" }}
              >
                {post.excerpt}
              </p>
            )}

            {/* Contenu HTML §4.2.1 — rendu depuis le CMS (sanitisé §12 XSS) */}
            <div
              className="prose prose-gray max-w-none
                prose-headings:font-[family-name:var(--font-playfair)]
                prose-headings:text-[var(--azae-navy)]
                prose-a:text-[var(--azae-orange)]
                prose-a:no-underline
                hover:prose-a:underline"
              dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(post.content) }}
            />

            {/* Actions — PDF + partage social §5.4.2 */}
            <div className="mt-10 border-t border-gray-100 pt-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                {post.pdfUrl && (
                  <a
                    href={post.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-[var(--azae-orange)] hover:text-[var(--azae-orange)]"
                  >
                    <Download className="h-4 w-4" />
                    Télécharger en PDF
                  </a>
                )}

                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">Partager :</span>
                  <ShareButtons url={fullUrl} title={post.title} />
                </div>
              </div>
            </div>
          </div>

          {/* Retour à la liste */}
          <div className="mt-6">
            <Link
              href={BACK_HREFS[category] ?? "/actualites"}
              className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
              style={{ color: "var(--azae-orange)" }}
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
              Retour aux {CATEGORY_LABELS[post.category] ?? "articles"}s
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
