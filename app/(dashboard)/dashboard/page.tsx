// app/(dashboard)/dashboard/page.tsx
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScraperTrigger } from "@/components/dashboard/scraper-trigger"
import { Briefcase, FileText, Zap } from "lucide-react"

export const metadata = {
  title: "Dashboard | ThunderCrawler",
}

export default async function DashboardPage() {
  const user = await requireAuth()

  // Fetch user stats
  const [jobCount, applicationCount, todayJobCount] = await Promise.all([
    prisma.job.count(),
    prisma.application.count({
      where: { userId: user.id },
    }),
    prisma.job.count({
      where: {
        scrapedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
  ])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500">Overview of your job search</p>
      </div>

      {/* Scraper Trigger */}
      <ScraperTrigger />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Jobs
            </CardTitle>
            <Briefcase className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{jobCount}</div>
            <p className="text-xs text-gray-500 mt-1">
              Across all platforms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Scraped Today
            </CardTitle>
            <Zap className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{todayJobCount}</div>
            <p className="text-xs text-gray-500 mt-1">
              New jobs added today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Applications
            </CardTitle>
            <FileText className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{applicationCount}</div>
            <p className="text-xs text-gray-500 mt-1">
              Jobs you&apos;ve applied to
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}