// app/api/ai/resume-suggestions/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getResumeSuggestions, calculateKeywordMatch } from "@/lib/gemini"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { resume, jobDescription } = await request.json()

    if (!resume || !jobDescription) {
      return NextResponse.json(
        { error: "Resume and job description are required" },
        { status: 400 }
      )
    }

    // Get AI suggestions and keyword match
    const [suggestions, keywordMatch] = await Promise.all([
      getResumeSuggestions(resume, jobDescription),
      Promise.resolve(calculateKeywordMatch(resume, jobDescription)),
    ])

    return NextResponse.json({
      success: true,
      suggestions,
      keywordMatch,
    })
  } catch (error: unknown) {
    console.error("Resume suggestions error:", error)
    return NextResponse.json(
      { error: (error as Error).message || "Failed to generate suggestions" },
      { status: 500 }
    )
  }
}