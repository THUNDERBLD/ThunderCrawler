"use server"

import { signIn, signOut } from "@/lib/auth"
import { AuthError } from "next-auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { signupSchema } from "@/lib/validations"

/**
 * Sign in with credentials
 */
export async function signInAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    })
    
    return { success: true }
  // actions/auth.actions.ts (inside the catch block)
  } catch (error) {
  if (error instanceof AuthError) {
    // 🔍 LOG THE REAL CAUSE
    console.error("❌ Auth Error Cause:", error.cause); 
    
    switch (error.type) {
      case "CredentialsSignin":
        return { error: "Invalid email or password" }
      case "CallbackRouteError":
        // This will print the specific error from inside the 'cause' object
        const causeErr = error.cause?.err?.toString() || "Unknown cause";
        return { error: `Login failed: ${causeErr}` }
      default:
        return { error: "Something went wrong" }
    }
  }
  throw error
}
}

/**
 * Sign out
 */
export async function signOutAction() {
  await signOut({ redirectTo: "/" })
}

/**
 * Sign up new user
 */
export async function signUpAction(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  try {
    // Validate input
    const validatedData = signupSchema.parse({ name, email, password })

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return { error: "User with this email already exists" }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    // Create user
    await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
      },
    })

    // Auto sign in after signup
    await signIn("credentials", {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    })

    return { success: true }
  } catch (error: any) {
    if (error?.errors) {
      return { error: error.errors[0].message }
    }
    return { error: "Something went wrong" }
  }
}