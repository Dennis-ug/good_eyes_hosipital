'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Edit, Package, AlertTriangle, Activity, Calendar, TrendingUp, Trash2 } from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import { consumablesApi } from '@/lib/api'
import { ConsumableItem } from '@/lib/types'
import Link from 'next/link'

export default function ConsumableItemViewPage() {
  const router = useRouter()
  const params = useParams()
  const itemId = Number(params.id)
  
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [item, setItem] = useState<ConsumableItem | null>(null)

  useEffect(() => {
    const fetchItemData = async () => {
      try {
        setIsLoading(true)
        
        const itemData = await consumablesApi.getItemById(itemId)
        setItem(itemData)
        
      } catch (error) {
        console.error('Failed to load item data:', error)
        setError('Failed to load item data')
      } finally {
        setIsLoading(false)
      }
    }

    if (itemId) {
      fetchItemData()
    }
  }, [itemId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading consumable item...</p>
        </div>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Item not found'}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const isLowStock = item.currentStock <= (item.minimumStockLevel || 0)

  const handleDelete = async () => {
    if (!item || !confirm('Are you sure you want to delete this consumable item? This action cannot be undone.')) {
      return
    }

    try {
      setIsDeleting(true)
      
      await consumablesApi.deleteItem(item.id)
      router.push('/dashboard/consumables/items')
    } catch (error) {
      console.error('Failed to delete item:', error)
      
      // Check if it's a dependency error
      if (error.message && error.message.includes('usage records') || error.message.includes('restock records')) {
        const useSoftDelete = confirm(
          'This item has related records and cannot be permanently deleted. Would you like to deactivate it instead? (This will hide it from the active items list but preserve the data.)'
        )
        
        if (useSoftDelete) {
          try {
            await consumablesApi.softDeleteItem(item.id)
            router.push('/dashboard/consumables/items')
            return
          } catch (softDeleteError) {
            console.error('Failed to soft delete item:', softDeleteError)
            alert('Failed to deactivate item. Please try again.')
          }
        }
      } else {
        alert('Failed to delete item. Please try again.')
      }
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{item.name}</h1>
            <p className="text-gray-600 dark:text-gray-400">Consumable item details</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Link
            href={`/dashboard/consumables/items/${item.id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Item
          </Link>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting ? 'Deleting...' : 'Delete Item'}
          </button>
        </div>
      </div>

      {/* Stock Status Alert */}
      {isLowStock && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Low Stock Alert</h3>
              <p className="text-sm text-red-700 dark:text-red-400">
                Current stock ({item.currentStock} {item.unitOfMeasure}) is below minimum level ({item.minimumStockLevel} {item.unitOfMeasure})
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Item Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg mr-3">
                <Package className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Name</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{item.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">SKU</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{item.sku || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Category</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{item.categoryName || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Unit of Measure</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{item.unitOfMeasure}</p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Description</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{item.description || 'No description available'}</p>
              </div>
            </div>
          </div>

          {/* Stock Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mr-3">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Stock Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Stock</label>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{item.currentStock} {item.unitOfMeasure}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Minimum Stock Level</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{item.minimumStockLevel || 'Not set'} {item.unitOfMeasure}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Maximum Stock Level</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{item.maximumStockLevel || 'Not set'} {item.unitOfMeasure}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Reorder Point</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{item.reorderPoint || 'Not set'} {item.unitOfMeasure}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg mr-3">
                <Package className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Status</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Active Status</span>
                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                  item.isActive 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                    : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                }`}>
                  {item.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Stock Status</span>
                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                  isLowStock 
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' 
                    : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                }`}>
                  {isLowStock ? 'Low Stock' : 'In Stock'}
                </span>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg mr-3">
                <Calendar className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Additional Info</h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Supplier</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{item.supplierName || 'Not specified'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Location</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{item.location || 'Not specified'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Expiry Date</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{item.expiryDate ? formatDate(item.expiryDate) : 'Not specified'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Created</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{formatDate(item.createdAt)}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Updated</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{formatDate(item.updatedAt)}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
                <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
            </div>
            
            <div className="space-y-3">
              <Link
                href="/dashboard/consumables/usage"
                className="block w-full text-left border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 hover:shadow-sm flex items-center"
              >
                <Activity className="h-4 w-4 mr-3" />
                Record Usage
              </Link>
              
              <Link
                href="/dashboard/consumables/items"
                className="block w-full text-left border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 hover:shadow-sm flex items-center"
              >
                <Package className="h-4 w-4 mr-3" />
                Back to Items
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
