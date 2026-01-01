// app/(dashboard)/jobs/page.tsx
import { getJobs } from "@/actions/job.actions"
import { JobCard } from "@/components/dashboard/job-card"
import { JobFilters } from "@/components/dashboard/job-filters"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export const metadata = {
  title: "Jobs | ThunderCrawler",
}

// FIX 1: Update the interface to wrap the object in a Promise
interface JobsPageProps {
  searchParams: Promise<{
    search?: string
    source?: string
    remote?: string
  }>
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  // FIX 2: Await the searchParams before accessing properties
  const resolvedParams = await searchParams;

  const filters = {
    search: resolvedParams.search,
    source: resolvedParams.source as any,
    // Use resolvedParams here instead of searchParams
    remote: resolvedParams.remote === "true" ? true : resolvedParams.remote === "false" ? false : undefined,
  }

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

        {/* Job List */}
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
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  {result.jobs?.length} jobs found
                </p>
              </div>

              <div className="space-y-4">
                {result.jobs?.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}