// app/(dashboard)/jobs/page.tsx
import { getJobs } from "@/actions/job.actions"
import { JobFilters } from "@/components/dashboard/job-filters"
import { JobList } from "@/components/dashboard/job-list" // Import the new component
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export const metadata = {
  title: "Jobs | ThunderCrawler",
}

interface JobsPageProps {
  searchParams: Promise<{
    search?: string
    source?: string
    remote?: string
  }>
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const resolvedParams = await searchParams;

  const filters = {
    search: resolvedParams.search,
    source: resolvedParams.source as any,
    remote: resolvedParams.remote === "true" ? true : resolvedParams.remote === "false" ? false : undefined,
    page: 1, // Explicitly request page 1
  }

  // Fetch the initial 10 jobs
  const result = await getJobs(filters)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Job Listings</h1>
        <p className="text-gray-500">
          Browse and apply to jobs from multiple platforms
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <JobFilters />
        </div>

        {/* Job List Area */}
        <div className="lg:col-span-3 space-y-4">
          {!result.success ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{result.error}</AlertDescription>
            </Alert>
          ) : result.jobs?.length === 0 ? (
            <Alert>
              <AlertDescription>
                No jobs found. Try adjusting your filters or scrape some jobs first!
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500">
                  Showing latest jobs
                </p>
              </div>

              {/* Pass the data and filters to the Client Component */}
              <JobList 
                initialJobs={result.jobs || []} 
                filters={filters} 
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}