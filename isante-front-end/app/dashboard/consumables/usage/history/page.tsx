'use client'

import React, { useState, useEffect } from 'react'
import { History, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { consumablesApi } from '@/lib/api'
import { ConsumableUsage } from '@/lib/types'

export default function UsageHistoryPage() {
  const [usageHistory, setUsageHistory] = useState<ConsumableUsage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsageHistory = async () => {
      try {
        setLoading(true)
        const response = await consumablesApi.getUsageHistory({ page: 0, size: 50 })
        setUsageHistory(response.content || [])
      } catch (err) {
        console.error('Failed to fetch usage history:', err)
        setError('Failed to load usage history')
        // Set demo data for testing
        setUsageHistory([
          {
            id: 1,
            consumableItemId: 1,
            consumableItemName: 'Surgical Gloves',
            quantityUsed: 2,
            usageDate: new Date().toISOString(),
            purpose: 'surgery',
            notes: 'Used during surgical procedure',
            createdAt: new Date().toISOString()
          },
          {
            id: 2,
            consumableItemId: 2,
            consumableItemName: 'Cleaning Solution',
            quantityUsed: 1.5,
            usageDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
            purpose: 'cleaning',
            notes: 'General cleaning',
            createdAt: new Date(Date.now() - 86400000).toISOString()
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchUsageHistory()
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Usage History</h1>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Link 
          href="/dashboard/consumables"
          className="mr-4 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold">Usage History</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity Used
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Purpose
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {usageHistory.map((usage) => (
                <tr key={usage.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {usage.consumableItemName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{usage.quantityUsed}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {usage.purpose || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(usage.usageDate).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(usage.usageDate).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {usage.notes || 'No notes'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {usageHistory.length === 0 && (
          <div className="text-center py-8">
            <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No usage history found</p>
          </div>
        )}
      </div>
    </div>
  )
}
