// components/dashboard/application-status-select.tsx
"use client"

import { useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateApplicationStatus } from "@/actions/application.actions"
import { useRouter } from "next/navigation"
import { APPLICATION_STATUS } from "@/lib/constants"

interface ApplicationStatusSelectProps {
  applicationId: string
  currentStatus: string
}

export function ApplicationStatusSelect({ 
  applicationId, 
  currentStatus 
}: ApplicationStatusSelectProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  async function handleStatusChange(newStatus: string) {
    setIsLoading(true)

    try {
      const result = await updateApplicationStatus(applicationId, newStatus)

      if (result.success) {
        router.refresh()
      } else {
        alert(result.error)
      }
    } catch (error) {
      alert("Failed to update status")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Select 
      value={currentStatus} 
      onValueChange={handleStatusChange}
      disabled={isLoading}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={APPLICATION_STATUS.SAVED}>Saved</SelectItem>
        <SelectItem value={APPLICATION_STATUS.APPLIED}>Applied</SelectItem>
        <SelectItem value={APPLICATION_STATUS.INTERVIEWING}>Interviewing</SelectItem>
        <SelectItem value={APPLICATION_STATUS.ACCEPTED}>Accepted</SelectItem>
        <SelectItem value={APPLICATION_STATUS.REJECTED}>Rejected</SelectItem>
      </SelectContent>
    </Select>
  )
}