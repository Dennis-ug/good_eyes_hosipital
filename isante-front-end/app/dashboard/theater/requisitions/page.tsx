'use client'
// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { theaterRequisitionApi, consumablesApi } from '@/lib/api'
import { TheaterRequisition, CreateTheaterRequisitionRequest, ConsumableItem } from '@/lib/types'
import { formatUGX } from '@/lib/currency'
import { Package, Plus, Clock, CheckCircle, XCircle, AlertCircle, Eye, Edit, Trash2, Loader2 } from 'lucide-react'
import { ConsumableSearch } from '@/components/dropdown-search'

export default function TheaterRequisitionsPage() {
  const searchParams = useSearchParams()
  const [requisitions, setRequisitions] = useState<TheaterRequisition[]>([])
  const [consumableItems, setConsumableItems] = useState<ConsumableItem[]>([])
  const [searchResults, setSearchResults] = useState<ConsumableItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedRequisition, setSelectedRequisition] = useState<TheaterRequisition | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string>(searchParams.get('status') || 'ALL')
  const [itemSearchTerm, setItemSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isLoadingEdit, setIsLoadingEdit] = useState(false)
  const [submittingId, setSubmittingId] = useState<number | null>(null)
  const [isOpening, setIsOpening] = useState(false)
  const [formErrors, setFormErrors] = useState<{ title?: string; items?: string }>({})
  const [newItemErrors, setNewItemErrors] = useState<{ item?: string; quantity?: string; stock?: string }>({})
  const [isAdding, setIsAdding] = useState(false)
  const [overStockIssues, setOverStockIssues] = useState<{ index: number; name: string; available: number; requested: number }[]>([])

  // Form state
  const [formData, setFormData] = useState<CreateTheaterRequisitionRequest>({
    title: '',
    description: '',
    requiredDate: '',
    priority: 'MEDIUM',
    notes: '',
    requisitionItems: []
  })

  const [newItem, setNewItem] = useState({
    consumableItemId: 0,
    quantityRequested: 0,
    purpose: '',
    notes: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  // Update selected status when URL parameter changes
  useEffect(() => {
    const statusParam = searchParams.get('status')
    if (statusParam) {
      setSelectedStatus(statusParam)
    }
  }, [searchParams])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      
      // Only fetch requisitions on page load - consumable items will be loaded lazily
      const requisitionsResponse = await theaterRequisitionApi.getAll({ page: 0, size: 50 })

      setRequisitions(requisitionsResponse.content || [])
      // Initialize empty consumable items - will be loaded when needed
      setConsumableItems([])
      setSearchResults([])
      setError(null) // Clear any previous errors
    } catch (error) {
      console.error('Failed to fetch data:', error)
      // Show error state instead of demo data
      setRequisitions([])
      setConsumableItems([])
      setSearchResults([])
      setError('Failed to load data. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Load consumable items lazily when needed
  const loadConsumableItems = useCallback(async () => {
    if (consumableItems.length === 0) {
      try {
        const response = await consumablesApi.getAllItems({ page: 0, size: 50 })
        setConsumableItems(response.content || [])
        return response.content || []
      } catch (error) {
        console.error('Failed to load consumable items:', error)
        return []
      }
    }
    return consumableItems
  }, [consumableItems])

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchTerm: string) => {
      try {
        setIsSearching(true)

        if (searchTerm.trim().length >= 2) {
          // Use search API for specific queries
          const response = await consumablesApi.searchItems(searchTerm)
          setSearchResults(response || [])
        } else {
          // Load items lazily and show all when search term is short
          const items = await loadConsumableItems()
          setSearchResults(items)
        }
      } catch (error) {
        console.error('Failed to search items:', error)
        setSearchResults([])
        setError('Search failed. Please try again.')
      } finally {
        setIsSearching(false)
      }
    }, 300),
    [loadConsumableItems]
  )

  // Handle item search
  const handleItemSearch = (searchTerm: string) => {
    setItemSearchTerm(searchTerm)
    debouncedSearch(searchTerm)
  }

  // Debounce utility function
  function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout
    return (...args: Parameters<T>) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func(...args), wait)
    }
  }

  // Handle item selection
  const handleItemSelect = (consumable: ConsumableItem) => {
    setNewItem(prev => ({
      ...prev,
      consumableItemId: consumable.id
    }))
    setItemSearchTerm(consumable.name)
    
    // Ensure the selected item is in the consumableItems array for display
    setConsumableItems(prev => {
      const exists = prev.find(item => item.id === consumable.id)
      if (!exists) {
        return [...prev, consumable]
      }
      return prev
    })
  }

  // Handle search clear
  const handleSearchClear = () => {
    setItemSearchTerm('')
    setNewItem(prev => ({
      ...prev,
      consumableItemId: 0
    }))
  }

  // Retry data fetch
  const handleRetry = () => {
    setError(null)
    fetchData()
  }

  // Handle view requisition
  const handleViewRequisition = (requisition: TheaterRequisition) => {
    setSelectedRequisition(requisition)
    setShowViewModal(true)
  }

  // Handle opening create modal with lazy loading
  const handleOpenCreateModal = async () => {
    setIsOpening(true)
    try {
      // Load consumable items if not already loaded
      if (consumableItems.length === 0) {
        const response = await consumablesApi.getAllItems({ page: 0, size: 50 })
        setConsumableItems(response.content || [])
        setSearchResults(response.content || [])
      }
      setShowCreateModal(true)
    } catch (error) {
      console.error('Failed to load consumable items:', error)
      setError('Failed to load items. Please try again.')
    } finally {
      setIsOpening(false)
    }
  }

  // Handle edit requisition
  const handleEditRequisition = async (requisition: TheaterRequisition) => {
    if (requisition.status !== 'DRAFT') {
      setError('Only DRAFT requisitions can be edited')
      return
    }

    setIsLoadingEdit(true)
    setError(null)

    try {
      // Load consumable items if not already loaded (for editing existing items)
      if (consumableItems.length === 0) {
        const response = await consumablesApi.getAllItems({ page: 0, size: 50 })
        setConsumableItems(response.content || [])
        setSearchResults(response.content || [])
      }

      setSelectedRequisition(requisition)
      // Convert requisition to form data - ensure clean data
      const cleanItems = requisition.requisitionItems.map(item => ({
        consumableItemId: item.consumableItemId,
        quantityRequested: item.quantityRequested,
        purpose: item.purpose || '',
        notes: item.notes || ''
      }))

      console.log('Loading requisition for edit:', requisition.id)
      console.log('Items in requisition:', cleanItems.length)
      console.log('Items details:', cleanItems.map(item => ({
        id: item.consumableItemId,
        qty: item.quantityRequested,
        purpose: item.purpose
      })))

      setFormData({
        title: requisition.title,
        description: requisition.description || '',
        requiredDate: requisition.requiredDate ? requisition.requiredDate.split('T')[0] : '',
        priority: requisition.priority,
        notes: requisition.notes || '',
        requisitionItems: cleanItems
      })
      setOverStockIssues([]) // Clear any stock issues
      setShowEditModal(true)
    } catch (error) {
      console.error('Failed to load requisition for edit:', error)
      setError('Failed to load requisition. Please try again.')
    } finally {
      setIsLoadingEdit(false)
    }
  }

  // Handle update requisition
  const handleUpdateRequisition = async () => {
    if (!selectedRequisition) return

    // Validate required fields
    if (!formData.title.trim()) {
      setError('Title is required')
      return
    }

    if (formData.requisitionItems.length === 0) {
      setError('At least one item must be added to the requisition')
      return
    }

    // Validate that all items have valid quantities
    const invalidItems = formData.requisitionItems.filter(item => item.quantityRequested <= 0)
    if (invalidItems.length > 0) {
      setError('All items must have a quantity greater than 0')
      return
    }

    // Stock validation (requested must be strictly less than available)
    const allMap = new Map<number, ConsumableItem>()
    consumableItems.forEach(ci => allMap.set(ci.id, ci))
    searchResults.forEach(ci => allMap.set(ci.id, ci))
    const issues: { index: number; name: string; available: number; requested: number }[] = []
    formData.requisitionItems.forEach((item, idx) => {
      const ci = allMap.get(item.consumableItemId)
      if (!ci) return
      const available = typeof ci.currentStock === 'number' ? ci.currentStock : undefined
      if (available !== undefined && available > 0) {
        if (item.quantityRequested >= available) {
          issues.push({ index: idx, name: ci.name, available, requested: item.quantityRequested })
        }
      }
    })
    if (issues.length > 0) {
      setOverStockIssues(issues)
      const details = issues.map(i => `${i.name} needs < ${i.available}`).join('; ')
      setError(`Adjust quantities: ${details}.`)
      return
    } else {
      setOverStockIssues([])
    }

    try {
      setIsUpdating(true)
      setError(null) // Clear any existing errors before attempting update

      console.log('Updating requisition:', selectedRequisition.id)
      console.log('Form data being sent:', formData)
      console.log('Items being sent:', formData.requisitionItems.length)
      console.log('Items details:', formData.requisitionItems.map(item => ({
        id: item.consumableItemId,
        qty: item.quantityRequested,
        purpose: item.purpose
      })))

      await theaterRequisitionApi.update(selectedRequisition.id, formData)

      console.log('Update successful - requisition items replaced')

      setShowEditModal(false)
      setSelectedRequisition(null)
      setFormData({
        title: '',
        description: '',
        requiredDate: '',
        priority: 'MEDIUM',
        notes: '',
        requisitionItems: []
      })
      setOverStockIssues([])
      setError(null) // Clear any errors on successful update

      // Force refresh of requisition data to show updated items
      // Add a small delay to ensure backend has processed the update
      setTimeout(async () => {
        await fetchData()
      }, 500)
    } catch (error: any) {
      console.error('Failed to update requisition:', error)
      console.error('Error details:', error.response?.data || error.message)

      // Extract specific error message from API response
      let errorMessage = 'Failed to update requisition. Please try again.'

      if (error.message && !error.message.includes('apiRequest')) {
        errorMessage = error.message
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid request. Please check your inputs and try again.'
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication required. Please login again.'
      } else if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to update this requisition.'
      }

      setError(errorMessage)
    } finally {
      setIsUpdating(false)
    }
  }

  // Handle delete requisition
  const handleDeleteRequisition = async (requisition: TheaterRequisition) => {
    if (!confirm('Are you sure you want to delete this requisition? This action cannot be undone.')) {
      return
    }

    try {
      setDeletingId(requisition.id)
      await theaterRequisitionApi.delete(requisition.id)
      fetchData()
    } catch (error) {
      console.error('Failed to delete requisition:', error)
      setError('Failed to delete requisition. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  // Handle submit requisition
  const handleSubmitRequisition = async (requisition: TheaterRequisition) => {
    if (requisition.status !== 'DRAFT') {
      setError('Only DRAFT requisitions can be submitted')
      return
    }

    if (!confirm('Are you sure you want to submit this requisition for approval?')) {
      return
    }

    try {
      setSubmittingId(requisition.id)
      setError(null)
      
      console.log('Submitting requisition:', requisition.id)
      await theaterRequisitionApi.submit(requisition.id)
      
      console.log('Requisition submitted successfully')
      await fetchData() // Refresh the data to show updated status
    } catch (error: any) {
      console.error('Failed to submit requisition:', error)
      setError('Failed to submit requisition. Please try again.')
    } finally {
      setSubmittingId(null)
    }
  }



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800'
      case 'SUBMITTED': return 'bg-blue-100 text-blue-800'
      case 'APPROVED': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      case 'FULFILLED': return 'bg-purple-100 text-purple-800'
      case 'CANCELLED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DRAFT': return <Edit className="h-4 w-4" />
      case 'SUBMITTED': return <Clock className="h-4 w-4" />
      case 'APPROVED': return <CheckCircle className="h-4 w-4" />
      case 'REJECTED': return <XCircle className="h-4 w-4" />
      case 'FULFILLED': return <CheckCircle className="h-4 w-4" />
      case 'CANCELLED': return <XCircle className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'bg-green-100 text-green-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'HIGH': return 'bg-orange-100 text-orange-800'
      case 'URGENT': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Get item name with fallback
  const getItemName = (item: any) => {
    const consumableItem = consumableItems.find(ci => ci.id === item.consumableItemId)
    if (consumableItem?.name) {
      return consumableItem.name
    }
    // If not found, try to find in search results
    const searchItem = searchResults.find(ci => ci.id === item.consumableItemId)
    if (searchItem?.name) {
      return searchItem.name
    }
    return `Item ID: ${item.consumableItemId}`
  }

  const filteredRequisitions = selectedStatus === 'ALL' 
    ? requisitions 
    : requisitions.filter(req => req.status === selectedStatus)

  const handleCreateRequisition = async () => {
    // Validate required fields (UI-first)
    const newErrors: { title?: string; items?: string } = {}
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }
    if (formData.requisitionItems.length === 0) {
      newErrors.items = 'Add at least one item to the requisition'
    } else {
      const invalidItems = formData.requisitionItems.filter(item => item.quantityRequested <= 0)
      if (invalidItems.length > 0) {
        newErrors.items = 'All items must have a quantity greater than 0'
      }

      // Stock validation: requested must be strictly less than available
      const issues: { index: number; name: string; available: number; requested: number }[] = []
      // Build a lookup across both loaded consumables and current search results, to ensure we have stock info
      const allMap = new Map<number, ConsumableItem>()
      consumableItems.forEach(ci => allMap.set(ci.id, ci))
      searchResults.forEach(ci => allMap.set(ci.id, ci))

      formData.requisitionItems.forEach((item, idx) => {
        const ci = allMap.get(item.consumableItemId)
        if (!ci) return
        const available = typeof ci.currentStock === 'number' ? ci.currentStock : undefined
        if (available !== undefined && available > 0) {
          if (item.quantityRequested >= available) {
            issues.push({ index: idx, name: ci.name, available, requested: item.quantityRequested })
          }
        }
      })
      if (!newErrors.items && issues.length > 0) {
        setOverStockIssues(issues)
        const details = issues
          .map(i => `${i.name} needs < ${i.available}`)
          .join('; ')
        newErrors.items = `Adjust quantities: ${details}.`
      } else {
        setOverStockIssues([])
      }
    }
    setFormErrors(newErrors)
    if (newErrors.title || newErrors.items) {
      // Focus first invalid field
      if (newErrors.title) {
        const el = document.getElementById('requisition-title-input') as HTMLInputElement | null
        el?.focus()
      }
      return
    }
    setError(null)

    try {
      setIsCreating(true)
      await theaterRequisitionApi.create(formData)
      setShowCreateModal(false)
      setFormData({
        title: '',
        description: '',
        requiredDate: '',
        priority: 'MEDIUM',
        notes: '',
        requisitionItems: []
      })
      setFormErrors({})
      fetchData()
      setError(null) // Clear any existing errors
    } catch (error) {
      console.error('Failed to create requisition:', error)
      setError('Failed to create requisition. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  const addItemToRequisition = () => {
    // Check for duplicates before adding
    const existingIndex = formData.requisitionItems.findIndex(item =>
      item.consumableItemId === newItem.consumableItemId &&
      item.quantityRequested === newItem.quantityRequested &&
      item.purpose === newItem.purpose
    )

    if (existingIndex !== -1) {
      setNewItemErrors({ item: 'This exact item (same ID, quantity, and purpose) already exists in the requisition' })
      return
    }

    // Add the item if no duplicate found
      setFormData(prev => ({
        ...prev,
        requisitionItems: [...prev.requisitionItems, { ...newItem }]
      }))
      setNewItem({
        consumableItemId: 0,
        quantityRequested: 0,
        purpose: '',
        notes: ''
      })
    setItemSearchTerm('')
    setNewItemErrors({})
    setError(null)
  }

  const removeItemFromRequisition = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requisitionItems: prev.requisitionItems.filter((_, i) => i !== index)
    }))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-6">
            <div className="flex items-center">
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Error Loading Data
                </h3>
                <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                  {error}
                </p>
                <button
                  onClick={handleRetry}
                  className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Package className="h-8 w-8 text-blue-600" />
                Theater Requisitions
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage consumable item requisitions for theater procedures
              </p>
            </div>
            <button
              onClick={handleOpenCreateModal}
              disabled={isLoading || isOpening}
              className={`text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${isLoading || isOpening ? 'bg-blue-600 opacity-60 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {isOpening ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Opening...
                </>
              ) : (
                <>
              <Plus className="h-5 w-5" />
              New Requisition
                </>
              )}
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Requisitions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {requisitions.length}
                  {requisitions.length === 0 && !isLoading && (
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">No data</span>
                  )}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Approval</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {requisitions.filter(r => r.status === 'SUBMITTED').length}
                  {requisitions.length === 0 && !isLoading && (
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">No data</span>
                  )}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approved</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {requisitions.filter(r => r.status === 'APPROVED').length}
                  {requisitions.length === 0 && !isLoading && (
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">No data</span>
                  )}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Eye className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Fulfilled</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {requisitions.filter(r => r.status === 'FULFILLED').length}
                  {requisitions.length === 0 && !isLoading && (
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">No data</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Status:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="FULFILLED">Fulfilled</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Requisitions Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          {filteredRequisitions.length === 0 && !isLoading ? (
            <div className="p-12 text-center">
              <Package className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Requisitions Found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                There are no theater requisitions to display at the moment.
              </p>
              <button
                onClick={handleRetry}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Refresh Data
              </button>
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Requisition
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Requested By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Required Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredRequisitions.map((requisition) => (
                  <tr key={requisition.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {requisition.requisitionNumber}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {requisition.title}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {requisition.requestedByUserName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(requisition.requestedDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(requisition.status)}`}>
                        {getStatusIcon(requisition.status)}
                        {requisition.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(requisition.priority)}`}>
                        {requisition.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {requisition.requiredDate ? new Date(requisition.requiredDate).toLocaleDateString() : 'Not specified'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {requisition.requisitionItems.length} items
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewRequisition(requisition)}
                          title="View"
                          aria-label="View requisition"
                          className="inline-flex items-center justify-center p-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {requisition.status === 'DRAFT' && (
                          <>
                            <button
                              onClick={() => handleEditRequisition(requisition)}
                              title="Edit"
                              aria-label="Edit requisition"
                              disabled={isLoadingEdit}
                              className="inline-flex items-center justify-center p-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isLoadingEdit ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Edit className="h-4 w-4" />
                              )}
                          </button>
                            <button
                              onClick={() => handleSubmitRequisition(requisition)}
                              title="Submit"
                              aria-label="Submit requisition"
                              disabled={submittingId === requisition.id}
                              className="inline-flex items-center justify-center p-2 rounded-md bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {submittingId === requisition.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle className="h-4 w-4" />
                              )}
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDeleteRequisition(requisition)}
                          title="Delete"
                          aria-label="Delete requisition"
                          disabled={deletingId === requisition.id}
                          className={`inline-flex items-center justify-center p-2 rounded-md ${deletingId === requisition.id ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'}`}
                        >
                          {deletingId === requisition.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                        {requisition.status === 'SUBMITTED' && (
                          <>
                            <button
                              title="Approve"
                              aria-label="Approve requisition"
                              className="inline-flex items-center justify-center p-2 rounded-md bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              title="Reject"
                              aria-label="Reject requisition"
                              className="inline-flex items-center justify-center p-2 rounded-md bg-red-600 hover:bg-red-700 text-white"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>

        {/* View Requisition Modal */}
        {showViewModal && selectedRequisition && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">View Requisition</h2>
                  <button
                    onClick={() => {
                      setShowViewModal(false)
                      setSelectedRequisition(null)
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Title
                      </label>
                      <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-2 rounded">
                        {selectedRequisition.title}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Priority
                      </label>
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(selectedRequisition.priority)}`}>
                        {selectedRequisition.priority}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-2 rounded">
                      {selectedRequisition.description || 'No description provided'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Required Date
                      </label>
                      <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-2 rounded">
                        {selectedRequisition.requiredDate ? new Date(selectedRequisition.requiredDate).toLocaleDateString() : 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Status
                      </label>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedRequisition.status)}`}>
                        {getStatusIcon(selectedRequisition.status)}
                        {selectedRequisition.status}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Requisition Number
                      </label>
                      <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-2 rounded font-mono">
                        {selectedRequisition.requisitionNumber}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Requested By
                      </label>
                      <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-2 rounded">
                        {selectedRequisition.requestedByUserName}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Notes
                      </label>
                      <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-2 rounded">
                        {selectedRequisition.notes || 'No notes provided'}
                      </p>
                    </div>
                  </div>

                  {/* Rejection Reason */}
                  {selectedRequisition.status === 'REJECTED' && selectedRequisition.rejectionReason && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <div className="flex">
                        <XCircle className="h-5 w-5 text-red-400 mr-3 mt-0.5" />
                        <div>
                          <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Rejection Reason</h3>
                          <p className="text-sm text-red-700 dark:text-red-300 mt-1">{selectedRequisition.rejectionReason}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Requisition Items */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Requisition Items</h3>

                    {selectedRequisition.requisitionItems.length > 0 ? (
                      <div className="space-y-3">
                        {selectedRequisition.requisitionItems.map((item, index) => (
                          <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              <div>
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Item</span>
                                <p className="text-gray-900 dark:text-white font-medium">
                                  {item.consumableItemName}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  SKU: {item.consumableItemSku}
                                </p>
                              </div>
                              <div>
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Quantity</span>
                                <p className="text-gray-900 dark:text-white">
                                  {item.quantityRequested} {item.consumableItemUnit}
                                </p>
                              </div>

                              <div>
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Cost</span>
                                <p className="text-gray-900 dark:text-white">
                                  {formatUGX(item.totalCost)}
                                </p>
                              </div>
                            </div>
                            {(item.purpose || item.notes) && (
                              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                                {item.purpose && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    <span className="font-medium">Purpose:</span> {item.purpose}
                                  </p>
                                )}
                                {item.notes && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    <span className="font-medium">Notes:</span> {item.notes}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                        <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-medium text-blue-900 dark:text-blue-100">
                              Total Items: {selectedRequisition.requisitionItems.length}
                            </span>
                            <span className="text-lg font-bold text-blue-900 dark:text-blue-100">
                              Total Cost: {formatUGX(selectedRequisition.requisitionItems.reduce((sum, item) => sum + item.totalCost, 0))}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">No items in this requisition.</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-4 pt-6 border-t">
                    <button
                      onClick={() => {
                        setShowViewModal(false)
                        setSelectedRequisition(null)
                      }}
                      className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    >
                      Close
                    </button>
                    {selectedRequisition.status === 'DRAFT' && (
                      <button
                        onClick={() => {
                          setShowViewModal(false)
                          handleEditRequisition(selectedRequisition)
                        }}
                        disabled={isLoadingEdit}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isLoadingEdit ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          'Edit Requisition'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Requisition Modal */}
        {showEditModal && selectedRequisition && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Requisition</h2>
                  <button
                    onClick={() => {
                      setShowEditModal(false)
                      setSelectedRequisition(null)
                      setFormData({
                        title: '',
                        description: '',
                        requiredDate: '',
                        priority: 'MEDIUM',
                        notes: '',
                        requisitionItems: []
                      })
                      setError(null) // Clear any errors when closing modal
                      setOverStockIssues([]) // Clear stock issues
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="mb-6 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
                      <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Title *
                      </label>
                      <input
                        id="requisition-title-input"
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className={`w-full rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border ${formErrors.title ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                        placeholder="Enter requisition title"
                        required
                      />
                      {formErrors.title && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Priority
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      rows={3}
                      placeholder="Enter description"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Required Date
                      </label>
                      <input
                        type="date"
                        value={formData.requiredDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, requiredDate: e.target.value }))}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Notes
                      </label>
                      <input
                        type="text"
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Additional notes"
                      />
                    </div>
                  </div>

                  {/* Add Items Section */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Requisition Items</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="md:col-span-2">
                        {consumableItems.length === 0 ? (
                          <div className="w-full p-4 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                            <div className="flex items-center">
                              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                              <div className="text-sm text-yellow-800 dark:text-yellow-200">
                                <strong>No consumable items available.</strong> Please contact the store manager to add items to the system.
                              </div>
                            </div>
                          </div>
                        ) : (
                          <ConsumableSearch
                            value={itemSearchTerm}
                            onChange={handleItemSearch}
                            onSelect={handleItemSelect}
                            onClear={handleSearchClear}
                            consumables={searchResults}
                            isLoading={isSearching}
                            required
                          />
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Quantity
                        </label>
                        <input
                          type="number"
                          value={newItem.quantityRequested}
                          onChange={(e) => setNewItem(prev => ({ ...prev, quantityRequested: parseInt(e.target.value) || 0 }))}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="0"
                          min="1"
                          required
                        />
                        {newItemErrors.quantity && (
                          <p className="mt-1 text-sm text-red-600">{newItemErrors.quantity}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Purpose
                        </label>
                        <input
                          type="text"
                          value={newItem.purpose}
                          onChange={(e) => setNewItem(prev => ({ ...prev, purpose: e.target.value }))}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="e.g., Surgical use"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={addItemToRequisition}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Add
                        </button>
                      </div>
                    </div>

                    {/* Items List */}
                    {formData.requisitionItems.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">Current Items:</h4>
                        {formData.requisitionItems.map((item, index) => {
                          const consumableItem = consumableItems.find(ci => ci.id === item.consumableItemId)
                          return (
                            <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                              <div>
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {getItemName(item)}
                                </span>
                                <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                                  Qty: {item.quantityRequested} | Purpose: {item.purpose}
                                </span>
                                {overStockIssues.find(i => i.index === index) && (
                                  <span className="ml-2 text-sm text-red-600">
                                    Needs &lt; {overStockIssues.find(i => i.index === index)?.available}
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={() => removeItemFromRequisition(index)}
                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-4 pt-6 border-t">
                    <button
                      onClick={() => {
                        setShowEditModal(false)
                        setSelectedRequisition(null)
                        setFormData({
                          title: '',
                          description: '',
                          requiredDate: '',
                          priority: 'MEDIUM',
                          notes: '',
                          requisitionItems: []
                        })
                        setError(null) // Clear any errors when cancelling
                        setOverStockIssues([]) // Clear stock issues
                      }}
                      className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateRequisition}
                      disabled={isUpdating}
                      className={`flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg ${isUpdating ? 'opacity-60 cursor-not-allowed' : 'hover:bg-indigo-700'}`}
                    >
                      {isUpdating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        'Update Requisition'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Requisition Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Requisition</h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="mb-6 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
                      <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Title *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter requisition title"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Priority
                        </label>
                        <select
                        value={formData.priority}
                        onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>
                        </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      rows={3}
                      placeholder="Enter description"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Required Date
                      </label>
                      <input
                        type="date"
                        value={formData.requiredDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, requiredDate: e.target.value }))}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Notes
                      </label>
                      <input
                        type="text"
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Additional notes"
                      />
                    </div>
                  </div>

                  {/* Add Items Section */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add Items</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="md:col-span-2">
                        {consumableItems.length === 0 ? (
                          <div className="w-full p-4 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                            <div className="flex items-center">
                              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                              <div className="text-sm text-yellow-800 dark:text-yellow-200">
                                <strong>No consumable items available.</strong> Please contact the store manager to add items to the system.
                              </div>
                            </div>
                          </div>
                        ) : (
                          <ConsumableSearch
                            value={itemSearchTerm}
                            onChange={handleItemSearch}
                            onSelect={handleItemSelect}
                            onClear={handleSearchClear}
                            consumables={searchResults}
                            isLoading={isSearching}
                            required
                          />
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Quantity
                        </label>
                        <input
                          type="number"
                          value={newItem.quantityRequested}
                          onChange={(e) => setNewItem(prev => ({ ...prev, quantityRequested: parseInt(e.target.value) || 0 }))}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="0"
                          min="1"
                          required
                        />
                        {newItemErrors.quantity && (
                          <p className="mt-1 text-sm text-red-600">{newItemErrors.quantity}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Purpose
                        </label>
                        <input
                          type="text"
                          value={newItem.purpose}
                          onChange={(e) => setNewItem(prev => ({ ...prev, purpose: e.target.value }))}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="e.g., Surgical use"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={addItemToRequisition}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Add
                        </button>
                      </div>
                    </div>

                    {/* Items List */}
                    {formData.requisitionItems.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">Selected Items:</h4>
                        {formData.requisitionItems.map((item, index) => {
                          const consumableItem = consumableItems.find(ci => ci.id === item.consumableItemId)
                          return (
                            <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                              <div>
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {getItemName(item)}
                                </span>
                                <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                                  Qty: {item.quantityRequested} | Purpose: {item.purpose}
                                </span>
                              </div>
                              <button
                                onClick={() => removeItemFromRequisition(index)}
                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    )}
                    {formErrors.items && (
                      <div className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
                        {formErrors.items}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-4 pt-6 border-t">
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateRequisition}
                      disabled={isCreating}
                      className={`flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg ${isCreating ? 'opacity-60 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                    >
                      {isCreating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create Requisition'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}