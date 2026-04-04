import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://iqra-togo.com"
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
          "/dons/merci",   // page remerciement don (locale par défaut)
          "/dons/echec",   // page échec paiement (locale par défaut)
          "/*/dons/merci", // idem toutes locales
          "/*/dons/echec", // idem toutes locales
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
