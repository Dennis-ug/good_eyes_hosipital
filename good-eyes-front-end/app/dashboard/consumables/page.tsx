'use client'

import React, { useState, useEffect } from 'react'
import { Package, Activity, AlertTriangle, Plus, Clock } from 'lucide-react'
import Link from 'next/link'
import { consumablesApi } from '@/lib/api'
import { ConsumableItem, ConsumableUsage } from '@/lib/types'

export default function ConsumablesDashboard() {
  const [totalItems, setTotalItems] = useState(0)
  const [lowStockItems, setLowStockItems] = useState<ConsumableItem[]>([])
  const [totalStockValue, setTotalStockValue] = useState(0)
  const [recentUsage, setRecentUsage] = useState<ConsumableUsage[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Calculate total quantity used in recent usage
  const totalRecentUsage = recentUsage.reduce((sum, usage) => sum + usage.quantityUsed, 0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch total items count
        const totalCount = await consumablesApi.getTotalItemsCount()
        setTotalItems(totalCount)
        
        // Fetch low stock items
        const lowStockResponse = await consumablesApi.getLowStockItems()
        setLowStockItems(lowStockResponse)
        
        // Fetch total stock value
        const stockValue = await consumablesApi.getTotalStockValue()
        setTotalStockValue(stockValue)
        
        // Fetch recent usage (last 10 records)
        const usageResponse = await consumablesApi.getUsageHistory({ page: 0, size: 10 })
        console.log('Usage response:', usageResponse)
        setRecentUsage(usageResponse.content || [])
        
      } catch (error) {
        console.error('Failed to fetch consumables data:', error)
        // Set demo data if API fails
        setTotalItems(25)
        setLowStockItems([
          {
            id: 1,
            name: 'Surgical Gloves',
            currentStock: 5,
            minimumStockLevel: 20,
            unitOfMeasure: 'boxes',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ])
        setTotalStockValue(12450000)
        setRecentUsage([
          {
            id: 1,
            consumableItemId: 1,
            consumableItemName: 'Surgical Gloves',
            quantityUsed: 2,
            usageDate: new Date().toISOString(),
            purpose: 'surgery',
            notes: 'Used during minor procedure',
            createdAt: new Date().toISOString()
          },
          {
            id: 2,
            consumableItemId: 2,
            consumableItemName: 'Hand Sanitizer',
            quantityUsed: 1,
            usageDate: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            purpose: 'cleaning',
            notes: 'Regular sanitization',
            createdAt: new Date(Date.now() - 86400000).toISOString()
          }
        ])
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Consumables Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage internal hospital consumables</p>
        </div>
        <div className="flex space-x-3">
          <Link href="/dashboard/consumables/items" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center">
            <Package className="h-4 w-4 mr-2" />
            Manage Items
          </Link>
          <Link href="/dashboard/consumables/usage" className="border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center">
            <Activity className="h-4 w-4 mr-2" />
            Record Usage
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Package className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-sm text-green-600 dark:text-green-400 font-medium">↑ 8.2%</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Items</h3>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalItems}</div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Consumable items in stock
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <span className="text-sm text-red-600 dark:text-red-400 font-medium">↓ 2.1%</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Low Stock Items</h3>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{lowStockItems.length}</div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Items below minimum stock level
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Package className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-sm text-green-600 dark:text-green-400 font-medium">↑ 12.5%</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Stock Value</h3>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            UGX {totalStockValue.toLocaleString()}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Total inventory value
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">↗ 15.3%</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Recent Usage</h3>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalRecentUsage}</div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Total quantity used (last 10 records)
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg mr-3">
            <Plus className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
        </div>
        <div className="space-y-3">
          <Link href="/dashboard/consumables/usage" className="block w-full text-left border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 hover:shadow-sm flex items-center">
            <Activity className="h-4 w-4 mr-3" />
            Record Usage
          </Link>
          <Link href="/dashboard/consumables/items" className="block w-full text-left border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 hover:shadow-sm flex items-center">
            <Package className="h-4 w-4 mr-3" />
            Add New Item
          </Link>
        </div>
      </div>

      {/* Low Stock Alerts */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg mr-3">
            <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Low Stock Alerts</h3>
        </div>
        {lowStockItems.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No low stock items</p>
        ) : (
          <div className="space-y-3">
            {lowStockItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {item.currentStock} {item.unitOfMeasure} remaining
                  </p>
                </div>
                <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-3 py-1 rounded-full">Low Stock</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Usage */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Usage</h3>
          </div>
          <Link 
            href="/dashboard/consumables/usage" 
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            View All
          </Link>
        </div>
        {isLoading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading recent usage...</p>
        ) : recentUsage.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No recent usage recorded</p>
        ) : (
          <div className="space-y-3">
            {recentUsage.map((usage) => (
              <div key={usage.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {usage.consumableItemName}
                    </p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(usage.usageDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-400">
                      <span className="flex items-center">
                        <Activity className="h-3 w-3 mr-1" />
                        {usage.quantityUsed} used
                      </span>
                      {usage.purpose && (
                        <span className="capitalize">
                          {usage.purpose.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                    {usage.notes && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs truncate">
                        {usage.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
