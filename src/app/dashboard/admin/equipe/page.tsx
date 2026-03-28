/* Page admin Équipe — SUPER_ADMIN + ADMIN uniquement */

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import EquipeAdmin from "./_components/EquipeAdmin"

export default async function EquipePage() {
  const session = await auth()
  const role = (session?.user as { role?: string })?.role ?? ""
  if (!["SUPER_ADMIN", "ADMIN"].includes(role)) redirect("/dashboard/admin")

  return <EquipeAdmin />
}
