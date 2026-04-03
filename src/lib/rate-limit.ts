/**
 * Rate limiting in-memory — par IP + clé, pour endpoints sensibles
 *
 * ⚠️ Serverless Vercel : chaque instance a son propre store en mémoire.
 * Ce rate limiter est donc par-instance, pas global.
 * Pour un rate limiting global cross-instances, utiliser Upstash Redis.
 * Pour une petite app à faible trafic, ce comportement est acceptable.
 *
 * Fuite mémoire évitée : nettoyage automatique des entrées expirées
 * toutes les 5 minutes (max 10 000 entrées en mémoire).
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()
const MAX_STORE_SIZE = 10_000

/** Nettoie les entrées expirées (appelé automatiquement) */
function cleanup() {
  const now = Date.now()
  // Si le store est trop grand, purger agressivement
  if (store.size > MAX_STORE_SIZE) {
    store.clear()
    return
  }
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) store.delete(key)
  }
}

// Nettoyage toutes les 5 minutes (serverless-safe : vérifie typeof)
if (typeof setInterval !== "undefined") {
  const timer = setInterval(cleanup, 5 * 60_000)
  // Évite de bloquer l'arrêt du process Node.js
  if (typeof timer === "object" && timer !== null && "unref" in timer) {
    (timer as NodeJS.Timeout).unref()
  }
}

/**
 * Vérifie si l'IP a dépassé la limite de requêtes.
 * @returns true si la requête doit être bloquée (limite atteinte)
 */
export function isRateLimited(
  ip: string,
  key: string,
  maxRequests: number,
  windowMs: number
): boolean {
  const now = Date.now()
  const storeKey = `${key}:${ip}`
  const entry = store.get(storeKey)

  if (!entry || entry.resetAt < now) {
    store.set(storeKey, { count: 1, resetAt: now + windowMs })
    return false
  }

  if (entry.count >= maxRequests) return true

  entry.count++
  return false
}

/**
 * Extrait l'IP réelle du client depuis les headers (Vercel/proxy-aware).
 * Sécurisé : ne fait pas confiance à x-forwarded-for en dehors d'un proxy de confiance.
 */
export function getClientIp(req: Request): string {
  // Vercel injecte l'IP réelle dans x-real-ip
  const realIp = req.headers.get("x-real-ip")?.trim()
  if (realIp) return realIp

  // Fallback : premier élément de x-forwarded-for (attention : peut être forgé)
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
  if (forwarded) return forwarded

  return "127.0.0.1"
}
