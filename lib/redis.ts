// lib/redis.ts
import { Redis } from "ioredis"

/**
 * Redis Client Singleton
 * Used for BullMQ queues and caching
 */

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined
}

export const redis =
  globalForRedis.redis ??
  new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
    maxRetriesPerRequest: null, // Required for BullMQ
    enableReadyCheck: false,
  })

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis
}

// Test connection
redis.on("connect", () => {
  console.log("✅ Redis connected")
})

redis.on("error", (err) => {
  console.error("❌ Redis connection error:", err)
})