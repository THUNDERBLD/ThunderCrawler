// app/(dashboard)/resume/page.tsx
import { requireAuth } from "@/lib/auth-helpers"
import { getUserResumes } from "@/actions/resume.actions"
import ResumeUpload from "@/components/dashboard/resume-upload"
import { ResumeList } from "@/components/dashboard/resume-list"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"

export const metadata = {
  title: "Resume | ThunderCrawler",
}

export default async function ResumePage() {
  await requireAuth()
  const result = await getUserResumes()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Resume Management</h1>
          <p className="text-gray-500">
            Upload and manage your resumes for job applications
          </p>
        </div>
        <ResumeUpload />
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Your base resume will be used as the default when applying to jobs. You can
          create customized versions for specific roles.
        </AlertDescription>
      </Alert>

      {result.success ? (
        <ResumeList resumes={result.resumes} />
      ) : (
        <Alert variant="destructive">
          <AlertDescription>{result.error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}