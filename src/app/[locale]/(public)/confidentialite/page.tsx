import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Politique de confidentialité — Azaetogo",
  description:
    "Politique de confidentialité et protection des données personnelles de l'ONG Azaetogo.",
}

export default function ConfidentialitePage() {
  return (
    <section className="bg-[#F5F5F5] py-16">
      <div className="mx-auto max-w-3xl px-4 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <p
            className="mb-2 text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--azae-orange)" }}
          >
            Protection des données
          </p>
          <h1
            className="font-[family-name:var(--font-playfair)] text-3xl font-bold md:text-4xl"
            style={{ color: "var(--azae-navy)" }}
          >
            Politique de confidentialité
          </h1>
          <p className="mt-3 text-sm text-gray-500">Dernière mise à jour : janvier 2025</p>
        </div>

        <div className="space-y-8 rounded-2xl bg-white p-8 shadow-sm md:p-10">
          {[
            {
              title: "1. Responsable du traitement",
              content: (
                <p className="text-sm text-gray-600">
                  L'association <strong>Azaetogo</strong>, ONG humanitaire togolaise dont le
                  siège est à Lomé, Togo, est responsable du traitement des données personnelles
                  collectées via ce site. Contact :{" "}
                  <a href="mailto:contact@azaetogo.com" className="underline" style={{ color: "var(--azae-orange)" }}>
                    contact@azaetogo.com
                  </a>.
                </p>
              ),
            },
            {
              title: "2. Données collectées",
              content: (
                <div className="space-y-2 text-sm text-gray-600">
                  <p>Nous collectons les données suivantes selon les services utilisés :</p>
                  <ul className="list-inside list-disc space-y-1 pl-2">
                    <li><strong>Compte membre :</strong> nom, prénom, email, téléphone, date de naissance, nationalité, profession, photo d'identité</li>
                    <li><strong>Dons :</strong> nom, prénom, email, téléphone (uniquement si don non anonyme)</li>
                    <li><strong>Newsletter :</strong> adresse email uniquement</li>
                    <li><strong>Formulaire de contact :</strong> nom, email, message</li>
                    <li><strong>Données de navigation :</strong> adresse IP, type de navigateur, pages visitées (via journaux serveur)</li>
                  </ul>
                </div>
              ),
            },
            {
              title: "3. Finalités du traitement",
              content: (
                <ul className="list-inside list-disc space-y-1 pl-2 text-sm text-gray-600">
                  <li>Gestion des adhésions et des espaces membres</li>
                  <li>Traitement des dons et émission de reçus fiscaux</li>
                  <li>Envoi de la newsletter (avec consentement explicite)</li>
                  <li>Réponse aux demandes de contact</li>
                  <li>Sécurité du site et prévention des fraudes</li>
                  <li>Amélioration des services proposés</li>
                </ul>
              ),
            },
            {
              title: "4. Base légale",
              content: (
                <p className="text-sm text-gray-600">
                  Le traitement est fondé sur : (a) l'exécution du contrat d'adhésion, (b) votre
                  consentement explicite pour la newsletter, (c) notre intérêt légitime pour la
                  sécurité et l'amélioration du service, et (d) le respect d'obligations légales.
                </p>
              ),
            },
            {
              title: "5. Durée de conservation",
              content: (
                <ul className="list-inside list-disc space-y-1 pl-2 text-sm text-gray-600">
                  <li><strong>Données membres :</strong> durée de l'adhésion + 3 ans</li>
                  <li><strong>Données de dons :</strong> 10 ans (obligations comptables)</li>
                  <li><strong>Newsletter :</strong> jusqu'à désinscription</li>
                  <li><strong>Journaux de connexion :</strong> 12 mois</li>
                </ul>
              ),
            },
            {
              title: "6. Partage des données",
              content: (
                <p className="text-sm text-gray-600">
                  Vos données ne sont pas vendues. Elles peuvent être partagées avec nos
                  prestataires techniques (hébergement, paiement via PayDunya, emails via notre service d'envoi)
                  dans le strict cadre de l'exécution de leurs services, et uniquement les données
                  nécessaires. Ces prestataires sont contractuellement tenus de respecter la
                  confidentialité de vos informations.
                </p>
              ),
            },
            {
              title: "7. Vos droits",
              content: (
                <div className="space-y-2 text-sm text-gray-600">
                  <p>Vous disposez des droits suivants sur vos données :</p>
                  <ul className="list-inside list-disc space-y-1 pl-2">
                    <li><strong>Accès :</strong> obtenir une copie de vos données</li>
                    <li><strong>Rectification :</strong> corriger des données inexactes</li>
                    <li><strong>Suppression :</strong> demander l'effacement de vos données</li>
                    <li><strong>Opposition :</strong> s'opposer à certains traitements</li>
                    <li><strong>Portabilité :</strong> recevoir vos données dans un format lisible</li>
                  </ul>
                  <p className="pt-1">
                    Pour exercer ces droits, contactez-nous à{" "}
                    <a href="mailto:contact@azaetogo.com" className="underline" style={{ color: "var(--azae-orange)" }}>
                      contact@azaetogo.com
                    </a>.
                    Nous nous engageons à répondre dans un délai de 30 jours.
                  </p>
                </div>
              ),
            },
            {
              title: "8. Cookies",
              content: (
                <p className="text-sm text-gray-600">
                  Ce site utilise uniquement des cookies strictement nécessaires au fonctionnement
                  (session d'authentification, sécurité CSRF). Aucun cookie publicitaire ou de
                  traçage tiers n'est utilisé.
                </p>
              ),
            },
            {
              title: "9. Sécurité",
              content: (
                <p className="text-sm text-gray-600">
                  Nous mettons en œuvre des mesures techniques et organisationnelles adaptées pour
                  protéger vos données : chiffrement HTTPS, hachage des mots de passe (bcrypt),
                  contrôle d'accès par rôle (RBAC), et journalisation des actions sensibles.
                </p>
              ),
            },
            {
              title: "10. Modifications",
              content: (
                <p className="text-sm text-gray-600">
                  Nous nous réservons le droit de modifier cette politique à tout moment. La date
                  de dernière mise à jour est indiquée en haut de cette page. Nous vous informerons
                  de tout changement substantiel par email si vous êtes membre.
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
            href="/mentions-legales"
            className="font-medium transition-colors hover:underline"
            style={{ color: "var(--azae-orange)" }}
          >
            ← Mentions légales
          </Link>
          <span className="mx-3 text-gray-300">|</span>
          <Link
            href="/contact"
            className="font-medium transition-colors hover:underline"
            style={{ color: "var(--azae-orange)" }}
          >
            Nous contacter →
          </Link>
        </div>
      </div>
    </section>
  )
}
