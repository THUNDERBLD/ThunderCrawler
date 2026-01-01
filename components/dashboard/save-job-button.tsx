// components/dashboard/save-job-button.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Bookmark } from "lucide-react"
import { saveJob, unsaveJob } from "@/actions/application.actions"
import { useRouter } from "next/navigation"

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
        alert(result.error)
      }
    } catch (error) {
      alert("Something went wrong")
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