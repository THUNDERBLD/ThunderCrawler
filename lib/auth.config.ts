// // auth.config.ts
import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  pages: {
    signIn: "/signin",
    signOut: "/",
    error: "/signin",
  },
  session: { 
    strategy: "jwt" 
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
      }
      return session
    },
  },
  providers: [], // Keep this empty here! We add providers in lib/auth.ts
} satisfies NextAuthConfig