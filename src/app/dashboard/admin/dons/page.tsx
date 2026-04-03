/* §7.5 Dons Admin */

import type { Metadata } from "next"
import DonsAdmin from "./_components/DonsAdmin"

export const metadata: Metadata = { title: "Dons — Admin IQRA TOGO" }

export default function DonsPage() {
  return <DonsAdmin />
}
