import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://azaetogo.togo"
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard/",   // espace connecté (sans préfixe locale)
          "/api/",         // routes API (sans préfixe locale)
          "/auth/",        // auth FR (locale par défaut, sans préfixe)
          "/*/auth/",      // auth toutes locales : /en/auth/, et futures locales
          "/*/dashboard/", // dashboard si un jour déplacé sous locale
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
