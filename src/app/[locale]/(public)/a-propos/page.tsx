import Image from "next/image"
import Link from "next/link"
import { BookOpen, Users, Globe, Check } from "lucide-react"
import SectionHeader from "@/components/ui/SectionHeader"

/* P3 — Page statique : revalidation toutes les 24h */
export const revalidate = 86400

export const metadata = {
  title: "À Propos — Azaetogo",
  description:
    "Découvrez l'histoire, la mission, la vision et les valeurs de l'ONG humanitaire Azaetogo au Togo.",
}

const TIMELINE = [
  {
    year: "2010",
    title: "Fondation de l'association",
    text: "Création d'Azaetogo par un groupe d'étudiants et de professionnels togolais de la diaspora, animés par la volonté d'agir concrètement.",
  },
  {
    year: "2015",
    title: "Premiers programmes d'éducation",
    text: "Lancement du programme de bourses scolaires ayant bénéficié à plus de 80 étudiants lors de sa première année.",
  },
  {
    year: "2019",
    title: "Extension nationale",
    text: "Déploiement des activités dans 6 nouvelles régions du pays, avec l'ouverture d'un bureau permanent à Lomé.",
  },
  {
    year: "2023",
    title: "Transition en ONG officielle",
    text: "Reconnaissance officielle par les autorités togolaises, marquant l'entrée dans une nouvelle ère d'impact et de responsabilité.",
  },
]

const DOMAINS = [
  {
    icon: BookOpen,
    title: "Accès à l'éducation",
    text: "Bourses, fournitures, frais de scolarité : nous supprimons les barrières financières pour 450 étudiants soutenus à ce jour.",
    stat: "450 étudiants soutenus",
    color: "var(--azae-orange)",
  },
  {
    icon: Users,
    title: "Soutien familial",
    text: "Aide alimentaire, médicale et accompagnement psychosocial pour les familles en situation précaire.",
    stat: "1 200 familles accompagnées",
    color: "var(--azae-navy)",
  },
  {
    icon: Globe,
    title: "Intégration sociale",
    text: "Formations professionnelles, insertions et projets communautaires pour une participation citoyenne active.",
    stat: "8 régions couvertes",
    color: "var(--azae-green)",
  },
]

export default function AboutPage() {
  return (
    <>
      {/* ══════════════════════════
          SECTION 1 — Hero bannière
      ══════════════════════════ */}
      <section className="relative h-72 overflow-hidden lg:h-96">
        <Image
          src="https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=1600&q=80"
          alt="Équipe Azaetogo sur le terrain"
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
              <li><Link href="/" className="hover:text-white">Accueil</Link></li>
              <li aria-hidden="true">/</li>
              <li className="text-white">À Propos</li>
            </ol>
          </nav>
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-white lg:text-5xl">
            Notre Histoire
          </h1>
        </div>
      </section>

      {/* ══════════════════════════
          SECTION 2 — Timeline
      ══════════════════════════ */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-4xl px-4 lg:px-8">
          <SectionHeader
            eyebrow="Nos Origines"
            title="Un engagement qui dure"
            subtitle="Retour sur les grandes étapes qui ont forgé l'identité d'Azaetogo."
            centered
          />

          <div className="relative mt-14">
            {/* Ligne verticale */}
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
                    {/* Texte */}
                    <div className={`w-[calc(50%-28px)] ${isLeft ? "text-right" : "text-left"}`}>
                      <p
                        className="font-[family-name:var(--font-playfair)] text-2xl font-bold"
                        style={{ color: "var(--azae-orange)" }}
                      >
                        {item.year}
                      </p>
                      <h3
                        className="mt-1 font-semibold"
                        style={{ color: "var(--azae-navy)" }}
                      >
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-gray-500">{item.text}</p>
                    </div>

                    {/* Point central */}
                    <div className="relative z-10 flex-shrink-0">
                      <div
                        className="h-7 w-7 rounded-full border-2 border-white shadow-md"
                        style={{ backgroundColor: "var(--azae-navy)" }}
                      />
                    </div>

                    {/* Espace vide de l'autre côté */}
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
            eyebrow="Notre Identité"
            title="Ce qui nous définit"
            centered
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {/* Mission */}
            <div className="rounded-xl bg-orange-50 p-8">
              <p
                className="mb-2 text-xs font-semibold uppercase tracking-widest"
                style={{ color: "var(--azae-orange)" }}
              >
                Mission
              </p>
              <h3
                className="mb-3 font-[family-name:var(--font-playfair)] text-xl font-bold"
                style={{ color: "var(--azae-navy)" }}
              >
                Pourquoi existons-nous ?
              </h3>
              <p className="text-sm leading-relaxed text-gray-600">
                Offrir à chaque Togolais·e, quelle que soit son origine, les ressources et le soutien
                nécessaires pour vivre dignement et s'épanouir pleinement.
              </p>
            </div>

            {/* Vision */}
            <div className="rounded-xl p-8" style={{ backgroundColor: "rgba(26,43,74,0.07)" }}>
              <p
                className="mb-2 text-xs font-semibold uppercase tracking-widest"
                style={{ color: "var(--azae-navy)" }}
              >
                Vision
              </p>
              <h3
                className="mb-3 font-[family-name:var(--font-playfair)] text-xl font-bold"
                style={{ color: "var(--azae-navy)" }}
              >
                Où allons-nous ?
              </h3>
              <p className="text-sm leading-relaxed text-gray-600">
                Un Togo où chaque enfant accède à une éducation de qualité, chaque famille vit en
                sécurité et chaque citoyen contribue au développement de sa communauté.
              </p>
            </div>

            {/* Valeurs */}
            <div className="rounded-xl p-8" style={{ backgroundColor: "rgba(46,125,94,0.08)" }}>
              <p
                className="mb-2 text-xs font-semibold uppercase tracking-widest"
                style={{ color: "var(--azae-green)" }}
              >
                Valeurs
              </p>
              <h3
                className="mb-3 font-[family-name:var(--font-playfair)] text-xl font-bold"
                style={{ color: "var(--azae-navy)" }}
              >
                Ce qui nous guide
              </h3>
              <ul className="space-y-2">
                {["Solidarité", "Transparence", "Action", "Respect", "Durabilité"].map((v) => (
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
            eyebrow="Nos Programmes"
            title="Domaines d'action"
            subtitle="Trois axes prioritaires pour un impact durable sur les communautés togolaises."
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
      <section
        className="py-20 text-white"
        style={{ backgroundColor: "var(--azae-navy)" }}
      >
        <div className="mx-auto max-w-3xl px-4 text-center lg:px-8">
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-white lg:text-4xl">
            Rejoindre notre mission
          </h2>
          <p className="mt-4 text-base text-white/75">
            Que vous soyez professionnel, étudiant, citoyen engagé ou entreprise — il y a
            une place pour vous au sein d'Azaetogo.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/adhesion"
              className="rounded-lg px-6 py-3 text-sm font-semibold text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: "var(--azae-orange)" }}
            >
              Devenir membre
            </Link>
            <Link
              href="/dons"
              className="rounded-lg border border-white/40 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Faire un don
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
