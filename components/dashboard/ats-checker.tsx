// components/dashboard/ats-checker.tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, FileText, TrendingUp, CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import { getATSScore } from "@/actions/ats.actions"

export function ATSChecker() {
  const [jobDescription, setJobDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)

  async function handleCheckScore() {
    if (!jobDescription.trim() || jobDescription.length < 50) {
      setError("Please enter a job description (at least 50 characters)")
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const score = await getATSScore(jobDescription)

      if (score.success) {
        setResult(score)
      } else {
        setError(score.error || "Failed to calculate ATS score")
      }
    } catch (err) {
      setError("An unexpected error occurred")
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  // Get score color and label
  function getScoreInfo(score: number) {
    if (score >= 70) {
      return {
        color: "text-green-600",
        bg: "bg-green-50",
        border: "border-green-200",
        label: "Excellent Match",
        icon: CheckCircle2,
      }
    } else if (score >= 40) {
      return {
        color: "text-yellow-600",
        bg: "bg-yellow-50",
        border: "border-yellow-200",
        label: "Good Match",
        icon: AlertCircle,
      }
    } else {
      return {
        color: "text-red-600",
        bg: "bg-red-50",
        border: "border-red-200",
        label: "Poor Match",
        icon: XCircle,
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          ATS Score Checker
        </CardTitle>
        <CardDescription>
          Check how well your base resume matches a job description
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Job Description Input */}
        <div className="space-y-2">
          <Label htmlFor="jobDescription">Job Description</Label>
          <textarea
            id="jobDescription"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here..."
            rows={8}
            className="w-full p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <p className="text-xs text-gray-500">
            {jobDescription.length} characters (minimum 50 required)
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
            {error}
          </div>
        )}

        {/* Check Score Button */}
        <Button
          onClick={handleCheckScore}
          disabled={loading || jobDescription.length < 50}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <FileText className="h-4 w-4 mr-2" />
              Check ATS Score
            </>
          )}
        </Button>

        {/* Results Display */}
        {result && (
          <div className="space-y-4 mt-6 pt-6 border-t">
            {/* Overall Score */}
            <div className={`p-6 rounded-lg border-2 ${getScoreInfo(result.score).bg} ${getScoreInfo(result.score).border}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">Overall ATS Score</h3>
                <Badge variant="outline" className={getScoreInfo(result.score).color}>
                  {getScoreInfo(result.score).label}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4">
                <div className={`text-5xl font-bold ${getScoreInfo(result.score).color}`}>
                  {result.score}
                </div>
                <div className="text-sm text-gray-600">
                  out of 100
                </div>
              </div>
            </div>

            {/* Detailed Analysis */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Keyword Match</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{result.analysis.keywordMatch}</span>
                  <span className="text-sm text-gray-500">/ 100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${result.analysis.keywordMatch}%` }}
                  />
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Skills Match</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{result.analysis.skillsMatch}</span>
                  <span className="text-sm text-gray-500">/ 100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${result.analysis.skillsMatch}%` }}
                  />
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Experience Match</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{result.analysis.experienceMatch}</span>
                  <span className="text-sm text-gray-500">/ 100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${result.analysis.experienceMatch}%` }}
                  />
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Overall Match</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{result.analysis.overallMatch}</span>
                  <span className="text-sm text-gray-500">/ 100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${result.analysis.overallMatch}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Matched Keywords */}
            {result.matchedKeywords && result.matchedKeywords.length > 0 && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Matched Keywords ({result.matchedKeywords.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {result.matchedKeywords.map((keyword: string, idx: number) => (
                    <Badge key={idx} variant="outline" className="bg-white">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Keywords */}
            {result.missingKeywords && result.missingKeywords.length > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-800 mb-2 flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Missing Keywords ({result.missingKeywords.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {result.missingKeywords.map((keyword: string, idx: number) => (
                    <Badge key={idx} variant="outline" className="bg-white">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {result.suggestions && result.suggestions.length > 0 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-3">
                  💡 Suggestions to Improve Your Score
                </h4>
                <ul className="space-y-2">
                  {result.suggestions.map((suggestion: string, idx: number) => (
                    <li key={idx} className="flex gap-2 text-sm text-blue-900">
                      <span className="text-blue-600 font-bold">{idx + 1}.</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Try Again Button */}
            <Button
              variant="outline"
              onClick={() => {
                setResult(null)
                setJobDescription("")
              }}
              className="w-full"
            >
              Check Another Job
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}