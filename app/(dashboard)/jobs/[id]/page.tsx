// app/(dashboard)/jobs/[id]/page.tsx
import { notFound } from "next/navigation"
import { getJobById } from "@/actions/job.actions"
import { getJobUserStatus } from "@/actions/application.actions"
import { JobAIAnalysis } from "@/components/dashboard/job-ai-analysis"
import { requireAuth } from "@/lib/auth-helpers"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SaveJobButton } from "@/components/dashboard/save-job-button"
import { ApplyJobButton } from "@/components/dashboard/apply-job-button"
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  Building2,
  DollarSign,
  ArrowLeft
} from "lucide-react"
import { formatDate } from "@/lib/utils"
import Link from "next/link"

// FIX 1: Wrap params in Promise (Next.js 15 requirement)
interface JobDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  await requireAuth()
  
  // FIX 2: Await the params before using them
  const { id } = await params

  // FIX 3: Use the resolved 'id' variable here, NOT 'params.id'
  const [jobResult, userStatus] = await Promise.all([
    getJobById(id),
    getJobUserStatus(id),
  ])

  if (!jobResult.success || !jobResult.job) {
    notFound()
  }

  const { job } = jobResult

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header with Actions */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
          <div className="flex items-center gap-2 text-gray-600">
            <Building2 className="h-4 w-4" />
            <span className="font-medium">{job.company}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <SaveJobButton jobId={job.id} initialIsSaved={userStatus.isSaved} />
          <ApplyJobButton 
            jobId={job.id} 
            jobUrl={job.url}
            hasApplied={!!userStatus.application}
          />
        </div>
      </div>

      {/* Job Info */}
      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {job.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span>{job.location}</span>
              </div>
            )}

            {job.jobType && (
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-gray-500" />
                <span className="capitalize">{job.jobType}</span>
              </div>
            )}

            {job.salary && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <span>{job.salary}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span>Posted {job.postedAt ? formatDate(job.postedAt) : formatDate(job.scrapedAt)}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {job.remote && <Badge>Remote</Badge>}
            {job.experience && <Badge variant="secondary" className="capitalize">{job.experience}</Badge>}
            <Badge variant="outline" className="capitalize">{job.source}</Badge>
          </div>

          {job.skills && job.skills.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Required Skills</h4>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap">{job.description}</p>
          </div>
        </CardContent>
      </Card>

      <JobAIAnalysis jobDescription={job.description} />

      {/* Application Status (if applied) */}
      {userStatus.application && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">Application Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">Status:</span>
                <Badge className="capitalize">{userStatus.application.status}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Applied:</span>
                <span>{formatDate(userStatus.application.appliedAt)}</span>
              </div>
              {userStatus.application.notes && (
                <div>
                  <span className="font-medium">Notes:</span>
                  <p className="text-sm mt-1">{userStatus.application.notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Back Button */}
      <div>
        <Button asChild variant="outline">
          <Link href="/jobs">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Link>
        </Button>
      </div>
    </div>
  )
}