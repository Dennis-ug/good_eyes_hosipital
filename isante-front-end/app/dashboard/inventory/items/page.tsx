'use client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Package, Search, RefreshCw, X, AlertTriangle, CalendarX } from 'lucide-react'
import { LoadingPage } from '@/components/loading-page'
import { LoadingButton } from '@/components/loading-button'
import { ErrorDialog, useErrorDialog } from '@/components/error-dialog'
import { Pagination } from '@/components/pagination'
import { inventoryApi } from '@/lib/api'
import { InventoryItem, Page } from '@/lib/types'
import Link from 'next/link'

export default function InventoryItemsPage() {
  const [items, setItems] = useState<Page<InventoryItem> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [showRestockModal, setShowRestockModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [restockQuantity, setRestockQuantity] = useState<number>(0)
  const [isRestocking, setIsRestocking] = useState(false)
  
  const { error, isErrorOpen, handleError, hideError } = useErrorDialog()

  const fetchItems = useCallback(async (page = 0, search = '') => {
    try {
      setIsLoading(true)
      const data = await inventoryApi.getAllItems({ page, size: 20 }, search)
      setItems(data)
    } catch (error) {
      console.error('Failed to fetch items:', error)
      handleError(error)
    } finally {
      setIsLoading(false)
    }
  }, []) // Remove handleError dependency to prevent infinite loop

  // Debounce search term with 2 second delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 2000)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Fetch items when search term changes or on initial load
  useEffect(() => {
    fetchItems(0, debouncedSearchTerm)
  }, [debouncedSearchTerm, fetchItems])

  const handlePageChange = (page: number) => {
    fetchItems(page, debouncedSearchTerm)
  }

  const handleRestock = (item: InventoryItem) => {
    setSelectedItem(item)
    setRestockQuantity(0)
    setShowRestockModal(true)
  }

  const handleRestockSubmit = async () => {
    if (!selectedItem || restockQuantity <= 0) {
      handleError(new Error('Please enter a valid quantity'))
      return
    }

    try {
      setIsRestocking(true)
      const newQuantity = selectedItem.quantityInStock + restockQuantity
      await inventoryApi.updateStockQuantity(selectedItem.id, newQuantity)
      setShowRestockModal(false)
      setSelectedItem(null)
      setRestockQuantity(0)
      fetchItems() // Refresh the list
    } catch (error) {
      console.error('Failed to restock item:', error)
      handleError(error)
    } finally {
      setIsRestocking(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX'
    }).format(amount)
  }

  const formatDate = (date?: string) => {
    if (!date) return '-'
    try {
      const d = new Date(date)
      if (isNaN(d.getTime())) return '-'
      return d.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: '2-digit' })
    } catch {
      return '-'
    }
  }

  const getExpiryStatus = (date?: string) => {
    if (!date) return { status: 'NONE' as const }
    const d = new Date(date)
    if (isNaN(d.getTime())) return { status: 'NONE' as const }
    const now = new Date()
    const diffMs = d.getTime() - now.getTime()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays < 0) return { status: 'EXPIRED' as const, days: Math.abs(diffDays) }
    if (diffDays <= 30) return { status: 'SOON' as const, days: diffDays }
    return { status: 'OK' as const }
  }

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantityInStock <= item.minimumStockLevel) {
      return { status: 'Low Stock', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' }
    } else if (item.quantityInStock <= item.reorderPoint) {
      return { status: 'Reorder', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' }
    } else {
      return { status: 'In Stock', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' }
    }
  }

  if (isLoading) {
    return (
      <LoadingPage 
        message="Loading inventory items..."
        variant="spinner"
        size="lg"
        color="blue"
        layout="top"
      />
    )
  }

  const filteredItems = items?.content || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory Items</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your inventory items and stock levels</p>
        </div>
        <Link
          href="/dashboard/inventory/items/create"
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search items by name, SKU, or category..."
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

      {/* Items List */}
      {filteredItems.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Expiry
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredItems.map((item: InventoryItem) => {
                  const stockStatus = getStockStatus(item)
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                              <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{item.sku}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{item.categoryName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {(() => {
                          const exp = getExpiryStatus(item.expiryDate)
                          const dateClass = exp.status === 'EXPIRED'
                            ? 'text-red-700 dark:text-red-300'
                            : exp.status === 'SOON'
                            ? 'text-yellow-700 dark:text-yellow-300'
                            : 'text-gray-900 dark:text-white'
                          return (
                            <div className="text-sm">
                              <div className={dateClass}>{formatDate(item.expiryDate)}</div>
                              {exp.status === 'EXPIRED' && (
                                <div className="mt-1">
                                  <span title={`Expired ${exp.days} day${(exp as any).days === 1 ? '' : 's'} ago`} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
                                    <CalendarX className="h-3 w-3" />
                                    Expired
                                  </span>
                                </div>
                              )}
                              {exp.status === 'SOON' && (
                                <div className="mt-1">
                                  <span title={`Expires in ${exp.days} day${(exp as any).days === 1 ? '' : 's'}`} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                                    <AlertTriangle className="h-3 w-3" />
                                    In {exp.days}d
                                  </span>
                                </div>
                              )}
                            </div>
                          )
                        })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {item.quantityInStock} {item.unitOfMeasure}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Min: {item.minimumStockLevel}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{formatCurrency(item.unitPrice)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.color}`}>
                          {stockStatus.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Link href={`/dashboard/inventory/items/edit/${item.id}`} className="inline-flex items-center px-2 py-1 border border-gray-300 dark:border-gray-600 text-xs font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                          Edit
                        </Link>
                        <button
                          onClick={() => handleRestock(item)}
                          className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                          title="Restock Item"
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Restock
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {items && (
            <Pagination 
              page={items} 
              onPageChange={handlePageChange}
            />
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No items found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchTerm ? 'No items match your search.' : 'Get started by creating a new item.'}
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <Link
                href="/dashboard/inventory/items/create"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Restock Modal */}
      {showRestockModal && selectedItem && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Restock Item</h3>
                <button
                  onClick={() => setShowRestockModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">{selectedItem.name}</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">SKU:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{selectedItem.sku}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Category:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{selectedItem.categoryName}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Current Stock:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{selectedItem.quantityInStock} {selectedItem.unitOfMeasure}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Unit Price:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{formatCurrency(selectedItem.unitPrice)}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quantity to Add <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="1"
                      value={restockQuantity}
                      onChange={(e) => setRestockQuantity(parseInt(e.target.value) || 0)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter quantity"
                    />
                    <span className="text-sm text-gray-500 dark:text-gray-400">{selectedItem.unitOfMeasure}</span>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>New Stock Level:</strong> {selectedItem.quantityInStock + restockQuantity} {selectedItem.unitOfMeasure}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-6 space-x-3">
                <button
                  onClick={() => setShowRestockModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <LoadingButton
                  onClick={handleRestockSubmit}
                  loading={isRestocking}
                  loadingText="Restocking..."
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Restock Item
                </LoadingButton>
              </div>
            </div>
          </div>
        </div>
      )}

      <ErrorDialog
        isOpen={isErrorOpen}
        onClose={hideError}
        error={error}
        title="Inventory Error"
        showRetry={true}
        onRetry={() => fetchItems()}
        showCopy={true}
      />
    </div>
  )
}
