'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Save, Activity } from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import { triageApi } from '@/lib/api'
import { TriageMeasurement, UpdateTriageMeasurementRequest } from '@/lib/types'
import { LoadingButton } from '@/components/loading-button'
import { LoadingPage } from '@/components/loading-page'

export default function EditTriagePage() {
  const router = useRouter()
  const params = useParams()
  const triageId = Number(params.id)
  
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [triage, setTriage] = useState<UpdateTriageMeasurementRequest>({
    systolicBp: undefined,
    diastolicBp: undefined,
    rbsValue: undefined,
    rbsUnit: 'mg/dL',
    iopRight: undefined,
    iopLeft: undefined,
    weightKg: undefined,
    notes: '',
    measurementDate: ''
  })

  useEffect(() => {
    const fetchTriage = async () => {
      try {
        const triageData = await triageApi.getById(triageId)
        setTriage({
          systolicBp: triageData.systolicBp,
          diastolicBp: triageData.diastolicBp,
          rbsValue: triageData.rbsValue,
          rbsUnit: triageData.rbsUnit || 'mg/dL',
          iopRight: triageData.iopRight,
          iopLeft: triageData.iopLeft,
          weightKg: triageData.weightKg,
          notes: triageData.notes || '',
          measurementDate: triageData.measurementDate || new Date().toISOString()
        })
      } catch (error) {
        console.error('Failed to fetch triage:', error)
        setError('Failed to load triage data')
        if (error instanceof Error) {
          alert(`Error: ${error.message}`)
        }
      } finally {
        setIsLoading(false)
      }
    }

    if (triageId) {
      fetchTriage()
    }
  }, [triageId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    setError(null)

    try {
      console.log('Updating triage measurement:', triage)
      
      const updatedTriage = await triageApi.update(triageId, triage)
      
      console.log('Triage measurement updated successfully:', updatedTriage)
      
      alert('Triage measurement updated successfully!')
      router.push('/dashboard/triage')
    } catch (error) {
      console.error('Failed to update triage measurement:', error)
      
      let errorMessage = 'Failed to update triage measurement'
      
      if (error instanceof Error) {
        if (error.message.includes('Unauthorized') || error.message.includes('Access denied')) {
          errorMessage = 'You do not have permission to update triage measurements.'
        } else {
          errorMessage = error.message
        }
      }
      
      setError(errorMessage)
      alert(errorMessage)
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <LoadingPage 
        message="Loading triage data..."
        variant="spinner"
        size="lg"
        color="blue"
        layout="top"
      />
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Triage Measurement</h1>
            <p className="text-gray-600">Update patient vital signs and assessment</p>
          </div>
        </div>
      </div>

      {/* Triage Form */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <Activity className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Vital Signs & Assessment</h3>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Vital Signs */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">Vital Signs</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="systolicBp" className="block text-sm font-medium text-gray-700">
                    Systolic BP
                  </label>
                  <input
                    type="number"
                    id="systolicBp"
                    placeholder="120"
                    value={triage.systolicBp || ''}
                    onChange={(e) => setTriage({ ...triage, systolicBp: e.target.value ? Number(e.target.value) : undefined })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="diastolicBp" className="block text-sm font-medium text-gray-700">
                    Diastolic BP
                  </label>
                  <input
                    type="number"
                    id="diastolicBp"
                    placeholder="80"
                    value={triage.diastolicBp || ''}
                    onChange={(e) => setTriage({ ...triage, diastolicBp: e.target.value ? Number(e.target.value) : undefined })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="rbsValue" className="block text-sm font-medium text-gray-700">
                  Random Blood Sugar (mg/dL)
                </label>
                <input
                  type="number"
                  id="rbsValue"
                  placeholder="95.5"
                  step="0.1"
                  min="0"
                  max="1000"
                  value={triage.rbsValue || ''}
                  onChange={(e) => setTriage({ ...triage, rbsValue: e.target.value ? Number(e.target.value) : undefined })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="iopRight" className="block text-sm font-medium text-gray-700">
                    IOP Right Eye (mmHg)
                  </label>
                  <input
                    type="number"
                    id="iopRight"
                    placeholder="16.0"
                    step="0.1"
                    min="0"
                    max="50"
                    value={triage.iopRight || ''}
                    onChange={(e) => setTriage({ ...triage, iopRight: e.target.value ? Number(e.target.value) : undefined })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="iopLeft" className="block text-sm font-medium text-gray-700">
                    IOP Left Eye (mmHg)
                  </label>
                  <input
                    type="number"
                    id="iopLeft"
                    placeholder="16.0"
                    step="0.1"
                    min="0"
                    max="50"
                    value={triage.iopLeft || ''}
                    onChange={(e) => setTriage({ ...triage, iopLeft: e.target.value ? Number(e.target.value) : undefined })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="weightKg" className="block text-sm font-medium text-gray-700">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  id="weightKg"
                  placeholder="70.5"
                  step="0.1"
                  min="0"
                  max="500"
                  value={triage.weightKg || ''}
                  onChange={(e) => setTriage({ ...triage, weightKg: e.target.value ? Number(e.target.value) : undefined })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Measurement Date */}
          <div>
            <label htmlFor="measurementDate" className="block text-sm font-medium text-gray-700">
              Measurement Date & Time
            </label>
            <input
              type="datetime-local"
              id="measurementDate"
              value={triage.measurementDate ? triage.measurementDate.slice(0, 16) : ''}
              onChange={(e) => {
                const dateTime = e.target.value ? new Date(e.target.value).toISOString() : new Date().toISOString()
                setTriage({ ...triage, measurementDate: dateTime })
              }}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Assessment Notes
            </label>
            <textarea
              id="notes"
              rows={4}
              placeholder="Enter any additional assessment notes..."
              value={triage.notes}
              onChange={(e) => setTriage({ ...triage, notes: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <LoadingButton
              type="submit"
              loading={isUpdating}
              loadingText="Updating Triage..."
              variant="primary"
              size="md"
            >
              <Save className="h-4 w-4 mr-2" />
              Update Triage
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  )
} 