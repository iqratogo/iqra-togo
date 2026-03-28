/* §7.2 Nouvelle publication */

import type { Metadata } from "next"
import PublicationForm from "../_components/PublicationForm"

export const metadata: Metadata = { title: "Nouvelle publication — Admin Azaetogo" }

export default function NewPublicationPage() {
  return <PublicationForm />
}
