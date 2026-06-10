// lib/queue.ts
import { Queue, QueueEvents } from "bullmq"
import { redis } from "@/lib/redis"

/**
 * Job Queue for Scraping Tasks
 */

// Queue configuration
const queueConfig = {
  connection: redis,
  defaultJobOptions: {
    attempts: 3, // Retry failed jobs 3 times
    backoff: {
      type: "exponential" as const,
      delay: 5000, // Start with 5 second delay
    },
    removeOnComplete: {
      age: 86400, // Keep completed jobs for 24 hours
      count: 100, // Keep last 100 completed jobs
    },
    removeOnFail: {
      age: 86400 * 7, // Keep failed jobs for 7 days
      count: 1000, // Keep last 1000 failed jobs
    },
  },
}

// Create the scraper queue
export const scraperQueue = new Queue("scraper", queueConfig)

// Queue events for monitoring
export const scraperQueueEvents = new QueueEvents("scraper", {
  connection: redis,
})

// Job types
export enum ScraperJobType {
  SCRAPE_YC = "scrape_yc",
  SCRAPE_ALL = "scrape_all",
}

// Job data interfaces
export interface ScrapeYCJobData {
  source: "yc"
  triggeredBy?: string // user ID or "system"
}

export interface ScrapeAllJobData {
  sources: string[]
  triggeredBy?: string
}

/**
 * Add a job to scrape YC jobs (One-off)
 */
export async function addYCScrapeJob(triggeredBy?: string) {
  return await scraperQueue.add(
    ScraperJobType.SCRAPE_YC,
    {
      source: "yc",
      triggeredBy,
    } as ScrapeYCJobData,
    {
      jobId: `yc-${Date.now()}`, // Unique job ID for one-off
    }
  )
}

/**
 * Add a job to scrape all sources (One-off)
 */
export async function addScrapeAllJob(sources: string[], triggeredBy?: string) {
  return await scraperQueue.add(
    ScraperJobType.SCRAPE_ALL,
    {
      sources,
      triggeredBy,
    } as ScrapeAllJobData,
    {
      jobId: `all-${Date.now()}`,
    }
  )
}

/**
 * Schedule recurring scrape jobs
 * UPDATED for BullMQ v5+ Job Schedulers
 */
export async function scheduleRecurringScrapes() {
  // 1. Get all existing schedulers (using new API)
  const schedulers = await scraperQueue.getJobSchedulers()

  // 2. Remove them to ensure a clean slate (using new API)
  for (const scheduler of schedulers) {
    await scraperQueue.removeJobScheduler(scheduler.key)
  }

  // 3. Add the new recurring job using upsertJobScheduler
  // This is the modern replacement for queue.add(..., { repeat: ... })
  const schedulerId = "yc-recurring-6h"
  
  await scraperQueue.upsertJobScheduler(
    schedulerId,
    {
      pattern: "0 */6 * * *", // Every 6 hours
    },
    {
      name: ScraperJobType.SCRAPE_YC,
      data: {
        source: "yc",
        triggeredBy: "system",
      } as ScrapeYCJobData,
      opts: {
        // These options apply to the jobs created by the scheduler
        removeOnComplete: { count: 50 }, 
        removeOnFail: { count: 50 }
      }
    }
  )

  console.log("✅ Scheduled recurring scrape jobs")
}

/**
 * Get queue statistics
 */
export async function getQueueStats() {
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    scraperQueue.getWaitingCount(),
    scraperQueue.getActiveCount(),
    scraperQueue.getCompletedCount(),
    scraperQueue.getFailedCount(),
    scraperQueue.getDelayedCount(),
  ])

  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
    total: waiting + active + completed + failed + delayed,
  }
}

/**
 * Get recent jobs
 */
export async function getRecentJobs(limit: number = 10) {
  const [completed, failed, active] = await Promise.all([
    scraperQueue.getCompleted(0, limit),
    scraperQueue.getFailed(0, limit),
    scraperQueue.getActive(0, limit),
  ])

  return {
    completed,
    failed,
    active,
  }
}