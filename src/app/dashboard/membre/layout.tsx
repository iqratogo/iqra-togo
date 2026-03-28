/* §8 Layout Espace Membre — RBAC MEMBER */

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import type { Metadata } from "next"
import type { ReactNode } from "react"
import MembreSidebar from "./_components/MembreSidebar"

/* IX3 — Noindex défense en profondeur : toutes les pages membre héritent */
export const metadata: Metadata = {
  robots: { index: false, follow: false, googleBot: { index: false } },
}

export default async function MembreLayout({ children }: { children: ReactNode }) {
  const session = await auth()
  if (!session) redirect("/auth/login")

  const role = (session.user as { role?: string })?.role ?? "VISITOR"
  if (!["MEMBER", "EDITOR", "ADMIN", "SUPER_ADMIN"].includes(role)) {
    redirect("/auth/login?error=pending_approval")
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <MembreSidebar userName={(session.user as { name?: string })?.name ?? ""} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
