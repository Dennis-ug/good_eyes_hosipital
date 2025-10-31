'use client'
// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import { diagnosisApi } from '@/lib/api'
import { Diagnosis, DiagnosisCategory } from '@/lib/types'

export default function EditDiagnosisPage() {
  const params = useParams()
  const router = useRouter()
  const diagnosisId = Number(params.id)
  
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null)
  const [categories, setCategories] = useState<DiagnosisCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: 0
  })

  // Searchable dropdown states
  const [categorySearch, setCategorySearch] = useState('')
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)

  useEffect(() => {
    if (diagnosisId) {
      fetchData()
    }
  }, [diagnosisId])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [diagnosisData, categoriesData] = await Promise.all([
        diagnosisApi.getDiagnosisById(diagnosisId),
        diagnosisApi.getAllCategories()
      ])
      setDiagnosis(diagnosisData)
      setCategories(categoriesData)
      
      // Initialize form data
      setFormData({
        name: diagnosisData.name,
        description: diagnosisData.description || '',
        categoryId: diagnosisData.categoryId
      })
      
      // Set category search to current category name
      const currentCategory = categoriesData.find(cat => cat.id === diagnosisData.categoryId)
      if (currentCategory) {
        setCategorySearch(currentCategory.name)
      }
    } catch (err) {
      console.error('Failed to fetch data:', err)
      setError('Failed to load diagnosis')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.categoryId) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setSaving(true)
      await diagnosisApi.updateDiagnosis(diagnosisId, formData)
      router.push(`/dashboard/diagnoses/${diagnosisId}`)
    } catch (err) {
      console.error('Failed to update diagnosis:', err)
      alert('Failed to update diagnosis')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(categorySearch.toLowerCase())
  )

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.category-dropdown')) {
        setShowCategoryDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
            href={`/dashboard/diagnoses/${diagnosis.id}`}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
          >
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Diagnosis</h1>
            <p className="text-gray-600 dark:text-gray-400">Update diagnosis information</p>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category / Eye Test Area
            </label>
            <div className="relative category-dropdown">
              <input
                type="text"
                placeholder="Search categories..."
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                onFocus={() => setShowCategoryDropdown(true)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
              {showCategoryDropdown && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredCategories.map(category => (
                    <div
                      key={category.id}
                      onClick={() => {
                        handleInputChange('categoryId', category.id)
                        setCategorySearch(category.name)
                        setShowCategoryDropdown(false)
                      }}
                      className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-900 dark:text-white"
                    >
                      {category.name}
                    </div>
                  ))}
                  {filteredCategories.length === 0 && (
                    <div className="px-3 py-2 text-gray-500 dark:text-gray-400">
                      No categories found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Diagnosis Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter diagnosis name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter description (optional)"
              rows={4}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Link
              href={`/dashboard/diagnoses/${diagnosis.id}`}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
