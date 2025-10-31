'use client'
// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { BarChart3, Users, CheckCircle, DollarSign, TrendingUp } from 'lucide-react'
import { LoadingPage } from '@/components/loading-page'
import { ErrorDialog, useErrorDialog } from '@/components/error-dialog'
import { patientVisitSessionApi } from '@/lib/api'
import { PatientVisitSessionStatistics } from '@/lib/types'

export default function PatientVisitSessionsStatisticsPage() {
  const [statistics, setStatistics] = useState<PatientVisitSessionStatistics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const { error, isErrorOpen, handleError, hideError } = useErrorDialog()

  const fetchStatistics = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await patientVisitSessionApi.getVisitSessionStatistics()
      setStatistics(data)
    } catch (error) {
      console.error('Failed to fetch visit session statistics:', error)
      handleError(error)
    } finally {
      setIsLoading(false)
    }
  }, []) // Remove handleError dependency to prevent infinite loop

  useEffect(() => {
    fetchStatistics()
  }, [fetchStatistics])

  if (isLoading) {
    return (
      <LoadingPage 
        message="Loading visit session statistics..."
        variant="spinner"
        size="lg"
        color="blue"
        layout="top"
      />
    )
  }

  if (!statistics) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No statistics available</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Visit session statistics will appear here once data is available.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Visit Session Statistics</h1>
        <p className="text-gray-600 dark:text-gray-400">Analytics and insights for patient visit sessions</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Visits</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{statistics.totalVisits}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed Visits</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{statistics.completedVisits}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">${statistics.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Fee</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">${statistics.averageConsultationFee.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      <ErrorDialog
        isOpen={isErrorOpen}
        onClose={hideError}
        error={error}
        title="Statistics Error"
        showRetry={true}
        onRetry={() => fetchStatistics()}
        showCopy={true}
      />
    </div>
  )
} 