import React from 'react'

interface SkeletonProps {
  className?: string
  height?: string
  width?: string
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  height = 'h-4', 
  width = 'w-full' 
}) => {
  return (
    <div 
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${height} ${width} ${className}`}
    />
  )
}

export const StatCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg">
          <div className="h-6 w-6 bg-gray-300 dark:bg-gray-600 rounded" />
        </div>
        <div className="ml-4 flex-1">
          <Skeleton className="mb-2" height="h-4" width="w-24" />
          <Skeleton className="mb-1" height="h-8" width="w-16" />
        </div>
      </div>
    </div>
  )
}

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="mb-2" height="h-8" width="w-64" />
          <Skeleton height="h-4" width="w-80" />
        </div>
        <Skeleton height="h-10" width="w-40" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Quick Actions Skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <Skeleton height="h-6" width="w-32" />
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <Skeleton className="mr-3" height="h-8" width="w-8" />
                <Skeleton height="h-4" width="w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
