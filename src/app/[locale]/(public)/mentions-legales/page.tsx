import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Mentions légales — Azaetogo",
  description: "Mentions légales de l'ONG Azaetogo, organisation humanitaire togolaise.",
}

export default function MentionsLegalesPage() {
  return (
    <section className="bg-[#F5F5F5] py-16">
      <div className="mx-auto max-w-3xl px-4 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <p
            className="mb-2 text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--azae-orange)" }}
          >
            Informations légales
          </p>
          <h1
            className="font-[family-name:var(--font-playfair)] text-3xl font-bold md:text-4xl"
            style={{ color: "var(--azae-navy)" }}
          >
            Mentions légales
          </h1>
          <p className="mt-3 text-sm text-gray-500">Dernière mise à jour : janvier 2025</p>
        </div>

        <div className="space-y-8 rounded-2xl bg-white p-8 shadow-sm md:p-10">
          {/* Section */}
          {[
            {
              title: "1. Identification de l'organisation",
              content: (
                <ul className="space-y-1 text-sm text-gray-600">
                  <li><strong>Dénomination :</strong> Association Azaetogo</li>
                  <li><strong>Statut :</strong> Organisation Non Gouvernementale (ONG) à but non lucratif</li>
                  <li><strong>Siège social :</strong> Lomé, République Togolaise</li>
                  <li><strong>Email :</strong>{" "}
                    <a href="mailto:contact@azaetogo.com" className="underline" style={{ color: "var(--azae-orange)" }}>
                      contact@azaetogo.com
                    </a>
                  </li>
                  <li><strong>Téléphone :</strong> +228 90 00 00 00</li>
                </ul>
              ),
            },
            {
              title: "2. Directeur de la publication",
              content: (
                <p className="text-sm text-gray-600">
                  Le directeur de la publication est le représentant légal de l'association Azaetogo.
                  Pour toute demande, merci de contacter{" "}
                  <a href="mailto:contact@azaetogo.com" className="underline" style={{ color: "var(--azae-orange)" }}>
                    contact@azaetogo.com
                  </a>.
                </p>
              ),
            },
            {
              title: "3. Hébergement",
              content: (
                <ul className="space-y-1 text-sm text-gray-600">
                  <li><strong>Hébergeur :</strong> Vercel Inc.</li>
                  <li><strong>Adresse :</strong> 340 Pine Street, Suite 1401, San Francisco, CA 94104, États-Unis</li>
                  <li><strong>Site web :</strong> vercel.com</li>
                </ul>
              ),
            },
            {
              title: "4. Propriété intellectuelle",
              content: (
                <p className="text-sm text-gray-600">
                  L'ensemble des contenus présents sur ce site (textes, images, vidéos, logos,
                  icônes, etc.) sont la propriété exclusive de l'association Azaetogo ou de leurs
                  auteurs respectifs. Toute reproduction, représentation, modification ou
                  exploitation de tout ou partie des contenus sans autorisation préalable et
                  écrite est strictement interdite.
                </p>
              ),
            },
            {
              title: "5. Responsabilité",
              content: (
                <p className="text-sm text-gray-600">
                  L'association Azaetogo s'efforce d'assurer l'exactitude et la mise à jour des
                  informations diffusées sur ce site. Elle ne saurait être tenue responsable
                  des erreurs, omissions ou d'une absence de disponibilité des informations.
                  L'association se réserve le droit de modifier les contenus à tout moment et
                  sans préavis.
                </p>
              ),
            },
            {
              title: "6. Liens hypertextes",
              content: (
                <p className="text-sm text-gray-600">
                  Le site peut contenir des liens vers des sites externes. L'association Azaetogo
                  ne contrôle pas ces sites et décline toute responsabilité quant à leur contenu.
                  La mise en place d'un lien vers ce site nécessite l'autorisation préalable de
                  l'association.
                </p>
              ),
            },
            {
              title: "7. Droit applicable",
              content: (
                <p className="text-sm text-gray-600">
                  Les présentes mentions légales sont régies par le droit togolais. Tout litige
                  relatif à l'utilisation de ce site sera soumis à la juridiction compétente de
                  Lomé, Togo.
                </p>
              ),
            },
          ].map(({ title, content }) => (
            <div key={title}>
              <h2
                className="mb-3 font-[family-name:var(--font-playfair)] text-lg font-bold"
                style={{ color: "var(--azae-navy)" }}
              >
                {title}
              </h2>
              {content}
            </div>
          ))}
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <Link
            href="/confidentialite"
            className="font-medium transition-colors hover:underline"
            style={{ color: "var(--azae-orange)" }}
          >
            Politique de confidentialité →
          </Link>
        </div>
      </div>
    </section>
  )
}
