import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Briefcase, MapPin, Clock, Bookmark, ExternalLink } from "lucide-react"
import { formatDate } from "@/lib/utils"
import type { Job } from "@prisma/client"

interface JobCardProps {
  job: Job
  isSaved?: boolean
}

export function JobCard({ job, isSaved = false }: JobCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <Link 
              href={`/jobs/${job.id}`}
              className="text-xl font-bold hover:text-blue-600 transition-colors"
            >
              {job.title}
            </Link>
            <p className="text-gray-600 font-medium mt-1">{job.company}</p>
          </div>
          
          {isSaved && (
            <Bookmark className="h-5 w-5 text-yellow-500 fill-yellow-500" />
          )}
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {job.location && (
            <Badge variant="outline" className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {job.location}
            </Badge>
          )}
          
          {job.jobType && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Briefcase className="h-3 w-3" />
              {job.jobType}
            </Badge>
          )}
          
          {job.remote && (
            <Badge variant="secondary">Remote</Badge>
          )}
          
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {job.postedAt ? formatDate(job.postedAt) : formatDate(job.scrapedAt)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
          {job.description}
        </p>

        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {job.skills.slice(0, 5).map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {job.skills.length > 5 && (
              <Badge variant="secondary" className="text-xs">
                +{job.skills.length - 5} more
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <Badge className="capitalize">{job.source}</Badge>
          
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/jobs/${job.id}`}>
                View Details
              </Link>
            </Button>
            <Button asChild size="sm">
              <a href={job.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-1" />
                Apply
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}