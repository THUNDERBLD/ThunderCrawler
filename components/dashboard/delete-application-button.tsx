// components/dashboard/delete-application-button.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Trash2 } from "lucide-react"
import { deleteApplication } from "@/actions/application.actions"
import { useRouter } from "next/navigation"

interface DeleteApplicationButtonProps {
  applicationId: string
}

export function DeleteApplicationButton({ applicationId }: DeleteApplicationButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  async function handleDelete() {
    setIsLoading(true)

    try {
      const result = await deleteApplication(applicationId)

      if (result.success) {
        router.refresh()
      } else {
        alert(result.error)
      }
    } catch (error) {
      alert("Failed to delete application")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" disabled={isLoading}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Application?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete this application record. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}