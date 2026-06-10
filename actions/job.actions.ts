"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"


// Get all jobs with optional filters
export async function getJobs(filters: any) {
  // Add these defaults or extract from filters
  const page = filters.page || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  try {
    const jobs = await prisma.job.findMany({
      where: { /* your existing filters */ },
      orderBy: { createdAt: 'desc' },
      skip: skip, // <--- Add this
      take: limit, // <--- Add this
    });
    
    return { success: true, jobs };
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return { success: false, error: "Failed to fetch jobs" };
  }
}


// Get single job by ID
export async function getJobById(id: string) {
  try {
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        applications: {
          take: 1,
          orderBy: { createdAt: "desc" },
        },
        savedJobs: {
          take: 1,
        },
      },
    })

    if (!job) {
      return { success: false, error: "Job not found" }
    }

    return { success: true, job }
  } catch (error) {
    console.error("Error fetching job:", error)
    return { success: false, error: "Failed to fetch job" }
  }
}


// Save/bookmark a job
export async function saveJob(jobId: string) {
  try {
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: "Not authenticated" }
    }

    const savedJob = await prisma.savedJob.create({
      data: {
        userId: session.user.id,
        jobId,
      },
    })

    revalidatePath("/jobs")
    revalidatePath(`/jobs/${jobId}`)

    return { success: true, savedJob }
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return { success: false, error: "Job already saved" }
    }
    console.error("Error saving job:", error)
    return { success: false, error: "Failed to save job" }
  }
}


// Unsave/remove bookmark from a job
export async function unsaveJob(jobId: string) {
  try {
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: "Not authenticated" }
    }

    await prisma.savedJob.delete({
      where: {
        userId_jobId: {
          userId: session.user.id,
          jobId,
        },
      },
    })

    revalidatePath("/jobs")
    revalidatePath(`/jobs/${jobId}`)

    return { success: true }
  } catch (error) {
    console.error("Error unsaving job:", error)
    return { success: false, error: "Failed to unsave job" }
  }
}


// Get job stats
export async function getJobStats() {
  try {
    const [totalJobs, todayJobs, sources] = await Promise.all([
      prisma.job.count(),
      prisma.job.count({
        where: {
          scrapedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.job.groupBy({
        by: ["source"],
        _count: true,
      }),
    ])

    return {
      success: true,
      stats: {
        totalJobs,
        todayJobs,
        sources: sources.map((s) => ({
          source: s.source,
          count: s._count,
        })),
      },
    }
  } catch (error) {
    console.error("Error fetching job stats:", error)
    return { success: false, error: "Failed to fetch stats" }
  }
}