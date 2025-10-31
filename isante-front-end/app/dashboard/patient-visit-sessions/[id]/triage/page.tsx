'use client'
// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { ArrowLeft, Activity, Save, Plus } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { triageApi, patientVisitSessionApi } from '@/lib/api'
import { TriageMeasurement, PatientVisitSession } from '@/lib/types'

export default function TriagePage() {
  const params = useParams()
  const visitSessionId = Number(params.id)
  const router = useRouter()
  
  const [visitSession, setVisitSession] = useState<PatientVisitSession | null>(null)
  const [triageData, setTriageData] = useState<TriageMeasurement | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    systolicBp: '',
    diastolicBp: '',
    rbsValue: '',
    rbsUnit: 'mg/dL',
    iopRight: '',
    iopLeft: '',
    weightKg: '',
    weightLbs: '',
    notes: ''
  })

  useEffect(() => {
    fetchData()
  }, [visitSessionId])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [visitData, triageData] = await Promise.all([
        patientVisitSessionApi.getVisitSession(visitSessionId),
        triageApi.getByVisitSession(visitSessionId).catch(() => null)
      ])
      setVisitSession(visitData)
      setTriageData(triageData)
      
      if (triageData) {
        setFormData({
          systolicBp: triageData.systolicBp?.toString() || '',
          diastolicBp: triageData.diastolicBp?.toString() || '',
          rbsValue: triageData.rbsValue?.toString() || '',
          rbsUnit: triageData.rbsUnit || 'mg/dL',
          iopRight: triageData.iopRight?.toString() || '',
          iopLeft: triageData.iopLeft?.toString() || '',
          weightKg: triageData.weightKg?.toString() || '',
          weightLbs: triageData.weightLbs?.toString() || '',
          notes: triageData.notes || ''
        })
      }
    } catch (err) {
      console.error('Failed to fetch data:', err)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      const triageRequest = {
        visitSessionId: visitSessionId,
        systolicBp: formData.systolicBp ? Number(formData.systolicBp) : undefined,
        diastolicBp: formData.diastolicBp ? Number(formData.diastolicBp) : undefined,
        rbsValue: formData.rbsValue ? Number(formData.rbsValue) : undefined,
        rbsUnit: formData.rbsUnit,
        iopRight: formData.iopRight ? Number(formData.iopRight) : undefined,
        iopLeft: formData.iopLeft ? Number(formData.iopLeft) : undefined,
        weightKg: formData.weightKg ? Number(formData.weightKg) : undefined,
        weightLbs: formData.weightLbs ? Number(formData.weightLbs) : undefined,
        notes: formData.notes || undefined,
        measuredBy: null
      }

      if (triageData) {
        // Update existing triage
        await triageApi.update(triageData.id, triageRequest)
      } else {
        // Create new triage
        await triageApi.create(triageRequest)
      }
      
      // Redirect to visit session view after save
      router.push(`/dashboard/patient-visit-sessions/${visitSessionId}`)
    } catch (err) {
      console.error('Failed to save triage:', err)
      alert('Failed to save triage data')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading triage data...</p>
        </div>
      </div>
    )
  }

  if (error || !visitSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Error Loading Triage</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error || 'Visit session not found'}</p>
          <Link
            href={`/dashboard/patient-visit-sessions/${visitSessionId}`}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Visit Session
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href={`/dashboard/patient-visit-sessions/${visitSessionId}`}
                className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Visit Session
              </Link>
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Triage Measurements</h1>
                  <p className="text-gray-600 dark:text-gray-400">Patient: {visitSession.patientName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Triage Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Blood Pressure */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Blood Pressure</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Systolic BP (mmHg)
                    </label>
                    <input
                      type="number"
                      value={formData.systolicBp}
                      onChange={(e) => setFormData(prev => ({ ...prev, systolicBp: e.target.value }))}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="120"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Diastolic BP (mmHg)
                    </label>
                    <input
                      type="number"
                      value={formData.diastolicBp}
                      onChange={(e) => setFormData(prev => ({ ...prev, diastolicBp: e.target.value }))}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="80"
                    />
                  </div>
                </div>
              </div>

              {/* Random Blood Sugar */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Random Blood Sugar</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      RBS Value
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.rbsValue}
                      onChange={(e) => setFormData(prev => ({ ...prev, rbsValue: e.target.value }))}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="5.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Unit
                    </label>
                    <select
                      value={formData.rbsUnit}
                      onChange={(e) => setFormData(prev => ({ ...prev, rbsUnit: e.target.value }))}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="mg/dL">mg/dL</option>
                      <option value="mmol/L">mmol/L</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Intraocular Pressure */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Intraocular Pressure</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Right Eye (mmHg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.iopRight}
                      onChange={(e) => setFormData(prev => ({ ...prev, iopRight: e.target.value }))}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="16"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Left Eye (mmHg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.iopLeft}
                      onChange={(e) => setFormData(prev => ({ ...prev, iopLeft: e.target.value }))}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="16"
                    />
                  </div>
                </div>
              </div>

              {/* Weight */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Weight</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.weightKg}
                      onChange={(e) => setFormData(prev => ({ ...prev, weightKg: e.target.value }))}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="70"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Weight (lbs)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.weightLbs}
                      onChange={(e) => setFormData(prev => ({ ...prev, weightLbs: e.target.value }))}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="154"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={4}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Additional notes about the triage measurements..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {triageData ? 'Update Triage' : 'Save Triage'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
