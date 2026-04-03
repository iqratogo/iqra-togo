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

export const revalidate = 300

export default async function HomePage() {
  const [tHero, tHome] = await Promise.all([
    getTranslations("home.hero"),
    getTranslations("home"),
  ])

  const PILLARS = [
    {
      icon: BookOpen,
      title: tHome("pillars.p1_title"),
      text: tHome("pillars.p1_text"),
    },
    {
      icon: Heart,
      title: tHome("pillars.p2_title"),
      text: tHome("pillars.p2_text"),
    },
    {
      icon: Sunrise,
      title: tHome("pillars.p3_title"),
      text: tHome("pillars.p3_text"),
    },
  ]

  return (
    <>
      {/* ═══════ SECTION 1 — Hero ═══════ */}
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

      {/* ═══════ SECTION 2 — Citation + 3 piliers ═══════ */}
      <div
        className="w-full py-8 text-center text-white"
        style={{ backgroundColor: "var(--azae-navy)" }}
      >
        <div className="mx-auto max-w-3xl px-4 lg:px-8">
          <p className="font-[family-name:var(--font-playfair)] text-lg font-medium italic leading-relaxed lg:text-xl">
            &ldquo;{tHome("quote")}&rdquo;
          </p>
          <p className="mt-3 text-sm font-semibold uppercase tracking-widest text-white/80">
            — {tHome("quote_author")}
          </p>
        </div>
      </div>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <SectionHeader
            eyebrow={tHome("pillars.eyebrow")}
            title={tHome("pillars.title")}
            subtitle={tHome("pillars.subtitle")}
            centered
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {PILLARS.map(({ icon: Icon, title, text }) => (
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
                  {tHome("pillars.learn_more")} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ SECTION 3 — Impact ═══════ */}
      <section className="bg-[var(--azae-navy)] py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <SectionHeader
            eyebrow={tHome("impact.eyebrow")}
            title={tHome("impact.title")}
            subtitle={tHome("impact.subtitle")}
            centered
            dark
          />
          <div className="mt-12 grid grid-cols-2 gap-8 md:grid-cols-4">
            <StatCounter value={500} label={tHome("impact.students")} suffix="+" dark />
            <StatCounter value={200} label={tHome("impact.orphans")} suffix="+" dark />
            <StatCounter value={30} label={tHome("impact.trainings")} dark />
            <StatCounter value={15} label={tHome("impact.partners_count")} dark />
          </div>
        </div>
      </section>

      {/* ═══════ SECTION 4 — Projets ═══════ */}
      <Suspense fallback={<LatestProjectsSkeleton />}>
        <LatestProjectsSection />
      </Suspense>

      {/* ═══════ SECTION 5 — Témoignages ═══════ */}
      <TestimonialsCarousel />

      {/* ═══════ SECTION 6 — Dons ═══════ */}
      <section className="bg-green-50 py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-6">
              <SectionHeader
                eyebrow={tHome("donate.section_eyebrow")}
                title={tHome("donate.section_title")}
                subtitle={tHome("donate.section_subtitle")}
              />
              <ul className="space-y-2 text-sm text-gray-600">
                {[
                  tHome("donate.bullet1"),
                  tHome("donate.bullet2"),
                  tHome("donate.bullet3"),
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

      {/* ═══════ SECTION 7 — Actualités ═══════ */}
      <Suspense fallback={<LatestPostsSkeleton />}>
        <LatestPostsSection />
      </Suspense>

      {/* ═══════ SECTION 8 — Newsletter ═══════ */}
      <NewsletterBand />

      {/* ═══════ SECTION 9 — Partenaires ═══════ */}
      <Suspense fallback={<PartnersSkeleton />}>
        <PartnersSection />
      </Suspense>
    </>
  )
}
