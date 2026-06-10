"use client"

import { useState } from "react"
import { JobCard } from "@/components/dashboard/job-card"
import { Button } from "@/components/ui/button"
import { getJobs } from "@/actions/job.actions"
import { Loader2 } from "lucide-react"

interface JobListProps {
  initialJobs: any[]
  filters: any
}

export function JobList({ initialJobs, filters }: JobListProps) {
  const [jobs, setJobs] = useState<any[]>(initialJobs)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)

  const loadMore = async () => {
    setLoading(true)
    const nextPage = page + 1
    
    // Call the server action with the next page number
    const result = await getJobs({ ...filters, page: nextPage })

    if (result.success && result.jobs) {
      if (result.jobs.length < 10) {
        setHasMore(false) // No more jobs to load after this batch
      }
      // Append new jobs to the existing list
      setJobs((prev) => [...prev, ...result.jobs])
      setPage(nextPage)
    } else {
      setHasMore(false)
    }
    setLoading(false)
  }

  // If initial load was less than 10, don't show the button
  if (initialJobs.length < 10 && hasMore) {
    setHasMore(false)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button 
            variant="outline" 
            onClick={loadMore} 
            disabled={loading}
            className="w-full md:w-auto min-w-[200px]"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More Jobs"
            )}
          </Button>
        </div>
      )}
      
      {!hasMore && jobs.length > 0 && (
        <p className="text-center text-sm text-gray-500 mt-6">
          You&apos;ve viewed all available jobs.
        </p>
      )}
    </div>
  )
}