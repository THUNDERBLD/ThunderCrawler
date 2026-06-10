import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function JobNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      <AlertCircle className="h-16 w-16 text-gray-400 mb-4" />
      <h2 className="text-2xl font-bold mb-2">Job Not Found</h2>
      <p className="text-gray-500 mb-6">
        This job listing doesn&apos;t exist or has been removed.
      </p>
      <Button asChild>
        <Link href="/jobs">Browse All Jobs</Link>
      </Button>
    </div>
  )
}