/* Utilitaire settings public — lecture en lecture seule sans authentification */

import { prisma } from "@/lib/db/prisma"

/**
 * Récupère les settings par clés. Retourne un Record vide en cas d'erreur.
 * Silencieux pour ne pas bloquer le rendu des pages publiques.
 */
export async function getSettings(keys: string[]): Promise<Record<string, string>> {
  try {
    const rows = await prisma.setting.findMany({
      where: { key: { in: keys } },
      select: { key: true, value: true },
    })
    return Object.fromEntries(rows.map((r) => [r.key, r.value]))
  } catch {
    return {}
  }
}
