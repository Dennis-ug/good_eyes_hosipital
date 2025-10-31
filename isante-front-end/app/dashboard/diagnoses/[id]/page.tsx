'use client'
// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Edit, Trash2, Stethoscope } from 'lucide-react'
import Link from 'next/link'
import { diagnosisApi } from '@/lib/api'
import { Diagnosis } from '@/lib/types'

export default function DiagnosisDetailPage() {
  const params = useParams()
  const router = useRouter()
  const diagnosisId = Number(params.id)
  
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (diagnosisId) {
      fetchDiagnosis()
    }
  }, [diagnosisId])

  const fetchDiagnosis = async () => {
    try {
      setLoading(true)
      const data = await diagnosisApi.getDiagnosisById(diagnosisId)
      setDiagnosis(data)
    } catch (err) {
      console.error('Failed to fetch diagnosis:', err)
      setError('Failed to load diagnosis')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!diagnosis) return
    
    if (!confirm(`Are you sure you want to delete "${diagnosis.name}"?`)) {
      return
    }

    try {
      setDeleting(true)
      await diagnosisApi.deleteDiagnosis(diagnosis.id)
      router.push('/dashboard/diagnoses')
    } catch (err) {
      console.error('Failed to delete diagnosis:', err)
      alert('Failed to delete diagnosis')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading diagnosis...</p>
        </div>
      </div>
    )
  }

  if (error || !diagnosis) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Stethoscope className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Diagnosis Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error || 'The requested diagnosis could not be found.'}</p>
          <Link
            href="/dashboard/diagnoses"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Diagnoses
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard/diagnoses"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
          >
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{diagnosis.name}</h1>
            <p className="text-gray-600 dark:text-gray-400">Diagnosis Details</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Link
            href={`/dashboard/diagnoses/${diagnosis.id}/edit`}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Diagnosis
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {deleting ? 'Deleting...' : 'Delete Diagnosis'}
          </button>
        </div>
      </div>

      {/* Diagnosis Details */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Diagnosis Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Diagnosis Name
            </label>
            <p className="text-lg font-medium text-gray-900 dark:text-white">{diagnosis.name}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              {diagnosis.categoryName}
            </span>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <p className="text-gray-900 dark:text-white">
              {diagnosis.description || 'No description provided'}
            </p>
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Metadata</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Created At
            </label>
            <p className="text-gray-900 dark:text-white">
              {new Date(diagnosis.createdAt).toLocaleDateString()} at {new Date(diagnosis.createdAt).toLocaleTimeString()}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Last Updated
            </label>
            <p className="text-gray-900 dark:text-white">
              {new Date(diagnosis.updatedAt).toLocaleDateString()} at {new Date(diagnosis.updatedAt).toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
