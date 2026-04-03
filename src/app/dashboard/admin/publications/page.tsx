/* §7.2 Publications Admin — liste */

import type { Metadata } from "next"
import PublicationsList from "./_components/PublicationsList"

export const metadata: Metadata = { title: "Publications — Admin IQRA TOGO" }

export default function PublicationsPage() {
  return <PublicationsList />
}
