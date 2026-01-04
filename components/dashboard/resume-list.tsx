// components/dashboard/resume-list.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { FileText, Star, Trash2, Download } from "lucide-react"
import { deleteResume, setBaseResume } from "@/actions/resume.actions"
import { formatDate } from "@/lib/utils"
import type { Resume } from "@prisma/client"

interface ResumeListProps {
  resumes: Resume[]
}

export function ResumeList({ resumes }: ResumeListProps) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  async function handleSetBase(id: string) {
    setLoadingId(id)
    try {
      const result = await setBaseResume(id)
      if (result.success) {
        router.refresh()
      } else {
        alert(result.error)
      }
    } catch (error) {
      alert("Failed to set base resume")
      console.log(error)
    } finally {
      setLoadingId(null)
    }
  }

  async function handleDelete(id: string) {
    setLoadingId(id)
    try {
      const result = await deleteResume(id)
      if (result.success) {
        router.refresh()
      } else {
        alert(result.error)
      }
    } catch (error) {
      alert("Failed to delete resume")
      console.log(error)
    } finally {
      setLoadingId(null)
    }
  }

  function handleDownload(resume: Resume) {
    const blob = new Blob([resume.content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${resume.name}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (resumes.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500 mb-4">No resumes uploaded yet</p>
          <p className="text-sm text-gray-400">
            Upload your resume to start applying to jobs
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {resumes.map((resume) => (
        <Card key={resume.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">{resume.name}</CardTitle>
                  {resume.isBase && (
                    <Badge variant="default" className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current" />
                      Base
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Created {formatDate(resume.createdAt)}
                </p>
              </div>

              <div className="flex gap-2">
                {!resume.isBase && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetBase(resume.id)}
                    disabled={loadingId === resume.id}
                  >
                    <Star className="h-4 w-4 mr-1" />
                    Set as Base
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(resume)}
                >
                  <Download className="h-4 w-4" />
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={loadingId === resume.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Resume?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete &quot;{resume.name}&quot;. This action
                        cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(resume.id)}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-600 line-clamp-3 font-mono">
                {resume.content}
              </p>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {resume.content.length} characters
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}