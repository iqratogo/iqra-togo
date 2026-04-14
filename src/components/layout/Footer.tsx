import Image from "next/image"
import { Link } from "@/i18n/navigation"
import { getTranslations, getLocale } from "next-intl/server"
import { FacebookIcon, InstagramIcon, TwitterXIcon, YoutubeIcon } from "@/components/ui/SocialIcons"
import { prisma } from "@/lib/db/prisma"
import { getSettings } from "@/lib/settings"
import { format } from "date-fns"
import { fr, enUS } from "date-fns/locale"

interface RecentPost {
  id: string
  title: string
  slug: string
  category: string
  publishedAt: Date | null
}

async function getRecentPosts(): Promise<RecentPost[]> {
  try {
    const rows = await prisma.post.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 3,
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        publishedAt: true,
      },
    })
    return rows as RecentPost[]
  } catch {
    return []
  }
}

const CATEGORY_SLUG: Record<string, string> = {
  PROJET: "projets",
  COMMUNIQUE: "communiques",
  PARTENAIRE: "partenaires",
  ACTUALITE: "actualites",
}

const SOCIAL_ICONS = [
  { key: "social_facebook", icon: FacebookIcon, label: "Facebook" },
  { key: "social_instagram", icon: InstagramIcon, label: "Instagram" },
  { key: "social_twitter", icon: TwitterXIcon, label: "Twitter/X" },
  { key: "social_youtube", icon: YoutubeIcon, label: "YouTube" },
] as const

export default async function Footer() {
  const [recentPosts, t, locale, settings] = await Promise.all([
    getRecentPosts(),
    getTranslations("footer"),
    getLocale(),
    getSettings(["social_facebook", "social_instagram", "social_twitter", "social_youtube"]),
  ])

  const tNav = await getTranslations("nav")
  const dateLocale = locale === "en" ? enUS : fr

  const NAV_LINKS = [
    { href: "/" as const, label: tNav("home") },
    { href: "/a-propos" as const, label: tNav("about") },
    { href: "/equipe" as const, label: tNav("team") },
    { href: "/actualites" as const, label: tNav("news") },
    { href: "/medias" as const, label: tNav("media") },
    { href: "/dons" as const, label: tNav("donate") },
    { href: "/contact" as const, label: tNav("contact") },
  ]

  return (
    <footer className="bg-[#1A2B4A] text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">

          {/* ── Col 1 : Logo + description + réseaux ── */}
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-gray-300">
              {t("description")}
            </p>
            <div className="flex items-center gap-2 pt-1">
              {SOCIAL_ICONS.filter(({ key }) => !!settings[key]).map(({ key, icon: Icon, label }) => (
                <a
                  key={label}
                  href={settings[key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-gray-300 transition-colors hover:border-[var(--azae-orange)] hover:text-[var(--azae-orange)]"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* ── Col 2 : Navigation ── */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-[var(--azae-orange)]">
              {t("nav_title")}
            </h3>
            <ul className="space-y-2">
              {NAV_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-gray-300 transition-colors hover:text-[var(--azae-orange)]"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Col 3 : Actualités récentes ── */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-[var(--azae-orange)]">
              {t("news_title")}
            </h3>
            <ul className="space-y-4">
              {recentPosts.length > 0 ? (
                recentPosts.map((post) => (
                  <li key={post.id}>
                    <Link
                      href={`/actualites/${CATEGORY_SLUG[post.category] ?? "actualites"}/${post.slug}` as `/actualites/${string}/${string}`}
                      className="group block"
                    >
                      <p className="line-clamp-2 text-sm font-medium text-gray-200 transition-colors group-hover:text-[var(--azae-orange)]">
                        {post.title}
                      </p>
                      {post.publishedAt && (
                        <time className="mt-0.5 block text-xs text-gray-400">
                          {format(new Date(post.publishedAt), "d MMM yyyy", { locale: dateLocale })}
                        </time>
                      )}
                    </Link>
                  </li>
                ))
              ) : (
                <li className="text-sm text-gray-400">{t("no_news")}</li>
              )}
            </ul>
          </div>

          {/* ── Col 4 : Contact ── */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-[var(--azae-orange)]">
              {t("contact_title")}
            </h3>
            <address className="space-y-2 not-italic">
              <p className="text-sm text-gray-300">Quartier Limamwa, Tchamba</p>
              <a
                href="mailto:contact@iqra-togo.com"
                className="block text-sm text-gray-300 transition-colors hover:text-[var(--azae-orange)]"
              >
                contact@iqra-togo.com
              </a>
              <a
                href="tel:+22890000000"
                className="block text-sm text-gray-300 transition-colors hover:text-[var(--azae-orange)]"
              >
                +228 90 00 00 00
              </a>
            </address>

            {/* Badges */}
            <div className="flex flex-col gap-2 pt-2">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs text-green-400">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400" aria-hidden="true" />
                {t("secure_payment")}
              </span>
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-blue-400/30 bg-blue-400/10 px-3 py-1 text-xs text-blue-300">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" aria-hidden="true" />
                {t("official_ngo")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Barre bas ── */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-gray-400 sm:flex-row lg:px-8">
          <p>© {new Date().getFullYear()} IQRA TOGO. {t("rights")}</p>
          <div className="flex gap-4">
            <Link href="/mentions-legales" className="transition-colors hover:text-[var(--azae-orange)]">
              {t("legal")}
            </Link>
            <Link href="/confidentialite" className="transition-colors hover:text-[var(--azae-orange)]">
              {t("privacy")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
