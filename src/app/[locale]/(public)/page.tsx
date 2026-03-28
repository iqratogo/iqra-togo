import { Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import { BookOpen, Heart, Sunrise, ArrowRight } from "lucide-react"
import { getTranslations } from "next-intl/server"
import SectionHeader from "@/components/ui/SectionHeader"
import StatCounter from "@/components/ui/StatCounter"
import DonationWidget from "@/components/ui/DonationWidget"
import HeroSection from "./_components/HeroSection"
import TestimonialsCarousel from "./_components/TestimonialsCarousel"
import NewsletterBand from "./_components/NewsletterBand"
import LatestProjectsSection, { LatestProjectsSkeleton } from "./_components/LatestProjectsSection"
import LatestPostsSection, { LatestPostsSkeleton } from "./_components/LatestPostsSection"
import PartnersSection, { PartnersSkeleton } from "./_components/PartnersSection"

/* P3 — Shell statique mis en cache et revalidé toutes les 5 min */
export const revalidate = 300

/* ── Page ── */

export default async function HomePage() {
  const tHero = await getTranslations("home.hero")

  return (
    <>
      {/* ═══════════════════════════════════════════
          SECTION 1 — Hero (§5.1.1)
      ═══════════════════════════════════════════ */}
      <HeroSection
        badge={tHero("badge")}
        title={tHero("title")}
        subtitle={tHero("subtitle")}
        donateBtnLabel={tHero("donate_btn")}
        discoverBtnLabel={tHero("discover_btn")}
        statLabels={{
          families: tHero("families"),
          members: tHero("members"),
          projectsDone: tHero("projects_done"),
        }}
      />

      {/* ═══════════════════════════════════════════
          SECTION 2 — Mission (§5.1.2)
          Bandeau orangé + citation fondatrice + 3 piliers
      ═══════════════════════════════════════════ */}

      {/* §5.1.2 — Bandeau orangé full-width avec citation fondatrice */}
      <div
        className="w-full py-8 text-center text-white"
        style={{ backgroundColor: "var(--azae-orange)" }}
      >
        <div className="mx-auto max-w-3xl px-4 lg:px-8">
          <p className="font-[family-name:var(--font-playfair)] text-lg font-medium italic leading-relaxed lg:text-xl">
            &ldquo;Parce que chaque enfant mérite une chance, chaque famille mérite la dignité,
            et chaque communauté mérite l'espoir — nous agissons.&rdquo;
          </p>
          <p className="mt-3 text-sm font-semibold uppercase tracking-widest text-white/80">
            — Fondateurs d'Azaetogo, 2010
          </p>
        </div>
      </div>

      {/* §5.1.2 — 3 piliers iconographiques */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <SectionHeader
            eyebrow="Notre Mission"
            title="Ce qui nous anime"
            subtitle="Depuis plus de 15 ans, Azaetogo agit au cœur des communautés togolaises pour un avenir plus juste."
            centered
          />

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: BookOpen,
                title: "Éducation",
                text: "Nous finançons les frais scolaires et universitaires d'étudiants sans ressources pour leur permettre de construire leur avenir.",
              },
              {
                icon: Heart,
                title: "Soutien Social",
                text: "Aide alimentaire, médicale et psychologique auprès des familles vulnérables dans toutes les régions du Togo.",
              },
              {
                icon: Sunrise,
                title: "Espoir",
                text: "Programmes d'insertion, formations professionnelles et projets communautaires pour raviver la dignité et l'espoir.",
              },
            ].map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="group rounded-xl border border-gray-100 p-6 shadow-sm transition-shadow duration-300 hover:shadow-md"
              >
                <div
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg"
                  style={{ backgroundColor: "var(--azae-orange)" }}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3
                  className="mb-2 font-[family-name:var(--font-playfair)] text-lg font-bold"
                  style={{ color: "var(--azae-navy)" }}
                >
                  {title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-500">{text}</p>
                <Link
                  href="/a-propos"
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium transition-colors"
                  style={{ color: "var(--azae-orange)" }}
                >
                  En savoir plus <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 3 — Impact Chiffres (§5.1.3)
          4 compteurs animés : familles, étudiants, projets, partenaires
      ═══════════════════════════════════════════ */}
      <section className="bg-[var(--azae-navy)] py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <SectionHeader
            eyebrow="Notre Impact"
            title="Des chiffres qui parlent"
            subtitle="Chaque année, notre engagement se traduit en actions concrètes et résultats mesurables."
            centered
            dark
          />
          <div className="mt-12 grid grid-cols-2 gap-8 md:grid-cols-4">
            <StatCounter value={1200} label="Familles aidées" suffix="+" dark />
            <StatCounter value={450} label="Étudiants soutenus" suffix="+" dark />
            <StatCounter value={38} label="Projets réalisés" dark />
            <StatCounter value={24} label="Partenaires actifs" dark />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 4 — Projets Récents (§5.1.4)
          P1 — Suspense : la page s'affiche sans attendre la DB
      ═══════════════════════════════════════════ */}
      <Suspense fallback={<LatestProjectsSkeleton />}>
        <LatestProjectsSection />
      </Suspense>

      {/* ═══════════════════════════════════════════
          SECTION 5 — Témoignages (§5.1.5)
          Carrousel autoplay 5s — dots + flèches
      ═══════════════════════════════════════════ */}
      <TestimonialsCarousel />

      {/* ═══════════════════════════════════════════
          SECTION 6 — Appel aux Dons (§5.1.6)
      ═══════════════════════════════════════════ */}
      <section className="bg-orange-50 py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Texte + widget */}
            <div className="space-y-6">
              <SectionHeader
                eyebrow="Soutenir notre cause"
                title="Votre don change une vie"
                subtitle="1 000 FCFA peuvent couvrir les fournitures scolaires d'un enfant pour un mois. Chaque geste compte, quelle que soit sa taille."
              />
              <ul className="space-y-2 text-sm text-gray-600">
                {[
                  "Paiement 100 % sécurisé via PayDunya",
                  "Reçu fiscal disponible sur demande",
                  "Transparence totale sur l'utilisation des fonds",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: "var(--azae-orange)" }}
                    />
                    {item}
                  </li>
                ))}
              </ul>
              <DonationWidget />
            </div>

            {/* Image émotionnelle §5.1.6 */}
            <div className="relative hidden h-[520px] overflow-hidden rounded-2xl lg:block">
              <Image
                src="https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=800&q=80"
                alt="Enfant qui étudie au Togo"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 50vw, 0px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--azae-navy)]/30 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 7 — Actualités (§5.1.7)
          P1 — Suspense : stream indépendant des projets
      ═══════════════════════════════════════════ */}
      <Suspense fallback={<LatestPostsSkeleton />}>
        <LatestPostsSection />
      </Suspense>

      {/* ═══════════════════════════════════════════
          SECTION 8 — Newsletter (§5.1.9)
          Bandeau double opt-in avant les partenaires
      ═══════════════════════════════════════════ */}
      <NewsletterBand />

      {/* ═══════════════════════════════════════════
          SECTION 9 — Partenaires (§5.1.8)
          P1 — Suspense : ne bloque pas le reste de la page
      ═══════════════════════════════════════════ */}
      <Suspense fallback={<PartnersSkeleton />}>
        <PartnersSection />
      </Suspense>
    </>
  )
}
