import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-indigo-50 px-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 illustration */}
        <div className="mb-8">
          <div className="relative inline-block">
            <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-purple-600 animate-pulse">
              404
            </h1>
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center transform rotate-12 animate-bounce">
              <span className="text-3xl">🔍</span>
            </div>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h2>
        
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          We searched everywhere, but the page you&apos;re looking for doesn&apos;t exist. 
          It might have been moved or deleted.
        </p>

        {/* Decorative elements */}
        <div className="flex justify-center gap-4 mb-8">
          <div className="w-3 h-3 bg-indigo-400 rounded-full animate-ping"></div>
          <div className="w-3 h-3 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '0.4s' }}></div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-8 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
          >
            Back to Home
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="px-8 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-all duration-200 hover:scale-105"
          >
            Go Back
          </button>
        </div>

        {/* Additional help */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">
            Looking for something specific?
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/" className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline">
              Home
            </Link>
            <span className="text-gray-300">•</span>
            <Link href="/about" className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline">
              About
            </Link>
            <span className="text-gray-300">•</span>
            <Link href="/contact" className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}