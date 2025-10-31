'use client'

import { useState, useEffect } from 'react'
import { Server, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react'

interface BackendStatusProps {
  className?: string
}

export function BackendStatus({ className = '' }: BackendStatusProps) {
  const [isBackendRunning, setIsBackendRunning] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  const checkBackendStatus = async () => {
    setIsChecking(true)
    try {
      const response = await fetch('http://localhost:5025/api/auth/test', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      setIsBackendRunning(response.ok)
    } catch (error) {
      setIsBackendRunning(false)
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    checkBackendStatus()
  }, [])

  if (isBackendRunning === null) {
    return null
  }

  if (isBackendRunning) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <CheckCircle className="h-5 w-5 text-green-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">Backend Connected</h3>
            <p className="text-sm text-green-700">
              Backend server is running and accessible.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-red-400" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">Backend Not Connected</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>The backend server is not running. To start the backend:</p>
            <ol className="mt-2 list-decimal list-inside space-y-1">
              <li>Navigate to your backend project directory</li>
              <li>Start the backend server (usually with <code className="bg-red-100 px-1 rounded">npm start</code> or <code className="bg-red-100 px-1 rounded">java -jar</code>)</li>
              <li>Ensure it&apos;s running on <code className="bg-red-100 px-1 rounded">http://localhost:5025</code></li>
              <li>Refresh this page once the backend is running</li>
            </ol>
            <div className="mt-3">
              <button
                onClick={checkBackendStatus}
                disabled={isChecking}
                className="inline-flex items-center px-3 py-1 border border-red-300 rounded-md text-xs font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${isChecking ? 'animate-spin' : ''}`} />
                {isChecking ? 'Checking...' : 'Check Again'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 