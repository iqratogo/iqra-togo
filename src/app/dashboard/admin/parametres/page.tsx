/* §7.7 Paramètres Admin */

import type { Metadata } from "next"
import ParametresAdmin from "./_components/ParametresAdmin"

export const metadata: Metadata = { title: "Paramètres — Admin IQRA TOGO" }

export default function ParametresPage() {
  return <ParametresAdmin />
}
