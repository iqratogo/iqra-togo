/* Protection CSRF — validation de l'en-tête Origin sur les endpoints publics */
/* Les requêtes navigateur cross-origin incluent toujours un header Origin.   */
/* Si Origin est présent et ne correspond pas au domaine de l'app, on bloque. */
/* Les appels serveur-à-serveur (ex: webhooks) n'ont pas d'Origin → autorisés. */

import { NextRequest, NextResponse } from "next/server"

/**
 * Vérifie que la requête provient du même domaine que l'app.
 * @returns true si la requête est autorisée, false si cross-origin suspect
 */
export function isSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin")

  // Pas d'Origin → appel serveur ou outil (curl, Postman) — autorisé
  if (!origin) return true

  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  // APP_URL non configurée → impossible de valider, on laisse passer
  if (!appUrl) return true

  try {
    return new URL(origin).origin === new URL(appUrl).origin
  } catch {
    return false
  }
}

/** Réponse standard en cas de requête cross-origin refusée */
export function csrfForbidden(): NextResponse {
  return NextResponse.json({ error: "Requête non autorisée." }, { status: 403 })
}
