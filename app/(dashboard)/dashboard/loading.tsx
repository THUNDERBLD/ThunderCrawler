// app/(dashboard)/dashboard/loading.tsx
export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
      
      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-3" />
            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Content Skeleton */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
        </div>
      </div>
    </div>
  )
}