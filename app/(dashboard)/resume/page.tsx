// app/(dashboard)/resume/page.tsx
import { requireAuth } from "@/lib/auth-helpers"
import { getUserResumes } from "@/actions/resume.actions"
import ResumeUpload from "@/components/dashboard/resume-upload"
import { ResumeList } from "@/components/dashboard/resume-list"
import { ATSChecker } from "@/components/dashboard/ats-checker"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"

export const metadata = {
  title: "Resume | ThunderCrawler",
}

export default async function ResumePage() {
  await requireAuth()
  const result = await getUserResumes()

  // Check if user has a base resume
  const hasBaseResume = result.resumes?.some((r) => r.isBase)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Resume Management</h1>
          <p className="text-gray-500">
            Upload and manage your resumes for job applications
          </p>
        </div>
        <ResumeUpload />
      </div>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Your base resume will be used as the default when applying to jobs. You can
          create customized versions for specific roles.
        </AlertDescription>
      </Alert>

      {/* ATS Score Checker */}
      {hasBaseResume ? (
        <ATSChecker />
      ) : (
        <Alert variant="default" className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            Upload and set a base resume to use the ATS Score Checker
          </AlertDescription>
        </Alert>
      )}

      {/* Resume List */}
      {result.success ? (
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Resumes</h2>
          <ResumeList resumes={result.resumes} />
        </div>
      ) : (
        <Alert variant="destructive">
          <AlertDescription>{result.error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}