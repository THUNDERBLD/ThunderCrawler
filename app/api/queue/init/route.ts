// app/api/queue/init/route.ts
import { NextResponse } from "next/server"
import { initializeQueue } from "@/lib/init-queue"

export async function POST() {
  try {
    await initializeQueue()
    
    return NextResponse.json({
      success: true,
      message: "Queue initialized with recurring jobs",
    })
  } catch (error: unknown) {
    console.error("Queue init error:", error)
    return NextResponse.json(
      { error: (error as Error).message || "Failed to initialize queue" },
      { status: 500 }
    )
  }
}