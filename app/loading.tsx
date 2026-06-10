export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-50 via-white to-purple-50">
      <div className="text-center">
        <div className="relative w-24 h-24 mx-auto mb-8">
          {/* Outer spinning ring */}
          <div className="absolute inset-0 border-4 border-indigo-200 rounded-full animate-spin border-t-indigo-600"></div>
          {/* Inner pulsing circle */}
          <div className="absolute inset-3 bg-indigo-600 rounded-full animate-pulse opacity-20"></div>
          {/* Center dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
          </div>
        </div>
        
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Loading
        </h2>
        <p className="text-gray-500">
          Please wait while we prepare your content...
        </p>
        
        {/* Animated dots */}
        <div className="flex justify-center gap-1 mt-4">
          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}