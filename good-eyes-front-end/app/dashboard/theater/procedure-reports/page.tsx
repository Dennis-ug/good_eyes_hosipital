'use client'
// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { surgeryReportApi, patientProcedureApi, theaterStoreApi } from '@/lib/api'
import { SurgeryReport, PatientProcedure, UpdateSurgeryReportRequest, AnesthesiaType, SurgeryType, SurgeryEyeSide, SurgeryReportConsumableRequest, SurgeryReportConsumable, TheaterStoreItem } from '@/lib/types'
import { FileText, Eye, Clock, User, Calendar, Search, Filter, Download, Plus, RefreshCw, AlertTriangle, Edit, Save, X, Package, Trash2 } from 'lucide-react'

export default function ProcedureReportsPage() {
  const [reports, setReports] = useState<SurgeryReport[]>([])
  const [procedures, setProcedures] = useState<PatientProcedure[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('ALL')
  const [filterSurgeryType, setFilterSurgeryType] = useState<string>('ALL')
  
  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingReport, setEditingReport] = useState<SurgeryReport | null>(null)
  const [editFormData, setEditFormData] = useState<UpdateSurgeryReportRequest>({})
  const [isUpdating, setIsUpdating] = useState(false)
  
  // Consumable items state
  const [theaterStoreItems, setTheaterStoreItems] = useState<TheaterStoreItem[]>([])
  const [newConsumableItem, setNewConsumableItem] = useState<SurgeryReportConsumableRequest>({
    consumableItemId: 0,
    quantityUsed: 0,
    notes: ''
  })

  // Load all surgery reports
  const fetchReports = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Get all patient procedures first
      const proceduresData = await patientProcedureApi.getAll()
      setProcedures(proceduresData)
      
      // Get surgery reports for each procedure
      const allReports: SurgeryReport[] = []
      for (const procedure of proceduresData) {
        try {
          const procedureReports = await surgeryReportApi.getByProcedure(procedure.id)
          allReports.push(...procedureReports)
        } catch (err) {
          // Some procedures might not have reports, that's okay
          console.log(`No reports found for procedure ${procedure.id}`)
        }
      }
      
      setReports(allReports)
    } catch (error) {
      console.error('Failed to fetch surgery reports:', error)
      setError('Failed to load surgery reports. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
    loadTheaterStoreItems()
  }, [])

  // Debounce search term with 2 second delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 2000)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Load theater store items for selection
  const loadTheaterStoreItems = async () => {
    try {
      const items = await theaterStoreApi.getItems()
      console.log('Loaded theater store items:', items)
      setTheaterStoreItems(items)
    } catch (error) {
      console.error('Failed to load theater store items:', error)
      setTheaterStoreItems([])
    }
  }

  // Edit functions
  const openEditModal = async (report: SurgeryReport) => {
    // Refresh theater store items to get the latest data
    await loadTheaterStoreItems()
    
    setEditingReport(report)
    setEditFormData({
      anesthesiaType: report.anesthesiaType,
      diagnosis: report.diagnosis || '',
      surgeryType: report.surgeryType,
      eyeSide: report.eyeSide,
      surgeonName: report.surgeonName || '',
      assistantName: report.assistantName || '',
      comments: report.comments || '',
      startTime: report.startTime || '',
      endTime: report.endTime || '',
      consumableItems: report.consumableItems?.map(item => ({
        consumableItemId: item.consumableItemId,
        quantityUsed: item.quantityUsed,
        notes: item.notes || ''
      })) || []
    })
    setShowEditModal(true)
  }

  const closeEditModal = () => {
    setShowEditModal(false)
    setEditingReport(null)
    setEditFormData({})
    setNewConsumableItem({
      consumableItemId: 0,
      quantityUsed: 0,
      notes: ''
    })
  }

  // Consumable items functions
  const addConsumableItem = () => {
    if (newConsumableItem.consumableItemId && newConsumableItem.quantityUsed > 0) {
      const currentItems = editFormData.consumableItems || []
      setEditFormData({
        ...editFormData,
        consumableItems: [...currentItems, { ...newConsumableItem }]
      })
      setNewConsumableItem({
        consumableItemId: 0,
        quantityUsed: 0,
        notes: ''
      })
    }
  }

  const removeConsumableItem = (index: number) => {
    console.log('Removing consumable item at index:', index)
    const currentItems = editFormData.consumableItems || []
    console.log('Current items before removal:', currentItems)
    const updatedItems = currentItems.filter((_, i) => i !== index)
    console.log('Updated items after removal:', updatedItems)
    setEditFormData({
      ...editFormData,
      consumableItems: updatedItems
    })
  }

  const getConsumableItemName = (itemId: number) => {
    const item = theaterStoreItems.find(i => i.consumableItemId === itemId)
    return item ? item.consumableItemName : 'Unknown Item'
  }

  const handleUpdateReport = async () => {
    if (!editingReport) return

    try {
      setIsUpdating(true)
      console.log('Updating report with data:', editFormData)
      console.log('Consumable items being sent:', editFormData.consumableItems)
      
      const updatedReport = await surgeryReportApi.update(editingReport.id, editFormData)
      console.log('Updated report received from API:', updatedReport)
      console.log('Consumable items in response:', updatedReport.consumableItems)
      
      // Update the reports list
      setReports(reports.map(report => 
        report.id === editingReport.id ? updatedReport : report
      ))
      
      closeEditModal()
    } catch (error) {
      console.error('Failed to update report:', error)
      setError('Failed to update report. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  // Filter reports based on search and filters
  const filteredReports = reports.filter(report => {
    const procedure = procedures.find(p => p.id === report.patientProcedureId)
    if (!procedure) return false

    const matchesSearch = debouncedSearchTerm === '' || 
      procedure.procedureName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      procedure.patientName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      report.diagnosis?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      report.surgeonName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())

    const matchesSurgeryType = filterSurgeryType === 'ALL' || report.surgeryType === filterSurgeryType

    return matchesSearch && matchesSurgeryType
  })

  // Get procedure details for a report
  const getProcedureDetails = (report: SurgeryReport) => {
    return procedures.find(p => p.id === report.patientProcedureId)
  }

  // Format time duration
  const formatDuration = (startTime?: string, endTime?: string) => {
    if (!startTime || !endTime) return 'N/A'
    
    const start = new Date(`2000-01-01T${startTime}`)
    const end = new Date(`2000-01-01T${endTime}`)
    const diffMs = end.getTime() - start.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`
    }
    return `${diffMinutes}m`
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Get status badge color
  const getStatusBadgeColor = (surgeryType: string) => {
    switch (surgeryType) {
      case 'EMERGENCY':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'ELECTIVE':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  // Get anesthesia badge color
  const getAnesthesiaBadgeColor = (anesthesiaType: string) => {
    switch (anesthesiaType) {
      case 'GENERAL':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'LOCAL':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <FileText className="h-8 w-8 mr-3 text-blue-600" />
                Procedure Reports
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                View and manage surgery procedure reports
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchReports}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Error
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by procedure, patient, diagnosis, or surgeon..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Surgery Type Filter */}
            <div>
              <select
                value={filterSurgeryType}
                onChange={(e) => setFilterSurgeryType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="ALL">All Surgery Types</option>
                <option value="ELECTIVE">Elective</option>
                <option value="EMERGENCY">Emergency</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Filter className="h-4 w-4 mr-2" />
              {filteredReports.length} of {reports.length} reports
            </div>
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          {filteredReports.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No procedure reports found
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {debouncedSearchTerm || filterSurgeryType !== 'ALL' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No surgery reports have been created yet.'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Procedure & Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Surgery Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Medical Team
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Consumables
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredReports.map((report) => {
                    const procedure = getProcedureDetails(report)
                    return (
                      <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {procedure?.procedureName || 'Unknown Procedure'}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {procedure?.patientName || 'Unknown Patient'}
                            </div>
                            {report.diagnosis && (
                              <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                DX: {report.diagnosis}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col space-y-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(report.surgeryType)}`}>
                              {report.surgeryType}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAnesthesiaBadgeColor(report.anesthesiaType)}`}>
                              {report.anesthesiaType} Anesthesia
                            </span>
                            {report.eyeSide && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {report.eyeSide} Eye
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-1 text-gray-400" />
                              {report.surgeonName || 'N/A'}
                            </div>
                            {report.assistantName && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Asst: {report.assistantName}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900 dark:text-white">
                            <Clock className="h-4 w-4 mr-1 text-gray-400" />
                            {formatDuration(report.startTime, report.endTime)}
                          </div>
                          {report.startTime && report.endTime && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {report.startTime} - {report.endTime}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900 dark:text-white">
                            <Package className="h-4 w-4 mr-1 text-gray-400" />
                            {report.consumableItems && report.consumableItems.length > 0 ? (
                              <div>
                                <div className="font-medium">{report.consumableItems.length} items</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {report.consumableItems.slice(0, 2).map(item => getConsumableItemName(item.consumableItemId)).join(', ')}
                                  {report.consumableItems.length > 2 && ` +${report.consumableItems.length - 2} more`}
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-500 dark:text-gray-400">No items</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900 dark:text-white">
                            <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                            {formatDate(report.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openEditModal(report)}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                              title="Edit Report"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                              title="Download Report"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && editingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={closeEditModal} />
          <div className="relative z-10 w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Edit Surgery Report
                </h3>
                <button
                  onClick={closeEditModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="px-5 py-4">

              <div className="space-y-4">
                {/* Anesthesia Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Anesthesia Type *
                  </label>
                  <select
                    value={editFormData.anesthesiaType || ''}
                    onChange={(e) => setEditFormData({...editFormData, anesthesiaType: e.target.value as AnesthesiaType})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  >
                    <option value="">Select Anesthesia Type</option>
                    <option value="LOCAL">Local</option>
                    <option value="GENERAL">General</option>
                  </select>
                </div>

                {/* Diagnosis */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Diagnosis
                  </label>
                  <input
                    type="text"
                    value={editFormData.diagnosis || ''}
                    onChange={(e) => setEditFormData({...editFormData, diagnosis: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Enter diagnosis"
                  />
                </div>

                {/* Surgery Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Surgery Type *
                  </label>
                  <select
                    value={editFormData.surgeryType || ''}
                    onChange={(e) => setEditFormData({...editFormData, surgeryType: e.target.value as SurgeryType})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  >
                    <option value="">Select Surgery Type</option>
                    <option value="ELECTIVE">Elective</option>
                    <option value="EMERGENCY">Emergency</option>
                  </select>
                </div>

                {/* Eye Side */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Eye Side
                  </label>
                  <select
                    value={editFormData.eyeSide || ''}
                    onChange={(e) => setEditFormData({...editFormData, eyeSide: e.target.value as SurgeryEyeSide})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">Select Eye Side</option>
                    <option value="LEFT">Left</option>
                    <option value="RIGHT">Right</option>
                    <option value="BOTH">Both</option>
                  </select>
                </div>

                {/* Surgeon Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Surgeon Name
                  </label>
                  <input
                    type="text"
                    value={editFormData.surgeonName || ''}
                    onChange={(e) => setEditFormData({...editFormData, surgeonName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Enter surgeon name"
                  />
                </div>

                {/* Assistant Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Assistant Name
                  </label>
                  <input
                    type="text"
                    value={editFormData.assistantName || ''}
                    onChange={(e) => setEditFormData({...editFormData, assistantName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Enter assistant name"
                  />
                </div>

                {/* Start Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Time
                  </label>
                  <input
                    type="datetime-local"
                    value={editFormData.startTime || ''}
                    onChange={(e) => setEditFormData({...editFormData, startTime: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                {/* End Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Time
                  </label>
                  <input
                    type="datetime-local"
                    value={editFormData.endTime || ''}
                    onChange={(e) => setEditFormData({...editFormData, endTime: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                {/* Comments */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Comments
                  </label>
                  <textarea
                    value={editFormData.comments || ''}
                    onChange={(e) => setEditFormData({...editFormData, comments: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Enter any additional comments"
                  />
                </div>

                {/* Consumable Items Section */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                      <Package className="h-5 w-5 mr-2" />
                      Consumable Items Used
                    </h4>
                    <button
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
                              ? 'No theater store items available' 
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
                          value={newConsumableItem.quantityUsed}
                          onChange={(e) => setNewConsumableItem({...newConsumableItem, quantityUsed: parseFloat(e.target.value) || 0})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                          placeholder="0.00"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
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
                  {editFormData.consumableItems && editFormData.consumableItems.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Items Used in Surgery:
                      </h5>
                      {editFormData.consumableItems.map((item, index) => (
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
              </div>

              </div>
            </div>
            <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3 flex-shrink-0">
              <button
                onClick={closeEditModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateReport}
                disabled={isUpdating}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isUpdating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Report
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
