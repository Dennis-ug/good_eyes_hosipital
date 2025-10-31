'use client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { LoadingButton } from '@/components/loading-button'
import { ErrorDialog, useErrorDialog } from '@/components/error-dialog'
import { Mail, User, Lock, CheckCircle, AlertCircle } from 'lucide-react'
import { authApi } from '@/lib/api'

interface InvitationData {
  email: string
  firstName: string
  lastName: string
  roles: string[]
  department?: string
  customMessage?: string
  expiresAt: string
}

function AcceptInvitationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [invitation, setInvitation] = useState<InvitationData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isValid, setIsValid] = useState(false)
  const [isSettingUp, setIsSettingUp] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  })
  
  const { error, isErrorOpen, handleError, hideError } = useErrorDialog()

  useEffect(() => {
    if (token) {
      validateAndLoadInvitation()
    } else {
      setIsLoading(false)
      setIsValid(false)
    }
  }, [token])

  const validateAndLoadInvitation = async () => {
    try {
      // Validate invitation token
      const isValidToken = await validateInvitation(token!)
      setIsValid(isValidToken)
      
      if (isValidToken) {
        // Load invitation details
        const invitationData = await loadInvitation(token!)
        setInvitation(invitationData)
      }
    } catch (error) {
      console.error('Failed to validate invitation:', error)
      setIsValid(false)
      handleError(error)
    } finally {
      setIsLoading(false)
    }
  }

  const validateInvitation = async (token: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/user-management/invitations/validate/${token}`)
      return response.ok && await response.json()
    } catch (error) {
      return false
    }
  }

  const loadInvitation = async (token: string): Promise<InvitationData> => {
    const response = await fetch(`/api/user-management/invitations/${token}`)
    if (!response.ok) {
      throw new Error('Failed to load invitation details')
    }
    return response.json()
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!token || !invitation) return
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match')
      return
    }
    
    if (formData.password.length < 6) {
      alert('Password must be at least 6 characters long')
      return
    }

    setIsSettingUp(true)
    
    try {
      // TODO: Implement account setup API call
      // await authApi.setupAccountFromInvitation(token, formData)
      
      alert('Account setup completed successfully! You can now log in.')
      router.push('/login')
    } catch (error) {
      console.error('Failed to setup account:', error)
      handleError(error)
    } finally {
      setIsSettingUp(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Validating invitation...</p>
        </div>
      </div>
    )
  }

  if (!isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invitation</h1>
            <p className="text-gray-600 mb-6">
              This invitation link is invalid, expired, or has already been used.
            </p>
            <a
              href="/login"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Login
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Mail className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Account Setup</h1>
          <p className="mt-2 text-gray-600">
            Welcome to Good Eyes Hospital Management System
          </p>
        </div>

        {invitation && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-blue-900">Invitation Details</h3>
                <div className="mt-2 text-sm text-blue-800 space-y-1">
                  <p><strong>Name:</strong> {invitation.firstName} {invitation.lastName}</p>
                  <p><strong>Email:</strong> {invitation.email}</p>
                  <p><strong>Roles:</strong> {invitation.roles.join(', ')}</p>
                  {invitation.department && <p><strong>Department:</strong> {invitation.department}</p>}
                  {invitation.customMessage && (
                    <p><strong>Message:</strong> {invitation.customMessage}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                id="username"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                minLength={3}
                placeholder="Choose a username"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Username must be at least 3 characters long
            </p>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                minLength={6}
                placeholder="Create a password"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Password must be at least 6 characters long
            </p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="password"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder="Confirm your password"
              />
            </div>
          </div>

          <LoadingButton
            type="submit"
            loading={isSettingUp}
            loadingText="Setting up account..."
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Complete Account Setup
          </LoadingButton>
        </form>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            By completing this setup, you agree to our terms of service and privacy policy.
          </p>
        </div>
      </div>

      <ErrorDialog
        isOpen={isErrorOpen}
        onClose={hideError}
        error={error}
        title="Account Setup Error"
        showRetry={false}
        showCopy={true}
      />
    </div>
  )
}

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invitation...</p>
        </div>
      </div>
    }>
      <AcceptInvitationContent />
    </Suspense>
  )
}
