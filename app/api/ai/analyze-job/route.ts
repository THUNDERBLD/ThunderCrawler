// app/api/ai/analyze-job/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { analyzeJobDescription } from "@/lib/gemini"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { jobDescription } = await request.json()

    if (!jobDescription) {
      return NextResponse.json(
        { error: "Job description is required" },
        { status: 400 }
      )
    }

    const analysis = await analyzeJobDescription(jobDescription)

    return NextResponse.json({
      success: true,
      analysis,
    })
  } catch (error: unknown) {
    console.error("AI analysis error:", error)
    return NextResponse.json(
      { error: (error as Error).message || "Failed to analyze job" },
      { status: 500 }
    )
  }
}