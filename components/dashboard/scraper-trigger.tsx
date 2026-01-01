"use client"

import { useState } from "react"
import axios from "axios" // Import Axios
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Zap, CheckCircle, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export function ScraperTrigger() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  async function triggerScrape(source: string) {
    setIsLoading(true)
    setResult(null)

    try {
      // CHANGED: Using axios instead of fetch
      const response = await axios.post("/api/scrape/trigger", { 
        source 
      })

      const data = response.data
      setResult(data)

      if (data.success) {
        // Refresh the page to show new jobs
        router.refresh()
      }
    } catch (error: any) {
      // CHANGED: Better error handling for Axios
      const errorMessage = error.response?.data?.error || error.message || "Failed to trigger scrape"
      
      setResult({ 
        success: false, 
        error: errorMessage 
      })
      console.error("Scrape error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          Scrape Jobs
        </CardTitle>
        <CardDescription>
          Manually trigger job scraping from different platforms
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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

          {/* Add more scrapers later */}
          <Button disabled variant="outline">
            Wellfound (Soon)
          </Button>
          <Button disabled variant="outline">
            Internshala (Soon)
          </Button>
        </div>

        {result && (
          <Alert variant={result.success ? "default" : "destructive"}>
            {result.success ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <AlertDescription>
              {result.message || result.error}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}