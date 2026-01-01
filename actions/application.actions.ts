// actions/application.actions.ts
"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { APPLICATION_STATUS } from "@/lib/constants"

/**
 * Helper to get authenticated user ID safely
 */
async function getAuthUserId() {
  const session = await auth()
  if (!session?.user?.id) return null
  return session.user.id
}

/**
 * Save/bookmark a job
 */
export async function saveJob(jobId: string) {
  try {
    const userId = await getAuthUserId()
    
    if (!userId) {
      return { success: false, error: "Not authenticated" }
    }

    // Check if already saved
    const existing = await prisma.savedJob.findUnique({
      where: {
        userId_jobId: {
          userId,
          jobId,
        },
      },
    })

    if (existing) {
      return { success: false, error: "Job already saved" }
    }

    await prisma.savedJob.create({
      data: {
        userId,
        jobId,
      },
    })

    revalidatePath("/jobs")
    revalidatePath(`/jobs/${jobId}`)
    revalidatePath("/saved")

    return { success: true, message: "Job saved successfully" }
  } catch (error: any) {
    console.error("Error saving job:", error)
    return { success: false, error: "Failed to save job" }
  }
}

/**
 * Unsave/remove bookmark from a job
 */
export async function unsaveJob(jobId: string) {
  try {
    const userId = await getAuthUserId()
    
    if (!userId) {
      return { success: false, error: "Not authenticated" }
    }

    await prisma.savedJob.delete({
      where: {
        userId_jobId: {
          userId,
          jobId,
        },
      },
    })

    revalidatePath("/jobs")
    revalidatePath(`/jobs/${jobId}`)
    revalidatePath("/saved")

    return { success: true, message: "Job removed from saved" }
  } catch (error: any) {
    console.error("Error unsaving job:", error)
    return { success: false, error: "Failed to unsave job" }
  }
}

/**
 * Mark job as applied
 */
export async function applyToJob(jobId: string, notes?: string) {
  try {
    const userId = await getAuthUserId()
    
    if (!userId) {
      return { success: false, error: "Not authenticated" }
    }

    // Check if already applied
    const existing = await prisma.application.findUnique({
      where: {
        userId_jobId: {
          userId,
          jobId,
        },
      },
    })

    if (existing) {
      return { success: false, error: "Already applied to this job" }
    }

    await prisma.application.create({
      data: {
        userId,
        jobId,
        status: APPLICATION_STATUS.APPLIED,
        notes,
      },
    })

    revalidatePath("/jobs")
    revalidatePath(`/jobs/${jobId}`)
    revalidatePath("/applications")

    return { success: true, message: "Application recorded successfully" }
  } catch (error: any) {
    console.error("Error applying to job:", error)
    return { success: false, error: "Failed to record application" }
  }
}

/**
 * Update application status
 */
export async function updateApplicationStatus(
  applicationId: string,
  status: string,
  notes?: string
) {
  try {
    const userId = await getAuthUserId()
    
    if (!userId) {
      return { success: false, error: "Not authenticated" }
    }

    // Verify the application belongs to the user
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    })

    if (!application || application.userId !== userId) {
      return { success: false, error: "Application not found" }
    }

    await prisma.application.update({
      where: { id: applicationId },
      data: {
        status,
        ...(notes !== undefined && { notes }),
      },
    })

    revalidatePath("/applications")
    revalidatePath("/jobs")

    return { success: true, message: "Application updated successfully" }
  } catch (error: any) {
    console.error("Error updating application:", error)
    return { success: false, error: "Failed to update application" }
  }
}

/**
 * Delete application
 */
export async function deleteApplication(applicationId: string) {
  try {
    const userId = await getAuthUserId()
    
    if (!userId) {
      return { success: false, error: "Not authenticated" }
    }

    // Verify the application belongs to the user
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    })

    if (!application || application.userId !== userId) {
      return { success: false, error: "Application not found" }
    }

    await prisma.application.delete({
      where: { id: applicationId },
    })

    revalidatePath("/applications")

    return { success: true, message: "Application deleted successfully" }
  } catch (error: any) {
    console.error("Error deleting application:", error)
    return { success: false, error: "Failed to delete application" }
  }
}

/**
 * Check if user has saved or applied to a job
 * Returns { isSaved: false, application: null } if not logged in
 */
export async function getJobUserStatus(jobId: string) {
  try {
    const userId = await getAuthUserId()
    
    // STRICT CHECK: If no userId, return default "guest" state immediately
    // This prevents the "Argument userId is missing" error
    if (!userId) {
      return { isSaved: false, application: null }
    }

    const [savedJob, application] = await Promise.all([
      prisma.savedJob.findUnique({
        where: {
          userId_jobId: {
            userId, // This is now guaranteed to be a string
            jobId,
          },
        },
      }),
      prisma.application.findUnique({
        where: {
          userId_jobId: {
            userId,
            jobId,
          },
        },
      }),
    ])

    return {
      isSaved: !!savedJob,
      application: application,
    }
  } catch (error) {
    console.error("Error getting job status:", error)
    // Fail gracefully
    return { isSaved: false, application: null }
  }
}