/* Middleware — next-intl locale routing + NextAuth RBAC + security headers */

import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth/config"
import { NextResponse } from "next/server"
import createIntlMiddleware from "next-intl/middleware"
import { routing } from "./i18n/routing"

const intlMiddleware = createIntlMiddleware(routing)

const isDev = process.env.NODE_ENV === "development"

const SECURITY_HEADERS: Record<string, string> = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "X-XSS-Protection": "1; mode=block",
  /* S8 — preload ajouté pour soumission à la HSTS preload list */
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  /* S7 — 'unsafe-eval' requis par Next.js dev (React Refresh/HMR) ; supprimé en prod */
  "Content-Security-Policy": [
    "default-src 'self'",
    "img-src 'self' data: blob: https://images.unsplash.com https://*.supabase.co https://randomuser.me https:",
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://www.googletagmanager.com`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://*.supabase.co https://api.resend.com https://app.paydunya.com",
    "frame-src https://www.google.com/maps/ https://maps.google.com/ https://www.google.com",
    "media-src 'self' blob: https://*.supabase.co",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; "),
}

/* S10 — Origine autorisée pour les appels API (navigateur uniquement, CORS) */
const APP_ORIGIN = process.env.NEXT_PUBLIC_APP_URL ?? ""

function applyHeaders(res: NextResponse): NextResponse {
  Object.entries(SECURITY_HEADERS).forEach(([k, v]) => res.headers.set(k, v))
  /* CORS : autorise uniquement le domaine de l'app ; les webhooks (server-to-server)
     ne sont pas concernés par CORS (enforcement navigateur uniquement). */
  if (APP_ORIGIN) {
    res.headers.set("Access-Control-Allow-Origin", APP_ORIGIN)
    res.headers.set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")
    res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
    res.headers.set("Vary", "Origin")
  }
  return res
}

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { pathname } = req.nextUrl

  /* ── Dashboard — protection auth + RBAC ── */
  if (pathname.startsWith("/dashboard")) {
    if (!req.auth) {
      const loginUrl = new URL("/auth/login", req.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return applyHeaders(NextResponse.redirect(loginUrl))
    }
    if (pathname.startsWith("/dashboard/admin")) {
      const role = (req.auth.user as { role?: string })?.role ?? "VISITOR"
      if (!["SUPER_ADMIN", "ADMIN", "EDITOR"].includes(role)) {
        return applyHeaders(NextResponse.redirect(new URL("/dashboard/membre", req.url)))
      }
    }
    return applyHeaders(NextResponse.next())
  }

  /* ── API routes — security headers only ── */
  if (pathname.startsWith("/api")) {
    return applyHeaders(NextResponse.next())
  }

  /* ── Pages publiques — i18n locale routing + security headers ── */
  const res = intlMiddleware(req)
  Object.entries(SECURITY_HEADERS).forEach(([k, v]) => res.headers.set(k, v))
  return res
})

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|manifest\\.webmanifest|sitemap\\.xml|robots\\.txt|uploads/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?)).*)",
  ],
}
