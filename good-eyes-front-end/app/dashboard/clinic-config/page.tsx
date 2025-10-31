'use client'

import { useState, useEffect } from 'react'
import { Save, Settings } from 'lucide-react'
import { LoadingPage } from '@/components/loading-page'
import { LoadingButton } from '@/components/loading-button'
import { ErrorDialog, useErrorDialog } from '@/components/error-dialog'
// import { clinicApi } from '@/lib/api'
// import { Clinic } from '@/lib/types'

export default function ClinicConfigPage() {
  const [clinic, setClinic] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  const { error, isErrorOpen, handleError, hideError } = useErrorDialog()

  const [formData, setFormData] = useState({
    name: '',
    clinicName: '',
    clinicAddress: '',
    clinicPhone: '',
    clinicEmail: '',
    clinicLogoText: '',
    receiptFooterMessage: '',
    receiptContactMessage: '',
    isActive: true,
    isDefault: false
  })

  const fetchClinicConfig = async () => {
    try {
      setIsLoading(true)
      // const data = await clinicApi.getDefaultClinic()
      const data = null // TODO: Implement clinic API
      setClinic(data)
      setFormData({
        name: data.name || '',
        clinicName: data.clinicName || '',
        clinicAddress: data.clinicAddress || '',
        clinicPhone: data.clinicPhone || '',
        clinicEmail: data.clinicEmail || '',
        clinicLogoText: data.clinicLogoText || '',
        receiptFooterMessage: data.receiptFooterMessage || '',
        receiptContactMessage: data.receiptContactMessage || '',
        isActive: data.isActive,
        isDefault: data.isDefault
      })
    } catch (error) {
      console.error('Failed to fetch clinic configuration:', error)
      handleError(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchClinicConfig()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsSaving(true)
      
      const dataToSave = {
        ...formData,
        id: clinic?.id
      }
      
      // const savedClinic = await clinicApi.saveClinic(dataToSave)
      const savedClinic = dataToSave // TODO: Implement clinic API
      setClinic(savedClinic)
      
      alert('Clinic configuration saved successfully!')
    } catch (error) {
      console.error('Failed to save clinic configuration:', error)
      handleError(error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (isLoading) {
    return <LoadingPage />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Clinic Configuration</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage clinic contact information for receipts</p>
        </div>
        <div className="flex items-center space-x-2">
          <Settings className="h-5 w-5 text-blue-500" />
          <span className="text-sm text-gray-500">Receipt Settings</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Receipt Contact Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Clinic Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.clinicName}
                onChange={(e) => handleInputChange('clinicName', e.target.value)}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.clinicPhone}
                onChange={(e) => handleInputChange('clinicPhone', e.target.value)}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Address <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.clinicAddress}
              onChange={(e) => handleInputChange('clinicAddress', e.target.value)}
              rows={2}
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              value={formData.clinicEmail}
              onChange={(e) => handleInputChange('clinicEmail', e.target.value)}
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Footer Message
            </label>
            <textarea
              value={formData.receiptFooterMessage}
              onChange={(e) => handleInputChange('receiptFooterMessage', e.target.value)}
              rows={2}
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <LoadingButton
            type="submit"
            loading={isSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>Save Configuration</span>
          </LoadingButton>
        </div>
      </form>

      <ErrorDialog
        isOpen={isErrorOpen}
        error={error}
        onClose={hideError}
      />
    </div>
  )
}
