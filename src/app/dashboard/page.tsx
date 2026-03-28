/* Routeur de tableau de bord — redirige selon le rôle de l'utilisateur connecté */

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN", "EDITOR"]
const MEMBER_ROLES = ["MEMBER"]

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect("/auth/login")
  }

  const role = (session.user as { role?: string })?.role ?? "VISITOR"

  if (ADMIN_ROLES.includes(role)) {
    redirect("/dashboard/admin")
  }

  if (MEMBER_ROLES.includes(role)) {
    redirect("/dashboard/membre")
  }

  /* VISITOR ou statut PENDING — compte en attente de validation */
  redirect("/auth/login?error=pending_approval")
}
