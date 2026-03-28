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

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://azaetogo.togo"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1A2B4A",
}

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: "Azaetogo — ONG Humanitaire Togolaise",
    template: "%s — Azaetogo",
  },
  description:
    "Azaetogo soutient les familles et étudiants togolais dans leur accès à l'éducation et au bien-être social.",
  keywords: ["ONG", "Togo", "humanitaire", "éducation", "solidarité", "Azaetogo", "Lomé"],
  authors: [{ name: "Azaetogo" }],
  creator: "Azaetogo",
  publisher: "Azaetogo",
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
    siteName: "Azaetogo",
    title: "Azaetogo — ONG Humanitaire Togolaise",
    description:
      "Azaetogo soutient les familles et étudiants togolais dans leur accès à l'éducation et au bien-être social.",
    url: BASE,
    images: [
      {
        url: `${BASE}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Azaetogo — ONG Humanitaire Togolaise",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Azaetogo — ONG Humanitaire Togolaise",
    description:
      "Azaetogo soutient les familles et étudiants togolais dans leur accès à l'éducation et au bien-être social.",
    images: [`${BASE}/og-image.png`],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  alternates: {
    canonical: BASE,
    languages: {
      fr: BASE,
      en: `${BASE}/en`,
    },
  },
}

/* JSON-LD Organisation (NGO) */
const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "NGO",
  name: "Azaetogo",
  alternateName: "AZAE Togo",
  url: BASE,
  logo: `${BASE}/og-image.png`,
  description:
    "ONG humanitaire togolaise œuvrant pour l'accès à l'éducation et le bien-être des familles et étudiants togolais.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Lomé",
    addressCountry: "TG",
  },
  contactPoint: {
    "@type": "ContactPoint",
    email: "contact@azaetogo.com",
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
