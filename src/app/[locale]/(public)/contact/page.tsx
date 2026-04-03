/* §5.8 Page Contact (/contact) */

import Link from "next/link"
import {
  MapPin,
  Mail,
  Phone,
  MessageCircle,
  ChevronRight,
} from "lucide-react"
import { getTranslations } from "next-intl/server"
import { FacebookIcon, InstagramIcon, YoutubeIcon, LinkedinIcon } from "@/components/ui/SocialIcons"
import ContactForm from "./_components/ContactForm"

/* P3 — Page statique : revalidation toutes les 24h */
export const revalidate = 86400

export async function generateMetadata() {
  const t = await getTranslations("pages.contact")
  return {
    title: `${t("title")} — IQRA TOGO`,
    description: t("subtitle"),
  }
}

/* §5.8 — liens réseaux sociaux */
const SOCIAL_LINKS = [
  { icon: FacebookIcon, href: "#", label: "Facebook" },
  { icon: InstagramIcon, href: "#", label: "Instagram" },
  { icon: YoutubeIcon, href: "#", label: "YouTube" },
  { icon: LinkedinIcon, href: "#", label: "LinkedIn" },
]

export default async function ContactPage() {
  const [t, tNav] = await Promise.all([
    getTranslations("pages.contact"),
    getTranslations("nav"),
  ])

  return (
    <>
      {/* ── Hero banner §5.8 ── */}
      <section
        className="relative py-20 text-white"
        style={{
          background:
            "linear-gradient(135deg, var(--azae-navy) 0%, var(--azae-navy-light) 100%)",
        }}
      >
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          {/* Breadcrumb */}
          <nav aria-label="Fil d'Ariane" className="mb-6">
            <ol className="flex items-center gap-1.5 text-xs text-white/60">
              <li>
                <Link href="/" className="transition-colors hover:text-white">
                  {tNav("home")}
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="h-3 w-3" />
              </li>
              <li className="text-white" aria-current="page">
                {t("title")}
              </li>
            </ol>
          </nav>

          <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-bold text-white lg:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-4 max-w-xl text-base text-white/80 lg:text-lg">
            {t("subtitle")}
          </p>
        </div>
      </section>

      {/* ── Contenu principal ── */}
      <section className="bg-[#F5F5F5] py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2">

            {/* ── Colonne gauche : formulaire ── */}
            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <h2
                className="mb-6 font-[family-name:var(--font-playfair)] text-2xl font-bold"
                style={{ color: "var(--azae-navy)" }}
              >
                {t("form_title")}
              </h2>
              <ContactForm />
            </div>

            {/* ── Colonne droite : coordonnées + carte ── */}
            <div className="space-y-6">

              {/* Coordonnées §5.8 */}
              <div className="rounded-2xl bg-white p-8 shadow-sm">
                <h2
                  className="mb-6 font-[family-name:var(--font-playfair)] text-2xl font-bold"
                  style={{ color: "var(--azae-navy)" }}
                >
                  {t("coords_title")}
                </h2>
                <address className="space-y-4 not-italic">
                  {/* Adresse */}
                  <div className="flex items-start gap-3">
                    <div
                      className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: "var(--azae-orange)", opacity: 0.9 }}
                    >
                      <MapPin className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{t("address")}</p>
                      <p className="text-sm text-gray-600">
                        {t("address_val")}
                      </p>
                    </div>
                  </div>

                  {/* Email §5.8 */}
                  <div className="flex items-start gap-3">
                    <div
                      className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: "var(--azae-orange)", opacity: 0.9 }}
                    >
                      <Mail className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{t("email_label")}</p>
                      <a
                        href="mailto:contact@iqra-togo.com"
                        className="text-sm text-gray-600 transition-colors hover:text-[var(--azae-orange)]"
                      >
                        contact@iqra-togo.com
                      </a>
                    </div>
                  </div>

                  {/* Téléphone §5.8 */}
                  <div className="flex items-start gap-3">
                    <div
                      className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: "var(--azae-orange)", opacity: 0.9 }}
                    >
                      <Phone className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{t("phone_label")}</p>
                      <a
                        href="tel:+22890000000"
                        className="text-sm text-gray-600 transition-colors hover:text-[var(--azae-orange)]"
                      >
                        +228 90 00 00 00
                      </a>
                    </div>
                  </div>

                  {/* WhatsApp §5.8 */}
                  <div className="flex items-start gap-3">
                    <div
                      className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: "#25D366" }}
                    >
                      <MessageCircle className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{t("whatsapp_label")}</p>
                      <a
                        href="https://wa.me/22890000000"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-600 transition-colors hover:text-[var(--azae-orange)]"
                      >
                        +228 90 00 00 00
                      </a>
                    </div>
                  </div>
                </address>

                {/* Réseaux sociaux §5.8 */}
                <div className="mt-6 border-t border-gray-100 pt-6">
                  <p className="mb-3 text-sm font-semibold text-gray-900">
                    {t("follow")}
                  </p>
                  <div className="flex gap-2">
                    {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                      <a
                        key={label}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:border-[var(--azae-orange)] hover:text-[var(--azae-orange)]"
                      >
                        <Icon className="h-4 w-4" />
                      </a>
                    ))}
                    {/* TikTok §5.8 */}
                    <a
                      href="#"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="TikTok"
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:border-[var(--azae-orange)] hover:text-[var(--azae-orange)]"
                    >
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.16 8.16 0 004.77 1.52V6.75a4.85 4.85 0 01-1-.06z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>

              {/* Carte Google Maps §5.8 — iframe embed (pas d'API key requis) */}
              <div className="overflow-hidden rounded-2xl shadow-sm">
                <iframe
                  title="Localisation IQRA TOGO — Quartier Limamwa, Tchamba"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31698.5!2d1.2133!3d9.0334!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1123d96cb8b4b5d3%3A0x5a3b6b3b3b3b3b3b!2sTchamba%2C%20Togo!5e0!3m2!1sfr!2sfr!4v1706000000000!5m2!1sfr!2sfr"
                  width="100%"
                  height="280"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              {/* Horaires d'ouverture */}
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h3
                  className="mb-3 font-[family-name:var(--font-playfair)] text-lg font-bold"
                  style={{ color: "var(--azae-navy)" }}
                >
                  Horaires
                </h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li className="flex justify-between">
                    <span>Lundi – Vendredi</span>
                    <span className="font-medium">8h00 – 17h00</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Samedi</span>
                    <span className="font-medium">9h00 – 13h00</span>
                  </li>
                  <li className="flex justify-between text-gray-400">
                    <span>Dimanche</span>
                    <span>Fermé</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
