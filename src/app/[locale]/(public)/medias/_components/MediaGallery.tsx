"use client"

/* §5.7 Médiathèque — onglets Photos/Vidéos/Documents + lightbox */

import { useState } from "react"
import Image from "next/image"
import { Download, X, ChevronLeft, ChevronRight, Share2 } from "lucide-react"
import { cn } from "@/lib/utils"

type MediaType = "IMAGE" | "VIDEO" | "DOCUMENT"

interface MediaItem {
  id: string
  name: string
  url: string
  type: MediaType
  alt?: string | null
}

interface MediaGalleryProps {
  images: MediaItem[]
  videos: MediaItem[]
  documents: MediaItem[]
}

const TABS: { value: MediaType | "ALL"; label: string }[] = [
  { value: "IMAGE", label: "Photos" },
  { value: "VIDEO", label: "Vidéos" },
  { value: "DOCUMENT", label: "Documents" },
]

export default function MediaGallery({ images, videos, documents }: MediaGalleryProps) {
  const [activeTab, setActiveTab] = useState<MediaType>("IMAGE")
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const items =
    activeTab === "IMAGE" ? images
    : activeTab === "VIDEO" ? videos
    : documents

  const openLightbox = (index: number) => setLightboxIndex(index)
  const closeLightbox = () => setLightboxIndex(null)

  const navigateLightbox = (dir: 1 | -1) => {
    if (lightboxIndex === null) return
    const next = (lightboxIndex + dir + images.length) % images.length
    setLightboxIndex(next)
  }

  const currentImage = lightboxIndex !== null ? images[lightboxIndex] : null

  return (
    <>
      {/* §5.7 Onglets filtres */}
      <div className="mb-8 flex gap-1 rounded-xl border border-gray-200 bg-white p-1 w-fit">
        {TABS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setActiveTab(value as MediaType)}
            className={cn(
              "rounded-lg px-5 py-2 text-sm font-medium transition-colors",
              activeTab === value
                ? "text-white shadow-sm"
                : "text-gray-600 hover:text-[var(--azae-orange)]"
            )}
            style={activeTab === value ? { backgroundColor: "var(--azae-orange)" } : {}}
          >
            {label}{" "}
            <span className="ml-1 text-xs opacity-70">
              ({value === "IMAGE" ? images.length : value === "VIDEO" ? videos.length : documents.length})
            </span>
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white py-16 text-center">
          <p className="text-gray-400">
            Aucun{" "}
            {activeTab === "IMAGE" ? "photo" : activeTab === "VIDEO" ? "vidéo" : "document"}{" "}
            disponible pour le moment.
          </p>
        </div>
      ) : (
        <>
          {/* §5.7 Galerie photos — grille masonry */}
          {activeTab === "IMAGE" && (
            <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => openLightbox(i)}
                  className="group mb-4 block w-full overflow-hidden rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--azae-orange)]"
                  aria-label={`Ouvrir la photo : ${img.alt ?? img.name}`}
                >
                  <div className="relative overflow-hidden rounded-xl bg-gray-100">
                    <Image
                      src={img.url}
                      alt={img.alt ?? img.name}
                      width={400}
                      height={300}
                      className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    />
                    {/* Overlay hover */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
                      <span className="scale-75 rounded-full bg-white/90 p-3 opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100">
                        <ChevronRight className="h-5 w-5" style={{ color: "var(--azae-orange)" }} />
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* §5.7 Vidéos — embed YouTube/Vimeo */}
          {activeTab === "VIDEO" && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {videos.map((video) => {
                const isEmbed = video.url.includes("youtube") || video.url.includes("vimeo")
                const embedUrl = video.url.includes("watch?v=")
                  ? video.url.replace("watch?v=", "embed/")
                  : video.url

                return (
                  <div key={video.id} className="overflow-hidden rounded-xl bg-white shadow-sm">
                    {isEmbed ? (
                      <div className="relative aspect-video">
                        <iframe
                          src={embedUrl}
                          title={video.name}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="absolute inset-0 h-full w-full"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="relative aspect-video bg-black">
                        <video src={video.url} controls className="h-full w-full" preload="metadata" />
                      </div>
                    )}
                    <div className="p-3">
                      <p className="line-clamp-1 text-sm font-medium" style={{ color: "var(--azae-navy)" }}>
                        {video.name}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* §5.7 Documents — rapports, plaquettes, chartes */}
          {activeTab === "DOCUMENT" && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {documents.map((doc) => {
                const ext = doc.url.split(".").pop()?.toUpperCase() ?? "PDF"
                return (
                  <div
                    key={doc.id}
                    className="flex flex-col gap-3 rounded-xl bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                        style={{ backgroundColor: "var(--azae-navy)" }}
                      >
                        {ext}
                      </div>
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-sm font-medium leading-snug"
                          style={{ color: "var(--azae-navy)" }}
                        >
                          {doc.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={doc.name}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:border-[var(--azae-orange)] hover:text-[var(--azae-orange)]"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Télécharger
                      </a>
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(doc.url)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Partager sur WhatsApp"
                        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:border-[var(--azae-orange)] hover:text-[var(--azae-orange)]"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* §5.7 Lightbox full-screen pour photos */}
      {currentImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          role="dialog"
          aria-modal="true"
          aria-label={`Photo : ${currentImage.alt ?? currentImage.name}`}
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            aria-label="Fermer"
          >
            <X className="h-6 w-6" />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); navigateLightbox(-1) }}
            className="absolute left-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            aria-label="Photo précédente"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <div
            className="relative max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={currentImage.url}
              alt={currentImage.alt ?? currentImage.name}
              width={1200}
              height={800}
              className="max-h-[90vh] w-auto rounded-lg object-contain"
              sizes="90vw"
              priority
            />
            <p className="mt-2 text-center text-sm text-white/70">
              {currentImage.alt ?? currentImage.name}
              {lightboxIndex !== null && (
                <span className="ml-2 text-xs text-white/50">
                  {lightboxIndex + 1} / {images.length}
                </span>
              )}
            </p>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); navigateLightbox(1) }}
            className="absolute right-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            aria-label="Photo suivante"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      )}
    </>
  )
}
