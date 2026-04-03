import { defineConfig } from "prisma/config"
import { config } from "dotenv"

/* Prisma 7 évalue ce fichier avant de charger les .env — on les charge manuellement */
config({ path: ".env.local" })
config({ path: ".env" })

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "node --env-file=.env.local --env-file=.env -r tsx/cjs prisma/seed.ts",
  },
  datasource: {
    /*
     * Priorité :
     *  1. DIRECT_URL  — connexion directe Supabase (port 5432), requise pour les migrations
     *  2. DATABASE_URL — connexion poolée pgBouncer (port 6543), utilisée par l'app en prod
     *
     * En production sur Vercel, les migrations sont exécutées séparément via DIRECT_URL.
     * L'app utilise DATABASE_URL (poolée) via @prisma/adapter-pg dans src/lib/db/prisma.ts.
     */
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  },
})
