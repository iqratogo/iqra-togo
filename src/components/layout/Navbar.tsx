"use client"

/* §6.1 Navigation principale — Navbar desktop mega-menu + drawer mobile */

import Image from "next/image"
import { usePathname, Link } from "@/i18n/navigation"
import { useState, useEffect, useRef, Fragment } from "react"
import { useLocale, useTranslations } from "next-intl"
import {
  Menu,
  X,
  ChevronDown,
  FolderOpen,
  FileText,
  Handshake,
  Globe,
} from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/* ── §6.1.1 Mega-menu Actualités : 3 colonnes ── */
function useActualitesColumns() {
  const t = useTranslations("nav.news_sub")
  return [
    {
      href: "/actualites/projets" as const,
      label: t("projects"),
      description: t("projects_desc"),
      icon: FolderOpen,
    },
    {
      href: "/actualites/communiques" as const,
      label: t("communiques"),
      description: t("communiques_desc"),
      icon: FileText,
    },
    {
      href: "/actualites/partenaires" as const,
      label: t("partners"),
      description: t("partners_desc"),
      icon: Handshake,
    },
  ]
}

/* ── Sélecteur de langue FR | EN ── */
function LanguageSwitcher() {
  const locale = useLocale()
  const pathname = usePathname()

  return (
    <div className="flex items-center gap-0.5 rounded-full border border-gray-200 px-1 py-0.5 text-xs font-semibold">
      <Globe className="mr-1 h-3 w-3 text-gray-400" />
      {(["fr", "en"] as const).map((l, i) => (
        <Fragment key={l}>
          {i > 0 && <span className="text-gray-300">|</span>}
          <Link
            href={pathname}
            locale={l}
            className={cn(
              "rounded px-1.5 py-0.5 uppercase transition-colors",
              locale === l
                ? "bg-[var(--azae-orange)] text-white"
                : "text-gray-500 hover:text-[var(--azae-navy)]"
            )}
          >
            {l}
          </Link>
        </Fragment>
      ))}
    </div>
  )
}

export default function Navbar() {
  const t = useTranslations("nav")
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [megaOpen, setMegaOpen] = useState(false)
  const megaRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const ACTUALITES_COLUMNS = useActualitesColumns()

  const NAV_LINKS = [
    { href: "/" as const, label: t("home") },
    { href: "/a-propos" as const, label: t("about") },
    { href: "/equipe" as const, label: t("team") },
    {
      label: t("news"),
      children: ACTUALITES_COLUMNS,
    },
    { href: "/medias" as const, label: t("media") },
    { href: "/contact" as const, label: t("contact") },
  ]

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) {
        setMegaOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const openMega = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setMegaOpen(true)
  }

  const closeMega = () => {
    timerRef.current = setTimeout(() => setMegaOpen(false), 120)
  }

  const isActualitesActive = ACTUALITES_COLUMNS.some((c) =>
    pathname.startsWith(c.href)
  )

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full bg-white transition-shadow duration-300",
        scrolled && "shadow-md"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">

        {/* ── Logo ── */}
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/logo-iqra.jpg"
            alt="IQRA TOGO"
            width={180}
            height={68}
            className="h-14 w-auto"
            priority
          />
        </Link>

        {/* ── Desktop navigation ── */}
        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Navigation principale">
          {NAV_LINKS.map((item) => {
            if ("children" in item) {
              return (
                <div
                  key={item.label}
                  ref={megaRef}
                  className="relative"
                  onMouseEnter={openMega}
                  onMouseLeave={closeMega}
                >
                  <button
                    aria-haspopup="true"
                    aria-expanded={megaOpen}
                    className={cn(
                      "flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-[#333] transition-colors hover:text-[var(--azae-orange)]",
                      isActualitesActive && "text-[var(--azae-orange)]"
                    )}
                  >
                    {item.label}
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 transition-transform duration-200",
                        megaOpen && "rotate-180"
                      )}
                      aria-hidden="true"
                    />
                    {isActualitesActive && (
                      <span
                        className="absolute inset-x-3 bottom-0 h-0.5 rounded-full"
                        style={{ backgroundColor: "var(--azae-orange)" }}
                      />
                    )}
                  </button>

                  <div
                    role="region"
                    aria-label={t("news_sub.header")}
                    className={cn(
                      "absolute left-1/2 top-full mt-2 w-[540px] -translate-x-1/2 rounded-xl border border-gray-100 bg-white shadow-xl transition-all duration-200",
                      megaOpen
                        ? "pointer-events-auto translate-y-0 opacity-100"
                        : "pointer-events-none -translate-y-2 opacity-0"
                    )}
                  >
                    <div
                      className="rounded-t-xl px-5 py-3"
                      style={{ backgroundColor: "var(--azae-navy)" }}
                    >
                      <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
                        {t("news_sub.header")}
                      </p>
                      <p className="text-sm text-white">{t("news_sub.subheader")}</p>
                    </div>

                    <div className="grid grid-cols-3 divide-x divide-gray-100 p-2">
                      {ACTUALITES_COLUMNS.map(({ href, label, description, icon: Icon }) => {
                        const isActive = pathname.startsWith(href)
                        return (
                          <Link
                            key={href}
                            href={href}
                            onClick={() => setMegaOpen(false)}
                            className={cn(
                              "group flex flex-col gap-2 rounded-lg p-4 transition-colors hover:bg-green-50",
                              isActive && "bg-green-50"
                            )}
                          >
                            <div
                              className="flex h-9 w-9 items-center justify-center rounded-lg"
                              style={{ backgroundColor: isActive ? "var(--azae-orange)" : "#F5F5F5" }}
                            >
                              <Icon
                                className="h-4 w-4"
                                style={{ color: isActive ? "white" : "var(--azae-navy)" }}
                              />
                            </div>
                            <div>
                              <p
                                className={cn(
                                  "text-sm font-semibold transition-colors group-hover:text-[var(--azae-orange)]",
                                  isActive ? "text-[var(--azae-orange)]" : "text-[var(--azae-navy)]"
                                )}
                              >
                                {label}
                              </p>
                              <p className="mt-0.5 text-xs leading-snug text-gray-500">
                                {description}
                              </p>
                            </div>
                          </Link>
                        )
                      })}
                    </div>

                    <div className="border-t border-gray-100 px-5 py-3">
                      <Link
                        href="/actualites"
                        onClick={() => setMegaOpen(false)}
                        className="text-xs font-medium transition-colors hover:text-[var(--azae-orange)]"
                        style={{ color: "var(--azae-orange)" }}
                      >
                        {t("news_sub.see_all")}
                      </Link>
                    </div>
                  </div>
                </div>
              )
            }

            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative rounded-md px-3 py-2 text-sm font-medium text-[#333] transition-colors hover:text-[var(--azae-orange)]",
                  isActive && "text-[var(--azae-orange)]"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
                {isActive && (
                  <span
                    className="absolute inset-x-3 bottom-0 h-0.5 rounded-full"
                    style={{ backgroundColor: "var(--azae-orange)" }}
                  />
                )}
              </Link>
            )
          })}
        </nav>

        {/* ── Desktop CTAs + Language Switcher ── */}
        <div className="hidden items-center gap-2 lg:flex">
          <LanguageSwitcher />
          <Button
            variant="outline"
            size="sm"
            asChild
            className="border-[var(--azae-navy)] text-[var(--azae-navy)] transition-colors hover:bg-[var(--azae-navy)] hover:text-white"
          >
            <Link href="/auth/login">{t("login")}</Link>
          </Button>
          <Button
            size="sm"
            asChild
            className="bg-[var(--azae-orange)] text-white transition-colors hover:bg-[var(--azae-orange-dark)]"
          >
            <Link href="/dons">{t("donate")}</Link>
          </Button>
        </div>

        {/* ── Mobile hamburger + Sheet drawer ── */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button
              className="p-2 text-[var(--azae-navy)] lg:hidden"
              aria-label={t("open_menu")}
              aria-expanded={mobileOpen}
            >
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
          </SheetTrigger>

          <SheetContent side="right" className="flex w-80 flex-col p-0">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <Image
                src="/logo-iqra.jpg"
                alt="IQRA TOGO"
                width={100}
                height={36}
                className="h-9 w-auto"
              />
              <div className="flex items-center gap-2">
                <LanguageSwitcher />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="rounded p-1 text-gray-500 hover:text-gray-700"
                  aria-label={t("close_menu")}
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>

            <nav className="flex-1 overflow-y-auto px-2 py-4" aria-label="Navigation mobile">
              <Accordion type="single" collapsible className="w-full">
                {NAV_LINKS.map((item) => {
                  if ("children" in item) {
                    return (
                      <AccordionItem key={item.label} value={item.label} className="border-none">
                        <AccordionTrigger className="rounded-md px-3 py-2.5 text-sm font-medium text-[#333] hover:text-[var(--azae-orange)] hover:no-underline">
                          {item.label}
                        </AccordionTrigger>
                        <AccordionContent className="pb-1 pl-3">
                          {item.children!.map(({ href, label, icon: Icon }) => (
                            <Link
                              key={href}
                              href={href}
                              onClick={() => setMobileOpen(false)}
                              className={cn(
                                "flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-600 transition-colors hover:text-[var(--azae-orange)]",
                                pathname.startsWith(href) && "font-medium text-[var(--azae-orange)]"
                              )}
                              aria-current={pathname.startsWith(href) ? "page" : undefined}
                            >
                              <Icon className="h-4 w-4 flex-shrink-0" />
                              {label}
                            </Link>
                          ))}
                        </AccordionContent>
                      </AccordionItem>
                    )
                  }

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "block rounded-md px-3 py-2.5 text-sm font-medium text-[#333] transition-colors hover:text-[var(--azae-orange)]",
                        pathname === item.href && "font-medium text-[var(--azae-orange)]"
                      )}
                      aria-current={pathname === item.href ? "page" : undefined}
                    >
                      {item.label}
                    </Link>
                  )
                })}
              </Accordion>
            </nav>

            <div className="border-t p-4 space-y-2">
              <Button
                asChild
                className="w-full bg-[var(--azae-orange)] text-white hover:bg-[var(--azae-orange-dark)]"
                onClick={() => setMobileOpen(false)}
              >
                <Link href="/dons">{t("donate")}</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full border-[var(--azae-navy)] text-[var(--azae-navy)]"
                onClick={() => setMobileOpen(false)}
              >
                <Link href="/auth/login">{t("login")}</Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
