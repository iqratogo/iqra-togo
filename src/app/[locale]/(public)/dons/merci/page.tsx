/* §9.2 Page succès don — /dons/merci?ref=XXX */

import type { Metadata } from "next"
import Link from "next/link"
import { CheckCircle, Share2, Home, ArrowRight } from "lucide-react"
import { prisma } from "@/lib/db/prisma"

export const metadata: Metadata = {
  title: "Merci pour votre don — IQRA TOGO",
  robots: { index: false, follow: false },
}

interface PageProps {
  searchParams: Promise<{ ref?: string }>
}

const AFFECTATION_LABELS: Record<string, string> = {
  GENERAL: "Fonds général",
  BOURSES_EDUCATION: "Bourses éducation",
  SOUTIEN_FAMILLES: "Soutien familles",
  PROJETS_TERRAIN: "Projets terrain",
}

export default async function DonsMerciPage({ searchParams }: PageProps) {
  const { ref } = await searchParams

  const donation = ref
    ? await prisma.donation
        .findUnique({
          where: { id: ref },
          select: {
            amount: true, affectation: true, donorFirstName: true, status: true,
          },
        })
        .catch(() => null)
    : null

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/dons`
  const shareText = "Je viens de faire un don à l'association IQRA TOGO pour soutenir les familles et étudiants togolais."

  return (
    <section className="min-h-[70vh] bg-[#F5F5F5] py-20">
      <div className="mx-auto max-w-lg px-4 text-center">
        {/* §9.2 Animation succès */}
        <div
          className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full"
          style={{ backgroundColor: "var(--azae-green)" }}
        >
          <CheckCircle className="h-12 w-12 text-white" />
        </div>

        <h1
          className="font-[family-name:var(--font-playfair)] text-3xl font-bold"
          style={{ color: "var(--azae-navy)" }}
        >
          {donation?.donorFirstName
            ? `Merci, ${donation.donorFirstName} !`
            : "Merci pour votre générosité !"}
        </h1>

        {donation && donation.status === "SUCCESS" && (
          <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4">
            <p className="text-green-700">
              Votre don de{" "}
              <strong>{donation.amount.toLocaleString("fr-FR")} FCFA</strong> pour{" "}
              <strong>{AFFECTATION_LABELS[donation.affectation] ?? "nos programmes"}</strong>{" "}
              a bien été reçu.
            </p>
          </div>
        )}

        {donation && donation.status === "PENDING" && (
          <div className="mt-4 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
            <p className="text-yellow-700">
              Votre paiement est en cours de traitement. Vous recevrez une confirmation par email.
            </p>
          </div>
        )}

        <p className="mt-6 text-gray-600">
          Grâce à votre don, nous pouvons continuer à soutenir les familles vulnérables
          et les étudiants togolais. Un email de remerciement vous a été envoyé.
        </p>

        {/* §9.2 — Partage social */}
        <div className="mt-8">
          <p className="mb-3 text-sm font-medium text-gray-700">
            <Share2 className="mr-1.5 inline h-4 w-4" />
            Partagez votre geste et encouragez vos proches à donner
          </p>
          <div className="flex justify-center gap-3">
            {[
              {
                label: "Facebook",
                href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
                bg: "#1877F2",
              },
              {
                label: "X",
                href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
                bg: "#000000",
              },
              {
                label: "WhatsApp",
                href: `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`,
                bg: "#25D366",
              },
            ].map(({ label, href, bg }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: bg }}
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-[var(--azae-orange)] hover:text-[var(--azae-orange)]"
          >
            <Home className="h-4 w-4" />
            Retour à l'accueil
          </Link>
          <Link
            href="/actualites/projets"
            className="flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white"
            style={{ backgroundColor: "var(--azae-orange)" }}
          >
            Voir nos projets <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
