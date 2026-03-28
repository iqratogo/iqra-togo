import { redirect } from "next/navigation"

// /adhesion redirige vers le formulaire d'adhésion officiel
export default function AdhesionPage() {
  redirect("/auth/signup")
}
