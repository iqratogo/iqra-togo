/* §5.7 Page Médias (/medias) — galerie photos, vidéos, documents */

import type { Metadata } from "next"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { prisma } from "@/lib/db/prisma"
import MediaGallery from "./_components/MediaGallery"

/* P3 — Médiathèque : revalidation toutes les 30 min */
export const revalidate = 1800

export const metadata: Metadata = {
  title: "Médiathèque — Azaetogo",
  description:
    "Galerie photos, vidéos et documents de l'ONG Azaetogo : retrouvez nos archives médias et rapports annuels.",
}

export default async function MediasPage() {
  const [images, videos, documents] = await Promise.all([
    prisma.media.findMany({
      where: { type: "IMAGE" },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, url: true, type: true, alt: true },
    }),
    prisma.media.findMany({
      where: { type: "VIDEO" },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, url: true, type: true, alt: true },
    }),
    prisma.media.findMany({
      where: { type: "DOCUMENT" },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, url: true, type: true, alt: true },
    }),
  ]).catch(() => [[], [], []])

  return (
    <>
      {/* Hero §5.7 */}
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
              <li className="text-white" aria-current="page">Médiathèque</li>
            </ol>
          </nav>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-bold text-white lg:text-5xl">
            Médiathèque
          </h1>
          <p className="mt-4 max-w-xl text-white/80">
            Photos, vidéos et documents de nos actions sur le terrain et événements.
          </p>
        </div>
      </section>

      {/* Galerie §5.7 */}
      <section className="bg-[#F5F5F5] py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <MediaGallery
            images={images as { id: string; name: string; url: string; type: "IMAGE" | "VIDEO" | "DOCUMENT"; alt?: string | null }[]}
            videos={videos as { id: string; name: string; url: string; type: "IMAGE" | "VIDEO" | "DOCUMENT"; alt?: string | null }[]}
            documents={documents as { id: string; name: string; url: string; type: "IMAGE" | "VIDEO" | "DOCUMENT"; alt?: string | null }[]}
          />
        </div>
      </section>
    </>
  )
}
