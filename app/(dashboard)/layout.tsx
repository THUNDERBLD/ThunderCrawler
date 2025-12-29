// app/(dashboard)/layout.tsx
import { requireAuth } from "@/lib/auth-helpers"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Protect all dashboard routes
  const user = await requireAuth()

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <DashboardSidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <DashboardHeader user={user} />
        <main className="flex-1 p-8 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  )
}