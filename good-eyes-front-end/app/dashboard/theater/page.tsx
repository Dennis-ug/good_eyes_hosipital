'use client'
// Force dynamic rendering
export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react'
import { Scissors, Plus, Calendar, Users, Package, Activity, Eye, CheckCircle, Clock, User, FileText, Edit, Trash2, RefreshCw } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { usePermissions } from '@/lib/hooks/use-permissions'
import { procedureApi, patientProcedureApi, patientVisitSessionApi, surgeryReportApi, theaterStoreApi } from '@/lib/api'
import { Procedure, PatientProcedure, PatientVisitSession, CreateSurgeryReportRequest, SurgeryReportConsumableRequest, TheaterStoreItem } from '@/lib/types'
import Link from 'next/link'

interface TheaterPatientProcedure extends PatientProcedure {
  patientName?: string
  patientPhone?: string
  visitDate?: string
  currentStage?: string
  visitStatus?: string
  scheduledDate?: string
  totalPrice?: number
}

export default function TheaterPage() {
  const { user } = useAuth()
  const { isAdmin, isDoctor } = usePermissions()
  const [isLoading, setIsLoading] = useState(true)
  const [procedures, setProcedures] = useState<Procedure[]>([])
  const [patientProcedures, setPatientProcedures] = useState<TheaterPatientProcedure[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportProcedureId, setReportProcedureId] = useState<number | null>(null)
  const [reportSubmitting, setReportSubmitting] = useState(false)
  
  // Consumables state
  const [theaterStoreItems, setTheaterStoreItems] = useState<TheaterStoreItem[]>([])
  const [consumableItems, setConsumableItems] = useState<SurgeryReportConsumableRequest[]>([])
  const [newConsumableItem, setNewConsumableItem] = useState<SurgeryReportConsumableRequest>({
    consumableItemId: 0,
    quantityUsed: 0,
    notes: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)

      // Fetch only pending patient procedures - core Theater functionality
      console.log('Fetching pending theater procedures...')
      await fetchPatientProcedures()

      // Set empty data for statistics (not needed for core theater workflow)
      setProcedures([])
      setCategories([])

    } catch (error) {
      console.error('Failed to fetch theater data:', error)
      setPatientProcedures([])
      setProcedures([])
      setCategories([])
    } finally {
      setIsLoading(false)
    }
  }

    const fetchPatientProcedures = async () => {
    try {
      console.log('Fetching all patient procedures...')

      // Get all patient procedures (both pending and completed)
      const allProcedures = await patientProcedureApi.getAll()
      console.log('All patient procedures from API:', allProcedures)
      console.log('Sample procedure with patient info:', allProcedures[0])

      if (allProcedures && allProcedures.length > 0) {
        // Filter for theater procedures (Surgery, Laser Treatment, and Treatment categories)
        const theaterProcedures = allProcedures.filter(pp =>
          pp.procedureCategory === 'Surgery' ||
          pp.procedureCategory === 'Laser Treatment' ||
          pp.procedureCategory === 'Treatment'
        )

        console.log('Theater procedures found:', theaterProcedures)

        // Use the patient information from the API response
        const enrichedProcedures: TheaterPatientProcedure[] = theaterProcedures.map(pp => ({
          ...pp,
          patientName: pp.patientName || 'Unknown Patient',
          patientPhone: pp.patientPhone || 'Phone not available',
          visitDate: new Date().toISOString().split('T')[0], // Default date
          currentStage: 'DOCTOR_VISIT',
          visitStatus: 'PAYMENT_COMPLETED',
          scheduledDate: pp.performedDate || new Date().toISOString(),
          totalPrice: pp.cost || pp.procedurePrice || 0
        }))

        console.log('Setting theater procedures:', enrichedProcedures)
        setPatientProcedures(enrichedProcedures)
      } else {
        console.log('No theater procedures found')
        setPatientProcedures([])
      }

    } catch (error) {
      console.error('Failed to fetch patient procedures:', error)
      setPatientProcedures([])
    }
  }



  // Filter patient procedures based on search, category, and status
  const filteredPatientProcedures = patientProcedures.filter(patientProcedure => {
    const matchesSearch = patientProcedure.procedureName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patientProcedure.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patientProcedure.patientPhone?.includes(searchTerm)
    const matchesCategory = !selectedCategory || patientProcedure.procedureCategory === selectedCategory
    const matchesStatus = !statusFilter || (patientProcedure.performed ? 'COMPLETED' : 'SCHEDULED') === statusFilter
    return matchesSearch && matchesCategory && matchesStatus
  })

  // Calculate statistics from patient procedures
  const totalProcedures = patientProcedures.length
  const totalPendingProcedures = patientProcedures.filter(p => !p.performed).length

  // Count procedures by category
  const surgeryProcedures = patientProcedures.filter(p => p.procedureCategory === 'Surgery').length
  const laserProcedures = patientProcedures.filter(p => p.procedureCategory === 'Laser Treatment').length
  const treatmentProcedures = patientProcedures.filter(p => p.procedureCategory === 'Treatment').length

  // Patient procedure statistics
  const scheduledProcedures = patientProcedures.filter(p => !p.performed).length
  const inProgressProcedures = patientProcedures.filter(p => p.performed && p.performedDate).length
  const completedProcedures = patientProcedures.filter(p => p.performed).length
  const pendingProcedures = patientProcedures.filter(p => !p.performed && p.currentStage === 'RECEPTION').length

  const getStatusColor = (performed: boolean) => {
    if (performed) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'RECEPTION': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
      case 'CASHIER': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'TRIAGE': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
      case 'DOCTOR_VISIT': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'PHARMACY': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'COMPLETED': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-GB', { 
        year: 'numeric', 
        month: 'short', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return '-'
    }
  }

  const calculateRemainingDays = (scheduledDate: string, performed: boolean, performedDate?: string) => {
    if (!scheduledDate) return '-'
    
    try {
      const scheduled = new Date(scheduledDate)
      const now = new Date()
      
      // If procedure is performed, calculate days since completion
      if (performed && performedDate) {
        const performed = new Date(performedDate)
        const diffTime = now.getTime() - performed.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return `${diffDays} days ago`
      }
      
      // If not performed, calculate days until scheduled date
      const diffTime = scheduled.getTime() - now.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays < 0) {
        return `${Math.abs(diffDays)} days overdue`
      } else if (diffDays === 0) {
        return 'Today'
      } else {
        return `${diffDays} days`
      }
    } catch {
      return '-'
    }
  }

  const getRemainingDaysColor = (scheduledDate: string, performed: boolean, performedDate?: string) => {
    if (!scheduledDate) return 'text-gray-500'
    
    try {
      const scheduled = new Date(scheduledDate)
      const now = new Date()
      
      // If procedure is performed, show in green
      if (performed && performedDate) {
        return 'text-green-600 dark:text-green-400'
      }
      
      // If not performed, calculate urgency
      const diffTime = scheduled.getTime() - now.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays < 0) {
        return 'text-red-600 dark:text-red-400' // Overdue
      } else if (diffDays === 0) {
        return 'text-orange-600 dark:text-orange-400' // Today
      } else if (diffDays <= 3) {
        return 'text-yellow-600 dark:text-yellow-400' // Soon (1-3 days)
      } else {
        return 'text-blue-600 dark:text-blue-400' // Future
      }
    } catch {
      return 'text-gray-500'
    }
  }

  const openReportModal = async (patientProcedureId: number) => {
    setReportProcedureId(patientProcedureId)
    setShowReportModal(true)
    // Load theater store items when opening the modal
    await loadTheaterStoreItems()
  }

  // Load theater store items for consumables selection
  const loadTheaterStoreItems = async () => {
    try {
      const items = await theaterStoreApi.getItems()
      setTheaterStoreItems(items)
    } catch (error) {
      console.error('Failed to load theater store items:', error)
      setTheaterStoreItems([])
    }
  }

  // Consumable items functions
  const addConsumableItem = () => {
    if (newConsumableItem.consumableItemId && newConsumableItem.quantityUsed > 0) {
      // Check if the selected item has enough quantity available
      const selectedItem = theaterStoreItems.find(item => item.consumableItemId === newConsumableItem.consumableItemId)
      if (selectedItem && newConsumableItem.quantityUsed > selectedItem.quantityAvailable) {
        alert(`Cannot use ${newConsumableItem.quantityUsed} units. Only ${selectedItem.quantityAvailable} units available in theater store.`)
        return
      }

      setConsumableItems([...consumableItems, { ...newConsumableItem }])
      setNewConsumableItem({
        consumableItemId: 0,
        quantityUsed: 0,
        notes: ''
      })
    }
  }

  const removeConsumableItem = (index: number) => {
    setConsumableItems(consumableItems.filter((_, i) => i !== index))
  }

  const getConsumableItemName = (itemId: number) => {
    const item = theaterStoreItems.find(i => i.consumableItemId === itemId)
    return item ? item.consumableItemName : 'Unknown Item'
  }

  const submitSurgeryReport: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    if (!reportProcedureId) return
    const form = e.currentTarget
    const formData = new FormData(form)
    const payload: CreateSurgeryReportRequest = {
      patientProcedureId: reportProcedureId,
      anesthesiaType: (formData.get('anesthesiaType') as string) as any,
      diagnosis: (formData.get('diagnosis') as string) || undefined,
      surgeryType: (formData.get('surgeryType') as string) as any,
      eyeSide: (formData.get('eyeSide') as string) as any,
      surgeonName: (formData.get('surgeonName') as string) || undefined,
      assistantName: (formData.get('assistantName') as string) || undefined,
      comments: (formData.get('comments') as string) || undefined,
      startTime: (formData.get('startTime') as string) || undefined,
      endTime: (formData.get('endTime') as string) || undefined,
      consumableItems: consumableItems.length > 0 ? consumableItems : undefined,
    }
    try {
      setReportSubmitting(true)
      await surgeryReportApi.create(payload)
      setShowReportModal(false)
      setReportProcedureId(null)
      // Reset consumables
      setConsumableItems([])
      setNewConsumableItem({
        consumableItemId: 0,
        quantityUsed: 0,
        notes: ''
      })
      await fetchPatientProcedures()
    } catch (err) {
      console.error('Failed to create surgery report', err)
      alert('Failed to create surgery report')
    } finally {
      setReportSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Theater Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage theater operations and patient surgical procedures</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Theater Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage theater operations and patient surgical procedures</p>
        </div>
        <div className="flex space-x-3">
          <Link href="/dashboard/procedures/create">
            <button title="Add new procedure" aria-label="Add new procedure" className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Procedure
            </button>
          </Link>
          <button title="Schedule a surgery" aria-label="Schedule a surgery" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Surgery
          </button>
        </div>
      </div>

      {/* Theater Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Scissors className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Procedures</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">{totalProcedures}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
            <div className="text-sm">
              <span className="text-blue-600 dark:text-blue-400">{totalPendingProcedures} Pending</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Surgery Procedures</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">{surgeryProcedures}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
            <div className="text-sm">
              <span className="text-purple-600 dark:text-purple-400">Surgical Cases</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Eye className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Laser Treatments</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">{laserProcedures + treatmentProcedures}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
            <div className="text-sm">
              <span className="text-orange-600 dark:text-orange-400">Laser & Treatment</span>
            </div>
          </div>
        </div>
      </div>







      {/* Theater Procedures from Visit Sessions */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
            <Scissors className="h-5 w-5 mr-2" />
            Theater Procedures
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            All theater procedures (Surgery, Laser & Treatment) - both pending and completed
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Procedure
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Added Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Scheduled Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Remaining Days
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {patientProcedures.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center">
                    <Scissors className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No theater procedures found</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                      No theater procedures (Surgery, Laser & Treatment) have been created yet
                    </p>
                  </td>
                </tr>
              ) : (
                patientProcedures.map((patientProcedure) => (
                  <tr key={patientProcedure.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {patientProcedure.patientName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {patientProcedure.patientPhone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {patientProcedure.procedureName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {patientProcedure.procedureCategory}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatDate(patientProcedure.createdAt || '')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {patientProcedure.scheduledDate ? (
                        <div className="text-sm text-gray-900 dark:text-white">
                          {formatDate(patientProcedure.scheduledDate)}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 dark:text-gray-500 italic">
                          Not scheduled
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${getRemainingDaysColor(
                        patientProcedure.scheduledDate || '', 
                        patientProcedure.performed || false, 
                        patientProcedure.performedDate
                      )}`}>
                        {calculateRemainingDays(
                          patientProcedure.scheduledDate || '', 
                          patientProcedure.performed || false, 
                          patientProcedure.performedDate
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(patientProcedure.performed)}`}>
                        {patientProcedure.performed ? 'COMPLETED' : 'SCHEDULED'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link href={`/dashboard/patient-visit-sessions/${patientProcedure.visitSessionId}`}>
                          <button title="View visit session" aria-label="View visit session" className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                            <Eye className="h-4 w-4" />
                          </button>
                        </Link>
                        {/* Create Procedure Report (available at any status) */}
                        <button title="Create procedure report" aria-label="Create procedure report" className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300" onClick={() => openReportModal(patientProcedure.id)}>
                          <FileText className="h-4 w-4" />
                        </button>
                        {!patientProcedure.performed && (
                          <button title="Schedule procedure" aria-label="Schedule procedure" className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">
                            <Calendar className="h-4 w-4" />
                          </button>
                        )}
                        {!patientProcedure.performed && (
                          <button title="Edit procedure" aria-label="Edit procedure" className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300">
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                        {patientProcedure.performed && (
                          <button title="View timeline" aria-label="View timeline" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300">
                            <Clock className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      

      {/* Surgery Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowReportModal(false)} />
          <div className="relative z-10 w-full max-w-2xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <h4 className="text-md font-semibold text-gray-900 dark:text-white">Surgery Post Report</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Attach surgical report to the selected procedure</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              <form id="surgery-report-form" onSubmit={submitSurgeryReport} className="px-5 py-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300">Anesthesia Type</label>
                  <select name="anesthesiaType" required className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white">
                    <option value="LOCAL">Local</option>
                    <option value="GENERAL">General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300">Surgery Type</label>
                  <select name="surgeryType" required className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white">
                    <option value="ELECTIVE">Elective</option>
                    <option value="EMERGENCY">Emergency</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300">Eye Side</label>
                  <select name="eyeSide" className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white">
                    <option value="">Select</option>
                    <option value="LEFT">Left</option>
                    <option value="RIGHT">Right</option>
                    <option value="BOTH">Both</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300">DX (Diagnosis)</label>
                  <input name="diagnosis" type="text" placeholder="Diagnosis" className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300">Surgeon Name</label>
                  <input name="surgeonName" type="text" className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300">Assistant Name</label>
                  <input name="assistantName" type="text" className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300">Start Time</label>
                  <input name="startTime" type="datetime-local" className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300">End Time</label>
                  <input name="endTime" type="datetime-local" className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300">Comments</label>
                <textarea name="comments" rows={3} className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
              </div>

              {/* Consumable Items Section */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Consumable Items Used
                  </h4>
                  <button
                    type="button"
                    onClick={loadTheaterStoreItems}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                    title="Refresh theater store items"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Refresh Items
                  </button>
                </div>

                {/* Add New Consumable Item */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Theater Store Item *
                      </label>
                      <select
                        value={newConsumableItem.consumableItemId}
                        onChange={(e) => setNewConsumableItem({...newConsumableItem, consumableItemId: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                        disabled={theaterStoreItems.length === 0}
                      >
                 <option value={0}>
                   {theaterStoreItems.length === 0
                     ? 'No items available in theater store'
                     : 'Select Theater Store Item'
                   }
                 </option>
                 {theaterStoreItems.map((item) => (
                   <option key={item.id} value={item.consumableItemId}>
                     {item.consumableItemName} ({item.consumableItemSku}) - Qty: {item.quantityAvailable}
                   </option>
                 ))}
                      </select>
                      {theaterStoreItems.length === 0 && (
                        <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                          No items available in theater store. Please add items to theater store first.
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Quantity Used *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        max={theaterStoreItems.find(item => item.consumableItemId === newConsumableItem.consumableItemId)?.quantityAvailable || undefined}
                        value={newConsumableItem.quantityUsed}
                        onChange={(e) => setNewConsumableItem({...newConsumableItem, quantityUsed: parseFloat(e.target.value) || 0})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                        placeholder="0.00"
                      />
                      {newConsumableItem.consumableItemId > 0 && (
                        <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                          Available: {theaterStoreItems.find(item => item.consumableItemId === newConsumableItem.consumableItemId)?.quantityAvailable || 0} units
                        </p>
                      )}
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={addConsumableItem}
                        disabled={theaterStoreItems.length === 0 || newConsumableItem.consumableItemId === 0 || newConsumableItem.quantityUsed <= 0}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Item
                      </button>
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Notes
                    </label>
                    <input
                      type="text"
                      value={newConsumableItem.notes}
                      onChange={(e) => setNewConsumableItem({...newConsumableItem, notes: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                      placeholder="Optional notes about this item usage"
                    />
                  </div>
                </div>

                {/* List of Added Consumable Items */}
                {consumableItems.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Items Used in Surgery:
                    </h5>
                    {consumableItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-600 p-3 rounded-lg border border-gray-200 dark:border-gray-500">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {getConsumableItemName(item.consumableItemId)}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Quantity Used: {item.quantityUsed}
                            {item.notes && ` | Notes: ${item.notes}`}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeConsumableItem(index)}
                          className="ml-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          title="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </form>
            </div>
            <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2 flex-shrink-0">
              <button type="button" onClick={() => {
                setShowReportModal(false)
                setConsumableItems([])
                setNewConsumableItem({
                  consumableItemId: 0,
                  quantityUsed: 0,
                  notes: ''
                })
              }} className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300">Cancel</button>
              <button type="submit" form="surgery-report-form" disabled={reportSubmitting} className="px-4 py-2 text-sm rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">{reportSubmitting ? 'Submitting...' : 'Submit Report'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
