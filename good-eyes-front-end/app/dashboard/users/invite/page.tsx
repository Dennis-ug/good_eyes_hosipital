'use client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { userManagementApi } from '@/lib/api'
import { LoadingButton } from '@/components/loading-button'
import { ErrorDialog, useErrorDialog } from '@/components/error-dialog'
import { Mail, ArrowLeft, UserPlus, Shield } from 'lucide-react'
import Link from 'next/link'

interface InviteUserRequest {
  email: string
  firstName: string
  lastName: string
  roles: string[]
  departmentId?: number
  customMessage?: string
}

export default function InviteUserPage() {
  const { user } = useAuth()
  const [isInviting, setIsInviting] = useState(false)
  const [departments, setDepartments] = useState<any[]>([])
  const [roles, setRoles] = useState<any[]>([])
  const [formData, setFormData] = useState<InviteUserRequest>({
    email: '',
    firstName: '',
    lastName: '',
    roles: [],
    customMessage: ''
  })
  
  const { error, isErrorOpen, handleError, hideError } = useErrorDialog()

  // Load departments and roles on component mount
  useState(() => {
    loadDepartments()
    loadRoles()
  })

  const loadDepartments = async () => {
    try {
      // TODO: Replace with actual department API call
      const response = await fetch('/api/departments')
      const data = await response.json()
      setDepartments(data)
    } catch (error) {
      console.error('Failed to load departments:', error)
    }
  }

  const loadRoles = async () => {
    try {
      // TODO: Replace with actual role API call
      const response = await fetch('/api/roles')
      const data = await response.json()
      setRoles(data)
    } catch (error) {
      console.error('Failed to load roles:', error)
    }
  }

  const handleInputChange = (field: keyof InviteUserRequest, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleRoleToggle = (roleName: string) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(roleName)
        ? prev.roles.filter(role => role !== roleName)
        : [...prev.roles, roleName]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.firstName || !formData.lastName || formData.roles.length === 0) {
      alert('Please fill in all required fields and select at least one role.')
      return
    }

    setIsInviting(true)
    
    try {
      // TODO: Replace with actual invitation API call
      await userManagementApi.sendInvitation(formData)
      
      alert('Invitation sent successfully! The user will receive an email with a link to complete their account setup.')
      
      // Reset form
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        roles: [],
        customMessage: ''
      })
    } catch (error) {
      console.error('Failed to send invitation:', error)
      handleError(error)
    } finally {
      setIsInviting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8">
          <Link
            href="/dashboard/users"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to User Management
          </Link>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invite New User</h1>
              <p className="text-gray-600 dark:text-gray-400">Send invitation link to create a new account</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">User Invitation</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              The user will receive an email with a secure link to complete their account setup
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                  required
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                required
                placeholder="user@example.com"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                The invitation link will be sent to this email address
              </p>
            </div>

            {/* Department */}
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Department
              </label>
              <select
                id="department"
                onChange={(e) => handleInputChange('departmentId', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
              >
                <option value="">Select Department (Optional)</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>

            {/* Roles */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Roles *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {roles.map(role => (
                  <label key={role.name} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.roles.includes(role.name)}
                      onChange={() => handleRoleToggle(role.name)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{role.name}</span>
                    </div>
                  </label>
                ))}
              </div>
              {formData.roles.length === 0 && (
                <p className="mt-1 text-xs text-red-500">Please select at least one role</p>
              )}
            </div>

            {/* Custom Message */}
            <div>
              <label htmlFor="customMessage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Custom Message (Optional)
              </label>
              <textarea
                id="customMessage"
                value={formData.customMessage}
                onChange={(e) => handleInputChange('customMessage', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                placeholder="Add a personal message to include in the invitation email..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
              <LoadingButton
                type="submit"
                loading={isInviting}
                loadingText="Sending Invitation..."
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                <Mail className="h-4 w-4 mr-2" />
                Send Invitation
              </LoadingButton>
            </div>
          </form>
        </div>

        {/* Information Card */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <UserPlus className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">How it works</h3>
              <ul className="mt-2 text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• The user will receive an email with a secure invitation link</li>
                <li>• They can click the link to access the account setup page</li>
                <li>• They'll be able to set their own username and password</li>
                <li>• The invitation link expires after 24 hours for security</li>
                <li>• You'll receive a confirmation when they complete setup</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <ErrorDialog
        isOpen={isErrorOpen}
        onClose={hideError}
        error={error}
        title="Invitation Error"
        showRetry={false}
        showCopy={true}
      />
    </div>
  )
}
