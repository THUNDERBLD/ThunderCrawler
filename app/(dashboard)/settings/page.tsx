// app/(dashboard)/settings/page.tsx
import { requireAuth } from "@/lib/auth-helpers"
import { getUserApiKeys } from "@/actions/settings.actions"
import { prisma } from "@/lib/prisma"
import { ProfileForm } from "@/components/dashboard/profile-form"
import { ApiKeysForm } from "@/components/dashboard/api-keys-form"
import { SubscriptionInfo } from "@/components/dashboard/subscription-info"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "Settings | ThunderCrawler",
}

export default async function SettingsPage() {
  const user = await requireAuth()
  
  // Get full user data
  const userData = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      subscription: true,
      dailyResumeBuilds: true,
      lastQuotaReset: true,
      createdAt: true,
    },
  })

  // Get API keys
  const apiKeysResult = await getUserApiKeys()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-500">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Update your personal information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm user={userData!} />
        </CardContent>
      </Card>

      {/* Subscription Info */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>
            Your current plan and usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SubscriptionInfo user={userData!} />
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>
            Manage your Gemini API keys for resume generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ApiKeysForm keys={apiKeysResult.keys} />
        </CardContent>
      </Card>
    </div>
  )
}