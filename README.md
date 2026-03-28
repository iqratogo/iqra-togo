# Azaetogo — Plateforme ONG Humanitaire

Application web de l'ONG Azaetogo (Togo) : gestion des membres, dons, publications et administration.

**Stack :** Next.js 16 · React 19 · TypeScript · Prisma 7 · PostgreSQL (Supabase) · NextAuth v5 · Tailwind CSS 4 · next-intl (FR/EN)

---

## Prérequis

- Node.js 20+
- npm 10+
- Compte [Supabase](https://supabase.com) (base de données + stockage fichiers)
- Compte [Vercel](https://vercel.com) (déploiement)

---

## Installation locale

```bash
# 1. Cloner le dépôt
git clone <repo-url>
cd azaetogo

# 2. Installer les dépendances (génère aussi le client Prisma via postinstall)
npm install

# 3. Configurer les variables d'environnement
cp .env .env.local
# Remplir .env.local avec vos vraies valeurs (voir section Variables d'environnement)

# 4. Pousser le schéma vers la base de données
npx prisma db push

# 5. (Optionnel) Peupler avec des données de test
npm run seed

# 6. Lancer le serveur de développement
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

---

## Variables d'environnement

Copier `.env` en `.env.local` et remplir chaque valeur. Le fichier `.env` sert de template documenté.

| Variable | Description |
|---|---|
| `DATABASE_URL` | Connexion poolée Supabase (port 6543, pgBouncer) |
| `DIRECT_URL` | Connexion directe Supabase (port 5432, pour migrations) |
| `SUPABASE_URL` | URL du projet Supabase (`https://[ref].supabase.co`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service role Supabase (upload fichiers côté serveur) |
| `AUTH_SECRET` | Secret NextAuth ≥ 32 caractères (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | URL complète de l'application |
| `PAYDUNYA_MASTER_KEY` | Clé PayDunya |
| `PAYDUNYA_PRIVATE_KEY` | Clé privée PayDunya |
| `PAYDUNYA_TOKEN` | Token PayDunya |
| `PAYDUNYA_MODE` | `test` ou `live` |
| `PAYDUNYA_WEBHOOK_SECRET` | Secret pour valider les webhooks PayDunya |
| `NEXT_PUBLIC_APP_URL` | URL publique de l'application |
| `NEXT_PUBLIC_APP_NAME` | Nom de l'application |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Token Google Search Console (optionnel) |

---

## Supabase — Configuration

### Base de données

1. Créer un projet Supabase
2. Dans **Project Settings > Database**, récupérer :
   - **Connection string (pooler)** → `DATABASE_URL` (port 6543, mode Transaction)
   - **Connection string (direct)** → `DIRECT_URL` (port 5432)
3. Appliquer le schéma : `npx prisma db push`

### Stockage fichiers

1. Dans Supabase, aller dans **Storage**
2. Créer un bucket nommé `uploads` (public)
3. Ajouter la politique RLS suivante pour permettre la lecture publique :

```sql
-- Lecture publique du bucket uploads
CREATE POLICY "Public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'uploads');
```

4. Remplir `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` dans les variables d'environnement

---

## Déploiement sur Vercel

### Premier déploiement

1. Importer le dépôt sur [vercel.com/new](https://vercel.com/new)
2. Sélectionner le framework **Next.js** (détecté automatiquement)
3. Dans **Environment Variables**, ajouter toutes les variables de la section ci-dessus avec les valeurs de production
4. Déployer — Vercel exécute `prisma generate && next build` automatiquement (via `vercel.json`)

### Mises à jour

```bash
git push origin main   # Vercel redéploie automatiquement
```

### Variables clés à changer pour la production

| Variable | Valeur production |
|---|---|
| `NEXT_PUBLIC_APP_URL` | `https://azaetogo.togo` |
| `NEXTAUTH_URL` | `https://azaetogo.togo` |
| `PAYDUNYA_MODE` | `live` |
| `AUTH_SECRET` | Nouveau secret généré |

---

## Google Search Console — Indexation

1. Aller sur [search.google.com/search-console](https://search.google.com/search-console)
2. Ajouter la propriété `https://azaetogo.togo`
3. Choisir la méthode **Balise HTML** et copier le contenu du token
4. Ajouter la variable `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` dans Vercel avec la valeur du token
5. Valider dans Search Console
6. Soumettre le sitemap : `https://azaetogo.togo/sitemap.xml`

Le sitemap est généré dynamiquement par `src/app/sitemap.ts` et inclut toutes les pages statiques + les articles publiés (FR et EN).

---

## Commandes utiles

```bash
npm run dev           # Serveur de développement
npm run build         # Build de production
npm run start         # Démarrer en production

npx prisma studio     # Interface graphique base de données
npx prisma db push    # Synchroniser le schéma (sans migration)
npx prisma migrate dev --name <nom>  # Créer une migration
npm run seed          # Peupler la base avec des données de test
```

---

## Architecture

```
src/
├── app/
│   ├── [locale]/           # Pages i18n (fr/en) — layout, pages publiques
│   │   └── (public)/       # Pages publiques groupées
│   ├── api/                # Routes API (admin, auth, membres, dons, newsletter)
│   ├── dashboard/          # Tableau de bord admin & membre (protégé)
│   ├── layout.tsx          # Layout racine (métadonnées SEO, JSON-LD)
│   └── sitemap.ts          # Sitemap dynamique
├── components/
│   ├── layout/             # Navbar, Footer
│   ├── sections/           # Sections de pages
│   └── ui/                 # Composants shadcn/ui
├── i18n/                   # Configuration next-intl (routing, request)
├── lib/
│   ├── auth/               # Configuration NextAuth v5
│   └── db/prisma.ts        # Client Prisma (adapter pg, singleton)
├── messages/               # Traductions JSON (fr.json, en.json)
└── types/                  # Extensions de types TypeScript
prisma/
├── schema.prisma           # Schéma base de données
└── seed.ts                 # Script de peuplement
```

### Rôles utilisateurs

| Rôle | Accès |
|---|---|
| `SUPER_ADMIN` | Accès total, paramètres, audit |
| `ADMIN` | Membres, publications, dons, équipe |
| `EDITOR` | Publications uniquement |
| `MEMBER` | Dashboard membre, cotisations, profil |
| `VISITOR` | Pages publiques uniquement |

### Internationalisation

- Français (défaut) : `/`, `/a-propos`, `/actualites`, etc.
- Anglais : `/en/`, `/en/about`, `/en/news`, etc.
- Préfixe uniquement pour l'anglais (`localePrefix: "as-needed"`)

---

## Technologies

| Catégorie | Outil |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4, shadcn/ui, Framer Motion |
| Base de données | PostgreSQL via Supabase + Prisma 7 ORM |
| Authentification | NextAuth v5 (credentials, JWT) |
| Stockage fichiers | Supabase Storage |
| Paiements | PayDunya (mobile money Togo) |
| i18n | next-intl 4 (FR/EN) |
| Éditeur rich text | Tiptap 3 |
| Formulaires | React Hook Form + Zod |
| Déploiement | Vercel |
