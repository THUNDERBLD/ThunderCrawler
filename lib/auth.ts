// lib/auth.ts
import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthConfig = {
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: "jwt" },
  
  // 👇 FIX: Add these callbacks to expose the User ID
  callbacks: {
    async jwt({ token, user }) {
      // 1. On login, add the user's ID to the token
      if (user) {
        token.sub = user.id
      }
      return token
    },
    async session({ session, token }) {
      // 2. When asking for session, grab ID from token and put it in session
      if (token.sub && session.user) {
        session.user.id = token.sub
      }
      return session
    }
  },

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null 
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.password) {
          return null 
        }

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!valid) {
          return null 
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      },
    }),
  ],
}

export const { auth, signIn, signOut, handlers } = NextAuth(authOptions)