/* §7 Layout Admin — protégé RBAC, sidebar persistante */

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import type { Metadata } from "next"
import type { ReactNode } from "react"
import AdminSidebar from "./_components/AdminSidebar"

/* IX3 — Noindex défense en profondeur : toutes les pages admin héritent */
export const metadata: Metadata = {
  robots: { index: false, follow: false, googleBot: { index: false } },
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth()

  /* §7.6 RBAC — seuls SUPER_ADMIN, ADMIN, EDITOR accèdent au dashboard admin */
  if (!session) redirect("/auth/login")
  const role = (session.user as { role?: string })?.role ?? "VISITOR"
  if (!["SUPER_ADMIN", "ADMIN", "EDITOR"].includes(role)) {
    redirect("/dashboard/membre")
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
