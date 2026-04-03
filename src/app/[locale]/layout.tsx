import { NextIntlClientProvider, hasLocale } from "next-intl"
import { getMessages } from "next-intl/server"
import { notFound } from "next/navigation"
import { routing } from "@/i18n/routing"
import type { ReactNode } from "react"
import SetHtmlLang from "./_components/SetHtmlLang"

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://iqra-togo.com"

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()

  const messages = await getMessages()

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {/* Corrige l'attribut lang dynamiquement côté client */}
      <SetHtmlLang locale={locale} />
      {/* hreflang injectés dans <head> via next/head n'est pas disponible en App Router.
          Ils sont gérés dans metadata.alternates (layout.tsx root) et sitemap.ts */}
      {children}
    </NextIntlClientProvider>
  )
}
