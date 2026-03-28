/* §7.7 Paramètres Admin */

import type { Metadata } from "next"
import ParametresAdmin from "./_components/ParametresAdmin"

export const metadata: Metadata = { title: "Paramètres — Admin Azaetogo" }

export default function ParametresPage() {
  return <ParametresAdmin />
}
