// lib/init-queue.ts
import { scheduleRecurringScrapes } from "./queue"

/**
 * Initialize queue with recurring jobs
 * Call this when your app starts
 */
export async function initializeQueue() {
  try {
    console.log("🔧 Initializing queue...")
    await scheduleRecurringScrapes()
    console.log("✅ Queue initialized successfully")
  } catch (error) {
    console.error("❌ Failed to initialize queue:", error)
  }
}