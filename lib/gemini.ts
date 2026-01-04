// lib/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai"

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set")
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

/**
 * Analyze job description and provide insights
 */
export async function analyzeJobDescription(jobDescription: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    const prompt = `
Analyze this job description and provide:
1. Key required skills (list 5-8 most important)
2. Experience level required
3. Main responsibilities (top 3)
4. Red flags or concerns (if any)
5. Company culture indicators

Job Description:
${jobDescription}

Respond in JSON format:
{
  "skills": ["skill1", "skill2", ...],
  "experienceLevel": "junior|mid|senior",
  "responsibilities": ["resp1", "resp2", "resp3"],
  "redFlags": ["flag1", ...] or [],
  "cultureIndicators": ["indicator1", ...]
}
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response")
    }

    return JSON.parse(jsonMatch[0])
  } catch (error) {
    console.error("Gemini API error:", error)
    throw error
  }
}

/**
 * Get resume optimization suggestions
 */
export async function getResumeSuggestions(
  resume: string,
  jobDescription: string
) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    const prompt = `
Compare this resume with the job description and provide optimization suggestions.

Resume:
${resume}

Job Description:
${jobDescription}

Provide:
1. Missing keywords that should be added
2. Skills to highlight more prominently
3. Specific improvements for each section
4. ATS compatibility score (0-100)
5. Overall match score (0-100)

Respond in JSON format:
{
  "missingKeywords": ["keyword1", "keyword2", ...],
  "skillsToHighlight": ["skill1", "skill2", ...],
  "improvements": {
    "summary": "suggestion for summary section",
    "experience": "suggestion for experience section",
    "skills": "suggestion for skills section"
  },
  "atsScore": 85,
  "matchScore": 75,
  "summary": "Brief overall assessment"
}
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response")
    }

    return JSON.parse(jsonMatch[0])
  } catch (error) {
    console.error("Gemini API error:", error)
    throw error
  }
}

/**
 * Calculate keyword match between resume and job
 */
export function calculateKeywordMatch(
  resume: string,
  jobDescription: string
): {
  matchPercentage: number
  matchedKeywords: string[]
  missingKeywords: string[]
} {
  // Simple keyword extraction (you can enhance this)
  const extractKeywords = (text: string): string[] => {
    const technicalTerms = text
      .toLowerCase()
      .match(/\b[a-z]{3,}\b/g) || []
    
    // Filter common words
    const commonWords = new Set(['the', 'and', 'for', 'with', 'that', 'this', 'from', 'have', 'will', 'are', 'was', 'been'])
    
    return [...new Set(technicalTerms)].filter(word => !commonWords.has(word))
  }

  const resumeKeywords = new Set(extractKeywords(resume))
  const jobKeywords = extractKeywords(jobDescription)

  const matchedKeywords: string[] = []
  const missingKeywords: string[] = []

  jobKeywords.forEach(keyword => {
    if (resumeKeywords.has(keyword)) {
      matchedKeywords.push(keyword)
    } else {
      missingKeywords.push(keyword)
    }
  })

  const matchPercentage = jobKeywords.length > 0
    ? Math.round((matchedKeywords.length / jobKeywords.length) * 100)
    : 0

  return {
    matchPercentage,
    matchedKeywords: matchedKeywords.slice(0, 10), // Top 10
    missingKeywords: missingKeywords.slice(0, 10), // Top 10
  }
}