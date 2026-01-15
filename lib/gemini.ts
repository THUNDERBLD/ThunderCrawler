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
    // 1. UPDATED MODEL NAME & ADDED JSON CONFIG
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" } 
    })

    const prompt = `
    Analyze this job description and provide the output in strict JSON format.
    
    Job Description:
    ${jobDescription}

    Output Schema:
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
    
    // 2. SIMPLIFIED PARSING (No regex needed with JSON mode)
    // If the model is forced to return JSON, we can often parse directly.
    // However, sometimes it might still return whitespace, so trimming is safe.
    return JSON.parse(text.trim())

  } catch (error) {
    console.error("Gemini API error:", error)
    throw error // This bubbles up to your route handler
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
    // UPDATED MODEL HERE TOO
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    })

    const prompt = `
    Compare this resume with the job description.
    
    Resume:
    ${resume}

    Job Description:
    ${jobDescription}

    Output Schema:
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
    
    return JSON.parse(text.trim())

  } catch (error) {
    console.error("Gemini API error:", error)
    throw error
  }
}

// ... calculateKeywordMatch remains the same ...
export function calculateKeywordMatch(
  resume: string,
  jobDescription: string
): {
  matchPercentage: number
  matchedKeywords: string[]
  missingKeywords: string[]
} {
  // Simple keyword extraction
  const extractKeywords = (text: string): string[] => {
    // Basic regex to find words with 3+ letters
    const technicalTerms = text
      .toLowerCase()
      .match(/\b[a-z]{3,}\b/g) || []
    
    // Filter common words (stopwords)
    const commonWords = new Set([
      'the', 'and', 'for', 'with', 'that', 'this', 'from', 
      'have', 'will', 'are', 'was', 'been', 'can', 'has', 
      'but', 'not', 'you', 'all', 'any', 'jobs', 'work'
    ])
    
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