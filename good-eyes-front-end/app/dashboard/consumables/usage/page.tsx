'use client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react'
import { Activity, Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { consumablesApi } from '@/lib/api'
import { ConsumableItem, CreateConsumableUsageRequest } from '@/lib/types'

export default function RecordUsagePage() {
  const [items, setItems] = useState<ConsumableItem[]>([])
  const [selectedItemId, setSelectedItemId] = useState<number | ''>('')
  const [quantityUsed, setQuantityUsed] = useState<number>(1)
  const [purpose, setPurpose] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await consumablesApi.getAllItems({ page: 0, size: 1000 })
        setItems(response.content || [])
      } catch (err) {
        console.error('Failed to fetch items:', err)
        // Set demo data for testing
        setItems([
          {
            id: 1,
            name: 'Surgical Gloves',
            description: 'Disposable surgical gloves',
            currentStock: 25,
            unitOfMeasure: 'boxes',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 2,
            name: 'Cleaning Solution',
            description: 'Hospital grade cleaning solution',
            currentStock: 8,
            unitOfMeasure: 'liters',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ])
      }
    }

    fetchItems()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedItemId) {
      setError('Please select an item')
      return
    }

    // Validate quantity against available stock
    if (selectedItem && quantityUsed > selectedItem.currentStock) {
      setError(`Cannot use ${quantityUsed} ${selectedItem.unitOfMeasure}. Only ${selectedItem.currentStock} ${selectedItem.unitOfMeasure} available in stock.`)
      return
    }

    if (quantityUsed <= 0) {
      setError('Quantity used must be greater than 0')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const request: CreateConsumableUsageRequest = {
        consumableItemId: selectedItemId as number,
        quantityUsed: quantityUsed,
        purpose: purpose || undefined,
        notes: notes || undefined
      }

      await consumablesApi.recordUsage(request)
      setSuccess(true)
      
      // Reset form
      setSelectedItemId('')
      setQuantityUsed(1)
      setPurpose('')
      setNotes('')
      
      // Refresh items to get updated stock levels
      const response = await consumablesApi.getAllItems({ page: 0, size: 1000 })
      setItems(response.content || [])
      
    } catch (err: any) {
      console.error('Failed to record usage:', err)
      
      // Handle specific error messages
      if (err.message && err.message.includes('Insufficient stock available')) {
        setError('Insufficient stock available. Please check the current stock level and reduce the quantity.')
      } else if (err.message && err.message.includes('Consumable item not found')) {
        setError('Selected item not found. Please refresh the page and try again.')
      } else {
        setError('Failed to record usage. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const selectedItem = items.find(item => item.id === selectedItemId)

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center mb-6">
        <Link 
          href="/dashboard/consumables"
          className="mr-4 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold">Record Usage</h1>
      </div>

      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM5 9l3 3 7-7 1.414 1.414L8 13.414 3.586 9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                Usage recorded successfully! Stock levels have been updated.
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="space-y-6">
          {/* Item Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Consumable Item *
            </label>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value ? Number(e.target.value) : '')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select an item...</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} - {item.currentStock} {item.unitOfMeasure} available
                </option>
              ))}
            </select>
          </div>

          {/* Current Stock Display */}
          {selectedItem && (
            <div className={`border rounded-md p-3 ${
              selectedItem.currentStock <= (selectedItem.minimumStockLevel || 0)
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-blue-50 border-blue-200'
            }`}>
              <p className={`text-sm ${
                selectedItem.currentStock <= (selectedItem.minimumStockLevel || 0)
                  ? 'text-yellow-800'
                  : 'text-blue-800'
              }`}>
                <strong>Current Stock:</strong> {selectedItem.currentStock} {selectedItem.unitOfMeasure}
                {selectedItem.minimumStockLevel && (
                  <span className="ml-2">
                    (Minimum: {selectedItem.minimumStockLevel} {selectedItem.unitOfMeasure})
                  </span>
                )}
                {selectedItem.currentStock <= (selectedItem.minimumStockLevel || 0) && (
                  <span className="block mt-1 font-medium">
                    ⚠️ Low stock alert - consider restocking
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Quantity Used */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity Used *
            </label>
            <input
              type="number"
              min="0.01"
              max={selectedItem ? selectedItem.currentStock : undefined}
              step="0.01"
              value={quantityUsed}
              onChange={(e) => setQuantityUsed(Number(e.target.value))}
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                selectedItem && quantityUsed > selectedItem.currentStock 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300'
              }`}
              required
            />
            {selectedItem && quantityUsed > selectedItem.currentStock && (
              <p className="text-sm text-red-600 mt-1">
                Cannot exceed available stock: {selectedItem.currentStock} {selectedItem.unitOfMeasure}
              </p>
            )}
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Purpose
            </label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select purpose...</option>
              <option value="surgery">Surgery</option>
              <option value="cleaning">Cleaning</option>
              <option value="maintenance">Maintenance</option>
              <option value="patient_care">Patient Care</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Additional notes about this usage..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 flex items-center"
            >
              {loading ? (
                'Recording...'
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Record Usage
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
