// components/dashboard/save-job-button.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Bookmark } from "lucide-react"
import { saveJob, unsaveJob } from "@/actions/application.actions"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface SaveJobButtonProps {
  jobId: string
  initialIsSaved: boolean
}

export function SaveJobButton({ jobId, initialIsSaved }: SaveJobButtonProps) {
  const router = useRouter()
  const [isSaved, setIsSaved] = useState(initialIsSaved)
  const [isLoading, setIsLoading] = useState(false)

  async function handleToggle() {
    setIsLoading(true)

    try {
      const result = isSaved ? await unsaveJob(jobId) : await saveJob(jobId)

      if (result.success) {
        setIsSaved(!isSaved)
        router.refresh()
      } else {
        toast.success("Job saved successfully")
        toast.error(result.error || "Failed to save job")
      }
    } catch (error) {
      alert("Something went wrong")
      console.error("Error toggling save job:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleToggle}
      disabled={isLoading}
      className="flex items-center gap-2"
    >
      <Bookmark
        className={`h-4 w-4 ${isSaved ? "fill-yellow-500 text-yellow-500" : ""}`}
      />
      {isSaved ? "Saved" : "Save Job"}
    </Button>
  )
}