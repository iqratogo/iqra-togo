# IQRA TOGO — Plateforme associative

Application web de l'association **IQRA TOGO** (Tchamba, Togo) : gestion des membres, dons, publications et administration.

**Stack :** Next.js 16 · React 19 · TypeScript · Prisma 7 · PostgreSQL · Supabase · NextAuth v5 · Tailwind CSS 4 · Resend · next-intl (FR/EN)

---

## Table des matières

1. [Prérequis](#prérequis)
2. [Installation locale](#installation-locale)
3. [Déploiement Vercel + Supabase](#déploiement-vercel--supabase)
4. [Configuration Resend (emails)](#configuration-resend-emails)
5. [Variables d'environnement](#variables-denvironnement)
6. [Migrations base de données](#migrations-base-de-données)
7. [Traductions en ligne (Supabase Storage)](#traductions-en-ligne-supabase-storage)
8. [Commandes utiles](#commandes-utiles)

---

## Prérequis

- **Node.js** 20+ et **npm** 10+
- Compte [Supabase](https://supabase.com) (base de données PostgreSQL + stockage fichiers)
- Compte [Vercel](https://vercel.com) (hébergement Next.js)
- Compte [Resend](https://resend.com) (emails transactionnels)
- Compte [PayDunya](https://paydunya.com) (paiements en ligne, optionnel en dev)

---

## Installation locale

```bash
# 1. Cloner le dépôt
git clone <repo-url>
cd iqratogo

# 2. Installer les dépendances (génère aussi le client Prisma via postinstall)
npm install

# 3. Configurer l'environnement local
cp .env .env.local
# Remplir .env.local avec vos vraies valeurs (voir section Variables d'environnement)

# 4. Créer les tables en base (développement local)
npx prisma migrate dev

# 5. Peupler avec des données de test
npm run seed

# 6. Lancer le serveur de développement
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

**Comptes de test (après seed) :**
| Email | Mot de passe | Rôle |
|-------|-------------|------|
| superadmin@iqratogo.org | Iqra2025! | Super Admin |
| admin@iqratogo.org | Iqra2025! | Admin |

---

## Déploiement Vercel + Supabase

### Étape 1 — Créer le projet Supabase

1. Aller sur [supabase.com](https://supabase.com) → **New Project**
2. Choisir une région proche (ex: `eu-west-2` London pour l'Afrique de l'Ouest)
3. Définir un **mot de passe de base de données fort** (le sauvegarder !)
4. Attendre ~2 minutes que le projet soit initialisé

**Récupérer les identifiants** dans *Project Settings → Database* :

```
DATABASE_URL  → "Transaction pooler" (port 6543)
              Format: postgresql://postgres.[ref]:[password]@aws-0-eu-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true

DIRECT_URL    → "Direct connection" (port 5432)
              Format: postgresql://postgres.[ref]:[password]@db.[ref].supabase.co:5432/postgres
```

**Récupérer les clés API** dans *Project Settings → API* :
```
SUPABASE_URL              → https://[ref].supabase.co
SUPABASE_SERVICE_ROLE_KEY → eyJhbGci... (clé privée — ne JAMAIS exposer côté client)
```

### Étape 2 — Créer les buckets Supabase Storage

Dans *Storage → New bucket*, créer les deux buckets suivants :

| Nom | Accès | Usage |
|-----|-------|-------|
| `media` | **Public** | Photos membres, images articles, logos partenaires |
| `translations` | **Public** | Fichiers JSON de traduction (fr.json, en.json) |

Pour `media` : activer *RLS* → ajouter une policy "Allow public reads" sur SELECT.

### Étape 3 — Exécuter les migrations

Les migrations **doivent être lancées depuis votre machine locale** avec la connexion directe (pas la poolée) :

```bash
# Dans .env.local, s'assurer que DIRECT_URL pointe vers Supabase (port 5432)
# Lancer les migrations vers Supabase
DIRECT_URL="postgresql://postgres.[ref]:[password]@db.[ref].supabase.co:5432/postgres" \
npx prisma migrate deploy

# Peupler les données initiales (settings, comptes admin)
# Remplacer DATABASE_URL par DIRECT_URL pour le seed
DATABASE_URL="postgresql://postgres.[ref]:[password]@db.[ref].supabase.co:5432/postgres" \
npm run seed
```

### Étape 4 — Créer le projet Vercel

1. Aller sur [vercel.com](https://vercel.com) → **Add New Project**
2. Importer le dépôt GitHub/GitLab
3. Framework : **Next.js** (détecté automatiquement)
4. Ne pas lancer le déploiement tout de suite — configurer les variables d'abord

### Étape 5 — Variables d'environnement sur Vercel

Dans *Project → Settings → Environment Variables*, ajouter **toutes** les variables suivantes (sélectionner les 3 environnements : Production, Preview, Development) :

| Variable | Valeur |
|----------|--------|
| `DATABASE_URL` | URL poolée Supabase (port **6543**, avec `?pgbouncer=true`) |
| `DIRECT_URL` | URL directe Supabase (port **5432**) |
| `SUPABASE_URL` | `https://[ref].supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service role Supabase |
| `AUTH_SECRET` | Secret aléatoire 32+ chars (`openssl rand -base64 32`) |
| `AUTH_URL` | `https://votre-domaine.vercel.app` (ou domaine custom) |
| `NEXTAUTH_URL` | idem `AUTH_URL` |
| `RESEND_API_KEY` | `re_xxxxxxxxxxxx` |
| `EMAIL_FROM` | `IQRA TOGO <noreply@iqra-togo.com>` |
| `EMAIL_ADMIN` | `contact@iqra-togo.com` |
| `PAYDUNYA_MASTER_KEY` | Clé master PayDunya |
| `PAYDUNYA_PRIVATE_KEY` | Clé privée PayDunya |
| `PAYDUNYA_TOKEN` | Token PayDunya |
| `PAYDUNYA_MODE` | `live` (production) ou `test` |
| `PAYDUNYA_WEBHOOK_SECRET` | Secret webhook PayDunya |
| `NEXT_PUBLIC_APP_URL` | `https://votre-domaine.vercel.app` |
| `NEXT_PUBLIC_APP_NAME` | `IQRA TOGO` |

### Étape 6 — Déployer

```bash
# Pousser sur la branche principale pour déclencher le déploiement
git push origin master
```

Vercel exécutera automatiquement : `npm install` → `prisma generate` → `next build`

### Étape 7 — Domaine personnalisé (optionnel)

Dans *Project → Settings → Domains* : ajouter `iqra-togo.com` et configurer les DNS chez votre registrar :
```
Type  Name   Value
A     @      76.76.21.21
CNAME www    cname.vercel-dns.com
```

---

## Configuration Resend (emails)

Resend est utilisé pour tous les emails transactionnels : reset de mot de passe, inscription, contact, newsletter.

### Étape 1 — Créer un compte Resend

1. Aller sur [resend.com](https://resend.com) → **Sign Up** (gratuit : 3 000 emails/mois)
2. Dans *API Keys* → **Create API Key** → copier la clé `re_xxxxx`

### Étape 2 — Vérifier votre domaine

Pour envoyer depuis `noreply@iqra-togo.com` (au lieu de `onboarding@resend.dev`) :

1. Dans Resend → *Domains* → **Add Domain** → entrer `iqra-togo.com`
2. Ajouter les enregistrements DNS indiqués par Resend chez votre registrar :

```
Type   Name                        Value
TXT    resend._domainkey           v=DKIM1; k=rsa; p=MIIBIj...
TXT    _dmarc                      v=DMARC1; p=none; rua=mailto:...
MX     send                        feedback-smtp.us-east-1.amazonses.com
```

3. Attendre la vérification (2-15 min) → statut **Verified** ✅

### Étape 3 — Test en développement local

Avant d'avoir un domaine vérifié, utiliser l'adresse de test Resend :

```env
# .env.local
RESEND_API_KEY=re_VOTRE_CLE
EMAIL_FROM=IQRA TOGO <onboarding@resend.dev>
EMAIL_ADMIN=votre-email-personnel@gmail.com
```

> Avec `onboarding@resend.dev`, les emails ne partent que vers l'adresse liée à votre compte Resend.

### Emails envoyés par l'application

| Déclencheur | Destinataire | Objet |
|-------------|-------------|-------|
| Inscription membre | Nouveau membre | Bienvenue + numéro de dossier |
| Inscription membre | Admin | Nouvelle candidature |
| Reset mot de passe | Utilisateur | Lien de réinitialisation (valide 1h) |
| Formulaire contact | Admin | Nouveau message + infos expéditeur |
| Formulaire contact | Expéditeur | Accusé de réception |
| Newsletter | Abonné | Lien de confirmation double opt-in |

---

## Variables d'environnement

Le fichier `.env` (commité) est le template documenté. Ne jamais committer `.env.local`.

```bash
cp .env .env.local   # Copier le template
# Remplir chaque valeur dans .env.local
```

### Développement local minimal

```env
# Base de données locale (pgAdmin)
DATABASE_URL="postgresql://postgres:VOTRE_MOT_DE_PASSE@localhost:5432/iqradb"
DIRECT_URL="postgresql://postgres:VOTRE_MOT_DE_PASSE@localhost:5432/iqradb"

# Auth
AUTH_SECRET="au-moins-32-caracteres-aleatoires-ici"
AUTH_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"

# Email (test Resend)
RESEND_API_KEY="re_VOTRE_CLE"
EMAIL_FROM="IQRA TOGO <onboarding@resend.dev>"
EMAIL_ADMIN="votre@email.com"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="IQRA TOGO"
```

---

## Migrations base de données

### Première fois (projet neuf)

```bash
# Crée les tables et le dossier prisma/migrations/
npx prisma migrate dev --name init
```

### Après modification du schéma Prisma

```bash
# Développement local
npx prisma migrate dev --name description_de_la_modification

# Production (Supabase) — utilise DIRECT_URL
npx prisma migrate deploy
```

### Autres commandes Prisma utiles

```bash
npx prisma studio          # Interface graphique pour explorer la DB
npx prisma db push         # Synchronise schéma sans créer de fichier migration (dev rapide)
npx prisma generate        # Regénère le client Prisma (après modification schema.prisma)
npm run seed               # Peuple la DB avec des données initiales
```

---

## Traductions en ligne (Supabase Storage)

Les traductions sont chargées depuis **Supabase Storage** au lieu d'être bundlées dans l'application. Cela permet de les mettre à jour sans redéploiement.

### Comment ça fonctionne

1. L'app tente de charger `{locale}.json` depuis le bucket `translations` (public, CDN Supabase)
2. Si le fichier n'existe pas, fallback sur les fichiers locaux `messages/fr.json` ou `messages/en.json`
3. Cache 1 heure via `unstable_cache` de Next.js

### Mettre à jour une traduction sans redéployer

**Via Supabase Dashboard :**
1. *Storage → translations* → uploader `fr.json` ou `en.json`
2. Attendre max 1h que le cache expire (ou déclencher une revalidation)

**Via API (script) :**
```bash
curl -X POST \
  "https://[ref].supabase.co/storage/v1/object/translations/fr.json" \
  -H "Authorization: Bearer SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  --data-binary @messages/fr.json
```

### Forcer le vidage de cache (revalidation)

```bash
# Via l'API Next.js de revalidation (à implémenter dans le dashboard admin)
curl -X POST "https://votre-site.vercel.app/api/admin/revalidate" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"tag":"translations"}'
```

---

## Commandes utiles

```bash
npm run dev          # Serveur de développement (webpack)
npm run build        # Build de production
npm run start        # Serveur de production local
npm run lint         # ESLint
npm run seed         # Peupler la base de données

npx prisma studio    # Explorer la DB en visuel
npx prisma migrate dev    # Créer et appliquer une migration
npx prisma migrate deploy # Appliquer les migrations en production
```

---

## Architecture des services

```
┌─────────────────────────────────────────────────────┐
│                   VERCEL (Next.js 16)                │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────┐ │
│  │  Pages   │  │   API    │  │    Middleware       │ │
│  │  (ISR)   │  │  Routes  │  │  (Auth + Headers)  │ │
│  └──────────┘  └──────────┘  └────────────────────┘ │
└──────────────────────┬──────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
┌──────────────┐ ┌──────────┐ ┌──────────────┐
│   SUPABASE   │ │  RESEND  │ │   PAYDUNYA   │
│ ┌──────────┐ │ │  Emails  │ │   Paiements  │
│ │PostgreSQL│ │ │transact. │ │   (FCFA)     │
│ ├──────────┤ │ └──────────┘ └──────────────┘
│ │ Storage  │ │
│ │(fichiers)│ │
│ └──────────┘ │
└──────────────┘
```

---

*IQRA TOGO — Le savoir, la liberté · contact@iqra-togo.com · Quartier Limamwa, Tchamba, Togo*
