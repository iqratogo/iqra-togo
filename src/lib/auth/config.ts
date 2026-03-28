/* Auth config Edge-compatible — utilisée uniquement par middleware.ts */
/* Pas de Prisma, pas de bcrypt → peut s'exécuter dans le Edge runtime */

import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  session: { strategy: "jwt" },
  providers: [],   // les providers réels sont dans index.ts (Node.js uniquement)

  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role?: string }).role ?? "VISITOR"
        token.status = (user as { status?: string }).status ?? "PENDING"
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

  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
} satisfies NextAuthConfig
