/* CRM Newsletter — /dashboard/admin/newsletter */

import type { Metadata } from "next"
import { prisma } from "@/lib/db/prisma"
import NewsletterCRM from "./_components/NewsletterCRM"

export const metadata: Metadata = {
  title: "Newsletter CRM — Admin IQRA TOGO",
  robots: { index: false },
}

export const revalidate = 0

async function getData() {
  const [subscribers, campaigns] = await Promise.all([
    prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        isConfirmed: true,
        confirmedAt: true,
        unsubscribedAt: true,
        tags: true,
        createdAt: true,
      },
    }),
    prisma.newsletterCampaign.findMany({
      orderBy: { sentAt: "desc" },
      take: 100,
      select: {
        id: true,
        subject: true,
        previewText: true,
        recipients: true,
        status: true,
        segment: true,
        sentAt: true,
      },
    }),
  ])
  return { subscribers, campaigns }
}

export default async function NewsletterPage() {
  const { subscribers, campaigns } = await getData()

  const stats = {
    total: subscribers.length,
    confirmed: subscribers.filter((s: { isConfirmed: boolean; unsubscribedAt: Date | null }) => s.isConfirmed && !s.unsubscribedAt).length,
    pending: subscribers.filter((s: { isConfirmed: boolean; unsubscribedAt: Date | null }) => !s.isConfirmed && !s.unsubscribedAt).length,
    unsubscribed: subscribers.filter((s: { unsubscribedAt: Date | null }) => !!s.unsubscribedAt).length,
  }

  return <NewsletterCRM initialSubscribers={subscribers} initialCampaigns={campaigns} stats={stats} />
}
