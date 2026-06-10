// components/dashboard/apply-job-button.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ExternalLink } from "lucide-react"
import { applyToJob } from "@/actions/application.actions"
import { useRouter } from "next/navigation"

interface ApplyJobButtonProps {
  jobId: string
  jobUrl: string
  hasApplied: boolean
}

export function ApplyJobButton({ jobId, jobUrl, hasApplied }: ApplyJobButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  async function handleApply() {
    setIsLoading(true)

    try {
      const result = await applyToJob(jobId, notes)

      if (result.success) {
        setOpen(false)
        setNotes("")
        router.refresh()
        // Open job URL in new tab
        window.open(jobUrl, "_blank")
      } else {
        alert(result.error)
      }
    } catch (error) {
      alert("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  if (hasApplied) {
    return (
      <Button variant="outline" disabled>
        Already Applied
      </Button>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <ExternalLink className="h-4 w-4" />
          Apply Now
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark as Applied</DialogTitle>
          <DialogDescription>
            This will open the job application page and record your application in ThunderCrawler.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this application..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleApply} disabled={isLoading} className="flex-1">
              {isLoading ? "Recording..." : "Apply & Open Job Page"}
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}