'use client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { ArrowLeft, Save } from 'lucide-react'
import { LoadingButton } from '@/components/loading-button'
import { ErrorDialog, useErrorDialog } from '@/components/error-dialog'
import { inventoryApi } from '@/lib/api'
import { CreateInventoryCategoryRequest } from '@/lib/types'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CreateCategoryPage() {
  const [formData, setFormData] = useState<CreateInventoryCategoryRequest>({
    name: '',
    description: ''
  })
  const [isCreating, setIsCreating] = useState(false)
  
  const { error, isErrorOpen, handleError, hideError } = useErrorDialog()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      handleError(new Error('Category name is required'))
      return
    }

    try {
      setIsCreating(true)
      await inventoryApi.createCategory(formData)
      router.push('/dashboard/inventory/categories')
    } catch (error) {
      console.error('Failed to create category:', error)
      handleError(error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleInputChange = (field: keyof CreateInventoryCategoryRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard/inventory/categories"
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Categories
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Category</h1>
            <p className="text-gray-600 dark:text-gray-400">Add a new inventory category</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter category name"
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
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter category description"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Link
              href="/dashboard/inventory/categories"
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Cancel
            </Link>
            <LoadingButton
              type="submit"
              loading={isCreating}
              loadingText="Creating..."
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Create Category
            </LoadingButton>
          </div>
        </form>
      </div>

      <ErrorDialog
        isOpen={isErrorOpen}
        onClose={hideError}
        error={error}
        title="Category Creation Error"
        showRetry={false}
        showCopy={true}
      />
    </div>
  )
} 