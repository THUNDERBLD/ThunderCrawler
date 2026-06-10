// app/api/scrape/status/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getQueueStats, getRecentJobs } from "@/lib/queue"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const stats = await getQueueStats()
    const recentJobs = await getRecentJobs(10)

    return NextResponse.json({
      success: true,
      stats,
      recentJobs: {
        completed: recentJobs.completed.map(job => ({
          id: job.id,
          name: job.name,
          timestamp: job.timestamp,
          returnvalue: job.returnvalue,
        })),
        failed: recentJobs.failed.map(job => ({
          id: job.id,
          name: job.name,
          timestamp: job.timestamp,
          failedReason: job.failedReason,
        })),
        active: recentJobs.active.map(job => ({
          id: job.id,
          name: job.name,
          timestamp: job.timestamp,
        })),
      },
    })
  } catch (error: any) {
    console.error("Queue status error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to get queue status" },
      { status: 500 }
    )
  }
}