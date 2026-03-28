/* Rate limiting in-memory — par IP, pour endpoints sensibles */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Nettoyage périodique des entrées expirées
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store.entries()) {
      if (entry.resetAt < now) store.delete(key)
    }
  }, 60_000)
}

/**
 * Vérifie si l'IP a dépassé la limite de requêtes.
 * @returns true si la requête est bloquée (limite atteinte)
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

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for")
  const realIp = req.headers.get("x-real-ip")
  return forwarded?.split(",")[0]?.trim() ?? realIp?.trim() ?? "127.0.0.1"
}
