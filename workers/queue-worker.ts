// workers/queue-worker.ts
import { Worker, Job } from "bullmq"
import { redis } from "@/lib/redis"
import { YCScraper } from "./scrapers/yc-scraper"
import { ScraperJobType, ScrapeYCJobData, ScrapeAllJobData } from "@/lib/queue"

/**
 * Background Worker Process
 * This runs separately from Next.js and processes jobs from the queue
 */

console.log("🚀 Starting queue worker...")

const worker = new Worker(
  "scraper",
  async (job: Job) => {
    console.log(`📥 Processing job: ${job.name} (ID: ${job.id})`)

    try {
      switch (job.name) {
        case ScraperJobType.SCRAPE_YC: {
          const data = job.data as ScrapeYCJobData
          console.log(`🔍 Scraping YC jobs (triggered by: ${data.triggeredBy || "unknown"})`)

          const scraper = new YCScraper()
          const result = await scraper.scrape()

          if (!result.success) {
            throw new Error(`Scraping failed: ${result.errors.join(", ")}`)
          }

          console.log(`✅ Successfully scraped ${result.jobsScraped} jobs from YC`)

          return {
            success: true,
            jobsScraped: result.jobsScraped,
            source: "yc",
          }
        }

        case ScraperJobType.SCRAPE_ALL: {
          const data = job.data as ScrapeAllJobData
          console.log(`🔍 Scraping all sources: ${data.sources.join(", ")}`)

          const results = []

          // For now, only YC is implemented
          if (data.sources.includes("yc")) {
            const scraper = new YCScraper()
            const result = await scraper.scrape()
            results.push({ source: "yc", ...result })
          }

          const totalScraped = results.reduce((sum, r) => sum + r.jobsScraped, 0)
          console.log(`✅ Successfully scraped ${totalScraped} jobs total`)

          return {
            success: true,
            results,
            totalScraped,
          }
        }

        default:
          throw new Error(`Unknown job type: ${job.name}`)
      }
    } catch (error: any) {
      console.error(`❌ Job failed: ${error.message}`)
      throw error // This will mark the job as failed and trigger retry
    }
  },
  {
    connection: redis,
    concurrency: 1, // Process one job at a time
    limiter: {
      max: 10, // Max 10 jobs
      duration: 60000, // Per minute
    },
  }
)

// Worker events
worker.on("completed", (job) => {
  console.log(`✅ Job completed: ${job.id}`)
})

worker.on("failed", (job, err) => {
  console.error(`❌ Job failed: ${job?.id}`, err.message)
})

worker.on("error", (err) => {
  console.error("❌ Worker error:", err)
})

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("🛑 SIGTERM received, closing worker...")
  await worker.close()
  process.exit(0)
})

process.on("SIGINT", async () => {
  console.log("🛑 SIGINT received, closing worker...")
  await worker.close()
  process.exit(0)
})

console.log("✅ Worker started and ready to process jobs")