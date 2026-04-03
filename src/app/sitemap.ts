import type { MetadataRoute } from "next"
import { prisma } from "@/lib/db/prisma"

export const revalidate = 3600 // Revalide le sitemap toutes les heures

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://iqra-togo.com"

const CATEGORY_SLUG: Record<string, string> = {
  PROJET: "projets",
  COMMUNIQUE: "communiques",
  PARTENAIRE: "partenaires",
}

const STATIC_PAGES = [
  { url: "/", priority: 1.0, changeFrequency: "weekly" as const },
  { url: "/a-propos", priority: 0.8, changeFrequency: "monthly" as const },
  { url: "/equipe", priority: 0.7, changeFrequency: "monthly" as const },
  { url: "/actualites", priority: 0.9, changeFrequency: "daily" as const },
  { url: "/actualites/projets", priority: 0.8, changeFrequency: "weekly" as const },
  { url: "/actualites/communiques", priority: 0.8, changeFrequency: "weekly" as const },
  { url: "/actualites/partenaires", priority: 0.7, changeFrequency: "monthly" as const },
  { url: "/medias", priority: 0.6, changeFrequency: "monthly" as const },
  { url: "/dons", priority: 0.9, changeFrequency: "monthly" as const },
  { url: "/contact", priority: 0.7, changeFrequency: "yearly" as const },
  { url: "/adhesion", priority: 0.7, changeFrequency: "monthly" as const },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  /* Pages statiques — FR (défaut, pas de préfixe) + EN */
  const staticEntries: MetadataRoute.Sitemap = STATIC_PAGES.flatMap(
    ({ url, priority, changeFrequency }) => [
      {
        url: `${BASE}${url}`,
        lastModified: now,
        changeFrequency,
        priority,
        alternates: {
          languages: {
            fr: `${BASE}${url}`,
            en: `${BASE}/en${url}`,
          },
        },
      },
    ]
  )

  /* Articles publiés */
  let postEntries: MetadataRoute.Sitemap = []
  try {
    const posts = await prisma.post.findMany({
      where: { status: "PUBLISHED", category: { in: ["PROJET", "COMMUNIQUE", "PARTENAIRE"] } },
      select: { slug: true, category: true, updatedAt: true },
      orderBy: { publishedAt: "desc" },
    })

    postEntries = posts.map((post) => {
      const catSlug = CATEGORY_SLUG[post.category] ?? "actualites"
      const path = `/actualites/${catSlug}/${post.slug}`
      return {
        url: `${BASE}${path}`,
        lastModified: post.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.7,
        alternates: {
          languages: {
            fr: `${BASE}${path}`,
            en: `${BASE}/en${path}`,
          },
        },
      }
    })
  } catch {
    // DB non disponible : sitemap partiel acceptable
  }

  return [...staticEntries, ...postEntries]
}
