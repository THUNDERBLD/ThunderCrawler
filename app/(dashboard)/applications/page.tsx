// app/(dashboard)/applications/page.tsx
import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ApplicationStatusSelect } from "@/components/dashboard/application-status-select"
import { DeleteApplicationButton } from "@/components/dashboard/delete-application-button"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { ExternalLink, Briefcase, MapPin, Building2 } from "lucide-react"

export const metadata = {
  title: "Applications | ThunderCrawler",
}

export default async function ApplicationsPage() {
  const user = await requireAuth()

  const applications = await prisma.application.findMany({
    where: {
      userId: user.id,
    },
    include: {
      job: true,
    },
    orderBy: {
      appliedAt: "desc",
    },
  })

  const stats = {
    total: applications.length,
    applied: applications.filter(a => a.status === "applied").length,
    interviewing: applications.filter(a => a.status === "interviewing").length,
    accepted: applications.filter(a => a.status === "accepted").length,
    rejected: applications.filter(a => a.status === "rejected").length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Applications</h1>
        <p className="text-gray-500">Track your job applications</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Applied</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.applied}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Interviewing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.interviewing}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Accepted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {applications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500 mb-4">No applications yet</p>
              <Button asChild>
                <Link href="/jobs">Browse Jobs</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          applications.map((application) => (
            <Card key={application.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div>
                      <Link 
                        href={`/jobs/${application.job.id}`}
                        className="text-xl font-bold hover:text-blue-600"
                      >
                        {application.job.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-1 text-gray-600">
                        <Building2 className="h-4 w-4" />
                        <span>{application.job.company}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm">
                      {application.job.location && (
                        <div className="flex items-center gap-1 text-gray-600">
                          <MapPin className="h-4 w-4" />
                          {application.job.location}
                        </div>
                      )}
                      {application.job.jobType && (
                        <div className="flex items-center gap-1 text-gray-600">
                          <Briefcase className="h-4 w-4" />
                          <span className="capitalize">{application.job.jobType}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>Applied: {formatDate(application.appliedAt)}</span>
                    </div>

                    {application.notes && (
                      <div className="text-sm">
                        <span className="font-medium">Notes: </span>
                        <span className="text-gray-600">{application.notes}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <ApplicationStatusSelect 
                      applicationId={application.id}
                      currentStatus={application.status}
                    />
                    
                    <Button asChild variant="outline" size="sm">
                      <a href={application.job.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View Job
                      </a>
                    </Button>

                    <DeleteApplicationButton applicationId={application.id} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}