// app/api/scrape/trigger/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { addYCScrapeJob } from "@/lib/queue"

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { source } = body

    console.log(`🎯 Scrape job requested for: ${source}`)

    if (source === "yc") {
      // Add job to queue instead of running directly
      const job = await addYCScrapeJob(session.user.id)

      return NextResponse.json({
        success: true,
        message: `Scraping job queued for ${source}`,
        jobId: job.id,
      })
    }

    return NextResponse.json(
      { error: "Invalid source" },
      { status: 400 }
    )
  } catch (error: any) {
    console.error("Scrape trigger error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to queue scrape job" },
      { status: 500 }
    )
  }
}