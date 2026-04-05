/* Admin — Registre des cotisations */

import type { Metadata } from "next"
import CotisationsAdmin from "./_components/CotisationsAdmin"

export const metadata: Metadata = {
  title: "Cotisations — Admin IQRA TOGO",
  robots: { index: false },
}

export const revalidate = 0

export default function CotisationsAdminPage() {
  return <CotisationsAdmin />
}
