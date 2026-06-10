// app/(dashboard)/analytics/page.tsx
import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Briefcase,  
  Calendar,
  Target,
  CheckCircle
} from "lucide-react"

export const metadata = {
  title: "Analytics | ThunderCrawler",
}

export default async function AnalyticsPage() {
  const user = await requireAuth()

  const [
    totalJobs,
    totalApplications,
    jobsBySource,
    recentJobs,
    applicationsByStatus,
    applicationsByMonth,
  ] = await Promise.all([
    // ... other queries remain the same ...
    prisma.job.count(),
    prisma.application.count({ where: { userId: user.id } }),
    prisma.job.groupBy({
      by: ["source"],
      _count: true,
      orderBy: { _count: { source: "desc" } },
    }),
    prisma.job.count({
      where: {
        scrapedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    }),
    prisma.application.groupBy({
      by: ["status"],
      where: { userId: user.id },
      _count: true,
    }),

    // FIX: Use double quotes for camelCase columns and table names
    prisma.$queryRaw<Array<{ month: string; count: bigint }>>`
      SELECT 
        TO_CHAR("appliedAt", 'YYYY-MM') as month,
        COUNT(*) as count
      FROM applications
      WHERE "userId" = ${user.id}
        AND "appliedAt" >= NOW() - INTERVAL '6 months'
      GROUP BY TO_CHAR("appliedAt", 'YYYY-MM')
      ORDER BY month DESC
    `,
  ])

  // Calculate success rate
  const acceptedCount = applicationsByStatus.find(s => s.status === "accepted")?._count || 0
  const successRate = totalApplications > 0 
    ? Math.round((acceptedCount / totalApplications) * 100) 
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-gray-500">Track your job search progress</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Jobs
            </CardTitle>
            <Briefcase className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalJobs}</div>
            <p className="text-xs text-gray-500 mt-1">
              {recentJobs} added this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Applications
            </CardTitle>
            <Target className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalApplications}</div>
            <p className="text-xs text-gray-500 mt-1">
              {successRate}% success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Accepted
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{acceptedCount}</div>
            <p className="text-xs text-gray-500 mt-1">
              Job offers received
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              This Month
            </CardTitle>
            <Calendar className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {applicationsByMonth[0] ? Number(applicationsByMonth[0].count) : 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Applications sent
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Jobs by Source */}
      <Card>
        <CardHeader>
          <CardTitle>Jobs by Source</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {jobsBySource.map((source) => (
              <div key={source.source} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="capitalize">
                    {source.source}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {source._count} jobs
                  </span>
                </div>
                <div className="w-48 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${(source._count / totalJobs) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Application Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Application Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {["saved", "applied", "interviewing", "accepted", "rejected"].map((status) => {
              const count = applicationsByStatus.find(s => s.status === status)?._count || 0
              return (
                <div key={status} className="text-center">
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-sm text-gray-500 capitalize">{status}</div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Application Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Application Timeline (Last 6 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {applicationsByMonth.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No application data yet
              </p>
            ) : (
              applicationsByMonth.map((month) => (
                <div key={month.month} className="flex items-center gap-4">
                  <span className="text-sm font-medium w-24">{month.month}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-6">
                    <div
                      className="bg-green-600 h-6 rounded-full flex items-center justify-end px-2"
                      style={{
                        width: `${Math.min((Number(month.count) / totalApplications) * 100 * 5, 100)}%`,
                        minWidth: Number(month.count) > 0 ? "40px" : "0",
                      }}
                    >
                      <span className="text-white text-xs font-medium">
                        {Number(month.count)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}