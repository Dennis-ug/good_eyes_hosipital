'use client'

import { useState, useEffect } from 'react'
import { AlertCircle, X, RefreshCw, Copy, Check } from 'lucide-react'

interface ErrorDialogProps {
  isOpen: boolean
  onClose: () => void
  error: {
    status?: number
    message: string
    error?: string
    path?: string
    timestamp?: string
    details?: string
  } | null
  title?: string
  showRetry?: boolean
  onRetry?: () => void
  showCopy?: boolean
}

export function ErrorDialog({
  isOpen,
  onClose,
  error,
  title = "Error",
  showRetry = false,
  onRetry,
  showCopy = true
}: ErrorDialogProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setCopied(false)
    }
  }, [isOpen])

  const handleCopy = async () => {
    if (!error) return

    const errorText = `
Error Details:
Status: ${error.status || 'Unknown'}
Message: ${error.message}
Error Type: ${error.error || 'Unknown'}
Path: ${error.path || 'Unknown'}
Timestamp: ${error.timestamp || 'Unknown'}
Details: ${error.details || 'No additional details'}
    `.trim()

    try {
      await navigator.clipboard.writeText(errorText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy error details:', err)
    }
  }

  const getStatusColor = (status?: number) => {
    if (!status) return 'bg-gray-500'
    if (status >= 500) return 'bg-red-500'
    if (status >= 400) return 'bg-orange-500'
    if (status >= 300) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const getStatusText = (status?: number) => {
    if (!status) return 'Unknown'
    if (status >= 500) return 'Server Error'
    if (status >= 400) return 'Client Error'
    if (status >= 300) return 'Redirect'
    return 'Success'
  }

  if (!isOpen || !error) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {title}
              </h3>
              {error.status && (
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`inline-block w-2 h-2 rounded-full ${getStatusColor(error.status)}`}></span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {error.status} - {getStatusText(error.status)}
                  </span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Main Error Message */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
            <p className="text-sm text-red-800 dark:text-red-400 font-medium">
              {error.message}
            </p>
          </div>

          {/* Error Details */}
          <div className="space-y-3">
            {error.error && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 dark:text-gray-400">Error Type:</span>
                <span className="text-gray-900 dark:text-white font-mono">{error.error}</span>
              </div>
            )}
            
            {error.path && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 dark:text-gray-400">Path:</span>
                <span className="text-gray-900 dark:text-white font-mono text-xs">{error.path}</span>
              </div>
            )}
            
            {error.timestamp && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 dark:text-gray-400">Timestamp:</span>
                <span className="text-gray-900 dark:text-white text-xs">
                  {new Date(error.timestamp).toLocaleString()}
                </span>
              </div>
            )}
            
            {error.details && (
              <div className="text-sm">
                <span className="text-gray-500 dark:text-gray-400">Details:</span>
                <p className="text-gray-900 dark:text-white mt-1 text-xs bg-gray-50 dark:bg-gray-700 p-2 rounded">
                  {error.details}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <div className="flex space-x-2">
            {showCopy && (
              <button
                onClick={handleCopy}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Details
                  </>
                )}
              </button>
            )}
            
            {showRetry && onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </button>
            )}
          </div>
          
          <button
            onClick={onClose}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// Hook for managing error state
export function useErrorDialog() {
  const [error, setError] = useState<{
    status?: number
    message: string
    error?: string
    path?: string
    timestamp?: string
    details?: string
  } | null>(null)
  const [isErrorOpen, setIsErrorOpen] = useState(false)

  const showError = (errorData: {
    status?: number
    message: string
    error?: string
    path?: string
    timestamp?: string
    details?: string
  }) => {
    setError(errorData)
    setIsErrorOpen(true)
  }

  const hideError = () => {
    setIsErrorOpen(false)
    setError(null)
  }

  const handleError = (error: unknown) => {
    console.error('Error occurred:', error)
    
    // Extract error details
    let errorDetails = {
      message: 'An unexpected error occurred',
      status: undefined,
      error: undefined,
      path: undefined,
      timestamp: undefined,
      details: undefined
    }

    if (error instanceof Error) {
      errorDetails.message = error.message
      errorDetails.details = error.stack
    } else if (typeof error === 'object' && error !== null) {
      const errorObj = error as Record<string, unknown>
      errorDetails = {
        message: (errorObj.message as string) || errorDetails.message,
        status: errorObj.status as number | undefined,
        error: errorObj.error as string | undefined,
        path: errorObj.path as string | undefined,
        timestamp: errorObj.timestamp as string | undefined,
        details: (errorObj.details as string) || (errorObj.stack as string)
      }
    } else if (typeof error === 'string') {
      errorDetails.message = error
    }

    showError(errorDetails)
  }

  return {
    error,
    isErrorOpen,
    showError,
    hideError,
    handleError
  }
} 