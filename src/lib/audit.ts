/* §9 Audit — utilitaire de traçage centralisé */

import { prisma } from "@/lib/db/prisma"
import { Prisma } from "@prisma/client"

export type AuditAction =
  | "APPLICATION_APPROVED"
  | "APPLICATION_REJECTED"
  | "SETTINGS_UPDATED"
  | "POST_CREATED"
  | "POST_UPDATED"
  | "POST_DELETED"

export type AuditModule =
  | "MEMBRES"
  | "PUBLICATIONS"
  | "PARAMETRES"
  | "COTISATIONS"
  | "NEWSLETTER"
  | "AUTH"

export interface AuditParams {
  userId: string
  action: AuditAction
  module: AuditModule | string
  targetId?: string
  details?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}

/**
 * Insère un log d'audit. Silencieux en cas d'erreur (ne bloque jamais l'action principale).
 */
export async function logAudit(params: AuditParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        id: crypto.randomUUID(),
        userId: params.userId,
        action: params.action,
        module: params.module,
        targetId: params.targetId ?? null,
        details: params.details !== undefined
          ? (params.details as Prisma.InputJsonValue)
          : undefined,
        ipAddress: params.ipAddress ?? null,
        userAgent: params.userAgent ?? null,
        createdAt: new Date(),
      },
    })
  } catch (err) {
    console.error("[audit] Échec de l'enregistrement du log:", err)
  }
}

/**
 * Extrait l'IP et le userAgent depuis une requête Next.js.
 */
export function getRequestContext(req: {
  headers: { get(key: string): string | null }
}): Pick<AuditParams, "ipAddress" | "userAgent"> {
  return {
    ipAddress:
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined,
    userAgent: req.headers.get("user-agent") ?? undefined,
  }
}
