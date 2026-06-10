// lib/cloudinary.ts
// Purpose: Handle file uploads to Cloudinary storage
// Why Cloudinary? Free tier, CDN, automatic optimization

import { v2 as cloudinary } from "cloudinary"

/**
 * Configure Cloudinary
 * 
 * WHY HERE?
 * - Configuration runs once on import
 * - Environment variables loaded
 * - Ready for all upload operations
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

/**
 * Upload file buffer to Cloudinary
 * 
 * HOW IT WORKS:
 * 1. Convert Buffer to base64 data URI
 * 2. Upload to Cloudinary via their API
 * 3. Return secure URL (HTTPS)
 * 
 * WHY BUFFER?
 * - Server Actions receive File objects
 * - We convert File → ArrayBuffer → Buffer
 * - Cloudinary accepts base64 or Buffer
 * 
 * @param buffer - File data as Buffer
 * @param options - Upload configuration
 * @returns Cloudinary upload result with secure_url
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  options: {
    folder?: string
    resource_type?: "auto" | "image" | "raw"
    public_id?: string
  } = {}
) {
  try {
    // Convert buffer to base64 data URI
    // Format: "data:application/pdf;base64,JVBERi0x..."
    const base64 = buffer.toString("base64")
    const dataURI = `data:application/pdf;base64,${base64}`
    
    // Upload to Cloudinary
    // Returns: { secure_url, public_id, format, bytes, ... }
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: options.folder || "resumes", // Organize in folders
      resource_type: options.resource_type || "raw", // 'raw' for non-image files
      public_id: options.public_id, // Optional custom ID
    })
    
    return result
  } catch (error) {
    console.error("Cloudinary upload error:", error)
    throw new Error("Failed to upload file to storage")
  }
}

/**
 * Delete file from Cloudinary
 * 
 * WHY NEEDED?
 * - Clean up when user deletes resume
 * - Avoid storage costs for unused files
 * - Good practice: delete data when no longer needed
 * 
 * @param publicId - Cloudinary public_id (from upload result)
 * @param resourceType - Type of resource to delete
 */
export async function deleteFromCloudinary(
  publicId: string,
  resourceType: "image" | "raw" | "video" = "raw"
) {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    })
    return result
  } catch (error) {
    console.error("Cloudinary delete error:", error)
    // Don't throw - deletion failure shouldn't break app
    return { result: "not found" }
  }
}

/**
 * Extract public_id from Cloudinary URL
 * 
 * WHY?
 * - We store secure_url in database
 * - Need public_id to delete file
 * - This extracts it from the URL
 * 
 * Example URL:
 * https://res.cloudinary.com/demo/raw/upload/v1234567890/resumes/abc123.pdf
 *                                                          ^^^^^^^^^^^^^^^^^^
 *                                                          This is public_id
 * 
 * @param url - Cloudinary secure_url
 * @returns public_id or null
 */
export function extractPublicIdFromUrl(url: string): string | null {
  try {
    // Match pattern: /upload/v{version}/{folder}/{filename}
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/)
    return match ? match[1] : null
  } catch {
    return null
  }
}