'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-red-50 via-white to-orange-50 px-4">
      <div className="max-w-md w-full text-center">
        {/* Error icon */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-75"></div>
          <div className="relative flex items-center justify-center w-24 h-24 bg-red-500 rounded-full">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              strokeWidth="2"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Oops! Something went wrong
        </h1>
        
        <p className="text-gray-600 mb-6">
          We encountered an unexpected error. Don&apos;t worry, it&apos;s not your fault.
        </p>

        {error.message && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm font-mono text-red-800 wrap-break-word">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            Try again
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
          >
            Go home
          </button>
        </div>

        {error.digest && (
          <p className="text-xs text-gray-400 mt-6">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}