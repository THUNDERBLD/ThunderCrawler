// app/(auth)/signin/page.tsx
import { LoginForm } from "@/components/auth/login-form"
import Link from "next/link"
import { Zap } from "lucide-react"

export const metadata = {
  title: "Sign In | ThunderCrawler",
  description: "Sign in to your ThunderCrawler account",
}

export default function SigninPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <Link href="/" className="flex items-center space-x-2">
          <Zap className="h-8 w-8 text-yellow-500" />
          <span className="text-2xl font-bold">ThunderCrawler</span>
        </Link>
      </div>
      <LoginForm />
    </div>
  )
}