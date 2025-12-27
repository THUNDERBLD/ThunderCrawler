// This file creates ONE shared PrismaClient instance for your entire app.
// Why?
// 1. PrismaClient opens database connections
// 2. In dev mode, hot-reload(reloading again and again on each change) can create multiple clients
// 3. Multiple clients = too many DB connections
// 4. DB crashes or Prisma throws warnings
// This file prevents that.


// Import the generated Prisma database client, This client knows your schema and tables and It’s your only way to talk to Postgres
import { PrismaClient } from '@prisma/client'     // Without this → no DB access.

// Prisma Client Singleton // Prevents multiple instances in development (hot reload issue)
const globalForPrisma = globalThis as unknown as {            // A global object available in Node.js and Survives hot reloads in development
                                                             // Reload files without restarting Node // Normal const prisma = new PrismaClient() runs again and You ends up with Too many connections
  prisma: PrismaClient | undefined                          // TypeScript doesn’t know globalThis.prisma  // We’re telling TS: “Trust me, this property exists”
}

export const prisma =
  globalForPrisma.prisma ??           // ?? (nullish coalescing)  // If globalForPrisma.prisma exists → use it, else → create a new PrismaClient
  new PrismaClient({                  // In dev mode: First load → creates PrismaClient   AND   Hot reload → reuses existing one
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],     // In prod mode: App starts once   AND   Single PrismaClient anyway
  })                                // Log all queries in DEVELOPMENT MODE for debugging -> LIKE Logs every SQL query, errors, and warnings to the console. 

// Why only in dev? -> Production servers don’t hot-reload, Storing globally in prod is unnecessary and Avoids weird edge cases
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma          // What this achieves: On first load, creates and stores PrismaClient in globalForPrisma.prisma   AND   On hot reloads, reuses the existing instance

