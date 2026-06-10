// components/dashboard/resume-upload.tsx
"use client"

/**
 * Resume Upload Component
 * 
 * FEATURES:
 * - Drag & drop file upload
 * - Manual file selection
 * - LaTeX code input option
 * - File validation
 * - Progress states
 * - Error handling
 * 
 * WHY CLIENT COMPONENT?
 * - Uses hooks (useState, useCallback)
 * - Needs event handlers
 * - Interactive UI states
 */

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Upload, FileText, Code, X, Loader2, CheckCircle2 } from "lucide-react"
import { uploadResume, uploadResumeLatex } from "@/actions/resume.actions"
import { validateResumeFile } from "@/lib/validations";

type UploadMode = "file" | "latex"

export default function ResumeUpload() {
  const router = useRouter()
  
  // UI State
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<UploadMode>("file")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [resumeName, setResumeName] = useState("")
  const [isBase, setIsBase] = useState(false)
  
  // LaTeX upload state
  const [latexCode, setLatexCode] = useState("")

  /**
   * Handle file drop/selection
   * 
   * WHY useCallback?
   * - Prevents function recreation on every render
   * - Important for react-dropzone performance
   * - Dependencies: none (all values from event)
   */
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    // Validate file
    const validation = validateResumeFile(file, 5)
    if (!validation.valid) {
      setError(validation.error || "Invalid file")
      return
    }

    // Set file and auto-fill name
    setSelectedFile(file)
    setResumeName(file.name.replace(/\.(pdf|docx)$/i, ""))
    setError(null)
  }, [])

  /**
   * Configure react-dropzone
   * 
   * WHY react-dropzone?
   * - Handles drag & drop
   * - File validation
   * - Cross-browser compatible
   * - Accessible (keyboard navigation)
   */
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/msword": [".doc"],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
  })

  /**
   * Handle file upload submission
   * 
   * FLOW:
   * 1. Create FormData (required for Server Actions with files)
   * 2. Append file and metadata
   * 3. Call Server Action
   * 4. Handle response
   * 5. Reset form on success
   */
  async function handleFileUpload(e: React.FormEvent) {
    e.preventDefault()
    
    if (!selectedFile) {
      setError("Please select a file")
      return
    }

    if (!resumeName.trim()) {
      setError("Please enter a resume name")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("name", resumeName)
      formData.append("isBase", isBase.toString())

      // Call Server Action
      const result = await uploadResume(formData)

      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          setOpen(false)
          resetForm()
          router.refresh() // Refresh server component data
        }, 1500)
      } else {
        setError(result.error || "Upload failed")
      }
    } catch (err) {
      console.error("Upload error:", err)
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handle LaTeX code submission
   */
  async function handleLatexUpload(e: React.FormEvent) {
    e.preventDefault()

    if (!resumeName.trim()) {
      setError("Please enter a resume name")
      return
    }

    if (!latexCode.trim() || latexCode.length < 100) {
      setError("Please enter valid LaTeX code (at least 100 characters)")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await uploadResumeLatex({
        name: resumeName,
        latexCode: latexCode,
        isBase: isBase,
      })

      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          setOpen(false)
          resetForm()
          router.refresh()
        }, 1500)
      } else {
        setError(result.error || "Upload failed")
      }
    } catch (err) {
      console.error("LaTeX upload error:", err)
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  /**
   * Reset form state
   */
  function resetForm() {
    setSelectedFile(null)
    setResumeName("")
    setLatexCode("")
    setIsBase(false)
    setError(null)
    setSuccess(false)
    setLoading(false)
  }

  /**
   * Handle dialog close
   */
  function handleOpenChange(newOpen: boolean) {
    if (!loading) {
      setOpen(newOpen)
      if (!newOpen) {
        resetForm()
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Upload Resume
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Upload Resume</DialogTitle>
          <DialogDescription>
            Upload your resume as PDF/DOCX or paste LaTeX code directly
          </DialogDescription>
        </DialogHeader>

        {/* Mode Tabs */}
        <div className="flex gap-2 border-b">
          <button
            type="button"
            onClick={() => setMode("file")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              mode === "file"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <FileText className="inline h-4 w-4 mr-1" />
            File Upload
          </button>
          <button
            type="button"
            onClick={() => setMode("latex")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              mode === "latex"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Code className="inline h-4 w-4 mr-1" />
            LaTeX Code
          </button>
        </div>

        {/* Success State */}
        {success && (
          <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-md text-green-800">
            <CheckCircle2 className="h-5 w-5" />
            <p>Resume uploaded successfully!</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
            {error}
          </div>
        )}

        {/* File Upload Mode */}
        {mode === "file" && !success && (
          <form onSubmit={handleFileUpload} className="space-y-4">
            {/* Drag & Drop Zone */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-gray-300 hover:border-primary/50"
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              
              {selectedFile ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedFile(null)
                      setResumeName("")
                    }}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Drag & drop your resume here, or click to browse
                  </p>
                  <p className="text-xs text-gray-400">
                    PDF or DOCX, max 5MB
                  </p>
                </div>
              )}
            </div>

            {/* Resume Name Input */}
            <div className="space-y-2">
              <Label htmlFor="name">Resume Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="e.g., Software Engineer Resume"
                value={resumeName}
                onChange={(e) => setResumeName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {/* Base Resume Checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isBase"
                checked={isBase}
                onChange={(e) => setIsBase(e.target.checked)}
                disabled={loading}
                className="h-4 w-4"
              />
              <Label htmlFor="isBase" className="text-sm font-normal cursor-pointer">
                Set as base resume (used by default when applying)
              </Label>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={loading || !selectedFile}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Resume
                </>
              )}
            </Button>
          </form>
        )}

        {/* LaTeX Mode */}
        {mode === "latex" && !success && (
          <form onSubmit={handleLatexUpload} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="latex-name">Resume Name</Label>
              <Input
                id="latex-name"
                type="text"
                placeholder="e.g., LaTeX Resume"
                value={resumeName}
                onChange={(e) => setResumeName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="latex-code">LaTeX Code</Label>
              <textarea
                id="latex-code"
                value={latexCode}
                onChange={(e) => setLatexCode(e.target.value)}
                placeholder="Paste your LaTeX resume code here..."
                rows={12}
                className="w-full p-3 border rounded-md font-mono text-sm"
                disabled={loading}
                required
              />
              <p className="text-xs text-gray-500">
                Minimum 100 characters required
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isBase-latex"
                checked={isBase}
                onChange={(e) => setIsBase(e.target.checked)}
                disabled={loading}
                className="h-4 w-4"
              />
              <Label htmlFor="isBase-latex" className="text-sm font-normal cursor-pointer">
                Set as base resume
              </Label>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Code className="h-4 w-4 mr-2" />
                  Create Resume
                </>
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}