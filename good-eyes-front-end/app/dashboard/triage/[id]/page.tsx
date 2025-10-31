'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Edit, Activity, Heart, Weight, Eye as EyeIcon } from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import { triageApi } from '@/lib/api'
import { TriageMeasurement } from '@/lib/types'
import { LoadingPage } from '@/components/loading-page'

export default function TriageViewPage() {
  const router = useRouter()
  const params = useParams()
  const triageId = Number(params.id)
  
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [triage, setTriage] = useState<TriageMeasurement | null>(null)

  useEffect(() => {
    const fetchTriage = async () => {
      try {
        const triageData = await triageApi.getById(triageId)
        setTriage(triageData)
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

  if (error || !triage) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Triage not found'}</p>
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

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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
            <h1 className="text-2xl font-bold text-gray-900">Triage Details</h1>
            <p className="text-gray-600">View triage measurement information</p>
          </div>
        </div>
        <button
          onClick={() => router.push(`/dashboard/triage/${triage.id}/edit`)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Triage
        </button>
      </div>

      {/* Triage Information Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Information - Full Width */}
        <div className="lg:col-span-2 bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <Activity className="h-5 w-5 text-blue-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Patient Information</h3>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Patient Name</label>
                <p className="mt-1 text-lg font-semibold text-gray-900">{triage.patientName || 'Not specified'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Patient Phone</label>
                <p className="mt-1 text-lg font-semibold text-gray-900">{triage.patientPhone || 'Not specified'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Visit Session ID</label>
                <p className="mt-1 text-lg font-semibold text-gray-900">#{triage.visitSessionId}</p>
              </div>
            </div>
          </div>
        </div>
        {/* Measurement Information */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <Activity className="h-5 w-5 text-blue-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Measurement Information</h3>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Measurement Date</label>
              <p className="mt-1 text-sm text-gray-900">{formatDate(triage.measurementDate)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Measured By</label>
              <p className="mt-1 text-sm text-gray-900">{triage.measuredBy ? `User ID: ${triage.measuredBy}` : 'Not specified'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Triage ID</label>
              <p className="mt-1 text-sm text-gray-900 font-medium">#{triage.id}</p>
            </div>
          </div>
        </div>

        {/* Vital Signs */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <Heart className="h-5 w-5 text-red-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Vital Signs</h3>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {triage.systolicBp && triage.diastolicBp && (
              <div>
                <label className="block text-sm font-medium text-gray-500">Blood Pressure</label>
                <p className="mt-1 text-sm text-gray-900">{triage.systolicBp}/{triage.diastolicBp} mmHg</p>
              </div>
            )}
            {triage.rbsValue && (
              <div>
                <label className="block text-sm font-medium text-gray-500">Random Blood Sugar</label>
                <p className="mt-1 text-sm text-gray-900">{triage.rbsValue} {triage.rbsUnit || 'mg/dL'}</p>
              </div>
            )}
            {(triage.iopRight !== undefined || triage.iopLeft !== undefined) && (
              <div>
                <label className="block text-sm font-medium text-gray-500">Intraocular Pressure</label>
                <div className="mt-1 text-sm text-gray-900">
                  {triage.iopRight !== undefined && <div>Right Eye: {triage.iopRight} mmHg</div>}
                  {triage.iopLeft !== undefined && <div>Left Eye: {triage.iopLeft} mmHg</div>}
                </div>
              </div>
            )}
            {triage.weightKg && (
              <div>
                <label className="block text-sm font-medium text-gray-500">Weight</label>
                <p className="mt-1 text-sm text-gray-900">
                  {triage.weightKg} kg
                  {triage.weightLbs && ` (${triage.weightLbs} lbs)`}
                </p>
              </div>
            )}
            {!triage.systolicBp && !triage.diastolicBp && !triage.rbsValue && triage.iopRight === undefined && triage.iopLeft === undefined && !triage.weightKg && (
              <p className="text-sm text-gray-500">No vital signs recorded</p>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <Activity className="h-5 w-5 text-green-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Assessment Notes</h3>
            </div>
          </div>
          <div className="p-6">
            <div>
              <label className="block text-sm font-medium text-gray-500">Notes</label>
              <p className="mt-1 text-sm text-gray-900">{triage.notes || 'No notes provided'}</p>
            </div>
          </div>
        </div>

        {/* Audit Information */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <Activity className="h-5 w-5 text-gray-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Audit Information</h3>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Created At</label>
              <p className="mt-1 text-sm text-gray-900">{formatDate(triage.createdAt)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Created By</label>
              <p className="mt-1 text-sm text-gray-900">{triage.createdBy}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Updated At</label>
              <p className="mt-1 text-sm text-gray-900">{formatDate(triage.updatedAt)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Updated By</label>
              <p className="mt-1 text-sm text-gray-900">{triage.updatedBy}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Complete Data Display */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <Activity className="h-5 w-5 text-gray-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Complete Triage Data</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">ID</label>
              <p className="mt-1 text-sm text-gray-900">{triage.id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Visit Session ID</label>
              <p className="mt-1 text-sm text-gray-900">{triage.visitSessionId}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Systolic BP</label>
              <p className="mt-1 text-sm text-gray-900">{triage.systolicBp !== undefined ? `${triage.systolicBp} mmHg` : 'Not recorded'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Diastolic BP</label>
              <p className="mt-1 text-sm text-gray-900">{triage.diastolicBp !== undefined ? `${triage.diastolicBp} mmHg` : 'Not recorded'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">RBS Value</label>
              <p className="mt-1 text-sm text-gray-900">{triage.rbsValue !== undefined ? `${triage.rbsValue} ${triage.rbsUnit || 'mg/dL'}` : 'Not recorded'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">RBS Unit</label>
              <p className="mt-1 text-sm text-gray-900">{triage.rbsUnit || 'Not specified'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">IOP Right Eye</label>
              <p className="mt-1 text-sm text-gray-900">{triage.iopRight !== undefined ? `${triage.iopRight} mmHg` : 'Not recorded'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">IOP Left Eye</label>
              <p className="mt-1 text-sm text-gray-900">{triage.iopLeft !== undefined ? `${triage.iopLeft} mmHg` : 'Not recorded'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Weight (kg)</label>
              <p className="mt-1 text-sm text-gray-900">{triage.weightKg !== undefined ? `${triage.weightKg} kg` : 'Not recorded'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Weight (lbs)</label>
              <p className="mt-1 text-sm text-gray-900">{triage.weightLbs !== null ? `${triage.weightLbs} lbs` : 'Not recorded'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Measured By</label>
              <p className="mt-1 text-sm text-gray-900">{triage.measuredBy !== null ? `User ID: ${triage.measuredBy}` : 'Not specified'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Patient Name</label>
              <p className="mt-1 text-sm text-gray-900">{triage.patientName || 'Not specified'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Patient Phone</label>
              <p className="mt-1 text-sm text-gray-900">{triage.patientPhone || 'Not specified'}</p>
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-500">Notes</label>
              <p className="mt-1 text-sm text-gray-900">{triage.notes || 'No notes provided'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 