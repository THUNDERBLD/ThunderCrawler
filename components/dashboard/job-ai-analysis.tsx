// components/dashboard/job-ai-analysis.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Collapsible,
  CollapsibleContent
} from "@/components/ui/collapsible"
import { Sparkles, ChevronDown, Loader2 } from "lucide-react"

interface JobAIAnalysisProps {
  jobDescription: string
}

export function JobAIAnalysis({ jobDescription }: JobAIAnalysisProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleAnalyze() {
    if (analysis) {
      setIsOpen(!isOpen)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/ai/analyze-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription }),
      })

      const data = await response.json()

      if (data.success) {
        setAnalysis(data.analysis)
        setIsOpen(true)
      } else {
        setError(data.error)
      }
    } catch (error) {
      setError("Failed to analyze job")
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            AI Job Analysis
          </CardTitle>
          <Button
            variant="outline"
            onClick={handleAnalyze}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : analysis ? (
              <>
                <ChevronDown className={`h-4 w-4 mr-2 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                {isOpen ? "Hide" : "Show"} Analysis
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Analyze Job
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      {error && (
        <CardContent>
          <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
            {error}
          </div>
        </CardContent>
      )}

      {analysis && (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              {/* Required Skills */}
              <div>
                <h4 className="font-semibold mb-2">Required Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.skills.map((skill: string) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Experience Level */}
              <div>
                <h4 className="font-semibold mb-2">Experience Level</h4>
                <Badge className="capitalize">{analysis.experienceLevel}</Badge>
              </div>

              {/* Main Responsibilities */}
              <div>
                <h4 className="font-semibold mb-2">Main Responsibilities</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {analysis.responsibilities.map((resp: string, i: number) => (
                    <li key={i}>{resp}</li>
                  ))}
                </ul>
              </div>

              {/* Red Flags */}
              {analysis.redFlags.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-red-600">⚠️ Red Flags</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-red-600">
                    {analysis.redFlags.map((flag: string, i: number) => (
                      <li key={i}>{flag}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Culture Indicators */}
              {analysis.cultureIndicators.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Company Culture</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.cultureIndicators.map((indicator: string) => (
                      <Badge key={indicator} variant="outline">
                        {indicator}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      )}
    </Card>
  )
}