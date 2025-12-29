"use client"

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { signOutAction } from "@/actions/auth.actions"

interface DashboardHeaderProps {
  user: {
    name?: string | null
    email?: string | null
  }
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <header className="border-b bg-white px-8 py-4 flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold">
          Welcome back, {user.name || "there"}!
        </h2>
        <p className="text-sm text-gray-500">{user.email}</p>
      </div>

      <form action={signOutAction}>
        <Button
          type="submit"
          variant="outline"
          className="flex items-center space-x-2"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign out</span>
        </Button>
      </form>
    </header>
  )
}