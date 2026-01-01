// app/api/scrape/trigger/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { YCScraper } from "@/workers/scrapers/yc-scraper"

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

    console.log(`🎯 Manual scrape triggered for: ${source}`)

    let result

    switch (source) {
      case "yc":
        const ycScraper = new YCScraper()
        result = await ycScraper.scrape()
        break

      // Add more scrapers here later
      // case "wellfound":
      //   const wellfoundScraper = new WellfoundScraper()
      //   result = await wellfoundScraper.scrape()
      //   break

      default:
        return NextResponse.json(
          { error: "Invalid source" },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: result.success,
      message: `Scraped ${result.jobsScraped} jobs from ${source}`,
      jobsScraped: result.jobsScraped,
      errors: result.errors,
    })
  } catch (error: any) {
    console.error("Scrape trigger error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to trigger scrape" },
      { status: 500 }
    )
  }
}