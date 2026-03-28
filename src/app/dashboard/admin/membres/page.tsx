/* §7.3 Membres Admin */

import type { Metadata } from "next"
import MembresAdmin from "./_components/MembresAdmin"

export const metadata: Metadata = { title: "Membres — Admin Azaetogo" }

export default function MembresPage() {
  return <MembresAdmin />
}
