import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"

export interface Post {
  id: string
  title: string
  slug: string
  excerpt?: string | null
  category: "PROJET" | "COMMUNIQUE" | "PARTENAIRE" | "ACTUALITE"
  featuredImage?: string | null
  publishedAt?: Date | string | null
  author?: { name?: string | null }
}

const CATEGORY_LABELS: Record<string, string> = {
  PROJET: "Projet",
  COMMUNIQUE: "Communiqué",
  PARTENAIRE: "Partenaire",
  ACTUALITE: "Actualité",
}

const CATEGORY_SLUG: Record<string, string> = {
  PROJET: "projets",
  COMMUNIQUE: "communiques",
  PARTENAIRE: "partenaires",
  ACTUALITE: "actualites",
}

interface PostCardProps {
  post: Post
  variant?: "default" | "featured" | "compact"
}

export default function PostCard({ post, variant = "default" }: PostCardProps) {
  const href = `/actualites/${CATEGORY_SLUG[post.category] ?? "actualites"}/${post.slug}`
  const label = CATEGORY_LABELS[post.category] ?? "Actualité"
  const dateFormatted =
    post.publishedAt
      ? format(new Date(post.publishedAt), "d MMM yyyy", { locale: fr })
      : null

  /* ── Compact ── */
  if (variant === "compact") {
    return (
      <Link href={href} className="group flex items-start gap-3">
        {post.featuredImage && (
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md">
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="64px"
            />
          </div>
        )}
        <div className="min-w-0">
          <p className="line-clamp-2 text-sm font-medium text-[var(--azae-navy)] transition-colors group-hover:text-[var(--azae-orange)]">
            {post.title}
          </p>
          {dateFormatted && (
            <time className="mt-0.5 block text-xs text-gray-400">{dateFormatted}</time>
          )}
        </div>
      </Link>
    )
  }

  const isFeatured = variant === "featured"

  /* ── Default / Featured ── */
  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md",
        isFeatured && "lg:flex-row"
      )}
    >
      {/* Image */}
      <div
        className={cn(
          "relative overflow-hidden bg-gray-100",
          isFeatured ? "h-56 shrink-0 lg:h-auto lg:w-72" : "h-48"
        )}
      >
        {post.featuredImage ? (
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes={
              isFeatured
                ? "(min-width: 1024px) 288px, 100vw"
                : "(min-width: 768px) 50vw, 100vw"
            }
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-sm text-gray-300">IQRA TOGO</span>
          </div>
        )}
        {/* Category badge */}
        <span
          className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold text-white"
          style={{ backgroundColor: "var(--azae-orange)" }}
        >
          {label}
        </span>
      </div>

      {/* Content */}
      <div className={cn("flex flex-col gap-2 p-4", isFeatured && "lg:p-6")}>
        <h3
          className={cn(
            "line-clamp-2 font-[family-name:var(--font-playfair)] font-bold leading-snug text-[var(--azae-navy)] transition-colors group-hover:text-[var(--azae-orange)]",
            isFeatured ? "text-xl" : "text-base"
          )}
        >
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="line-clamp-2 text-sm text-gray-500">{post.excerpt}</p>
        )}
        <div className="mt-auto flex items-center gap-2 pt-2 text-xs text-gray-400">
          {dateFormatted && <time>{dateFormatted}</time>}
          {post.author?.name && (
            <>
              <span aria-hidden="true">·</span>
              <span>{post.author.name}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  )
}
