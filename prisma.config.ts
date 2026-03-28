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
    url: process.env.DATABASE_URL ?? "",
  },
})
