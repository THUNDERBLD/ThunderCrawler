// actions/resume.actions.ts
"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { parseResumeFile, validateResumeFile } from "@/lib/parsers"
import { uploadToCloudinary } from "@/lib/cloudinary"


/**
 * Create a new resume
 */
export async function createResume(data: {
  name: string
  content: string
  isBase?: boolean
}) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" }
    }

    // If this is being set as base, unset other base resumes
    if (data.isBase) {
      await prisma.resume.updateMany({
        where: {
          userId: session.user.id,
          isBase: true,
        },
        data: {
          isBase: false,
        },
      })
    }

    const resume = await prisma.resume.create({
      data: {
        userId: session.user.id,
        name: data.name,
        content: data.content,
        isBase: data.isBase || false,
      },
    })

    revalidatePath("/resume")

    return { success: true, resume }
  } catch (error: unknown) {
    console.error("Error creating resume:", error)
    return { success: false, error: "Failed to create resume" }
  }
}

/**
 * Get all user resumes
 */
export async function getUserResumes() {
  try {
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: "Not authenticated", resumes: [] }
    }

    const resumes = await prisma.resume.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: [
        { isBase: "desc" }, // Base resume first
        { createdAt: "desc" },
      ],
    })

    return { success: true, resumes }
  } catch (error: unknown) {
    console.error("Error fetching resumes:", error)
    return { success: false, error: "Failed to fetch resumes", resumes: [] }
  }
}

/**
 * Get single resume
 */
export async function getResume(id: string) {
  try {
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: "Not authenticated" }
    }

    const resume = await prisma.resume.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!resume) {
      return { success: false, error: "Resume not found" }
    }

    return { success: true, resume }
  } catch (error: unknown) {
    console.error("Error fetching resume:", error)
    return { success: false, error: "Failed to fetch resume" }
  }
}

/**
 * Update resume
 */
export async function updateResume(
  id: string,
  data: {
    name?: string
    content?: string
    isBase?: boolean
  }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: "Not authenticated" }
    }

    // Verify ownership
    const existing = await prisma.resume.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existing) {
      return { success: false, error: "Resume not found" }
    }

    // If setting as base, unset other base resumes
    if (data.isBase) {
      await prisma.resume.updateMany({
        where: {
          userId: session.user.id,
          isBase: true,
          id: { not: id },
        },
        data: {
          isBase: false,
        },
      })
    }

    const resume = await prisma.resume.update({
      where: { id },
      data,
    })

    revalidatePath("/resume")

    return { success: true, resume }
  } catch (error: unknown) {
    console.error("Error updating resume:", error)
    return { success: false, error: "Failed to update resume" }
  }
}

/**
 * Delete resume
 */
export async function deleteResume(id: string) {
  try {
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: "Not authenticated" }
    }

    // Verify ownership
    const existing = await prisma.resume.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existing) {
      return { success: false, error: "Resume not found" }
    }

    await prisma.resume.delete({
      where: { id },
    })

    revalidatePath("/resume")

    return { success: true, message: "Resume deleted successfully" }
  } catch (error: unknown) {
    console.error("Error deleting resume:", error)
    return { success: false, error: "Failed to delete resume" }
  }
}

/**
 * Set resume as base/default
 */
export async function setBaseResume(id: string) {
  try {
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: "Not authenticated" }
    }

    // Unset all base resumes
    await prisma.resume.updateMany({
      where: {
        userId: session.user.id,
        isBase: true,
      },
      data: {
        isBase: false,
      },
    })

    // Set new base
    await prisma.resume.update({
      where: {
        id,
        userId: session.user.id,
      },
      data: {
        isBase: true,
      },
    })

    revalidatePath("/resume")

    return { success: true, message: "Base resume updated" }
  } catch (error: unknown) {
    console.error("Error setting base resume:", error)
    return { success: false, error: "Failed to set base resume" }
  }
}


/**
 * Upload and parse resume file (PDF/DOCX)
 * 
 * FLOW:
 * 1. User uploads file from browser
 * 2. File sent to this Server Action via FormData
 * 3. We validate → parse → upload → save to DB
 * 
 * WHY FormData?
 * - Server Actions can't directly receive File objects
 * - FormData is the standard way to send files
 * - Next.js automatically handles multipart/form-data
 * 
 * @param formData - Contains: file, name, isBase
 * @returns Success/error response
 */
export async function uploadResume(formData: FormData) {
  try {
    // 1. Authenticate user
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" }
    }

    // 2. Extract file from FormData
    // FormData.get() returns File | string | null
    const file = formData.get("file") as File | null
    const name = formData.get("name") as string
    const isBase = formData.get("isBase") === "true"

    if (!file) {
      return { success: false, error: "No file provided" }
    }

    if (!name || name.trim().length < 3) {
      return { success: false, error: "Resume name must be at least 3 characters" }
    }

    // 3. Validate file (client-side validation can be bypassed)
    const validation = validateResumeFile(file, 5) // 5MB limit
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    // 4. Parse file (PDF/DOCX → plain text)
    // This is the HEAVY operation (can take 1-3 seconds)
    let extractedText: string
    try {
      extractedText = await parseResumeFile(file)
    } catch (error) {
      console.error("Parse error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to parse file",
      }
    }

    // 5. Upload original file to Cloudinary
    // Why? User might want to download original PDF later
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    let fileUrl: string
    try {
      const uploadResult = await uploadToCloudinary(buffer, {
        folder: "resumes",
        resource_type: "raw",
        // Generate unique public_id to avoid conflicts
        public_id: `${session.user.id}_${Date.now()}`,
      })
      fileUrl = uploadResult.secure_url
    } catch (error) {
      console.error("Cloudinary upload error:", error)
      return {
        success: false,
        error: "Failed to upload file to storage",
      }
    }

    // 6. If setting as base, unset other base resumes
    if (isBase) {
      await prisma.resume.updateMany({
        where: {
          userId: session.user.id,
          isBase: true,
        },
        data: {
          isBase: false,
        },
      })
    }

    // 7. Save to database
    // content = extracted text (for AI processing)
    // fileUrl = original file in Cloudinary (for user download)
    // fileType = helps identify source for later processing
    const resume = await prisma.resume.create({
      data: {
        userId: session.user.id,
        name: name.trim(),
        content: extractedText,
        isBase: isBase,
        fileUrl: fileUrl,
        fileType: file.type === "application/pdf" ? "pdf" : "docx",
      },
    })

    // 8. Revalidate page to show new resume
    revalidatePath("/resume")

    return {
      success: true,
      resume,
      message: "Resume uploaded successfully",
    }
  } catch (error: unknown) {
    console.error("Error uploading resume:", error)
    return {
      success: false,
      error: "Failed to upload resume. Please try again.",
    }
  }
}

/**
 * Upload resume from LaTeX code (alternative flow)
 * 
 * WHY SEPARATE ACTION?
 * - Different input format (text vs file)
 * - No parsing needed
 * - Clearer separation of concerns
 * 
 * @param data - LaTeX code, name, isBase flag
 */
export async function uploadResumeLatex(data: {
  name: string
  latexCode: string
  isBase?: boolean
}) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" }
    }

    if (!data.name || data.name.trim().length < 3) {
      return { success: false, error: "Resume name must be at least 3 characters" }
    }

    if (!data.latexCode || data.latexCode.trim().length < 100) {
      return { success: false, error: "LaTeX code appears to be empty or too short" }
    }

    // If setting as base, unset other base resumes
    if (data.isBase) {
      await prisma.resume.updateMany({
        where: {
          userId: session.user.id,
          isBase: true,
        },
        data: {
          isBase: false,
        },
      })
    }

    const resume = await prisma.resume.create({
      data: {
        userId: session.user.id,
        name: data.name.trim(),
        content: data.latexCode.trim(),
        isBase: data.isBase || false,
        fileUrl: null, // No file URL for direct LaTeX input
        fileType: "latex",
      },
    })

    revalidatePath("/resume")

    return {
      success: true,
      resume,
      message: "LaTeX resume created successfully",
    }
  } catch (error: unknown) {
    console.error("Error creating LaTeX resume:", error)
    return {
      success: false,
      error: "Failed to create resume. Please try again.",
    }
  }
}

