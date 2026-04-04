import type { Metadata, Viewport } from "next"
import { Playfair_Display, Source_Sans_3 } from "next/font/google"
import "./globals.css"

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
})

const sourceSans3 = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "600", "700"],
})

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://iqra-togo.com"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1A2B4A",
}

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: "IQRA TOGO — Le savoir, la liberté",
    template: "%s — IQRA TOGO",
  },
  description:
    "IQRA TOGO accompagne les élèves et étudiants, soutient les orphelins et renforce les capacités des bénéficiaires togolais.",
  keywords: ["association", "Togo", "éducation", "orphelins", "orientation scolaire", "IQRA TOGO", "Tchamba", "renforcement de capacités", "savoir liberté"],
  authors: [{ name: "IQRA TOGO" }],
  creator: "IQRA TOGO",
  publisher: "IQRA TOGO",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    alternateLocale: "en_US",
    siteName: "IQRA TOGO",
    title: "IQRA TOGO — Le savoir, la liberté",
    description:
      "IQRA TOGO accompagne les élèves et étudiants, soutient les orphelins et renforce les capacités des bénéficiaires togolais.",
    url: BASE,
    images: [
      {
        url: `${BASE}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "IQRA TOGO — Le savoir, la liberté",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "IQRA TOGO — Le savoir, la liberté",
    description:
      "IQRA TOGO accompagne les élèves et étudiants, soutient les orphelins et renforce les capacités des bénéficiaires togolais.",
    images: [`${BASE}/og-image.png`],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  verification: {
    google: "zBDvwxvkcqkyEdQd8zC-3-W4HScFP0fvdB37xKZjqbA",
  },
  alternates: {
    canonical: BASE,
    languages: {
      fr: BASE,
      en: `${BASE}/en`,
    },
  },
}

/* JSON-LD Organisation */
const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "NGO",
  name: "IQRA TOGO",
  alternateName: "IQRA Togo",
  url: BASE,
  logo: `${BASE}/og-image.png`,
  description:
    "Association togolaise œuvrant pour l'orientation scolaire, le soutien aux orphelins et le renforcement des capacités. Devise : Le savoir, la liberté.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Quartier Limamwa",
    addressLocality: "Tchamba",
    addressCountry: "TG",
  },
  contactPoint: {
    "@type": "ContactPoint",
    email: "contact@iqra-togo.com",
    contactType: "customer service",
    availableLanguage: ["French", "English"],
  },
  sameAs: [],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${playfairDisplay.variable} ${sourceSans3.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
