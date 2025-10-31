import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'

// Import the apiRequest function from the API file
const API_BASE_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5025/api'

// Simple API request function for permissions
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('accessToken')
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

interface PermissionChecks {
  canCreatePatients: boolean
  canUpdatePatients: boolean
  canDeletePatients: boolean
  canCreateVisitSessions: boolean
  canUpdateVisitSessions: boolean
  canCreateExaminations: boolean
  canUpdateExaminations: boolean
  canCreateTriage: boolean
  canUpdateTriage: boolean
  isDoctor: boolean
  isReceptionist: boolean
  isAdmin: boolean
}

interface UserPermissions {
  permissions: string[]
  roles: string[]
  permissionChecks: PermissionChecks
}

export function usePermissions() {
  const { user, isAuthenticated } = useAuth()
  const [permissions, setPermissions] = useState<UserPermissions | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated || !user || !user.roles || user.roles.length === 0) {
      setPermissions(null)
      setIsLoading(false)
      return
    }

    // Add a small delay to ensure authentication is fully established
    const timeoutId = setTimeout(() => {
      const fetchPermissions = async () => {
        try {
          setIsLoading(true)
          setError(null)
          
          // Use fallback permissions directly since the permissions API endpoint might not exist
          console.log('Using fallback permissions based on user roles')
          
          // Fallback to basic role-based permissions from user data
          if (user && user.roles && user.roles.length > 0) {
            const fallbackPermissions: UserPermissions = {
              permissions: [],
              roles: user.roles,
              permissionChecks: {
                canCreatePatients: user.roles.includes('RECEPTIONIST') || user.roles.includes('SUPER_ADMIN'),
                canUpdatePatients: user.roles.includes('RECEPTIONIST') || user.roles.includes('SUPER_ADMIN') || user.roles.includes('OPTOMETRIST') || user.roles.includes('OPHTHALMOLOGIST'),
                canDeletePatients: user.roles.includes('SUPER_ADMIN'),
                canCreateVisitSessions: user.roles.includes('RECEPTIONIST') || user.roles.includes('SUPER_ADMIN'),
                canUpdateVisitSessions: user.roles.includes('RECEPTIONIST') || user.roles.includes('SUPER_ADMIN'),
                canCreateExaminations: user.roles.includes('DOCTOR') || user.roles.includes('OPTOMETRIST') || user.roles.includes('OPHTHALMOLOGIST') || user.roles.includes('SUPER_ADMIN'),
                canUpdateExaminations: user.roles.includes('DOCTOR') || user.roles.includes('OPTOMETRIST') || user.roles.includes('OPHTHALMOLOGIST') || user.roles.includes('SUPER_ADMIN'),
                canCreateTriage: user.roles.includes('DOCTOR') || user.roles.includes('OPTOMETRIST') || user.roles.includes('OPHTHALMOLOGIST') || user.roles.includes('SUPER_ADMIN'),
                canUpdateTriage: user.roles.includes('DOCTOR') || user.roles.includes('OPTOMETRIST') || user.roles.includes('OPHTHALMOLOGIST') || user.roles.includes('SUPER_ADMIN'),
                isDoctor: user.roles.includes('DOCTOR') || user.roles.includes('OPTOMETRIST') || user.roles.includes('OPHTHALMOLOGIST') || user.roles.includes('SUPER_ADMIN'),
                isReceptionist: user.roles.includes('RECEPTIONIST') || user.roles.includes('SUPER_ADMIN'),
                isAdmin: user.roles.includes('ADMIN') || user.roles.includes('SUPER_ADMIN')
              }
            }
            setPermissions(fallbackPermissions)
          } else {
            // If no user roles are available, set default permissions
            console.warn('No user roles available, setting default permissions')
            const defaultPermissions: UserPermissions = {
              permissions: [],
              roles: ['USER'],
              permissionChecks: {
                canCreatePatients: false,
                canUpdatePatients: false,
                canDeletePatients: false,
                canCreateVisitSessions: false,
                canUpdateVisitSessions: false,
                canCreateExaminations: false,
                canUpdateExaminations: false,
                canCreateTriage: false,
                canUpdateTriage: false,
                isDoctor: false,
                isReceptionist: false,
                isAdmin: false
              }
            }
            setPermissions(defaultPermissions)
          }
        } catch (err) {
          console.error('Failed to set user permissions:', err)
          setError('Failed to load user permissions')
        } finally {
          setIsLoading(false)
        }
      }

      fetchPermissions()
    }, 100) // 100ms delay

    return () => clearTimeout(timeoutId)
  }, [isAuthenticated, user])

  const hasPermission = (permissionName: string): boolean => {
    if (!permissions) return false
    return permissions.permissions.includes(permissionName)
  }

  const hasRole = (roleName: string): boolean => {
    if (!permissions) return false
    return permissions.roles.includes(roleName)
  }

  const hasAnyRole = (roleNames: string[]): boolean => {
    if (!permissions) return false
    return roleNames.some(role => permissions.roles.includes(role))
  }

  const hasAnyPermission = (permissionNames: string[]): boolean => {
    if (!permissions) return false
    return permissionNames.some(permission => permissions.permissions.includes(permission))
  }

  return {
    permissions,
    isLoading,
    error,
    hasPermission,
    hasRole,
    hasAnyRole,
    hasAnyPermission,
    // Convenience methods
    canCreatePatients: permissions?.permissionChecks.canCreatePatients ?? false,
    canUpdatePatients: permissions?.permissionChecks.canUpdatePatients ?? false,
    canDeletePatients: permissions?.permissionChecks.canDeletePatients ?? false,
    canCreateVisitSessions: permissions?.permissionChecks.canCreateVisitSessions ?? false,
    canUpdateVisitSessions: permissions?.permissionChecks.canUpdateVisitSessions ?? false,
    canCreateExaminations: permissions?.permissionChecks.canCreateExaminations ?? false,
    canUpdateExaminations: permissions?.permissionChecks.canUpdateExaminations ?? false,
    canCreateTriage: permissions?.permissionChecks.canCreateTriage ?? false,
    canUpdateTriage: permissions?.permissionChecks.canUpdateTriage ?? false,
    isDoctor: permissions?.permissionChecks.isDoctor ?? false,
    isReceptionist: permissions?.permissionChecks.isReceptionist ?? false,
    isAdmin: permissions?.permissionChecks.isAdmin ?? false
  }
}
