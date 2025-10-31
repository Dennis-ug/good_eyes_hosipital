'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Users, Calendar, Clock, Eye, Plus } from 'lucide-react'
import { receptionApi } from '@/lib/api'
import { PatientReception, Page } from '@/lib/types'
import { formatDateTime } from '@/lib/utils'
import { LoadingSpinner } from '@/components/loading-spinner'
import { Pagination } from '@/components/pagination'
import { usePagination } from '@/lib/hooks/use-pagination'
import { ClientOnly } from '@/components/client-only'

export default function ReceptionPage() {
  const router = useRouter()
  const [patientsToday, setPatientsToday] = useState<Page<PatientReception> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentDate, setCurrentDate] = useState<string>('')
  const [currentTime, setCurrentTime] = useState<string>('')
  
  const {
    pageable,
    handlePageChange,
    handleSizeChange,
    handleSortChange
  } = usePagination({
    initialPage: 0,
    initialSize: 10,
    initialSort: 'receptionTimestamp,desc'
  })

  const fetchPatientsToday = useCallback(async () => {
    try {
      console.log('Fetching patients received today with pagination:', pageable)
      const data = await receptionApi.getPatientsReceivedToday(pageable)
      console.log('Patients received today fetched successfully:', data)
      setPatientsToday(data)
    } catch (error) {
      console.error('Failed to fetch patients today:', error)
      console.error('Reception error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      })
      // Show specific API error
      if (error instanceof Error) {
        alert(`API Error: ${error.message}`)
      }
    } finally {
      setIsLoading(false)
    }
  }, [pageable])

  useEffect(() => {
    fetchPatientsToday()
  }, [fetchPatientsToday])

  // Update date and time on client side to prevent hydration mismatch
  useEffect(() => {
    const updateDateTime = () => {
      setCurrentDate(new Date().toLocaleDateString())
      setCurrentTime(new Date().toLocaleTimeString())
    }
    
    updateDateTime()
    const interval = setInterval(updateDateTime, 1000) // Update every second
    
    return () => clearInterval(interval)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Reset to first page when searching
    handlePageChange(0)
    fetchPatientsToday()
  }

  const filteredPatients = patientsToday?.content.filter(patient =>
    patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.receivedBy.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <LoadingSpinner size="lg" color="blue" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading reception data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reception</h1>
          <p className="text-gray-600">Monitor patient reception activities</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => router.push('/dashboard/patients/add')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Receive New Patient
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <Users className="h-6 w-6" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Patients Today
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {patientsToday?.totalElements || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                  <Calendar className="h-6 w-6" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Today&apos;s Date
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    <ClientOnly fallback="Loading...">
                      {currentDate}
                    </ClientOnly>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-purple-500 text-white">
                  <Clock className="h-6 w-6" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Current Time
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    <ClientOnly fallback="Loading...">
                      {currentTime}
                    </ClientOnly>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
                  <Eye className="h-6 w-6" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pending Exams
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    0
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search patients by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Search
          </button>
        </form>

        {/* Sort and Size Controls */}
        <div className="mt-4 flex gap-4 items-center">
          <div>
            <label htmlFor="sort" className="block text-sm font-medium text-gray-700">
              Sort by
            </label>
            <select
              id="sort"
              value={pageable.sort || ''}
              onChange={(e) => handleSortChange(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="receptionTimestamp,desc">Latest First</option>
              <option value="receptionTimestamp,asc">Earliest First</option>
              <option value="firstName,asc">First Name (A-Z)</option>
              <option value="firstName,desc">First Name (Z-A)</option>
              <option value="lastName,asc">Last Name (A-Z)</option>
              <option value="lastName,desc">Last Name (Z-A)</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="size" className="block text-sm font-medium text-gray-700">
              Items per page
            </label>
            <select
              id="size"
              value={pageable.size}
              onChange={(e) => handleSizeChange(Number(e.target.value))}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Patients List */}
      {patientsToday && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Patients Received Today ({patientsToday.totalElements})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reception Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Received By
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {patient.firstName} {patient.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {patient.patientNumber}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">N/A</div>
                      <div className="text-sm text-gray-500">N/A</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {patient.receptionTimestamp ? formatDateTime(patient.receptionTimestamp) : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{patient.receivedBy}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => router.push(`/dashboard/patients/${patient.id}`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <Pagination 
            page={patientsToday} 
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Empty State */}
      {patientsToday && patientsToday.content.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <Users className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No patients received today</h3>
          <p className="mt-1 text-sm text-gray-500">
            Start by receiving a new patient.
          </p>
          <div className="mt-6">
            <button
              onClick={() => router.push('/dashboard/patients/add')}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Receive New Patient
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 