import { requireGuest } from "@/lib/auth-helpers"

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Redirect to dashboard if already logged in
  await requireGuest()

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 px-4">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  )
}