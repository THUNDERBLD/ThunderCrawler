// actions/ats.actions.ts
"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getDecryptedApiKey } from "@/actions/settings.actions"
import { GoogleGenerativeAI } from "@google/generative-ai"

/**
 * ATS Score Result
 */
interface ATSScoreResult {
  success: boolean
  error?: string
  score?: number
  analysis?: {
    keywordMatch: number
    skillsMatch: number
    experienceMatch: number
    overallMatch: number
  }
  suggestions?: string[]
  matchedKeywords?: string[]
  missingKeywords?: string[]
}

async function checkQuotaAndGetApiKey(userId: string): Promise<{
  canUse: boolean
  apiKey: string | null
  quotaExhausted: boolean
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscription: true,
      dailyResumeBuilds: true,
      lastQuotaReset: true,
    },
  })

  if (!user) {
    return { canUse: false, apiKey: null, quotaExhausted: false }
  }

  const quotaLimits: Record<string, number> = {
    FREE: 5,
    PRO: 50,
    ENTERPRISE: 999,
  }

  const limit = quotaLimits[user.subscription] || 5

  const now = new Date()
  const lastReset = new Date(user.lastQuotaReset)
  const hoursSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60)

  if (hoursSinceReset >= 24) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        dailyResumeBuilds: 0,
        lastQuotaReset: now,
      },
    })
    return { canUse: true, apiKey: process.env.GEMINI_API_KEY || null, quotaExhausted: false }
  }

  if (user.dailyResumeBuilds < limit) {
    return { canUse: true, apiKey: process.env.GEMINI_API_KEY || null, quotaExhausted: false }
  }

  const userApiKey = await getDecryptedApiKey(userId, "GEMINI")

  if (userApiKey) {
    return { canUse: true, apiKey: userApiKey, quotaExhausted: true }
  }

  return { canUse: false, apiKey: null, quotaExhausted: true }
}

async function incrementQuotaUsage(userId: string, quotaExhausted: boolean) {
  if (!quotaExhausted) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        dailyResumeBuilds: { increment: 1 },
      },
    })
  }
}

async function analyzeATSWithGemini(
  resumeContent: string,
  jobDescription: string,
  apiKey: string
): Promise<{
  score: number
  analysis: {
    keywordMatch: number
    skillsMatch: number
    experienceMatch: number
    overallMatch: number
  }
  suggestions: string[]
  matchedKeywords: string[]
  missingKeywords: string[]
}> {
  const genAI = new GoogleGenerativeAI(apiKey)
  
  // FIXED: Updated to 'gemini-2.5-flash' as '1.5-flash' is deprecated in 2026.
  // You can also try 'gemini-3-flash' if you want the absolute latest.
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

  const prompt = `
You are an expert ATS (Applicant Tracking System) analyzer. Analyze the resume against the job description and provide a detailed ATS compatibility score.

**Job Description:**
${jobDescription}

**Resume:**
${resumeContent}

Analyze and return ONLY a valid JSON object with this exact structure (no markdown, no code blocks):
{
  "score": <number 0-100>,
  "analysis": {
    "keywordMatch": <number 0-100>,
    "skillsMatch": <number 0-100>,
    "experienceMatch": <number 0-100>,
    "overallMatch": <number 0-100>
  },
  "suggestions": [
    "<specific improvement suggestion 1>",
    "<specific improvement suggestion 2>",
    "<specific improvement suggestion 3>"
  ],
  "matchedKeywords": ["keyword1", "keyword2", ...],
  "missingKeywords": ["keyword1", "keyword2", ...]
}

Focus on:
1. Technical skills and tools mentioned in job description
2. Experience level and years required
3. Key responsibilities alignment
4. Industry-specific keywords
5. Action verbs and achievements

Be strict but fair in scoring. Provide actionable suggestions.
`

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = await response.text()

    const cleanedText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
    const parsed = JSON.parse(cleanedText)

    return {
      score: parsed.score || 0,
      analysis: parsed.analysis || {
        keywordMatch: 0,
        skillsMatch: 0,
        experienceMatch: 0,
        overallMatch: 0,
      },
      suggestions: parsed.suggestions || [],
      matchedKeywords: parsed.matchedKeywords || [],
      missingKeywords: parsed.missingKeywords || [],
    }
  } catch (error) {
    console.error("Gemini API error:", error)
    throw new Error("Failed to analyze resume with AI")
  }
}

export async function getATSScore(jobDescription: string): Promise<ATSScoreResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" }
    }

    if (!jobDescription || jobDescription.trim().length < 50) {
      return {
        success: false,
        error: "Job description must be at least 50 characters",
      }
    }

    const baseResume = await prisma.resume.findFirst({
      where: {
        userId: session.user.id,
        isBase: true,
      },
    })

    if (!baseResume) {
      return {
        success: false,
        error: "No base resume found. Please upload and set a base resume first.",
      }
    }

    const { canUse, apiKey, quotaExhausted } = await checkQuotaAndGetApiKey(
      session.user.id
    )

    if (!canUse) {
      return {
        success: false,
        error: quotaExhausted
          ? "Daily quota exhausted. Please add your own Gemini API key in Settings to continue."
          : "Unable to process request",
      }
    }

    if (!apiKey) {
      return {
        success: false,
        error: "API key not available. Please contact support.",
      }
    }

    const analysis = await analyzeATSWithGemini(
      baseResume.content,
      jobDescription.trim(),
      apiKey
    )

    await incrementQuotaUsage(session.user.id, quotaExhausted)

    return {
      success: true,
      score: analysis.score,
      analysis: analysis.analysis,
      suggestions: analysis.suggestions,
      matchedKeywords: analysis.matchedKeywords,
      missingKeywords: analysis.missingKeywords,
    }
  } catch (error) {
    console.error("ATS scoring error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to calculate ATS score",
    }
  }
}