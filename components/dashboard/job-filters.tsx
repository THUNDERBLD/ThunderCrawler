"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, X } from "lucide-react"

export function JobFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [source, setSource] = useState(searchParams.get("source") || "all")
  const [remote, setRemote] = useState(searchParams.get("remote") || "all")

  function handleFilter() {
    const params = new URLSearchParams()
    
    if (search) params.set("search", search)
    if (source !== "all") params.set("source", source)
    if (remote !== "all") params.set("remote", remote)

    router.push(`/jobs?${params.toString()}`)
  }

  function handleReset() {
    setSearch("")
    setSource("all")
    setRemote("all")
    router.push("/jobs")
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow space-y-4">
      <h3 className="font-semibold text-lg">Filters</h3>

      {/* Search */}
      <div className="space-y-2">
        <Label htmlFor="search">Search</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="search"
            placeholder="Job title, company, or keyword"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleFilter()}
            className="pl-10"
          />
        </div>
      </div>

      {/* Source */}
      <div className="space-y-2">
        <Label htmlFor="source">Source</Label>
        <Select value={source} onValueChange={setSource}>
          <SelectTrigger id="source">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="yc">Y Combinator</SelectItem>
            <SelectItem value="wellfound">Wellfound</SelectItem>
            <SelectItem value="internshala">Internshala</SelectItem>
            <SelectItem value="linkedin">LinkedIn</SelectItem>
            <SelectItem value="indeed">Indeed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Remote */}
      <div className="space-y-2">
        <Label htmlFor="remote">Location</Label>
        <Select value={remote} onValueChange={setRemote}>
          <SelectTrigger id="remote">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            <SelectItem value="true">Remote Only</SelectItem>
            <SelectItem value="false">On-site</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        <Button onClick={handleFilter} className="flex-1">
          Apply Filters
        </Button>
        <Button onClick={handleReset} variant="outline">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}