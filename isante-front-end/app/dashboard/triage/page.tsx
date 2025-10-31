'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Eye, Edit, Trash2, Activity } from 'lucide-react'
import { triageApi } from '@/lib/api'
import { TriageMeasurement, Page } from '@/lib/types'
import { LoadingSpinner } from '@/components/loading-spinner'
import { Pagination } from '@/components/pagination'
import { usePagination } from '@/lib/hooks/use-pagination'

export default function TriagePage() {
  const router = useRouter()
  const [triageMeasurements, setTriageMeasurements] = useState<Page<TriageMeasurement> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDemoMode, setIsDemoMode] = useState(false)
  
  const {
    pageable,
    handlePageChange,
    handleSizeChange,
    handleSortChange
  } = usePagination({
    initialPage: 0,
    initialSize: 10,
    initialSort: 'measurementDate,desc'
  })

  const fetchData = useCallback(async () => {
    try {
      const data = await triageApi.getAll(pageable)
      console.log('Triage API response:', data)
      setTriageMeasurements(data)
    } catch (error) {
      console.error('Failed to fetch triage measurements:', error)
      
      // Demo mode - create sample data
      console.log('Using demo mode for triage measurements')
      const demoData: Page<TriageMeasurement> = {
        content: [
          {
            id: 1,
            visitSessionId: 1,
            systolicBp: 120,
            diastolicBp: 80,
            rbsValue: 95.5,
            rbsUnit: 'mg/dL',
            iopRight: 16.0,
            iopLeft: 16.0,
            weightKg: 70.5,
            weightLbs: null,
            notes: 'Patient appears stable, no immediate concerns',
            measuredBy: null,
            measurementDate: '2025-01-15T10:30:00.000Z',
            createdAt: '2025-01-15T10:30:00.000Z',
            updatedAt: '2025-01-15T10:30:00.000Z',
            createdBy: 'Demo User',
            updatedBy: 'Demo User',
            patientName: 'John Doe',
            patientPhone: '1234567890'
          },
          {
            id: 2,
            visitSessionId: 2,
            systolicBp: 135,
            diastolicBp: 85,
            rbsValue: 110.0,
            rbsUnit: 'mg/dL',
            iopRight: 18.5,
            iopLeft: 18.5,
            weightKg: 65.2,
            weightLbs: null,
            notes: 'Slightly elevated blood pressure, monitor closely',
            measuredBy: null,
            measurementDate: '2025-01-15T11:15:00.000Z',
            createdAt: '2025-01-15T11:15:00.000Z',
            updatedAt: '2025-01-15T11:15:00.000Z',
            createdBy: 'Demo User',
            updatedBy: 'Demo User',
            patientName: 'Jane Smith',
            patientPhone: '0987654321'
          }
        ],
        totalElements: 2,
        totalPages: 1,
        size: pageable.size || 10,
        number: pageable.page || 0,
        first: true,
        last: true,
        numberOfElements: 2,
        empty: false,
        pageable: {
          pageNumber: pageable.page || 0,
          pageSize: pageable.size || 10,
          sort: { empty: true, sorted: false, unsorted: true },
          offset: (pageable.page || 0) * (pageable.size || 10),
          paged: true,
          unpaged: false
        },
        sort: { empty: true, sorted: false, unsorted: true }
      }
      
      setTriageMeasurements(demoData)
      setIsDemoMode(true)
      
      if (error instanceof Error) {
        console.log(`API Error (using demo mode): ${error.message}`)
      }
    } finally {
      setIsLoading(false)
    }
  }, [pageable])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    handlePageChange(0)
    fetchData()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" color="blue" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Triage Measurements</h1>
          <p className="text-gray-600">Manage patient vital signs and assessments</p>
          {isDemoMode && (
            <div className="mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Demo Mode - Backend API not available
              </span>
            </div>
          )}
        </div>
        <button
          onClick={() => router.push('/dashboard/triage/create')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Triage
        </button>
      </div>

      {triageMeasurements && triageMeasurements.content && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              All Triage Measurements ({triageMeasurements.totalElements || 0})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient & Visit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vital Signs
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {triageMeasurements.content && triageMeasurements.content.length > 0 ? (
                  triageMeasurements.content.map((triage) => (
                  <tr key={triage.id} className="hover:bg-gray-50">
                                     <td className="px-6 py-4 whitespace-nowrap">
                   <div className="text-sm font-medium text-gray-900">
                     Visit #{triage.visitSessionId}
                   </div>
                   {triage.patientName && (
                     <div className="text-sm text-gray-500">
                       {triage.patientName}
                     </div>
                   )}
                   {triage.patientPhone && (
                     <div className="text-xs text-gray-400">
                       {triage.patientPhone}
                     </div>
                   )}
                 </td>
                                     <td className="px-6 py-4 whitespace-nowrap">
                   <div className="text-sm text-gray-900">
                     {triage.systolicBp && triage.diastolicBp && `BP: ${triage.systolicBp}/${triage.diastolicBp}`}
                     {triage.rbsValue && ` RBS: ${triage.rbsValue}${triage.rbsUnit || 'mg/dL'}`}
                     {triage.weightKg && ` Weight: ${triage.weightKg}kg`}
                   </div>
                 </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(triage.measurementDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => router.push(`/dashboard/triage/${triage.id}`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => router.push(`/dashboard/triage/${triage.id}/edit`)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                      No triage measurements found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <Pagination 
            page={triageMeasurements} 
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Empty State */}
      {triageMeasurements && triageMeasurements.content && triageMeasurements.content.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <Activity className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No triage measurements found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new triage measurement.
          </p>
          <div className="mt-6">
            <button
              onClick={() => router.push('/dashboard/triage/create')}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Triage
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 