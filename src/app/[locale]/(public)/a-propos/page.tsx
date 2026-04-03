import Image from "next/image"
import Link from "next/link"
import { BookOpen, Users, Globe, Check } from "lucide-react"
import { getTranslations } from "next-intl/server"
import SectionHeader from "@/components/ui/SectionHeader"

export const revalidate = 86400

export async function generateMetadata() {
  const t = await getTranslations("pages.about")
  return {
    title: `${t("title")} — IQRA TOGO`,
    description: "Découvrez l'histoire, la mission, la vision et les valeurs de l'association IQRA TOGO — Le savoir, la liberté.",
  }
}

const TIMELINE = [
  {
    year: "2015",
    title: "Fondation de l'association",
    text: "Création d'IQRA TOGO par un groupe de passionnés de l'éducation et de jeunes professionnels togolais, animés par la devise « Le savoir, la liberté ».",
  },
  {
    year: "2017",
    title: "Premiers programmes d'orientation",
    text: "Lancement du programme d'orientation scolaire et académique, ayant accompagné plus de 80 élèves et étudiants dès sa première année.",
  },
  {
    year: "2020",
    title: "Programme soutien aux orphelins",
    text: "Déploiement du programme d'aide matérielle et financière aux enfants orphelins et vulnérables à Tchamba et dans les régions.",
  },
  {
    year: "2023",
    title: "Renforcement institutionnel",
    text: "Reconnaissance officielle de l'association et lancement des programmes structurés de renforcement de capacités.",
  },
]

const VALUES = ["Savoir", "Liberté", "Solidarité", "Intégrité", "Engagement"]

export default async function AboutPage() {
  const [t, tNav] = await Promise.all([
    getTranslations("pages.about"),
    getTranslations("nav"),
  ])

  const DOMAINS = [
    {
      icon: BookOpen,
      title: "Orientation scolaire et académique",
      text: "Accompagnement personnalisé des élèves et étudiants dans leurs choix de parcours, avec des conseils d'orientation, tutorats et suivis réguliers.",
      stat: "500+ élèves orientés",
      color: "var(--azae-orange)",
    },
    {
      icon: Users,
      title: "Soutien aux orphelins",
      text: "Aide matérielle et financière aux enfants en situation de vulnérabilité : fournitures scolaires, frais de scolarité et accompagnement social.",
      stat: "200+ orphelins soutenus",
      color: "var(--azae-navy)",
    },
    {
      icon: Globe,
      title: "Renforcement de capacités",
      text: "Formations, ateliers pratiques et sessions de développement personnel pour doter les bénéficiaires des compétences dont ils ont besoin.",
      stat: "30+ sessions réalisées",
      color: "var(--azae-green)",
    },
  ]

  return (
    <>
      {/* ══════════════════════════
          SECTION 1 — Hero bannière
      ══════════════════════════ */}
      <section className="relative h-72 overflow-hidden lg:h-96">
        <Image
          src="https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=1600&q=80"
          alt="Équipe IQRA TOGO sur le terrain"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to bottom, rgba(26,43,74,0.7) 0%, rgba(26,43,74,0.4) 100%)",
          }}
        />
        <div className="relative z-10 flex h-full flex-col items-center justify-center gap-3 px-4 text-center">
          <nav aria-label="Fil d'Ariane" className="text-xs text-white/60">
            <ol className="flex items-center gap-1.5">
              <li><Link href="/" className="hover:text-white">{t("accueil")}</Link></li>
              <li aria-hidden="true">/</li>
              <li className="text-white">{t("breadcrumb")}</li>
            </ol>
          </nav>
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-white lg:text-5xl">
            {t("hero_title")}
          </h1>
        </div>
      </section>

      {/* ══════════════════════════
          SECTION 2 — Timeline
      ══════════════════════════ */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-4xl px-4 lg:px-8">
          <SectionHeader
            eyebrow={t("origins_eyebrow")}
            title={t("origins_title")}
            subtitle={t("origins_subtitle")}
            centered
          />
          <div className="relative mt-14">
            <div
              className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2"
              style={{ backgroundColor: "var(--azae-orange)", opacity: 0.25 }}
              aria-hidden="true"
            />
            <div className="space-y-12">
              {TIMELINE.map((item, i) => {
                const isLeft = i % 2 === 0
                return (
                  <div
                    key={item.year}
                    className={`relative flex items-start gap-6 ${isLeft ? "flex-row" : "flex-row-reverse"}`}
                  >
                    <div className={`w-[calc(50%-28px)] ${isLeft ? "text-right" : "text-left"}`}>
                      <p
                        className="font-[family-name:var(--font-playfair)] text-2xl font-bold"
                        style={{ color: "var(--azae-orange)" }}
                      >
                        {item.year}
                      </p>
                      <h3 className="mt-1 font-semibold" style={{ color: "var(--azae-navy)" }}>
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-gray-500">{item.text}</p>
                    </div>
                    <div className="relative z-10 flex-shrink-0">
                      <div
                        className="h-7 w-7 rounded-full border-2 border-white shadow-md"
                        style={{ backgroundColor: "var(--azae-navy)" }}
                      />
                    </div>
                    <div className="w-[calc(50%-28px)]" />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════
          SECTION 3 — Mission / Vision / Valeurs
      ══════════════════════════ */}
      <section className="bg-[#F5F5F5] py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <SectionHeader
            eyebrow={t("identity_eyebrow")}
            title={t("identity_title")}
            centered
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {/* Mission */}
            <div className="rounded-xl bg-green-50 p-8">
              <p
                className="mb-2 text-xs font-semibold uppercase tracking-widest"
                style={{ color: "var(--azae-orange)" }}
              >
                {t("mission_label")}
              </p>
              <h3
                className="mb-3 font-[family-name:var(--font-playfair)] text-xl font-bold"
                style={{ color: "var(--azae-navy)" }}
              >
                {t("mission_question")}
              </h3>
              <p className="text-sm leading-relaxed text-gray-600">{t("mission_text")}</p>
            </div>

            {/* Vision */}
            <div className="rounded-xl p-8" style={{ backgroundColor: "rgba(26,43,74,0.07)" }}>
              <p
                className="mb-2 text-xs font-semibold uppercase tracking-widest"
                style={{ color: "var(--azae-navy)" }}
              >
                {t("vision_label")}
              </p>
              <h3
                className="mb-3 font-[family-name:var(--font-playfair)] text-xl font-bold"
                style={{ color: "var(--azae-navy)" }}
              >
                {t("vision_question")}
              </h3>
              <p className="text-sm leading-relaxed text-gray-600">{t("vision_text")}</p>
            </div>

            {/* Valeurs */}
            <div className="rounded-xl p-8" style={{ backgroundColor: "rgba(34,197,94,0.08)" }}>
              <p
                className="mb-2 text-xs font-semibold uppercase tracking-widest"
                style={{ color: "var(--azae-green)" }}
              >
                {t("values_label")}
              </p>
              <h3
                className="mb-3 font-[family-name:var(--font-playfair)] text-xl font-bold"
                style={{ color: "var(--azae-navy)" }}
              >
                {t("values_question")}
              </h3>
              <ul className="space-y-2">
                {VALUES.map((v) => (
                  <li key={v} className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="h-4 w-4 shrink-0" style={{ color: "var(--azae-green)" }} />
                    {v}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════
          SECTION 4 — Domaines d'Action
      ══════════════════════════ */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <SectionHeader
            eyebrow={t("programs_eyebrow")}
            title={t("programs_title")}
            subtitle={t("programs_subtitle")}
            centered
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {DOMAINS.map(({ icon: Icon, title, text, stat, color }) => (
              <div
                key={title}
                className="group flex flex-col gap-4 rounded-xl border border-gray-100 p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-lg"
                  style={{ backgroundColor: color, opacity: 0.9 }}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3
                  className="font-[family-name:var(--font-playfair)] text-lg font-bold"
                  style={{ color: "var(--azae-navy)" }}
                >
                  {title}
                </h3>
                <p className="flex-1 text-sm leading-relaxed text-gray-500">{text}</p>
                <div
                  className="mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold text-white"
                  style={{ backgroundColor: color }}
                >
                  {stat}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════
          SECTION 5 — CTA
      ══════════════════════════ */}
      <section className="py-20 text-white" style={{ backgroundColor: "var(--azae-navy)" }}>
        <div className="mx-auto max-w-3xl px-4 text-center lg:px-8">
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-white lg:text-4xl">
            {t("cta_title")}
          </h2>
          <p className="mt-4 text-base text-white/75">{t("cta_subtitle")}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/adhesion"
              className="rounded-lg px-6 py-3 text-sm font-semibold text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: "var(--azae-orange)" }}
            >
              {t("cta_join")}
            </Link>
            <Link
              href="/dons"
              className="rounded-lg border border-white/40 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              {t("cta_donate")}
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
