// lib/auth-helpers.ts
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"


// Get current user session (server-side) // Use in Server Components and Server Actions
export async function getCurrentUser() {
  const session = await auth()
  return session?.user
}


// Require authentication // Redirects to signin if not authenticated
export async function requireAuth() {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/signin")
  }
  
  return session.user
}


// Require guest (not authenticated) // Redirects to dashboard if authenticated
export async function requireGuest() {
  const session = await auth()
  
  if (session?.user) {
    redirect("/dashboard")
  }
}

// Uncomment it if u are working on admin features
// export async function requireAdmin() {
//   const user = await requireAuth()
//   if (user.role !== "ADMIN") {
//     redirect("/dashboard")
//   }
//   return user
// }