/* CRM Newsletter — /dashboard/admin/newsletter */

import type { Metadata } from "next"
import { prisma } from "@/lib/db/prisma"
import NewsletterCRM from "./_components/NewsletterCRM"

export const metadata: Metadata = {
  title: "Newsletter CRM — Admin IQRA TOGO",
  robots: { index: false },
}

export const revalidate = 0 // Toujours frais

async function getSubscribers() {
  return prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      isConfirmed: true,
      confirmedAt: true,
      unsubscribedAt: true,
      createdAt: true,
    },
  })
}

export default async function NewsletterPage() {
  const subscribers = await getSubscribers()

  const stats = {
    total: subscribers.length,
    confirmed: subscribers.filter((s) => s.isConfirmed && !s.unsubscribedAt).length,
    pending: subscribers.filter((s) => !s.isConfirmed && !s.unsubscribedAt).length,
    unsubscribed: subscribers.filter((s) => !!s.unsubscribedAt).length,
  }

  return <NewsletterCRM initialSubscribers={subscribers} stats={stats} />
}
