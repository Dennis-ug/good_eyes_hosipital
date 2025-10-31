'use client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { AlertTriangle, Package, ArrowLeft, RefreshCw } from 'lucide-react'
import { LoadingPage } from '@/components/loading-page'
import { LoadingButton } from '@/components/loading-button'
import { ErrorDialog, useErrorDialog } from '@/components/error-dialog'
import { inventoryApi } from '@/lib/api'
import { InventoryItem } from '@/lib/types'
import Link from 'next/link'

export default function LowStockPage() {
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showRestockModal, setShowRestockModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [restockQuantity, setRestockQuantity] = useState<number>(0)
  const [isRestocking, setIsRestocking] = useState(false)
  
  const { error, isErrorOpen, handleError, hideError } = useErrorDialog()

  const fetchLowStockItems = useCallback(async () => {
    try {
      setIsLoading(true)
      const items = await inventoryApi.getLowStockItems()
      setLowStockItems(items)
    } catch (error) {
      console.error('Failed to fetch low stock items:', error)
      handleError(error)
    } finally {
      setIsLoading(false)
    }
  }, []) // Remove handleError dependency to prevent infinite loop

  useEffect(() => {
    fetchLowStockItems()
  }, [fetchLowStockItems])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX'
    }).format(amount)
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
      fetchLowStockItems() // Refresh the list
    } catch (error) {
      console.error('Failed to restock item:', error)
      handleError(error)
    } finally {
      setIsRestocking(false)
    }
  }

  if (isLoading) {
    return (
      <LoadingPage 
        message="Loading low stock items..."
        variant="spinner"
        size="lg"
        color="blue"
        layout="top"
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard/inventory"
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Inventory
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Low Stock Alerts</h1>
            <p className="text-gray-600 dark:text-gray-400">Items that need restocking</p>
          </div>
        </div>
      </div>

      {lowStockItems.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Low Stock Items ({lowStockItems.length})
            </h3>
          </div>
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
                    Current Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Min Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Reorder Point
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
                {lowStockItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                            <Package className="h-5 w-5 text-red-600 dark:text-red-400" />
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
                      <div className="text-sm text-gray-900 dark:text-white">
                        {item.quantityInStock} {item.unitOfMeasure}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{item.minimumStockLevel}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{item.reorderPoint}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{formatCurrency(item.unitPrice)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.quantityInStock <= item.minimumStockLevel
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                      }`}>
                        {item.quantityInStock <= item.minimumStockLevel ? 'Critical' : 'Low Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No low stock alerts</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            All items are above their minimum stock levels.
          </p>
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
                      <span className="text-gray-500 dark:text-gray-400">Min Level:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{selectedItem.minimumStockLevel} {selectedItem.unitOfMeasure}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Reorder Point:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{selectedItem.reorderPoint} {selectedItem.unitOfMeasure}</span>
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
                  {selectedItem.quantityInStock + restockQuantity >= selectedItem.minimumStockLevel && (
                    <div className="text-sm text-green-800 dark:text-green-200 mt-1">
                      ✓ Will be above minimum stock level
                    </div>
                  )}
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
        title="Low Stock Error"
        showRetry={true}
        onRetry={fetchLowStockItems}
        showCopy={true}
      />
    </div>
  )
}
