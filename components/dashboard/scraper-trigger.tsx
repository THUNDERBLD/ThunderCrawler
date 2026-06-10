// components/dashboard/scraper-trigger.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Zap, CheckCircle, XCircle, Clock } from "lucide-react"
import { useRouter } from "next/navigation"

export function ScraperTrigger() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [queueStats, setQueueStats] = useState<any>(null)

  // Fetch queue status
  async function fetchQueueStatus() {
    try {
      const response = await fetch("/api/scrape/status")
      const data = await response.json()
      if (data.success) {
        setQueueStats(data.stats)
      }
    } catch (error) {
      console.error("Failed to fetch queue status:", error)
    }
  }

  // Fetch on mount and every 10 seconds
  useEffect(() => {
    fetchQueueStatus()
    const interval = setInterval(fetchQueueStatus, 10000)
    return () => clearInterval(interval)
  }, [])

  async function triggerScrape(source: string) {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/scrape/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source }),
      })

      const data = await response.json()
      setResult(data)

      if (data.success) {
        // Fetch updated queue status
        await fetchQueueStatus()
        
        // Refresh jobs after a delay
        setTimeout(() => {
          router.refresh()
        }, 5000)
      }
    } catch (error) {
      setResult({ success: false, error: "Failed to trigger scrape" })
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Scrape Jobs
          </CardTitle>
          <CardDescription>
            Manually trigger job scraping or view automated scraping status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Queue Stats */}
          {queueStats && (
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>Waiting: {queueStats.waiting}</span>
              </div>
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                <span>Active: {queueStats.active}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Completed: {queueStats.completed}</span>
              </div>
            </div>
          )}

          {/* Trigger Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={() => triggerScrape("yc")}
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Zap className="h-4 w-4 mr-2" />
              )}
              Y Combinator
            </Button>

            <Button disabled variant="outline">
              Wellfound (Soon)
            </Button>
            <Button disabled variant="outline">
              Internshala (Soon)
            </Button>
          </div>

          {/* Result Message */}
          {result && (
            <Alert variant={result.success ? "default" : "destructive"}>
              {result.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertDescription>
                {result.message || result.error}
                {result.jobId && (
                  <div className="text-xs mt-1 text-gray-500">
                    Job ID: {result.jobId}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Info */}
          <div className="text-xs text-gray-500">
            💡 Jobs are processed in the background. Automated scraping runs every 6 hours.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}