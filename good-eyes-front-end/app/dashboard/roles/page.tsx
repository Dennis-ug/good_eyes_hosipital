'use client'
// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Shield, Key, Edit, Trash2, X, Check } from 'lucide-react'
import { adminApi } from '@/lib/api'
import { Role, Permission, CreateRoleRequest, CreatePermissionRequest, Page } from '@/lib/types'
import { LoadingPage } from '@/components/loading-page'
import { LoadingButton } from '@/components/loading-button'
import { Pagination } from '@/components/pagination'
import { usePagination } from '@/lib/hooks/use-pagination'
import { ErrorDialog, useErrorDialog } from '@/components/error-dialog'

export default function RolesPage() {
  const [roles, setRoles] = useState<Page<Role> | null>(null)
  const [permissions, setPermissions] = useState<Page<Permission> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'roles' | 'permissions'>('roles')
  const [showCreateRole, setShowCreateRole] = useState(false)
  const [showCreatePermission, setShowCreatePermission] = useState(false)
  const [newRole, setNewRole] = useState<CreateRoleRequest>({
    name: '',
    description: '',
    enabled: true,
    permissionIds: []
  })
  const [newPermission, setNewPermission] = useState<CreatePermissionRequest>({
    name: '',
    description: '',
    resourceName: '',
    actionName: '',
    enabled: true
  })
  const [isCreating, setIsCreating] = useState(false)
  
  // Edit and delete states
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null)
  const [showEditRole, setShowEditRole] = useState(false)
  const [showEditPermission, setShowEditPermission] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  
  // Error dialog hook
  const { error, isErrorOpen, handleError, hideError } = useErrorDialog()
  
  const {
    pageable,
    handlePageChange,
    handleSizeChange,
    handleSortChange
  } = usePagination({
    initialPage: 0,
    initialSize: 10,
    initialSort: 'name,asc'
  })

  const fetchData = useCallback(async () => {
    try {
      console.log('Fetching roles and permissions with pagination:', pageable)
      const [rolesData, permissionsData] = await Promise.all([
        adminApi.getAllRoles(pageable),
        adminApi.getAllPermissions(pageable)
      ])
      console.log('Roles and permissions fetched successfully:', { roles: rolesData, permissions: permissionsData })
      setRoles(rolesData)
      setPermissions(permissionsData)
    } catch (error) {
      console.error('Failed to fetch roles and permissions:', error)
      handleError(error)
    } finally {
      setIsLoading(false)
    }
  }, [pageable, handleError])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)

    try {
      console.log('Creating role with data:', newRole)
      await adminApi.createRole(newRole)
      console.log('Role created successfully')
      setNewRole({
        name: '',
        description: '',
        enabled: true,
        permissionIds: []
      })
      setShowCreateRole(false)
      fetchData()
    } catch (error) {
      console.error('Failed to create role:', error)
      handleError(error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleCreatePermission = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)

    try {
      console.log('Creating permission with data:', newPermission)
      await adminApi.createPermission(newPermission)
      console.log('Permission created successfully')
      setNewPermission({
        name: '',
        description: '',
        resourceName: '',
        actionName: '',
        enabled: true
      })
      setShowCreatePermission(false)
      fetchData()
    } catch (error) {
      console.error('Failed to create permission:', error)
      handleError(error)
    } finally {
      setIsCreating(false)
    }
  }

  // Edit Role
  const handleEditRole = (role: Role) => {
    setEditingRole(role)
    setShowEditRole(true)
  }

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingRole) return

    setIsUpdating(true)

    try {
      console.log('Updating role with data:', editingRole)
      await adminApi.updateRole(editingRole.id, {
        name: editingRole.name,
        description: editingRole.description,
        enabled: editingRole.enabled,
        permissionIds: editingRole.permissionIds || []
      })
      console.log('Role updated successfully')
      setShowEditRole(false)
      setEditingRole(null)
      fetchData()
    } catch (error) {
      console.error('Failed to update role:', error)
      handleError(error)
    } finally {
      setIsUpdating(false)
    }
  }

  // Delete Role
  const handleDeleteRole = async (roleId: number) => {
    if (!confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    setDeletingId(roleId)

    try {
      console.log('Deleting role with ID:', roleId)
      await adminApi.deleteRole(roleId)
      console.log('Role deleted successfully')
      fetchData()
    } catch (error) {
      console.error('Failed to delete role:', error)
      handleError(error)
    } finally {
      setIsDeleting(false)
      setDeletingId(null)
    }
  }

  // Edit Permission
  const handleEditPermission = (permission: Permission) => {
    setEditingPermission(permission)
    setShowEditPermission(true)
  }

  const handleUpdatePermission = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPermission) return

    setIsUpdating(true)

    try {
      console.log('Updating permission with data:', editingPermission)
      await adminApi.updatePermission(editingPermission.id, {
        name: editingPermission.name,
        description: editingPermission.description,
        resourceName: editingPermission.resourceName,
        actionName: editingPermission.actionName,
        enabled: editingPermission.enabled
      })
      console.log('Permission updated successfully')
      setShowEditPermission(false)
      setEditingPermission(null)
      fetchData()
    } catch (error) {
      console.error('Failed to update permission:', error)
      handleError(error)
    } finally {
      setIsUpdating(false)
    }
  }

  // Delete Permission
  const handleDeletePermission = async (permissionId: number) => {
    if (!confirm('Are you sure you want to delete this permission? This action cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    setDeletingId(permissionId)

    try {
      console.log('Deleting permission with ID:', permissionId)
      await adminApi.deletePermission(permissionId)
      console.log('Permission deleted successfully')
      fetchData()
    } catch (error) {
      console.error('Failed to delete permission:', error)
      handleError(error)
    } finally {
      setIsDeleting(false)
      setDeletingId(null)
    }
  }

  if (isLoading) {
    return (
      <LoadingPage 
        message="Loading roles and permissions..."
        variant="spinner"
        size="lg"
        color="blue"
        layout="top"
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Roles & Permissions</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage user roles and system permissions</p>
        </div>


        <div className="flex space-x-3">
          <button
            onClick={() => setShowCreateRole(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Role
          </button>
          <button
            onClick={() => setShowCreatePermission(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Permission
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('roles')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'roles'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <Shield className="h-4 w-4 inline mr-2" />
            Roles
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'permissions'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <Key className="h-4 w-4 inline mr-2" />
            Permissions
          </button>
        </nav>
      </div>

      {/* Sort and Size Controls */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex gap-4 items-center">
          <div>
            <label htmlFor="sort" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Sort by
            </label>
            <select
              id="sort"
              value={pageable.sort || ''}
              onChange={(e) => handleSortChange(e.target.value)}
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="name,asc">Name (A-Z)</option>
              <option value="name,desc">Name (Z-A)</option>
              <option value="createdAt,desc">Newest First</option>
              <option value="createdAt,asc">Oldest First</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="size" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Items per page
            </label>
            <select
              id="size"
              value={pageable.size}
              onChange={(e) => handleSizeChange(Number(e.target.value))}
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Roles Tab */}
      {activeTab === 'roles' && roles && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              All Roles ({roles.totalElements})
            </h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {roles.content.map((role) => (
              <div key={role.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        role.enabled ? 'bg-green-100 dark:bg-green-900/20' : 'bg-gray-100 dark:bg-gray-700'
                      }`}>
                        <Shield className={`h-5 w-5 ${
                          role.enabled ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'
                        }`} />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {role.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {role.description}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      role.enabled 
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                    }`}>
                      {role.enabled ? 'Active' : 'Inactive'}
                    </span>
                    <button 
                      onClick={() => handleEditRole(role)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteRole(role.id)}
                      disabled={isDeleting && deletingId === role.id}
                      className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          <Pagination 
            page={roles} 
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Permissions Tab */}
      {activeTab === 'permissions' && permissions && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              All Permissions ({permissions.totalElements})
            </h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {permissions.content.map((permission) => (
              <div key={permission.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        permission.enabled ? 'bg-blue-100 dark:bg-blue-900/20' : 'bg-gray-100 dark:bg-gray-700'
                      }`}>
                        <Key className={`h-5 w-5 ${
                          permission.enabled ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'
                        }`} />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {permission.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {permission.description}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        {permission.resourceName} • {permission.actionName}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      permission.enabled 
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                    }`}>
                      {permission.enabled ? 'Active' : 'Inactive'}
                    </span>
                    <button 
                      onClick={() => handleEditPermission(permission)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDeletePermission(permission.id)}
                      disabled={isDeleting && deletingId === permission.id}
                      className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          <Pagination 
            page={permissions} 
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Empty States */}
      {activeTab === 'roles' && roles && roles.content.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <Shield className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No roles found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new role.
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowCreateRole(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Role
            </button>
          </div>
        </div>
      )}

      {activeTab === 'permissions' && permissions && permissions.content.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <Key className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No permissions found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new permission.
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowCreatePermission(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Permission
            </button>
          </div>
        </div>
      )}

      {/* Create Role Form */}
      {showCreateRole && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Create New Role</h3>
                <button
                  onClick={() => setShowCreateRole(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handleCreateRole} className="space-y-4">
                <div>
                  <label htmlFor="roleName" className="block text-sm font-medium text-gray-700">
                    Role Name
                  </label>
                  <input
                    type="text"
                    id="roleName"
                    value={newRole.name}
                    onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="roleDescription" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="roleDescription"
                    rows={3}
                    value={newRole.description}
                    onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    id="roleEnabled"
                    type="checkbox"
                    checked={newRole.enabled}
                    onChange={(e) => setNewRole({ ...newRole, enabled: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="roleEnabled" className="ml-2 block text-sm text-gray-900">
                    Enabled
                  </label>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateRole(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <LoadingButton
                    type="submit"
                    loading={isCreating}
                    loadingText="Creating..."
                    variant="primary"
                    size="md"
                  >
                    Create Role
                  </LoadingButton>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Role Form */}
      {showEditRole && editingRole && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Edit Role</h3>
                <button
                  onClick={() => {
                    setShowEditRole(false)
                    setEditingRole(null)
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handleUpdateRole} className="space-y-4">
                <div>
                  <label htmlFor="editRoleName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Role Name
                  </label>
                  <input
                    type="text"
                    id="editRoleName"
                    value={editingRole.name}
                    onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="editRoleDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <textarea
                    id="editRoleDescription"
                    rows={3}
                    value={editingRole.description}
                    onChange={(e) => setEditingRole({ ...editingRole, description: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    id="editRoleEnabled"
                    type="checkbox"
                    checked={editingRole.enabled}
                    onChange={(e) => setEditingRole({ ...editingRole, enabled: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                  />
                  <label htmlFor="editRoleEnabled" className="ml-2 block text-sm text-gray-900 dark:text-white">
                    Enabled
                  </label>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditRole(false)
                      setEditingRole(null)
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <LoadingButton
                    type="submit"
                    loading={isUpdating}
                    loadingText="Updating..."
                    variant="primary"
                    size="md"
                  >
                    Update Role
                  </LoadingButton>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Permission Form */}
      {showCreatePermission && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Create New Permission</h3>
                <button
                  onClick={() => setShowCreatePermission(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handleCreatePermission} className="space-y-4">
                <div>
                  <label htmlFor="permissionName" className="block text-sm font-medium text-gray-700">
                    Permission Name
                  </label>
                  <input
                    type="text"
                    id="permissionName"
                    value={newPermission.name}
                    onChange={(e) => setNewPermission({ ...newPermission, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="permissionDescription" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="permissionDescription"
                    rows={3}
                    value={newPermission.description}
                    onChange={(e) => setNewPermission({ ...newPermission, description: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="resourceName" className="block text-sm font-medium text-gray-700">
                      Resource Name
                    </label>
                    <input
                      type="text"
                      id="resourceName"
                      value={newPermission.resourceName}
                      onChange={(e) => setNewPermission({ ...newPermission, resourceName: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="actionName" className="block text-sm font-medium text-gray-700">
                      Action Name
                    </label>
                    <input
                      type="text"
                      id="actionName"
                      value={newPermission.actionName}
                      onChange={(e) => setNewPermission({ ...newPermission, actionName: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="permissionEnabled"
                    type="checkbox"
                    checked={newPermission.enabled}
                    onChange={(e) => setNewPermission({ ...newPermission, enabled: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="permissionEnabled" className="ml-2 block text-sm text-gray-900">
                    Enabled
                  </label>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreatePermission(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <LoadingButton
                    type="submit"
                    loading={isCreating}
                    loadingText="Creating..."
                    variant="primary"
                    size="md"
                  >
                    Create Permission
                  </LoadingButton>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Permission Form */}
      {showEditPermission && editingPermission && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Edit Permission</h3>
                <button
                  onClick={() => {
                    setShowEditPermission(false)
                    setEditingPermission(null)
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handleUpdatePermission} className="space-y-4">
                <div>
                  <label htmlFor="editPermissionName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Permission Name
                  </label>
                  <input
                    type="text"
                    id="editPermissionName"
                    value={editingPermission.name}
                    onChange={(e) => setEditingPermission({ ...editingPermission, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="editPermissionDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <textarea
                    id="editPermissionDescription"
                    rows={3}
                    value={editingPermission.description}
                    onChange={(e) => setEditingPermission({ ...editingPermission, description: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="editResourceName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Resource Name
                    </label>
                    <input
                      type="text"
                      id="editResourceName"
                      value={editingPermission.resourceName}
                      onChange={(e) => setEditingPermission({ ...editingPermission, resourceName: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="editActionName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Action Name
                    </label>
                    <input
                      type="text"
                      id="editActionName"
                      value={editingPermission.actionName}
                      onChange={(e) => setEditingPermission({ ...editingPermission, actionName: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="editPermissionEnabled"
                    type="checkbox"
                    checked={editingPermission.enabled}
                    onChange={(e) => setEditingPermission({ ...editingPermission, enabled: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                  />
                  <label htmlFor="editPermissionEnabled" className="ml-2 block text-sm text-gray-900 dark:text-white">
                    Enabled
                  </label>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditPermission(false)
                      setEditingPermission(null)
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <LoadingButton
                    type="submit"
                    loading={isUpdating}
                    loadingText="Updating..."
                    variant="primary"
                    size="md"
                  >
                    Update Permission
                  </LoadingButton>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Error Dialog */}
      <ErrorDialog
        isOpen={isErrorOpen}
        onClose={hideError}
        error={error}
        title="Roles & Permissions Error"
        showRetry={true}
        onRetry={fetchData}
        showCopy={true}
      />
    </div>
  )
} 