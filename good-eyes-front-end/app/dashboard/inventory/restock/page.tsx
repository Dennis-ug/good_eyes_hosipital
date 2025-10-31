'use client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, Package, ArrowLeft, Plus, Minus } from 'lucide-react'
import { LoadingPage } from '@/components/loading-page'
import { LoadingButton } from '@/components/loading-button'
import { ErrorDialog, useErrorDialog } from '@/components/error-dialog'
import { inventoryApi } from '@/lib/api'
import { InventoryItem } from '@/lib/types'
import Link from 'next/link'

interface RestockItem {
  item: InventoryItem
  quantity: number
  isSelected: boolean
}

export default function RestockPage() {
  const [lowStockItems, setLowStockItems] = useState<RestockItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRestocking, setIsRestocking] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  
  const { error, isErrorOpen, handleError, hideError } = useErrorDialog()

  const fetchLowStockItems = useCallback(async () => {
    try {
      setIsLoading(true)
      const items = await inventoryApi.getLowStockItems()
      const restockItems = items.map(item => ({
        item,
        quantity: Math.max(1, item.reorderQuantity || 10), // Default to reorder quantity or 10
        isSelected: true
      }))
      setLowStockItems(restockItems)
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

  const handleQuantityChange = (index: number, quantity: number) => {
    const updatedItems = [...lowStockItems]
    updatedItems[index].quantity = Math.max(0, quantity)
    setLowStockItems(updatedItems)
  }

  const handleSelectAll = () => {
    const allSelected = lowStockItems.every(item => item.isSelected)
    const updatedItems = lowStockItems.map(item => ({
      ...item,
      isSelected: !allSelected
    }))
    setLowStockItems(updatedItems)
  }

  const handleSelectItem = (index: number) => {
    const updatedItems = [...lowStockItems]
    updatedItems[index].isSelected = !updatedItems[index].isSelected
    setLowStockItems(updatedItems)
  }

  const handleBulkRestock = async () => {
    const selectedItems = lowStockItems.filter(item => item.isSelected && item.quantity > 0)
    
    if (selectedItems.length === 0) {
      handleError(new Error('Please select at least one item to restock'))
      return
    }

    setShowConfirmation(true)
  }

  const confirmBulkRestock = async () => {
    const selectedItems = lowStockItems.filter(item => item.isSelected && item.quantity > 0)
    
    try {
      setIsRestocking(true)
      
      // Restock each selected item
      for (const restockItem of selectedItems) {
        const newQuantity = restockItem.item.quantityInStock + restockItem.quantity
        await inventoryApi.updateStockQuantity(restockItem.item.id, newQuantity)
      }
      
      setShowConfirmation(false)
      fetchLowStockItems() // Refresh the list
    } catch (error) {
      console.error('Failed to bulk restock items:', error)
      handleError(error)
    } finally {
      setIsRestocking(false)
    }
  }

  const getTotalCost = () => {
    return lowStockItems
      .filter(item => item.isSelected && item.quantity > 0)
      .reduce((total, restockItem) => {
        return total + (restockItem.item.unitPrice * restockItem.quantity)
      }, 0)
  }

  const getSelectedCount = () => {
    return lowStockItems.filter(item => item.isSelected && item.quantity > 0).length
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bulk Restocking</h1>
            <p className="text-gray-600 dark:text-gray-400">Restock multiple items at once</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Items</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{lowStockItems.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center">
            <RefreshCw className="h-8 w-8 text-green-600 dark:text-green-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Selected</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{getSelectedCount()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Plus className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Quantity</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {lowStockItems
                  .filter(item => item.isSelected && item.quantity > 0)
                  .reduce((total, item) => total + item.quantity, 0)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center">
            <span className="h-8 w-8 text-purple-600 dark:text-purple-400 text-2xl">₦</span>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Cost</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{formatCurrency(getTotalCost())}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Items List */}
      {lowStockItems.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Low Stock Items ({lowStockItems.length})
              </h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  {lowStockItems.every(item => item.isSelected) ? 'Deselect All' : 'Select All'}
                </button>
                <LoadingButton
                  onClick={handleBulkRestock}
                  loading={isRestocking}
                  loadingText="Restocking..."
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Restock Selected ({getSelectedCount()})
                </LoadingButton>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={lowStockItems.every(item => item.isSelected)}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Current Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Quantity to Add
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    New Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Cost
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {lowStockItems.map((restockItem, index) => (
                  <tr key={restockItem.item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={restockItem.isSelected}
                        onChange={() => handleSelectItem(index)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                            <Package className="h-5 w-5 text-red-600 dark:text-red-400" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{restockItem.item.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{restockItem.item.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {restockItem.item.quantityInStock} {restockItem.item.unitOfMeasure}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Min: {restockItem.item.minimumStockLevel}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleQuantityChange(index, restockItem.quantity - 1)}
                          className="p-1 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <input
                          type="number"
                          min="0"
                          value={restockItem.quantity}
                          onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 0)}
                          className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <button
                          onClick={() => handleQuantityChange(index, restockItem.quantity + 1)}
                          className="p-1 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{restockItem.item.unitOfMeasure}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {restockItem.item.quantityInStock + restockItem.quantity} {restockItem.item.unitOfMeasure}
                      </div>
                      {restockItem.item.quantityInStock + restockItem.quantity >= restockItem.item.minimumStockLevel && (
                        <div className="text-sm text-green-600 dark:text-green-400">✓ Above min</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {formatCurrency(restockItem.item.unitPrice * restockItem.quantity)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <RefreshCw className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No items to restock</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            All items are above their minimum stock levels.
          </p>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Confirm Bulk Restock</h3>
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Restock Summary</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700 dark:text-blue-300">Items to restock:</span>
                      <span className="ml-2 text-blue-900 dark:text-blue-100 font-medium">{getSelectedCount()}</span>
                    </div>
                    <div>
                      <span className="text-blue-700 dark:text-blue-300">Total quantity:</span>
                      <span className="ml-2 text-blue-900 dark:text-blue-100 font-medium">
                        {lowStockItems
                          .filter(item => item.isSelected && item.quantity > 0)
                          .reduce((total, item) => total + item.quantity, 0)}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-700 dark:text-blue-300">Total cost:</span>
                      <span className="ml-2 text-blue-900 dark:text-blue-100 font-medium">{formatCurrency(getTotalCost())}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Are you sure you want to restock the selected items? This action cannot be undone.
                </div>
              </div>
              
              <div className="flex justify-end mt-6 space-x-3">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <LoadingButton
                  onClick={confirmBulkRestock}
                  loading={isRestocking}
                  loadingText="Restocking..."
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Confirm Restock
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
        title="Restock Error"
        showRetry={true}
        onRetry={fetchLowStockItems}
        showCopy={true}
      />
    </div>
  )
} 