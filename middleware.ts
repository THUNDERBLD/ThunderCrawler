// middleware.ts
import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config" // 👈 Import from config, NOT lib/auth
import { NextResponse } from "next/server"

// Initialize NextAuth with ONLY the edge-safe config
const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth

  // Public routes
  const isPublicRoute = 
    pathname === "/" || 
    pathname === "/signin" || 
    pathname === "/signup"

  // Protected routes
  const isProtectedRoute = pathname.startsWith("/dashboard") ||
    pathname.startsWith("/jobs") ||
    pathname.startsWith("/applications") ||
    pathname.startsWith("/resume") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/analytics")

  // Redirect logic
  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/signin", req.url))
  }

  if (isPublicRoute && isLoggedIn && (pathname === "/signin" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}