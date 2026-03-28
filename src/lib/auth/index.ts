/* §5.5 Auth — NextAuth v5 configuration complète (Node.js runtime) */

import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db/prisma"
import { z } from "zod"
import { authConfig } from "./config"
import { isRateLimited, getClientIp } from "@/lib/rate-limit"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials, request) {
        /* §5.5.1 PRD — Rate limiting server-side : 5 tentatives / 15 min par IP */
        const ip = getClientIp(request as Request)
        if (isRateLimited(ip, "login", 5, 15 * 60 * 1000)) return null

        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data

        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true, name: true, email: true, role: true,
            status: true, password: true, image: true,
          },
        }).catch(() => null)

        if (!user?.password) return null

        /* §12.9 — Blocage des comptes suspendus/inactifs dès la connexion */
        if (user.status === "SUSPENDED" || user.status === "INACTIVE") return null

        /* §12.9 — Vérification bcrypt, mots de passe jamais loggés */
        const { compare } = await import("bcryptjs")
        const valid = await compare(password, user.password)
        if (!valid) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role as string,
          status: user.status as string,
          image: user.image,
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger }) {
      /* Première connexion — stocker id, role, status dans le token */
      if (user) {
        token.id = user.id
        token.role = (user as { role?: string }).role ?? "VISITOR"
        token.status = (user as { status?: string }).status ?? "PENDING"
        return token
      }

      /* Revalidation du statut en BDD à chaque rafraîchissement */
      if (trigger === "update" || token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, status: true },
        }).catch(() => null)

        if (dbUser) {
          token.role = dbUser.role as string
          token.status = dbUser.status as string
          token.blocked = dbUser.status === "SUSPENDED" || dbUser.status === "INACTIVE"
        }
      }

      return token
    },

    session({ session, token }) {
      if (!session.user) return session

      if (token.blocked) {
        return {
          ...session,
          expires: new Date(0).toISOString(),
          user: { ...session.user, blocked: true },
        }
      }

      const user = session.user as unknown as Record<string, unknown>
      user.id = token.id as string
      user.role = token.role as string
      user.status = token.status as string

      return session
    },
  },
})
