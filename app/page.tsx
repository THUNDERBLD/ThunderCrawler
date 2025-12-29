import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Zap, Target, Zap as Lightning, Rocket } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center space-y-8">
            {/* Logo */}
            <div className="flex justify-center items-center space-x-3">
              <Zap className="h-16 w-16 text-yellow-400" />
              <h1 className="text-5xl md:text-7xl font-bold">
                ThunderCrawler
              </h1>
            </div>

            {/* Tagline */}
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
              Lightning-fast job aggregation with AI-powered automation.
              <br />
              Find jobs, customize resumes, apply intelligently.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="lg" className="text-lg px-8 py-6">
                <Link href="/signup">
                  <Rocket className="mr-2 h-5 w-5" />
                  Get Started Free
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
                <Link href="/signin">
                  Sign In
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16">
            Why ThunderCrawler?
          </h2>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Lightning className="h-12 w-12 text-yellow-500" />
              </div>
              <h3 className="text-xl font-bold">Lightning Fast</h3>
              <p className="text-gray-600">
                Scrape thousands of jobs from YC, Wellfound, Internshala and more in seconds
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Target className="h-12 w-12 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold">AI-Powered</h3>
              <p className="text-gray-600">
                Customize your resume for each job with Gemini AI integration
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Rocket className="h-12 w-12 text-green-500" />
              </div>
              <h3 className="text-xl font-bold">Semi-Automated</h3>
              <p className="text-gray-600">
                Chrome extension helps you apply faster while keeping control
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2024 ThunderCrawler. Built for learning purposes.
          </p>
        </div>
      </footer>
    </div>
  )
}