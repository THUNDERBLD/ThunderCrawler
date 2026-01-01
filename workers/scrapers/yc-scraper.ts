// workers/scrapers/yc-scraper.ts
import axios from "axios"
import * as cheerio from "cheerio"
import { BaseScraper, ScraperResult } from "./base-scraper"

export class YCScraper extends BaseScraper {
  constructor() {
    super("yc", "https://www.ycombinator.com/jobs")
  }

  async scrape(): Promise<ScraperResult> {
    const errors: string[] = []
    let jobsScraped = 0

    try {
      console.log(`🚀 Starting YC Jobs scrape...`)

      const response = await axios.get(this.baseUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        timeout: 10000,
      })

      console.log(`📄 Response status: ${response.status}`)

      const $ = cheerio.load(response.data)
      
      // Find the React component div with job data
      const reactComponent = $('div[id^="WaasLandingPage-react-component"]')
      
      if (reactComponent.length === 0) {
        throw new Error('Could not find WaasLandingPage component')
      }

      const dataPageAttr = reactComponent.attr('data-page')

      if (!dataPageAttr) {
        throw new Error('data-page attribute is empty')
      }

      console.log('✅ Found data with job listings')

      // Decode HTML entities (&quot; -> ", &amp; -> &, etc.)
      const decodedData = $('<div/>').html(dataPageAttr).text()
      
      // Parse the JSON data
      const pageData = JSON.parse(decodedData)
      const jobPostings = pageData.props?.jobPostings || pageData.jobPostings || []

      console.log(`📦 Found ${jobPostings.length} jobs from YC`)

      const jobs = jobPostings.map((job: any) => {
        // Helper function to safely parse dates
        const parseDate = (dateStr: string | null | undefined): Date | null => {
          if (!dateStr) return null
          const parsed = new Date(dateStr)
          return isNaN(parsed.getTime()) ? null : parsed
        }

        return {
          title: job.title,
          company: job.companyName,
          location: job.location || "Not specified",
          description: job.companyOneLiner || job.title || "No description available",
          url: job.applyUrl || `https://www.workatastartup.com${job.url}`,
          remote: job.location?.toLowerCase().includes('remote') || false,
          skills: job.skills || [],
          jobType: job.type?.toLowerCase().replace('-', ' ') || null,
          salary: job.salaryRange || null,
          postedAt: parseDate(job.createdAt), // Safely parse date or set to null
        }
      }).filter(job => job.title && job.company && job.url) // Filter out incomplete jobs

      console.log(`✅ Processed ${jobs.length} valid jobs`)

      // Save to database
      if (jobs.length > 0) {
        jobsScraped = await this.saveJobs(jobs)
        console.log(`✅ Saved ${jobsScraped} jobs to database`)
      }

      return {
        success: true,
        jobsScraped,
        errors,
      }
    } catch (error: any) {
      console.error("❌ YC Scraper failed:", error.message)
      errors.push(error.message)
      return {
        success: false,
        jobsScraped: 0,
        errors,
      }
    }
  }
}