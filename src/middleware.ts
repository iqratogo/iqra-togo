/**
 * Middleware Next.js — sécurité + i18n + protection des routes
 *
 * Ordre d'exécution :
 *   1. En-têtes de sécurité HTTP sur toutes les requêtes
 *   2. Protection des routes /dashboard/* (redirige vers login si non connecté)
 *   3. next-intl : routing i18n (localisation des URLs)
 */

import { NextRequest, NextResponse } from "next/server"
import { auth } from "./lib/auth"
import createIntlMiddleware from "next-intl/middleware"
import { routing } from "./i18n/routing"

/* ── Routes protégées (authentification requise) ──────────────── */
const PROTECTED = ["/dashboard", "/membre"]
const ADMIN_ONLY = ["/dashboard"]

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

/* ── next-intl middleware ──────────────────────────────────────── */
const intlMiddleware = createIntlMiddleware(routing)

/* ── En-têtes de sécurité HTTP ────────────────────────────────── */
function addSecurityHeaders(res: NextResponse): NextResponse {
  // Empêche le clickjacking
  res.headers.set("X-Frame-Options", "DENY")
  // Empêche le sniffing MIME
  res.headers.set("X-Content-Type-Options", "nosniff")
  // Referrer policy stricte
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  // Permissions Policy — désactive les APIs non utilisées
  res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(self), usb=()"
  )
  // HSTS (HTTPS uniquement en production)
  if (process.env.NODE_ENV === "production") {
    res.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    )
  }
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https://images.unsplash.com https://*.supabase.co https://randomuser.me",
    "media-src 'self' https://*.supabase.co",
    "connect-src 'self' https://*.supabase.co https://api.resend.com https://app.paydunya.com",
    "frame-src https://www.google.com https://maps.google.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ")
  res.headers.set("Content-Security-Policy", csp)
  return res
}

/* ── Middleware principal ──────────────────────────────────────── */
export default auth(async function middleware(req: NextRequest & { auth?: unknown }) {
  const { pathname } = req.nextUrl

  /* Ignorer les assets statiques et API routes */
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|webp|avif|woff2?|ttf|css|js)$/)
  ) {
    return NextResponse.next()
  }

  /* Nettoyer le chemin de la locale pour les vérifications */
  const pathWithoutLocale = pathname.replace(/^\/en/, "") || "/"

  /* Protection des routes privées */
  const isProtected = PROTECTED.some((p) => pathWithoutLocale.startsWith(p))
  if (isProtected) {
    const session = (req as { auth?: { user?: { role?: string } } }).auth
    if (!session?.user) {
      const loginUrl = new URL("/auth/login", BASE)
      loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname)
      const res = NextResponse.redirect(loginUrl)
      return addSecurityHeaders(res)
    }

    /* Vérification rôle admin pour /dashboard */
    const isAdminRoute = ADMIN_ONLY.some((p) => pathWithoutLocale.startsWith(p))
    const role = session.user.role as string | undefined
    if (isAdminRoute && !["SUPER_ADMIN", "ADMIN", "EDITOR"].includes(role ?? "")) {
      const res = NextResponse.redirect(new URL("/", BASE))
      return addSecurityHeaders(res)
    }
  }

  /* Appliquer i18n routing */
  const intlResponse = intlMiddleware(req)
  return addSecurityHeaders(intlResponse ?? NextResponse.next())
})

export const config = {
  matcher: [
    /*
     * Correspond à tous les chemins sauf :
     * - _next/static (fichiers statiques)
     * - _next/image (optimisation images)
     * - favicon.ico, manifest, sitemap, robots
     * - fichiers publics avec extension
     */
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff|woff2)).*)",
  ],
}
