"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  File, 
  BarChart3, 
  Settings,
  Zap
} from "lucide-react"

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    label: "Jobs",
    icon: Briefcase,
    href: "/jobs",
  },
  {
    label: "Applications",
    icon: FileText,
    href: "/applications",
  },
  {
    label: "Resume",
    icon: File,
    href: "/resume",
  },
  {
    label: "Analytics",
    icon: BarChart3,
    href: "/analytics",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-gray-900 text-white p-6 flex flex-col">
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center space-x-2 mb-8">
        <Zap className="h-8 w-8 text-yellow-400" />
        <span className="text-xl font-bold">ThunderCrawler</span>
      </Link>

      {/* Navigation */}
      <nav className="space-y-1 flex-1">
        {routes.map((route) => {
          const Icon = route.icon
          const isActive = pathname === route.href

          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                isActive 
                  ? "bg-gray-800 text-white" 
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{route.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}