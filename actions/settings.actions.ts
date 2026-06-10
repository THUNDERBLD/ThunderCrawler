// actions/settings.actions.ts
"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { encrypt, decrypt, validateApiKeyFormat } from "@/lib/encryption"
import bcrypt from "bcryptjs"

/**
 * Update user profile (name, email)
 * 
 * WHY SEPARATE FROM AUTH?
 * - Settings are different from auth
 * - Easier to maintain
 * - Clear separation of concerns
 */
export async function updateProfile(data: {
  name?: string
  email?: string
}) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" }
    }

    // Validate input
    if (data.name && data.name.trim().length < 2) {
      return { success: false, error: "Name must be at least 2 characters" }
    }

    // Check if email is already taken (if changing email)
    if (data.email && data.email !== session.user.email) {
      const existing = await prisma.user.findUnique({
        where: { email: data.email },
      })

      if (existing) {
        return { success: false, error: "Email is already in use" }
      }
    }

    // Update user
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.email && { email: data.email.toLowerCase().trim() }),
      },
    })

    revalidatePath("/settings")

    return { success: true, user }
  } catch (error) {
    console.error("Update profile error:", error)
    return { success: false, error: "Failed to update profile" }
  }
}

/**
 * Change password
 */
export async function changePassword(data: {
  currentPassword: string
  newPassword: string
}) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" }
    }

    // Get current user with password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user || !user.password) {
      return { success: false, error: "User not found" }
    }

    // Verify current password
    const validPassword = await bcrypt.compare(
      data.currentPassword,
      user.password
    )

    if (!validPassword) {
      return { success: false, error: "Current password is incorrect" }
    }

    // Validate new password
    if (data.newPassword.length < 8) {
      return { success: false, error: "New password must be at least 8 characters" }
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(data.newPassword, 10)

    // Update password
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    })

    return { success: true, message: "Password updated successfully" }
  } catch (error) {
    console.error("Change password error:", error)
    return { success: false, error: "Failed to change password" }
  }
}

/**
 * Add API key
 * 
 * SECURITY:
 * 1. Validate format
 * 2. Encrypt before storing
 * 3. Never return decrypted key
 */
export async function addApiKey(data: {
  provider: "GEMINI" | "OPENAI"
  apiKey: string
  name: string
}) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" }
    }

    // Validate API key format
    const validation = validateApiKeyFormat(data.apiKey, data.provider)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    // Check if user already has a key with this name
    const existing = await prisma.apiKey.findFirst({
      where: {
        userId: session.user.id,
        name: data.name,
      },
    })

    if (existing) {
      return { success: false, error: "You already have a key with this name" }
    }

    // Encrypt the API key
    const encryptedKey = encrypt(data.apiKey.trim())

    // Save to database
    const apiKey = await prisma.apiKey.create({
      data: {
        userId: session.user.id,
        provider: data.provider,
        encryptedKey: encryptedKey,
        name: data.name.trim(),
        isActive: true,
      },
    })

    revalidatePath("/settings")

    return {
      success: true,
      message: "API key added successfully",
      // Return ID only, never the key itself
      keyId: apiKey.id,
    }
  } catch (error) {
    console.error("Add API key error:", error)
    return { success: false, error: "Failed to add API key" }
  }
}

/**
 * Get user's API keys (without decrypted values)
 * 
 * WHY NOT DECRYPT?
 * - Security: Never send keys to client
 * - User doesn't need to see full key
 * - Show last 4 chars only (like credit cards)
 */
export async function getUserApiKeys() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated", keys: [] }
    }

    const keys = await prisma.apiKey.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        provider: true,
        name: true,
        isActive: true,
        usageCount: true,
        lastUsed: true,
        createdAt: true,
        // DO NOT SELECT encryptedKey (security!)
      },
    })

    return { success: true, keys }
  } catch (error) {
    console.error("Get API keys error:", error)
    return { success: false, error: "Failed to fetch API keys", keys: [] }
  }
}

/**
 * Delete API key
 */
export async function deleteApiKey(keyId: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" }
    }

    // Verify ownership
    const apiKey = await prisma.apiKey.findFirst({
      where: {
        id: keyId,
        userId: session.user.id,
      },
    })

    if (!apiKey) {
      return { success: false, error: "API key not found" }
    }

    // Delete
    await prisma.apiKey.delete({
      where: { id: keyId },
    })

    revalidatePath("/settings")

    return { success: true, message: "API key deleted successfully" }
  } catch (error) {
    console.error("Delete API key error:", error)
    return { success: false, error: "Failed to delete API key" }
  }
}

/**
 * Toggle API key active status
 */
export async function toggleApiKey(keyId: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" }
    }

    // Get current key
    const apiKey = await prisma.apiKey.findFirst({
      where: {
        id: keyId,
        userId: session.user.id,
      },
    })

    if (!apiKey) {
      return { success: false, error: "API key not found" }
    }

    // Toggle active status
    await prisma.apiKey.update({
      where: { id: keyId },
      data: { isActive: !apiKey.isActive },
    })

    revalidatePath("/settings")

    return {
      success: true,
      message: apiKey.isActive ? "API key disabled" : "API key enabled",
    }
  } catch (error) {
    console.error("Toggle API key error:", error)
    return { success: false, error: "Failed to toggle API key" }
  }
}

/**
 * INTERNAL: Get decrypted API key for backend use
 * 
 * NEVER expose this to client!
 * Only use in Server Actions/API Routes
 */
export async function getDecryptedApiKey(
  userId: string,
  provider: "GEMINI" | "OPENAI"
): Promise<string | null> {
  try {
    // Get active key for provider
    const apiKey = await prisma.apiKey.findFirst({
      where: {
        userId: userId,
        provider: provider,
        isActive: true,
      },
      orderBy: {
        lastUsed: "desc", // Use most recently used key
      },
    })

    if (!apiKey) {
      return null
    }

    // Decrypt and return
    const decryptedKey = decrypt(apiKey.encryptedKey)

    // Update usage stats
    await prisma.apiKey.update({
      where: { id: apiKey.id },
      data: {
        usageCount: { increment: 1 },
        lastUsed: new Date(),
      },
    })

    return decryptedKey
  } catch (error) {
    console.error("Get decrypted key error:", error)
    return null
  }
}