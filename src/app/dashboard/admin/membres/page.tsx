/* §7.3 Membres Admin */

import type { Metadata } from "next"
import MembresAdmin from "./_components/MembresAdmin"

export const metadata: Metadata = { title: "Membres — Admin IQRA TOGO" }

export default function MembresPage() {
  return <MembresAdmin />
}
