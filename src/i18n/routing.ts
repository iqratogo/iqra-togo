import { defineRouting } from "next-intl/routing"

export const routing = defineRouting({
  locales: ["fr", "en"],
  defaultLocale: "fr",
  /* Pas de préfixe pour le français (défaut) :
     /            → FR home
     /a-propos    → FR about
     /en/         → EN home
     /en/about    → EN about          */
  localePrefix: "as-needed",
})
