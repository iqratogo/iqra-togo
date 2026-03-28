/* §7.2 Édition publication */

import type { Metadata } from "next"
import { prisma } from "@/lib/db/prisma"
import { notFound } from "next/navigation"
import PublicationForm from "../_components/PublicationForm"

export const metadata: Metadata = { title: "Modifier publication — Admin Azaetogo" }

export default async function EditPublicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = await prisma.post.findUnique({ where: { id } })
  if (!post) notFound()

  return (
    <PublicationForm
      postId={post.id}
      initialData={{
        title: post.title,
        excerpt: post.excerpt ?? "",
        content: post.content,
        category: post.category as "ACTUALITE" | "PROJET" | "COMMUNIQUE" | "PARTENAIRE",
        status: post.status,
        featuredImage: post.featuredImage ?? "",
        pdfUrl: post.pdfUrl ?? "",
        seoTitle: post.seoTitle ?? "",
        seoDescription: post.seoDescription ?? "",
      }}
    />
  )
}
