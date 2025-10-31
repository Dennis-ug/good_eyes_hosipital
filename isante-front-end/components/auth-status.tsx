'use client'

import { useAuth } from '@/lib/auth-context'
import { getTokenExpirationTime, getTokenPayload } from '@/lib/auth-utils'
import { formatDateTime } from '@/lib/utils'
import { Shield, Clock, User } from 'lucide-react'

export function AuthStatus() {
  const { user, userRoles } = useAuth()
  
  if (!user) return null

  const token = localStorage.getItem('accessToken')
  const tokenPayload = token ? getTokenPayload(token) : null
  const expirationTime = token ? getTokenExpirationTime(token) : null

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Shield className="h-5 w-5 text-blue-400" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
            Authentication Status
          </h3>
          <div className="mt-2 text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              <span>
                Logged in as: <strong>{user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username}</strong>
              </span>
            </div>
            {tokenPayload && (
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                <span>
                  Token expires: <strong>
                    {expirationTime ? formatDateTime(expirationTime) : 'Unknown'}
                  </strong>
                </span>
              </div>
            )}
            {userRoles && userRoles.length > 0 && (
              <div>
                Roles: <strong>{userRoles.join(', ')}</strong>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 