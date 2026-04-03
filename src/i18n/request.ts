/**
 * next-intl request config — traductions chargées depuis Supabase Storage
 *
 * Priorité de chargement (par locale) :
 *   1. Supabase Storage : bucket "translations" → fichier "{locale}.json" (public)
 *      Permet de mettre à jour les traductions sans redéploiement.
 *   2. Fallback local  : messages/{locale}.json (bundlé dans l'app)
 *
 * Pour uploader/mettre à jour une traduction :
 *   Supabase Dashboard → Storage → bucket "translations" → upload {locale}.json
 *   (ou via l'API : POST /storage/v1/object/translations/{locale}.json avec service key)
 */

import { getRequestConfig } from "next-intl/server"
import { unstable_cache } from "next/cache"
import { routing } from "./routing"

type Messages = Record<string, unknown>

/** Charge les messages depuis Supabase Storage (CDN public, cache 1h) */
const fetchRemoteMessages = unstable_cache(
  async (locale: string): Promise<Messages | null> => {
    const supabaseUrl = process.env.SUPABASE_URL
    if (!supabaseUrl) return null
    try {
      const url = `${supabaseUrl}/storage/v1/object/public/translations/${locale}.json`
      const res = await fetch(url, {
        next: { revalidate: 3600 },
        headers: { "Cache-Control": "public, max-age=3600" },
      })
      if (!res.ok) return null
      return (await res.json()) as Messages
    } catch {
      return null
    }
  },
  ["i18n-remote-messages"],
  { revalidate: 3600, tags: ["translations"] }
)

/** Charge les messages locaux bundlés dans l'app (fallback) */
async function loadLocalMessages(locale: string): Promise<Messages> {
  try {
    return (await import(`../../messages/${locale}.json`)).default as Messages
  } catch {
    // Si la locale n'a pas de fichier local, on retourne les messages français
    return (await import(`../../messages/fr.json`)).default as Messages
  }
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale
  if (!locale || !routing.locales.includes(locale as "fr" | "en")) {
    locale = routing.defaultLocale
  }

  // 1. Essayer Supabase Storage (permet mise à jour sans redéploiement)
  const remoteMessages = await fetchRemoteMessages(locale)
  if (remoteMessages) {
    return { locale, messages: remoteMessages }
  }

  // 2. Fallback : fichier JSON bundlé dans l'app
  const localMessages = await loadLocalMessages(locale)
  return { locale, messages: localMessages }
})
