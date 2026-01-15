// lib/encryption.ts
/**
 * Encrypt/Decrypt API keys using AES-256-GCM
 * 
 * WHY ENCRYPT?
 * - API keys are secrets (like passwords)
 * - If database is compromised, keys stay safe
 * - Industry best practice
 * 
 * ALGORITHM: AES-256-GCM
 * - AES = Advanced Encryption Standard
 * - 256 = Key length (very secure)
 * - GCM = Galois/Counter Mode (authenticated encryption)
 */

import crypto from "crypto"

// Your encryption secret (add to .env.local)
// Generate one with: openssl rand -base64 32
const ENCRYPTION_KEY = process.env.ENCRYPTION_SECRET || ""

if (!ENCRYPTION_KEY) {
  throw new Error("ENCRYPTION_SECRET is not set in environment variables")
}

// Convert base64 secret to Buffer (32 bytes for AES-256)
const key = Buffer.from(ENCRYPTION_KEY, "base64")

/**
 * Encrypt a string (API key)
 * 
 * FLOW:
 * 1. Generate random IV (Initialization Vector)
 * 2. Create cipher with key + IV
 * 3. Encrypt the data
 * 4. Return IV + encrypted data (both needed for decryption)
 * 
 * @param text - Plain text API key
 * @returns Encrypted string (IV:encryptedData:authTag)
 */
export function encrypt(text: string): string {
  try {
    // Generate random 16-byte IV (must be unique per encryption)
    const iv = crypto.randomBytes(16)
    
    // Create cipher
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv)
    
    // Encrypt the text
    let encrypted = cipher.update(text, "utf8", "hex")
    encrypted += cipher.final("hex")
    
    // Get authentication tag (proves data wasn't tampered with)
    const authTag = cipher.getAuthTag()
    
    // Return: IV:encrypted:authTag (all needed for decryption)
    return `${iv.toString("hex")}:${encrypted}:${authTag.toString("hex")}`
  } catch (error) {
    console.error("Encryption error:", error)
    throw new Error("Failed to encrypt data")
  }
}

/**
 * Decrypt an encrypted string
 * 
 * FLOW:
 * 1. Split encrypted string into IV + data + authTag
 * 2. Create decipher with key + IV
 * 3. Set auth tag for verification
 * 4. Decrypt and return original text
 * 
 * @param encryptedText - Encrypted string from encrypt()
 * @returns Original plain text
 */
export function decrypt(encryptedText: string): string {
  try {
    // Split the encrypted string
    const parts = encryptedText.split(":")
    
    if (parts.length !== 3) {
      throw new Error("Invalid encrypted data format")
    }
    
    const [ivHex, encrypted, authTagHex] = parts
    
    // Convert hex strings back to Buffers
    const iv = Buffer.from(ivHex, "hex")
    const authTag = Buffer.from(authTagHex, "hex")
    
    // Create decipher
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv)
    
    // Set auth tag for verification
    decipher.setAuthTag(authTag)
    
    // Decrypt
    let decrypted = decipher.update(encrypted, "hex", "utf8")
    decrypted += decipher.final("utf8")
    
    return decrypted
  } catch (error) {
    console.error("Decryption error:", error)
    throw new Error("Failed to decrypt data")
  }
}

/**
 * Validate API key format before storing
 * 
 * WHY?
 * - Catch obvious mistakes (typos, incomplete keys)
 * - Don't waste encryption on invalid keys
 * 
 * @param key - API key to validate
 * @param provider - 'GEMINI' or 'OPENAI'
 * @returns Validation result
 */
export function validateApiKeyFormat(
  key: string,
  provider: "GEMINI" | "OPENAI"
): { valid: boolean; error?: string } {
  if (!key || typeof key !== "string") {
    return { valid: false, error: "API key is required" }
  }
  
  // Remove whitespace
  const trimmedKey = key.trim()
  
  if (trimmedKey.length < 20) {
    return { valid: false, error: "API key appears too short" }
  }
  
  // Provider-specific validation
  if (provider === "GEMINI") {
    // Gemini keys usually start with "AIza"
    if (!trimmedKey.startsWith("AIza")) {
      return {
        valid: false,
        error: "Gemini API keys typically start with 'AIza'",
      }
    }
    
    if (trimmedKey.length < 39) {
      return { valid: false, error: "Gemini API key appears incomplete" }
    }
  }
  
  if (provider === "OPENAI") {
    // OpenAI keys start with "sk-"
    if (!trimmedKey.startsWith("sk-")) {
      return {
        valid: false,
        error: "OpenAI API keys start with 'sk-'",
      }
    }
  }
  
  return { valid: true }
}

// Generate encryption secret (run once, save to .env.local)
// console.log(crypto.randomBytes(32).toString("base64"))