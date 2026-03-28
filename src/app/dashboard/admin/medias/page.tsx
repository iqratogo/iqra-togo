/* §7.2.4 Médiathèque Admin */

import type { Metadata } from "next"
import MediasAdmin from "./_components/MediasAdmin"

export const metadata: Metadata = { title: "Médiathèque — Admin Azaetogo" }

export default function MediasPage() {
  return <MediasAdmin />
}
