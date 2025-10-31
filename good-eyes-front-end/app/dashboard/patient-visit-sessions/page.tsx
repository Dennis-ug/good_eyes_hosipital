'use client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, Search, Eye, Trash2, X, User, FileText, CheckCircle, DollarSign, Clock, ArrowRight, Printer, Edit } from 'lucide-react'
import { LoadingPage } from '@/components/loading-page'
import { LoadingButton } from '@/components/loading-button'
import { ErrorDialog, useErrorDialog } from '@/components/error-dialog'
import { Pagination } from '@/components/pagination'
import { patientVisitSessionApi, patientApi } from '@/lib/api'
import { PatientVisitSession, VisitStatus, VisitStage, Page, CreatePatientVisitSessionRequest, UpdatePatientVisitSessionRequest, VisitPurpose, PaymentMethod, Patient, EmergencyLevel } from '@/lib/types'
import { ReceiptPrinter } from '@/components/receipt-printer'
import { useReceiptPrinter } from '@/lib/hooks/use-receipt-printer'
import { usePermissions } from '@/lib/hooks/use-permissions'
import { useAuth } from '@/lib/auth-context'

export default function PatientVisitSessionsPage() {
  const { canCreateVisitSessions, canUpdateVisitSessions, isAdmin } = usePermissions()
  const { user } = useAuth()
  const [visitSessions, setVisitSessions] = useState<Page<PatientVisitSession> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [stageFilter, setStageFilter] = useState('')
  const [purposeFilter, setPurposeFilter] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedVisitSession, setSelectedVisitSession] = useState<PatientVisitSession | null>(null)
  const [editingVisitSession, setEditingVisitSession] = useState<PatientVisitSession | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isLoadingPatients, setIsLoadingPatients] = useState(false)
  const [patients, setPatients] = useState<Patient[]>([])
  const [loadingActions, setLoadingActions] = useState<Set<number>>(new Set())
  const [showReceiptPrinter, setShowReceiptPrinter] = useState(false)
  const [selectedSessionForReceipt, setSelectedSessionForReceipt] = useState<PatientVisitSession | null>(null)
  
  const { error, isErrorOpen, handleError, hideError } = useErrorDialog()
  const { generateReceiptFromInvoice } = useReceiptPrinter()

  const [formData, setFormData] = useState<CreatePatientVisitSessionRequest>({
    patientId: 0,
    visitPurpose: VisitPurpose.NEW_CONSULTATION,
    chiefComplaint: '',
    consultationFeeAmount: null
  })

  const [editFormData, setEditFormData] = useState<UpdatePatientVisitSessionRequest>({
    visitPurpose: VisitPurpose.NEW_CONSULTATION,
    chiefComplaint: '',
    consultationFeeAmount: null
  })
  const handleErrorRef = useRef(handleError)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Loading skeleton component for better perceived performance
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
            <div className="flex space-x-2">
              <div className="h-8 bg-gray-200 rounded w-16"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const fetchVisitSessions = useCallback(async (page = 0, search = '') => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController()
    
    try {
      setIsLoading(true)
      const data = await patientVisitSessionApi.getAllVisitSessions({ page, size: 5 }, search)
      setVisitSessions(data)
    } catch (error) {
      // Don't show error if request was aborted
      if (error instanceof Error && error.name === 'AbortError') {
        return
      }
      console.error('Failed to fetch visit sessions:', error)
      handleErrorRef.current(error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchPatients = useCallback(async () => {
    try {
      setIsLoadingPatients(true)
      const data = await patientApi.getAll({ page: 0, size: 100 })
      setPatients(data.content)
    } catch (error) {
      console.error('Failed to fetch patients:', error)
      handleErrorRef.current(error)
    } finally {
      setIsLoadingPatients(false)
    }
  }, [])

  // Debounce search term - wait 2 seconds after last character is typed
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 2000)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Fetch visit sessions when search term changes
  useEffect(() => {
    fetchVisitSessions(0, debouncedSearchTerm)
  }, [debouncedSearchTerm, fetchVisitSessions])

  useEffect(() => {
    fetchVisitSessions()
    fetchPatients()
  }, [fetchVisitSessions, fetchPatients])

  const handleDeleteVisitSession = async () => {
    if (!deletingId || isDeleting) return

    try {
      setIsDeleting(true)
      
      const deleteResponse = await patientVisitSessionApi.deleteVisitSession(deletingId)
      console.log('Delete response:', deleteResponse)
      
      // Show success message
      if (deleteResponse.status === 'success') {
        alert(`Visit session deleted successfully! (ID: ${deleteResponse.deletedId})`)
        
        // Remove from list after successful deletion
        setVisitSessions(prev => {
          if (!prev) return prev
          
          const newContent = prev.content.filter(session => session.id !== deletingId)
          const newTotalElements = prev.totalElements - 1
          
          // If current page becomes empty and it's not the first page, go to previous page
          if (newContent.length === 0 && prev.number > 0) {
            // Refetch the previous page
            fetchVisitSessions(prev.number - 1, debouncedSearchTerm)
            return prev
          }
          
          return {
            ...prev,
            content: newContent,
            totalElements: newTotalElements
          }
        })
        
        // Refetch to ensure data consistency
        setTimeout(() => {
          const currentPage = visitSessions?.number || 0
          fetchVisitSessions(currentPage, debouncedSearchTerm)
        }, 100)
      }
      
      setDeletingId(null)
    } catch (error) {
      console.error('Failed to delete visit session:', error)
      let errorMessage = 'Failed to delete visit session'
      
      if (error instanceof Error) {
        if (error.message.includes('Visit session not found')) {
          errorMessage = 'Visit session not found. It may have already been deleted.'
        } else if (error.message.includes('Access Denied')) {
          errorMessage = 'You do not have permission to delete visit sessions.'
        } else {
          errorMessage = error.message
        }
      }
      
      alert(`Error: ${errorMessage}`)
    } finally {
      setIsDeleting(false)
    }
  }

  const handlePageChange = (page: number) => {
    fetchVisitSessions(page, debouncedSearchTerm)
  }

  const handleCreateVisitSession = async () => {
    // Prevent multiple submissions
    if (isCreating) return
    
    // Enhanced validation
    if (isLoadingPatients) {
      handleErrorRef.current(new Error('Please wait for patients to load'))
      return
    }

    if (!formData.patientId || formData.patientId === 0) {
      handleErrorRef.current(new Error('Please select a patient'))
      return
    }

    if (!formData.visitPurpose) {
      handleErrorRef.current(new Error('Please select a visit purpose'))
      return
    }

    // Validate that the selected patient exists
    const selectedPatient = patients.find(p => p.id === formData.patientId)
    if (!selectedPatient) {
      handleErrorRef.current(new Error('Selected patient not found. Please refresh and try again.'))
      return
    }

    try {
      setIsCreating(true)
      await patientVisitSessionApi.createVisitSession(formData)
      setShowCreateModal(false)
      setFormData({
        patientId: 0,
        visitPurpose: VisitPurpose.NEW_CONSULTATION,
        chiefComplaint: '',
        consultationFeeAmount: null
      })
      // Optimistic update - add new session to the list
      const newSession: PatientVisitSession = {
        id: Date.now(), // Temporary ID
        patientId: formData.patientId,
        patientName: selectedPatient.firstName + ' ' + selectedPatient.lastName,
        visitDate: new Date().toISOString(),
        visitPurpose: formData.visitPurpose,
        status: VisitStatus.REGISTERED,
        currentStage: VisitStage.RECEPTION,
        consultationFeePaid: false,
        consultationFeeAmount: formData.consultationFeeAmount || 0,
        paymentMethod: undefined,
        paymentReference: undefined,
        chiefComplaint: formData.chiefComplaint,
        previousVisitId: undefined,
        emergencyLevel: EmergencyLevel.NONE,
        requiresTriage: true,
        requiresDoctorVisit: true,
        isEmergency: false,
        notes: undefined,
        invoiceId: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'current-user',
        updatedBy: 'current-user'
      }
      
      setVisitSessions(prev => {
        if (!prev) return prev
        return {
          ...prev,
          content: [newSession, ...prev.content],
          totalElements: prev.totalElements + 1
        }
      })
      
      // Refetch to get the actual data from server
      await fetchVisitSessions(0, debouncedSearchTerm)
    } catch (error) {
      console.error('Failed to create visit session:', error)
      // Enhanced error handling
      if (error instanceof Error) {
        if (error.message.includes('Patient') || error.message.includes('patient')) {
          handleErrorRef.current(new Error('Patient not found or invalid. Please check the patient selection.'))
        } else {
          handleErrorRef.current(error)
        }
      } else {
        handleErrorRef.current(new Error('Failed to create visit session. Please try again.'))
      }
      
      // Revert optimistic update on error
      await fetchVisitSessions(0, debouncedSearchTerm)
    } finally {
      setIsCreating(false)
    }
  }

  const handleMarkFeePaid = async (id: number, paymentMethod: PaymentMethod) => {
    // Prevent multiple clicks
    if (loadingActions.has(id)) return
    
    try {
      setLoadingActions(prev => new Set(prev).add(id))
      
      // Optimistic update
      setVisitSessions(prev => {
        if (!prev) return prev
        return {
          ...prev,
          content: prev.content.map(session => 
            session.id === id 
              ? { ...session, consultationFeePaid: true, paymentMethod }
              : session
          )
        }
      })
      
      await patientVisitSessionApi.markFeePaid(id, { paymentMethod })
      
      // Refetch to ensure consistency
      await fetchVisitSessions(visitSessions?.number || 0, debouncedSearchTerm)
    } catch (error) {
      console.error('Failed to mark fee as paid:', error)
      handleErrorRef.current(error)
      
      // Revert optimistic update on error
      await fetchVisitSessions(visitSessions?.number || 0, debouncedSearchTerm)
    } finally {
      setLoadingActions(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }

  const handleEditVisitSession = (session: PatientVisitSession) => {
    setEditingVisitSession(session)
    setEditFormData({
      visitPurpose: session.visitPurpose,
      chiefComplaint: session.chiefComplaint || '',
      consultationFeeAmount: session.consultationFeeAmount || null
    })
    setShowEditModal(true)
  }

  const handleUpdateVisitSession = async () => {
    if (!editingVisitSession || isUpdating) return

    try {
      setIsUpdating(true)
      
      // Call the update API
      await patientVisitSessionApi.updateVisitSession(editingVisitSession.id, {
        visitPurpose: editFormData.visitPurpose,
        chiefComplaint: editFormData.chiefComplaint,
        consultationFeeAmount: editFormData.consultationFeeAmount
      })

      // Close modal and reset form
      setShowEditModal(false)
      setEditingVisitSession(null)
      setEditFormData({
        visitPurpose: VisitPurpose.NEW_CONSULTATION,
        chiefComplaint: '',
        consultationFeeAmount: null
      })

      // Show success message
      alert('Visit session updated successfully!')

      // Refresh the list
      await fetchVisitSessions(visitSessions?.number || 0, debouncedSearchTerm)
    } catch (error) {
      console.error('Failed to update visit session:', error)
      if (error instanceof Error) {
        alert(`Error: ${error.message}`)
      } else {
        alert('Failed to update visit session. Please try again.')
      }
    } finally {
      setIsUpdating(false)
    }
  }

  const handleProgressStage = async (id: number) => {
    // Prevent multiple clicks
    if (loadingActions.has(id)) return
    
    try {
      setLoadingActions(prev => new Set(prev).add(id))
      
      // Optimistic update - progress to next stage
      setVisitSessions(prev => {
        if (!prev) return prev
        return {
          ...prev,
          content: prev.content.map(session => {
            if (session.id !== id) return session
            
            const stages = [VisitStage.RECEPTION, VisitStage.CASHIER, VisitStage.TRIAGE, VisitStage.BASIC_REFRACTION_EXAM, VisitStage.DOCTOR_VISIT, VisitStage.PHARMACY, VisitStage.COMPLETED]
            const currentIndex = stages.indexOf(session.currentStage)
            const nextStage = currentIndex < stages.length - 1 ? stages[currentIndex + 1] : session.currentStage
            
            return { ...session, currentStage: nextStage }
          })
        }
      })
      
      await patientVisitSessionApi.progressStage(id)
      
      // Refetch to ensure consistency
      await fetchVisitSessions(visitSessions?.number || 0, debouncedSearchTerm)
    } catch (error) {
      console.error('Failed to progress stage:', error)
      handleErrorRef.current(error)
      
      // Revert optimistic update on error
      await fetchVisitSessions(visitSessions?.number || 0, debouncedSearchTerm)
    } finally {
      setLoadingActions(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }

  const getStatusColor = (status: VisitStatus) => {
    switch (status) {
      case VisitStatus.REGISTERED:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case VisitStatus.FREE:
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400'
      case VisitStatus.INVOICE_CREATED:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case VisitStatus.PAYMENT_PENDING:
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
      case VisitStatus.PAYMENT_COMPLETED:
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case VisitStatus.TRIAGE_COMPLETED:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
      case VisitStatus.BASIC_REFRACTION_COMPLETED:
        return 'bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400'
      case VisitStatus.DOCTOR_VISIT_COMPLETED:
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400'
      case VisitStatus.MEDICATION_DISPENSED:
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400'
      case VisitStatus.COMPLETED:
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case VisitStatus.CANCELLED:
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case VisitStatus.NO_SHOW:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }



  const filteredVisitSessions = (visitSessions?.content || []).filter((session) => {
    // Search filter
    const matchesSearch = !searchTerm || 
      session.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.chiefComplaint?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.patientId?.toString().includes(searchTerm)
    
    // Status filter
    const matchesStatus = !statusFilter || session.status === statusFilter
    
    // Stage filter
    const matchesStage = !stageFilter || session.currentStage === stageFilter
    
    // Purpose filter
    const matchesPurpose = !purposeFilter || session.visitPurpose === purposeFilter
    
    return matchesSearch && matchesStatus && matchesStage && matchesPurpose
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Patient Visit Sessions</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage patient visit sessions and workflows</p>
          </div>
          {canCreateVisitSessions && (
            <button
              onClick={() => setShowCreateModal(true)}
              disabled={isCreating}
              className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md transition-all duration-200 ${
                isCreating
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'text-white bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isCreating ? (
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              {isCreating ? 'Creating...' : 'New Visit Session'}
            </button>
          )}
        </div>
        
        <LoadingPage 
          message="Loading visit sessions..."
          variant="spinner"
          size="lg"
          color="blue"
          layout="top"
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Latest Visit Sessions</h1>
          <p className="text-gray-600 dark:text-gray-400">Showing the 5 most recent patient visit sessions</p>
        </div>
        {canCreateVisitSessions && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Visit Session
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Sessions</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {visitSessions?.totalElements || 0}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {filteredVisitSessions.filter(s => s.currentStage === VisitStage.COMPLETED).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">In Progress</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {filteredVisitSessions.filter(s => 
                  s.currentStage !== VisitStage.COMPLETED
                ).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Payment</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {filteredVisitSessions.filter(s => !s.consultationFeePaid).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-12 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>



      {/* Visit Sessions List */}
      {filteredVisitSessions.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 overflow-hidden">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Visit Sessions</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {filteredVisitSessions.length} of {visitSessions?.totalElements || 0} visit sessions
                </p>
              </div>
              
              {/* Filters - Responsive Layout */}
              <div className="flex flex-col lg:flex-row gap-3 flex-wrap">
                <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-1 lg:space-y-0 lg:space-x-2">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Status:</span>
                  <select 
                    className="w-full lg:w-auto max-w-xs text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">All Status</option>
                    {Object.values(VisitStatus).map((status) => (
                      <option key={status} value={status}>
                        {status.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-1 lg:space-y-0 lg:space-x-2">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Stage:</span>
                  <select 
                    className="w-full lg:w-auto max-w-xs text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={stageFilter}
                    onChange={(e) => setStageFilter(e.target.value)}
                  >
                    <option value="">All Stages</option>
                    {Object.values(VisitStage).map((stage) => (
                      <option key={stage} value={stage}>
                        {stage.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-1 lg:space-y-0 lg:space-x-2">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Purpose:</span>
                  <select 
                    className="w-full lg:w-auto max-w-xs text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={purposeFilter}
                    onChange={(e) => setPurposeFilter(e.target.value)}
                  >
                    <option value="">All Purposes</option>
                    {Object.values(VisitPurpose).map((purpose) => (
                      <option key={purpose} value={purpose}>
                        {purpose.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                
                {(statusFilter || stageFilter || purposeFilter) && (
                  <button
                    onClick={() => {
                      setStatusFilter('')
                      setStageFilter('')
                      setPurposeFilter('')
                    }}
                    className="w-full lg:w-auto text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Patient Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Visit Purpose & Stage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status & Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Visit Date & Time
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredVisitSessions.map((session: PatientVisitSession) => (
                  <tr key={session.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {session.patientName || 'Unknown Patient'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {session.patientId || 'N/A'}
                          </div>
                          {session.chiefComplaint && (
                            <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                              &ldquo;{session.chiefComplaint.substring(0, 50)}{session.chiefComplaint.length > 50 ? '...' : ''}&rdquo;
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {session.visitPurpose.replace(/_/g, ' ')}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Stage: {session.currentStage.replace(/_/g, ' ')}
                        </div>
                        {session.isEmergency && (
                          <div className="text-xs text-red-600 dark:text-red-400 font-medium">
                            EMERGENCY
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(session.status)}`}>
                          {session.status.replace(/_/g, ' ')}
                        </span>
                        <div className="flex items-center space-x-1">
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                            <div 
                              className={`h-1 rounded-full transition-all duration-300 ${
                                session.currentStage === VisitStage.RECEPTION ? 'w-1/6 bg-blue-500' :
                                session.currentStage === VisitStage.CASHIER ? 'w-2/6 bg-yellow-500' :
                                session.currentStage === VisitStage.TRIAGE ? 'w-3/6 bg-purple-500' :
                                session.currentStage === VisitStage.DOCTOR_VISIT ? 'w-4/6 bg-indigo-500' :
                                session.currentStage === VisitStage.PHARMACY ? 'w-5/6 bg-green-500' :
                                session.currentStage === VisitStage.COMPLETED ? 'w-full bg-green-500' :
                                'w-0'
                              }`}
                            />
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {session.currentStage === VisitStage.RECEPTION ? '17%' :
                             session.currentStage === VisitStage.CASHIER ? '33%' :
                             session.currentStage === VisitStage.TRIAGE ? '50%' :
                             session.currentStage === VisitStage.DOCTOR_VISIT ? '67%' :
                             session.currentStage === VisitStage.PHARMACY ? '83%' :
                             session.currentStage === VisitStage.COMPLETED ? '100%' : '0%'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          UGX {session.consultationFeeAmount ? session.consultationFeeAmount.toLocaleString() : '0'}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            session.consultationFeePaid 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                          }`}>
                            {session.consultationFeePaid ? 'Paid' : 'Pending'}
                          </span>
                          {session.paymentMethod && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {session.paymentMethod.replace(/_/g, ' ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {new Date(session.visitDate).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(session.visitDate).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                            timeZone: 'Africa/Kampala'
                          })}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          Session #{session.id}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => {
                            setSelectedVisitSession(session)
                            setShowViewModal(true)
                          }}
                          className="p-1 text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {canUpdateVisitSessions && session.currentStage === VisitStage.RECEPTION && (
                          <button
                            onClick={() => handleEditVisitSession(session)}
                            className="p-1 text-orange-600 dark:text-orange-400 hover:text-orange-900 dark:hover:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded"
                            title="Edit Visit Session"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                        {session.currentStage === VisitStage.CASHIER && !session.consultationFeePaid && canUpdateVisitSessions && (
                          <button
                            onClick={() => handleMarkFeePaid(session.id, PaymentMethod.CASH)}
                            disabled={loadingActions.has(session.id)}
                            className={`p-1 rounded transition-all duration-200 ${
                              loadingActions.has(session.id)
                                ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                : 'text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20'
                            }`}
                            title="Mark Fee as Paid"
                          >
                            {loadingActions.has(session.id) ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
                            ) : (
                              <DollarSign className="h-4 w-4" />
                            )}
                          </button>
                        )}
                        {session.currentStage !== VisitStage.COMPLETED && canUpdateVisitSessions && (
                          <button
                            onClick={() => handleProgressStage(session.id)}
                            disabled={loadingActions.has(session.id)}
                            className={`p-1 rounded transition-all duration-200 ${
                              loadingActions.has(session.id)
                                ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                : 'text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                            }`}
                            title="Progress to Next Stage"
                          >
                            {loadingActions.has(session.id) ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                            ) : (
                              <ArrowRight className="h-4 w-4" />
                            )}
                          </button>
                        )}
                        {session.consultationFeePaid && (
                          <button
                            onClick={() => {
                              setSelectedSessionForReceipt(session)
                              setShowReceiptPrinter(true)
                            }}
                            className="p-1 text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                            title="Print Receipt"
                          >
                            <Printer className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            window.location.href = `/dashboard/patient-visit-sessions/${session.id}`
                          }}
                          className="p-1 text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded"
                          title="View Visit Session"
                        >
                          <FileText className="h-4 w-4" />
                        </button>

                        {/* Temporary debug - always show delete button for testing */}
                        <button
                          onClick={() => setDeletingId(session.id)}
                          className="p-1 text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                          title="Delete Visit Session"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        
                        {/* Original conditional delete button - commented out for now */}
                        {/* {(isAdmin || canUpdateVisitSessions) && session.currentStage === VisitStage.RECEPTION && (
                          <button
                            onClick={() => setDeletingId(session.id)}
                            className="p-1 text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                            title="Delete Visit Session"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )} */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {visitSessions && (
            <Pagination 
              page={visitSessions} 
              onPageChange={handlePageChange}
            />
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No visit sessions found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchTerm ? 'No visit sessions match your search.' : 'Get started by creating a new visit session.'}
          </p>

        </div>
      )}

      {/* Create Visit Session Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Create Visit Session</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Patient <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <select
                      value={formData.patientId}
                      onChange={(e) => setFormData(prev => ({ ...prev, patientId: parseInt(e.target.value) }))}
                      className="flex-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                      disabled={isLoadingPatients}
                    >
                      <option value={0}>
                        {isLoadingPatients ? 'Loading patients...' : 'Select a patient'}
                      </option>
                      {patients.length > 0 ? (
                        patients.map((patient) => (
                          <option key={patient.id} value={patient.id}>
                            {patient.firstName} {patient.lastName} - {patient.phone}
                          </option>
                        ))
                      ) : (
                        <option value={0} disabled>
                          {isLoadingPatients ? 'Loading...' : 'No patients available'}
                        </option>
                      )}
                    </select>
                    {patients.length === 0 && !isLoadingPatients && (
                      <button
                        type="button"
                        onClick={fetchPatients}
                        className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                      >
                        Retry
                      </button>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Visit Purpose <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.visitPurpose}
                    onChange={(e) => setFormData(prev => ({ ...prev, visitPurpose: e.target.value as VisitPurpose }))}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {Object.values(VisitPurpose).map((purpose) => (
                      <option key={purpose} value={purpose}>
                        {purpose.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Chief Complaint
                  </label>
                  <textarea
                    value={formData.chiefComplaint}
                    onChange={(e) => setFormData(prev => ({ ...prev, chiefComplaint: e.target.value }))}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter chief complaint"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Consultation Fee Amount (UGX)
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={formData.consultationFeeAmount || ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? null : parseFloat(e.target.value);
                        setFormData(prev => ({ ...prev, consultationFeeAmount: value }));
                      }}
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Leave empty for free consultation"
                    />
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Leave empty to mark as FREE consultation
                    </p>
                  </div>
                  

                </div>
                

                

              </div>
              
              <div className="flex justify-end mt-6 space-x-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <LoadingButton
                  onClick={handleCreateVisitSession}
                  loading={isCreating}
                  loadingText="Creating..."
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Create Visit Session
                </LoadingButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Visit Session Modal */}
      {showViewModal && selectedVisitSession && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Visit Session Details</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Patient Information</h4>
                  <div className="space-y-2">
                                         <div>
                       <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Name:</span>
                       <span className="ml-2 text-sm text-gray-900 dark:text-white">{selectedVisitSession.patientName || 'Unknown Patient'}</span>
                     </div>
                     <div>
                       <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Patient ID:</span>
                       <span className="ml-2 text-sm text-gray-900 dark:text-white">{selectedVisitSession.patientId || 'N/A'}</span>
                     </div>
                                         <div>
                       <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Session ID:</span>
                       <span className="ml-2 text-sm text-gray-900 dark:text-white">
                         #{selectedVisitSession.id}
                       </span>
                     </div>
                  </div>
                </div>
                
                                 <div>
                   <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Visit Details</h4>
                   <div className="space-y-2">
                     <div>
                       <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Visit Purpose:</span>
                       <span className="ml-2 text-sm text-gray-900 dark:text-white">{selectedVisitSession.visitPurpose.replace(/_/g, ' ')}</span>
                     </div>
                     <div>
                       <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Stage:</span>
                       <span className="ml-2 text-sm text-gray-900 dark:text-white">{selectedVisitSession.currentStage.replace(/_/g, ' ')}</span>
                     </div>
                     <div>
                       <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
                       <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedVisitSession.status)}`}>
                         {selectedVisitSession.status.replace(/_/g, ' ')}
                       </span>
                     </div>
                     <div>
                       <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Emergency Level:</span>
                       <span className="ml-2 text-sm text-gray-900 dark:text-white">{selectedVisitSession.emergencyLevel}</span>
                     </div>
                     <div>
                       <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Is Emergency:</span>
                       <span className="ml-2 text-sm text-gray-900 dark:text-white">
                         {selectedVisitSession.isEmergency ? 'Yes' : 'No'}
                       </span>
                     </div>
                   </div>
                 </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Payment Information</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Fee Amount:</span>
                      <span className="ml-2 text-sm text-gray-900 dark:text-white">UGX {selectedVisitSession.consultationFeeAmount ? selectedVisitSession.consultationFeeAmount.toLocaleString() : '0'}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Payment Method:</span>
                      <span className="ml-2 text-sm text-gray-900 dark:text-white">
                        {selectedVisitSession.paymentMethod ? selectedVisitSession.paymentMethod.replace(/_/g, ' ') : 'Not specified'}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Payment Status:</span>
                      <span className="ml-2 text-sm text-gray-900 dark:text-white">
                        {selectedVisitSession.consultationFeePaid ? 'Paid' : 'Pending'}
                      </span>
                    </div>
                    {selectedVisitSession.paymentReference && (
                      <div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Payment Reference:</span>
                        <span className="ml-2 text-sm text-gray-900 dark:text-white">{selectedVisitSession.paymentReference}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                                 <div>
                   <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Medical Information</h4>
                   <div className="space-y-2">
                     <div>
                       <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Chief Complaint:</span>
                       <span className="ml-2 text-sm text-gray-900 dark:text-white">
                         {selectedVisitSession.chiefComplaint || 'Not specified'}
                       </span>
                     </div>
                     <div>
                       <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Requires Triage:</span>
                       <span className="ml-2 text-sm text-gray-900 dark:text-white">
                         {selectedVisitSession.requiresTriage ? 'Yes' : 'No'}
                       </span>
                     </div>
                     <div>
                       <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Requires Doctor Visit:</span>
                       <span className="ml-2 text-sm text-gray-900 dark:text-white">
                         {selectedVisitSession.requiresDoctorVisit ? 'Yes' : 'No'}
                       </span>
                     </div>
                     <div>
                       <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Invoice ID:</span>
                       <span className="ml-2 text-sm text-gray-900 dark:text-white">
                         {selectedVisitSession.invoiceId || 'Not created'}
                       </span>
                     </div>
                   </div>
                 </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                 <div>
                   <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Audit Information</h4>
                   <div className="space-y-2">
                     <div>
                       <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Created By:</span>
                       <span className="ml-2 text-sm text-gray-900 dark:text-white">{selectedVisitSession.createdBy}</span>
                     </div>
                     <div>
                       <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Created At:</span>
                       <span className="ml-2 text-sm text-gray-900 dark:text-white">
                         {new Date(selectedVisitSession.createdAt).toLocaleString()}
                       </span>
                     </div>
                     <div>
                       <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Updated By:</span>
                       <span className="ml-2 text-sm text-gray-900 dark:text-white">{selectedVisitSession.updatedBy}</span>
                     </div>
                     <div>
                       <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Updated At:</span>
                       <span className="ml-2 text-sm text-gray-900 dark:text-white">
                         {new Date(selectedVisitSession.updatedAt).toLocaleString()}
                       </span>
                     </div>
                   </div>
                 </div>
                 
                 <div>
                   <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Additional Information</h4>
                   <div className="space-y-2">
                     {selectedVisitSession.previousVisitId && (
                       <div>
                         <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Previous Visit ID:</span>
                         <span className="ml-2 text-sm text-gray-900 dark:text-white">{selectedVisitSession.previousVisitId}</span>
                       </div>
                     )}
                     {selectedVisitSession.notes && (
                       <div>
                         <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Notes:</span>
                         <span className="ml-2 text-sm text-gray-900 dark:text-white">{selectedVisitSession.notes}</span>
                       </div>
                     )}
                   </div>
                 </div>
              </div>
              
              
              
              <div className="flex justify-end mt-6 space-x-3">
                <button
                  onClick={() => {
                    window.location.href = `/dashboard/patient-visit-sessions/${selectedVisitSession.id}/diagnoses`
                  }}
                  className="px-4 py-2 border border-purple-300 dark:border-purple-600 rounded-md text-sm font-medium text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30"
                >
                  <FileText className="h-4 w-4 inline mr-2" />
                  Manage Diagnoses
                </button>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Delete Visit Session</h3>
                <button
                  onClick={() => setDeletingId(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Are you sure you want to delete this visit session? This action cannot be undone.
                </p>
                
                {/* Show session details being deleted */}
                {(() => {
                  const sessionToDelete = visitSessions?.content.find(s => s.id === deletingId)
                  if (sessionToDelete) {
                    return (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
                        <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">Session to be deleted:</h4>
                        <div className="space-y-1 text-sm">
                          <div>
                            <span className="text-red-700 dark:text-red-300">Patient:</span>
                            <span className="ml-2 text-red-800 dark:text-red-200">{sessionToDelete.patientName}</span>
                          </div>
                          <div>
                            <span className="text-red-700 dark:text-red-300">Visit Purpose:</span>
                            <span className="ml-2 text-red-800 dark:text-red-200">{sessionToDelete.visitPurpose.replace(/_/g, ' ')}</span>
                          </div>
                          <div>
                            <span className="text-red-700 dark:text-red-300">Status:</span>
                            <span className="ml-2 text-red-800 dark:text-red-200">{sessionToDelete.status.replace(/_/g, ' ')}</span>
                          </div>
                          <div>
                            <span className="text-red-700 dark:text-red-300">Session ID:</span>
                            <span className="ml-2 text-red-800 dark:text-red-200">#{sessionToDelete.id}</span>
                          </div>
                        </div>
                      </div>
                    )
                  }
                  return null
                })()}
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeletingId(null)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <LoadingButton
                  onClick={handleDeleteVisitSession}
                  loading={isDeleting}
                  loadingText="Deleting..."
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  Delete Visit Session
                </LoadingButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Printer Modal */}
      {showReceiptPrinter && selectedSessionForReceipt && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <ReceiptPrinter
              receiptData={{
                clinicName: 'EYE SANTE CLINIC',
                clinicAddress: 'Plot 47, Lumumba Avenue, Nakasero, Kampala - Uganda',
                clinicPhone: '+256 758 341 772 / +256 200 979 911',
                receiptNumber: `RCP-${selectedSessionForReceipt.id}`,
                date: new Date(selectedSessionForReceipt.visitDate).toLocaleDateString(),
                time: new Date(selectedSessionForReceipt.visitDate).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                  timeZone: 'Africa/Kampala'
                }),
                patientName: selectedSessionForReceipt.patientName,
                patientId: selectedSessionForReceipt.patientId.toString(),
                patientNumber: selectedSessionForReceipt.patientNumber,
                items: [{
                  name: 'Consultation Fee',
                  quantity: 1,
                  unitPrice: selectedSessionForReceipt.consultationFeeAmount,
                  total: selectedSessionForReceipt.consultationFeeAmount
                }],
                subtotal: selectedSessionForReceipt.consultationFeeAmount,
                taxAmount: 0,
                totalAmount: selectedSessionForReceipt.consultationFeeAmount,
                amountPaid: selectedSessionForReceipt.consultationFeeAmount,
                balanceDue: 0,
                paymentMethod: selectedSessionForReceipt.paymentMethod || 'CASH',
                paymentReference: selectedSessionForReceipt.paymentReference,
                cashierName: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.username || 'System',
                footerMessage: 'Keep this receipt for your records'
              }}
              onClose={() => {
                setShowReceiptPrinter(false)
                setSelectedSessionForReceipt(null)
              }}
              showPreview={true}
            />
          </div>
        </div>
      )}

      {/* Edit Visit Session Modal */}
      {showEditModal && editingVisitSession && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Edit Visit Session</h3>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingVisitSession(null)
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleUpdateVisitSession(); }} className="space-y-4">


              <div>
                <label htmlFor="edit-visit-purpose" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Visit Purpose
                </label>
                <select
                  id="edit-visit-purpose"
                  value={editFormData.visitPurpose}
                  onChange={(e) => setEditFormData({ ...editFormData, visitPurpose: e.target.value as VisitPurpose })}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  {Object.values(VisitPurpose).map((purpose) => (
                    <option key={purpose} value={purpose}>
                      {purpose.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="edit-chief-complaint" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Chief Complaint
                </label>
                <textarea
                  id="edit-chief-complaint"
                  value={editFormData.chiefComplaint}
                  onChange={(e) => setEditFormData({ ...editFormData, chiefComplaint: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter chief complaint"
                />
              </div>

              <div>
                <label htmlFor="edit-consultation-fee" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Consultation Fee (UGX)
                </label>
                <input
                  type="number"
                  id="edit-consultation-fee"
                  value={editFormData.consultationFeeAmount || ''}
                  onChange={(e) => {
                    const value = e.target.value === '' ? null : Number(e.target.value);
                    setEditFormData({ ...editFormData, consultationFeeAmount: value });
                  }}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Leave empty for free consultation"
                  min="0"
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Leave empty to mark as FREE consultation
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingVisitSession(null)
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <LoadingButton
                  type="submit"
                  loading={isUpdating}
                  loadingText="Updating..."
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Update Visit Session
                </LoadingButton>
              </div>
            </form>
          </div>
        </div>
      )}

      <ErrorDialog
        isOpen={isErrorOpen}
        onClose={hideError}
        error={error}
        title="Visit Session Error"
        showRetry={true}
        onRetry={() => fetchVisitSessions()}
        showCopy={true}
      />
    </div>
  )
} 