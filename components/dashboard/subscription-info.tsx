// components/dashboard/subscription-info.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Crown, Calendar, Zap } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface SubscriptionInfoProps {
  user: {
    subscription: string
    dailyResumeBuilds: number
    lastQuotaReset: Date
    createdAt: Date
  }
}

export function SubscriptionInfo({ user }: SubscriptionInfoProps) {
  // Calculate quota limits based on subscription
  const quotaLimits = {
    FREE: 5,
    PRO: 50,
    ENTERPRISE: 999,
  }

  const currentLimit = quotaLimits[user.subscription as keyof typeof quotaLimits] || 5
  const remainingBuilds = Math.max(0, currentLimit - user.dailyResumeBuilds)

  // Calculate quota reset time (24 hours from last reset)
  const resetTime = new Date(user.lastQuotaReset)
  resetTime.setHours(resetTime.getHours() + 24)
  const hoursUntilReset = Math.max(0, Math.ceil((resetTime.getTime() - Date.now()) / (1000 * 60 * 60)))

  return (
    <div className="space-y-4">
      {/* Current Plan */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium">Current Plan</h3>
            <Badge variant={user.subscription === "FREE" ? "secondary" : "default"}>
              {user.subscription === "FREE" && <Crown className="h-3 w-3 mr-1" />}
              {user.subscription}
            </Badge>
          </div>
          <p className="text-sm text-gray-500">
            Member since {formatDate(user.createdAt)}
          </p>
        </div>

        {user.subscription === "FREE" && (
          <Button variant="default" disabled>
            <Zap className="h-4 w-4 mr-2" />
            Upgrade (Coming Soon)
          </Button>
        )}
      </div>

      {/* Daily Quota */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Daily Resume Builds</span>
          <span className="text-sm text-gray-500">
            {remainingBuilds} / {currentLimit} remaining
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{
              width: `${((currentLimit - remainingBuilds) / currentLimit) * 100}%`,
            }}
          />
        </div>

        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Calendar className="h-3 w-3" />
          <span>Resets in {hoursUntilReset} hours</span>
        </div>
      </div>

      {/* Feature List */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Your Plan Includes:</p>
        <ul className="space-y-1 text-sm text-gray-600">
          <li className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            {currentLimit} resume builds per day
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            ATS scoring
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            Job tracking
          </li>
          {user.subscription === "FREE" && (
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              Use your own API keys for unlimited builds
            </li>
          )}
        </ul>
      </div>

      {/* Info */}
      {user.subscription === "FREE" && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
          💡 <strong>Tip:</strong> Add your own Gemini API key in the section below to get unlimited resume builds!
        </div>
      )}
    </div>
  )
}