import { Job, User, Application, Resume } from '@prisma/client'

// Re-export Prisma types
export type { Job, User, Application, Resume }

// Extended types with relations
export type JobWithApplications = Job & {
  applications: Application[]
  _count: {
    applications: number
    savedJobs: number
  }
}


export type ApplicationWithJobAndUser = Application & {
  job: Job
  user: User
}

// API response types
export type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: string
}

// Job filter types
export type JobFilters = {
  search?: string
  source?: string
  remote?: boolean
  minSalary?: number
  skills?: string[]
}