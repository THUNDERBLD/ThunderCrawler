// components/dashboard/api-keys-form.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Loader2, Key, ToggleLeft, ToggleRight } from "lucide-react"
import { addApiKey, deleteApiKey, toggleApiKey } from "@/actions/settings.actions"
import { formatDate } from "@/lib/utils"

interface ApiKey {
  id: string
  provider: string
  name: string
  isActive: boolean
  usageCount: number
  lastUsed: Date | null
  createdAt: Date
}

interface ApiKeysFormProps {
  keys: ApiKey[]
}

export function ApiKeysForm({ keys }: ApiKeysFormProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Add key form state
  const [provider, setProvider] = useState<"GEMINI" | "OPENAI">("GEMINI")
  const [apiKey, setApiKey] = useState("")
  const [keyName, setKeyName] = useState("")

  async function handleAddKey(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const result = await addApiKey({
        provider,
        apiKey,
        name: keyName,
      })

      if (result.success) {
        setOpen(false)
        setApiKey("")
        setKeyName("")
        router.refresh()
      } else {
        setError(result.error || "Failed to add API key")
      }
    } catch (err) {
      setError("An unexpected error occurred")
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(keyId: string) {
    if (!confirm("Are you sure you want to delete this API key?")) {
      return
    }

    setActionLoading(keyId)
    try {
      const result = await deleteApiKey(keyId)
      if (result.success) {
        router.refresh()
      } else {
        alert(result.error)
      }
    } catch (err) {
      alert("Failed to delete API key")
      console.log(err)
    } finally {
      setActionLoading(null)
    }
  }

  async function handleToggle(keyId: string) {
    setActionLoading(keyId)
    try {
      const result = await toggleApiKey(keyId)
      if (result.success) {
        router.refresh()
      } else {
        alert(result.error)
      }
    } catch (err) {
      alert("Failed to toggle API key")
      console.log(err)
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Info Alert */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
        <p className="font-medium mb-1">Why add your own API key?</p>
        <p>
          After using your free daily quota, you can use your own Gemini API key to continue generating resumes.
          Your key is encrypted and only used for your requests.
        </p>
      </div>

      {/* Add Key Button */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add API Key
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add API Key</DialogTitle>
            <DialogDescription>
              Add your Gemini or OpenAI API key to continue using resume features after your quota.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleAddKey} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="provider">Provider</Label>
              <Select
                value={provider}
                onValueChange={(value) => setProvider(value as "GEMINI" | "OPENAI")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GEMINI">Google Gemini</SelectItem>
                  <SelectItem value="OPENAI">OpenAI (Coming Soon)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="keyName">Key Name</Label>
              <Input
                id="keyName"
                type="text"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                placeholder="e.g., My Gemini Key"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIza..."
                required
                disabled={loading}
              />
              <p className="text-xs text-gray-500">
                Get your Gemini API key from{" "}
                <a
                  href="https://makersuite.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Google AI Studio
                </a>
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Key className="h-4 w-4 mr-2" />
                  Add Key
                </>
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* API Keys List */}
      {keys.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Key className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p>No API keys added yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {keys.map((key) => (
            <div
              key={key.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium">{key.name}</p>
                  <Badge variant={key.isActive ? "default" : "secondary"}>
                    {key.provider}
                  </Badge>
                  {!key.isActive && (
                    <Badge variant="outline">Disabled</Badge>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  Used {key.usageCount} times
                  {key.lastUsed && (
                    <> · Last used {formatDate(key.lastUsed)}</>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggle(key.id)}
                  disabled={actionLoading === key.id}
                >
                  {actionLoading === key.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : key.isActive ? (
                    <ToggleRight className="h-4 w-4" />
                  ) : (
                    <ToggleLeft className="h-4 w-4" />
                  )}
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(key.id)}
                  disabled={actionLoading === key.id}
                >
                  {actionLoading === key.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}