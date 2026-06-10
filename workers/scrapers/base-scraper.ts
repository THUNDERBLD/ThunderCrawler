import { prisma } from "@/lib/prisma"
import type { Job } from "@prisma/client"

export interface ScraperResult {
  success: boolean
  jobsScraped: number
  errors: string[]
}

export abstract class BaseScraper {
  protected source: string
  protected baseUrl: string

  constructor(source: string, baseUrl: string) {
    this.source = source
    this.baseUrl = baseUrl
  }

  /**
   * Main scraping method - implemented by each scraper
   */
  abstract scrape(): Promise<ScraperResult>

  /**
   * Save jobs to database
   */
  protected async saveJobs(jobs: Partial<Job>[]): Promise<number> {
    let savedCount = 0

    for (const job of jobs) {
      try {
        await prisma.job.upsert({
          where: { url: job.url! },
          update: {
            title: job.title,
            company: job.company,
            location: job.location,
            salary: job.salary,
            description: job.description,
            jobType: job.jobType,
            experience: job.experience,
            remote: job.remote,
            skills: job.skills,
            postedAt: job.postedAt,
            scrapedAt: new Date(),
          },
          create: {
            title: job.title!,
            company: job.company!,
            location: job.location,
            salary: job.salary,
            description: job.description!,
            url: job.url!,
            source: this.source,
            jobType: job.jobType,
            experience: job.experience,
            remote: job.remote || false,
            skills: job.skills || [],
            postedAt: job.postedAt,
            scrapedAt: new Date(),
          },
        })
        savedCount++
      } catch (error) {
        console.error(`Failed to save job: ${job.url}`, error)
      }
    }

    return savedCount
  }

  /**
   * Delay between requests to avoid rate limiting
   */
  protected async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}