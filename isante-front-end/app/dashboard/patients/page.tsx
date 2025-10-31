'use client'
// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Eye, Edit, Trash2 } from 'lucide-react'
import { patientApi } from '@/lib/api'
import { Patient, Page } from '@/lib/types'
import { LoadingSpinner } from '@/components/loading-spinner'
import { Pagination } from '@/components/pagination'
import { usePagination } from '@/lib/hooks/use-pagination'
import { ConfirmationDialog } from '@/components/confirmation-dialog'

export default function PatientsPage() {
  const router = useRouter()
  const [patients, setPatients] = useState<Page<Patient> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletingPatient, setDeletingPatient] = useState<Patient | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  const {
    pageable,
    handlePageChange,
    handleSizeChange,
    handleSortChange
  } = usePagination({
    initialPage: 0,
    initialSize: 10,
    initialSort: '' // Let backend handle default sorting (latest patients first)
  })

  const fetchPatients = useCallback(async () => {
    try {
      console.log('Fetching patients with pagination:', pageable)
      const data = await patientApi.getAll(pageable)
      console.log('Patients fetched successfully:', data)
      setPatients(data)
    } catch (error) {
      console.error('Failed to fetch patients:', error)
      console.error('Patients error details:', {
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
    fetchPatients()
  }, [fetchPatients])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Reset to first page when searching
    handlePageChange(0)
    fetchPatients()
  }

  const handleDeletePatient = (patient: Patient) => {
    setDeletingPatient(patient)
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!deletingPatient) return
    
    setIsDeleting(true)
    try {
      await patientApi.delete(deletingPatient.id)
      alert('Patient deleted successfully!')
      
      // Stay on the patient list page and refresh the data
      // Remove the deleted patient from the current list optimistically
      setPatients(prev => {
        if (!prev) return prev
        
        const newContent = prev.content.filter(patient => patient.id !== deletingPatient.id)
        const newTotalElements = prev.totalElements - 1
        
        // If current page becomes empty and it's not the first page, go to previous page
        if (newContent.length === 0 && prev.number > 0) {
          // Refetch the previous page
          fetchPatients()
          return prev
        }
        
        return {
          ...prev,
          content: newContent,
          totalElements: newTotalElements
        }
      })
      
      // Also refresh the data from server to ensure consistency
      fetchPatients()
    } catch (error) {
      console.error('Failed to delete patient:', error)
      let errorMessage = 'Failed to delete patient'
      
      if (error instanceof Error) {
        // Check for specific error types
        if (error.message.includes('Cannot delete this resource because it has related data')) {
          errorMessage = 'Cannot delete this patient because they have related data (visit sessions, eye examinations, etc.). Please remove all related data first.'
        } else if (error.message.includes('Patient not found')) {
          errorMessage = 'Patient not found. They may have already been deleted.'
        } else if (error.message.includes('Access Denied')) {
          errorMessage = 'You do not have permission to delete patients.'
        } else {
          errorMessage = error.message
        }
      }
      
      alert(`Error: ${errorMessage}`)
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
      setDeletingPatient(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <LoadingSpinner size="lg" color="blue" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading patients...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-600">Manage patient records and information</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/patients/add')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Patient
        </button>
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
              <option value="firstName,asc">First Name (A-Z)</option>
              <option value="firstName,desc">First Name (Z-A)</option>
              <option value="lastName,asc">Last Name (A-Z)</option>
              <option value="lastName,desc">Last Name (Z-A)</option>
              <option value="createdAt,desc">Newest First</option>
              <option value="createdAt,asc">Oldest First</option>
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
      {patients && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              All Patients ({patients.totalElements})
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
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {patients.content.map((patient) => (
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
                            {patient.patientNumber} {patient.nationalId && `• ${patient.nationalId}`}
                          </div>
                        </div>
                      </div>
                    </td>
                                         <td className="px-6 py-4 whitespace-nowrap">
                       <div className="text-sm text-gray-900">{patient.phone}</div>
                       <div className="text-sm text-gray-500">{patient.residence}</div>
                     </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        patient.patientCategory === 'PRIVATE' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {patient.patientCategory}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => router.push(`/dashboard/patients/${patient.id}`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => router.push(`/dashboard/patients/${patient.id}/edit`)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeletePatient(patient)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
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
            page={patients} 
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Empty State */}
      {patients && patients.content.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <Search className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No patients found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new patient.
          </p>
          <div className="mt-6">
            <button
              onClick={() => router.push('/dashboard/patients/add')}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Patient
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false)
          setDeletingPatient(null)
        }}
        onConfirm={confirmDelete}
        title="Delete Patient"
        message={`Are you sure you want to delete ${deletingPatient?.firstName} ${deletingPatient?.lastName}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  )
} 