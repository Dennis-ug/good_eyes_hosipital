'use client'

import { useState, useEffect, useCallback } from 'react'
import { Package, AlertTriangle, Plus, DollarSign, Box } from 'lucide-react'
import { LoadingPage } from '@/components/loading-page'
import { ErrorDialog, useErrorDialog } from '@/components/error-dialog'
import { inventoryApi } from '@/lib/api'
import { InventoryItem } from '@/lib/types'
import Link from 'next/link'

interface InventorySummary {
  totalItems: number
  totalCategories: number
  lowStockItems: number
  totalValue: number
  averagePrice: number
  topCategories: { categoryName: string; itemCount: number }[]
  recentItems: InventoryItem[]
}

export default function InventoryDashboardPage() {
  const [summary, setSummary] = useState<InventorySummary>({
    totalItems: 0,
    totalCategories: 0,
    lowStockItems: 0,
    totalValue: 0,
    averagePrice: 0,
    topCategories: [],
    recentItems: []
  })
  const [isLoading, setIsLoading] = useState(true)
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([])
  
  const { error, isErrorOpen, handleError, hideError } = useErrorDialog()

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      console.log('🔍 Starting to fetch inventory data...')
      
      // Fetch all data in parallel
      const [items, categories, lowStock] = await Promise.all([
        inventoryApi.getAllItems({ page: 0, size: 1000 }),
        inventoryApi.getAllCategories({ page: 0, size: 1000 }),
        inventoryApi.getLowStockItems()
      ])

      console.log('✅ Inventory data fetched successfully:', {
        items: items.content?.length || 0,
        categories: categories.content?.length || 0,
        lowStock: lowStock.length || 0
      })

      const allItems = items.content || []
      const allCategories = categories.content || []
      
      // Calculate summary
      const totalValue = allItems.reduce((sum, item) => sum + (item.unitPrice * item.quantityInStock), 0)
      const averagePrice = allItems.length > 0 ? totalValue / allItems.length : 0
      
      // Group items by category
      const categoryMap = new Map<string, number>()
      allItems.forEach(item => {
        const categoryName = item.categoryName || 'Uncategorized'
        categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + 1)
      })
      
      const topCategories = Array.from(categoryMap.entries())
        .map(([name, count]) => ({ categoryName: name, itemCount: count }))
        .sort((a, b) => b.itemCount - a.itemCount)
        .slice(0, 5)

      setSummary({
        totalItems: allItems.length,
        totalCategories: allCategories.length,
        lowStockItems: lowStock.length,
        totalValue,
        averagePrice,
        topCategories,
        recentItems: allItems.slice(0, 5)
      })
      
      setLowStockItems(lowStock)
      
    } catch (error) {
      console.error('❌ Failed to fetch inventory data:', error)
      handleError(error)
    } finally {
      setIsLoading(false)
    }
  }, []) // Keep empty dependency array to prevent infinite loops

  useEffect(() => {
    // Test API connection first
    const testConnection = async () => {
      try {
        console.log('🔍 Testing API connection...')
        const response = await fetch('http://localhost:5025/api/test/public')
        console.log('✅ API connection successful:', response.status)
      } catch (error) {
        console.error('❌ API connection failed:', error)
      }
    }
    
    testConnection()
    fetchData()
  }, [fetchData])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX'
    }).format(amount)
  }

  const formatCompactCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `UGX ${(amount / 1000000).toFixed(1)}M`
    } else if (amount >= 1000) {
      return `UGX ${(amount / 1000).toFixed(1)}K`
    } else {
      return formatCurrency(amount)
    }
  }

  if (isLoading) {
    return (
      <LoadingPage 
        message="Loading inventory data..."
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your inventory and track stock levels</p>
        </div>
        <div className="flex space-x-3">
          <Link
            href="/dashboard/inventory/items/create"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Link>
          <Link
            href="/dashboard/inventory/categories/create"
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Package className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4 min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Items</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white truncate">{summary.totalItems.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Box className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4 min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Categories</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white truncate">{summary.totalCategories}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4 min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Low Stock</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white truncate">{summary.lowStockItems}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4 min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Value</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white truncate" title={formatCurrency(summary.totalValue)}>
                {formatCompactCurrency(summary.totalValue)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Low Stock Alerts</h3>
          </div>
          <div className="p-6">
            {lowStockItems.length > 0 ? (
              <div className="space-y-4">
                {lowStockItems.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Stock: {item.quantityInStock} {item.unitOfMeasure} (Min: {item.minimumStockLevel})
                      </p>
                    </div>
                    <div className="text-right min-w-0">
                      <p className="text-sm font-medium text-red-600 dark:text-red-400 truncate" title={formatCurrency(item.unitPrice)}>
                        {formatCompactCurrency(item.unitPrice)}
                      </p>
                      <Link
                        href={`/dashboard/inventory/items/${item.id}/edit`}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Update Stock
                      </Link>
                    </div>
                  </div>
                ))}
                {lowStockItems.length > 5 && (
                  <Link
                    href="/dashboard/inventory/low-stock"
                    className="block text-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View all {lowStockItems.length} low stock items
                  </Link>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No low stock alerts</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  All items are above their minimum stock levels.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Top Categories</h3>
          </div>
          <div className="p-6">
            {summary.topCategories.length > 0 ? (
              <div className="space-y-4">
                {summary.topCategories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{index + 1}</span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{category.categoryName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{category.itemCount} items</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {((category.itemCount / summary.totalItems) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No categories</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Create categories to organize your inventory.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Items */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Items</h3>
            <Link
              href="/dashboard/inventory/items"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              View all
            </Link>
          </div>
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
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {summary.recentItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{item.sku}</div>
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
                    <div className="text-sm text-gray-900 dark:text-white truncate" title={formatCurrency(item.unitPrice)}>
                      {formatCompactCurrency(item.unitPrice)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      item.quantityInStock <= item.minimumStockLevel
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        : item.quantityInStock <= item.reorderPoint
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                        : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    }`}>
                      {item.quantityInStock <= item.minimumStockLevel ? 'Low Stock' :
                       item.quantityInStock <= item.reorderPoint ? 'Reorder' : 'In Stock'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ErrorDialog
        isOpen={isErrorOpen}
        onClose={hideError}
        error={error}
        title="Inventory Error"
        showRetry={true}
        onRetry={fetchData}
        showCopy={true}
      />
    </div>
  )
} 