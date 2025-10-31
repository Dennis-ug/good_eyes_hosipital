'use client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Edit, Trash2, X, Check, User, Shield, Building2, Mail } from 'lucide-react'
import Link from 'next/link'
import { userManagementApi, departmentApi, adminApi } from '@/lib/api'
import { User as UserType, Department, Role, Page, CreateUserRequest } from '@/lib/types'
import { LoadingPage } from '@/components/loading-page'
import { LoadingButton } from '@/components/loading-button'
import { Pagination } from '@/components/pagination'
import { usePagination } from '@/lib/hooks/use-pagination'
import { ErrorDialog, useErrorDialog } from '@/components/error-dialog'

export default function UsersPage() {
  const [users, setUsers] = useState<Page<UserType> | null>(null)
  const [departments, setDepartments] = useState<Department[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingUser, setEditingUser] = useState<UserType | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [isCreatingUser, setIsCreatingUser] = useState(false)
  const [isUpdatingUser, setIsUpdatingUser] = useState(false)
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null)
  const [editSelectedRoles, setEditSelectedRoles] = useState<string[]>([])
  const [createSelectedRoles, setCreateSelectedRoles] = useState<string[]>([])
  
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
    initialSort: 'firstName,asc'
  })

  const fetchData = useCallback(async () => {
    try {
      console.log('Fetching users with pagination:', pageable)
      const [usersData, departmentsData, rolesData] = await Promise.all([
        userManagementApi.getAllUsersWithFilters({
          search: searchTerm || undefined,
          role: roleFilter || undefined,
          status: statusFilter || undefined,
        }, pageable),
        departmentApi.getAll({ page: 0, size: 100 }), // Get all departments for dropdown
        adminApi.getAllRoles({ page: 0, size: 100 }) // Get all roles for dropdown
      ])
      console.log('Users fetched successfully:', usersData)
      setUsers(usersData)
      setDepartments(departmentsData.content)
      setRoles(rolesData.content)
    } catch (error) {
      console.error('Failed to fetch users:', error)
      if (error instanceof Error) {
        alert(`Error fetching users: ${error.message}`)
      }
    } finally {
      setIsLoading(false)
    }
  }, [pageable])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Reset to first page when searching
    handlePageChange(0)
    fetchData()
  }

  useEffect(() => {
    // refetch when filters change
    handlePageChange(0)
    fetchData()
  }, [roleFilter, statusFilter])

  const handleEditUser = (user: UserType) => {
    setEditingUser(user)
    setEditSelectedRoles(user.roles?.map(r => r.name) || [])
    setShowEditForm(true)
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    try {
      setIsUpdatingUser(true)
      const form = e.currentTarget as HTMLFormElement
      const username = (form.querySelector('#edit-username') as HTMLInputElement)?.value
      const email = (form.querySelector('#edit-email') as HTMLInputElement)?.value
      const firstName = (form.querySelector('#edit-firstName') as HTMLInputElement)?.value
      const lastName = (form.querySelector('#edit-lastName') as HTMLInputElement)?.value
      const departmentIdStr = (form.querySelector('#edit-department') as HTMLSelectElement)?.value
      const departmentId = departmentIdStr ? Number(departmentIdStr) : undefined

      // Validate that at least one role is selected
      if (editSelectedRoles.length === 0) {
        alert('Please select at least one role for the user.')
        setIsUpdatingUser(false)
        return
      }

      const updated = await userManagementApi.updateUser(editingUser.id, {
        username,
        email,
        firstName,
        lastName,
        departmentId,
      })
      // update roles if changed (no-content response expected)
      await userManagementApi.updateUserRoles(editingUser.id, editSelectedRoles)
      setShowEditForm(false)
      setEditingUser(null)
      await fetchData()
    } catch (error) {
      console.error('Failed to update user:', error)
    }
    finally {
      setIsUpdatingUser(false)
    }
  }

  const handleDeleteUser = async (userId: number) => {
    // Find the user to check if it's a super admin
    const userToDelete = users?.content.find(user => user.id === userId)
    
    if (userToDelete?.roles.some(role => role.name === 'SUPER_ADMIN')) {
      alert('Cannot delete a Super Admin user. Please contact the system administrator.')
      return
    }
    
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return

    setDeletingUserId(userId)
    
    try {
      console.log('Deleting user:', userId)
      await userManagementApi.deleteUser(userId)
      console.log('User deleted successfully')
      fetchData()
    } catch (error) {
      console.error('Failed to delete user:', error)
      handleError(error)
    } finally {
      setDeletingUserId(null)
    }
  }

  const handleToggleUserStatus = async (userId: number) => {
    try {
      // TODO: Implement toggle user status API call
      console.log('Toggling user status:', userId)
      fetchData()
    } catch (error) {
      console.error('Failed to toggle user status:', error)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreatingUser(true)
    
    try {
      const form = e.currentTarget as HTMLFormElement
      const formData = new FormData(form)
      
      // Use the state for selected roles
      const selectedRoles = createSelectedRoles
      
      // Validate that at least one role is selected
      if (selectedRoles.length === 0) {
        alert('Please select at least one role for the user.')
        setIsCreatingUser(false)
        return
      }
      
      const userData: CreateUserRequest = {
        username: formData.get('username') as string,
        email: formData.get('email') as string,
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        departmentId: Number(formData.get('department')),
        roles: selectedRoles,
        sendEmailNotification: formData.get('sendEmailNotification') === 'true',
        customMessage: formData.get('customMessage') as string || undefined
      }

      console.log('Creating user with data:', userData)
      await userManagementApi.createUser(userData)
      console.log('User created successfully')
      
      // Reset form and close modal
      form.reset()
      setCreateSelectedRoles([])
      setShowCreateForm(false)
      
      // Show success message
      alert('User created successfully!')
      
      // Refresh the user list with a small delay to ensure backend processing
      setTimeout(() => {
        fetchData()
      }, 500)
    } catch (error) {
      console.error('Failed to create user:', error)
      handleError(error)
    } finally {
      setIsCreatingUser(false)
    }
  }

  if (isLoading) {
    return (
      <LoadingPage 
        message="Loading users..."
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage system users and their permissions</p>
        </div>
        <div className="flex space-x-3">
          <Link
            href="/dashboard/users/invite"
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Mail className="h-4 w-4 mr-2" />
            Invite User
          </Link>
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search users by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Search
          </button>
        </form>

        {/* Filters */}
        <div className="mt-4 flex gap-4 items-center">
          <div>
            <label htmlFor="roleFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Filter by Role
            </label>
            <select
              id="roleFilter"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Roles</option>
              {roles.map((role) => (
                <option key={role.id} value={role.name}>
                  {role.name.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Filter by Status
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="sort" className="block text-sm font-medium text-gray-700">
              Sort by
            </label>
            <select
              id="sort"
              value={pageable.sort || ''}
              onChange={(e) => handleSortChange(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="firstName,asc">First Name (A-Z)</option>
              <option value="firstName,desc">First Name (Z-A)</option>
              <option value="lastName,asc">Last Name (A-Z)</option>
              <option value="lastName,desc">Last Name (Z-A)</option>
              <option value="createdAt,desc">Newest First</option>
              <option value="createdAt,asc">Oldest First</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="size" className="block text-sm font-medium text-gray-700">
              Items per page
            </label>
            <select
              id="size"
              value={pageable.size}
              onChange={(e) => handleSizeChange(Number(e.target.value))}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users List */}
      {users && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              All Users ({users.totalElements})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Roles
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.content.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap align-top">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.username}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap align-top">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap align-top">
                      <div className="flex items-start">
                        <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {user.departmentName || 'No Department'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap align-top">
                      <div className="flex flex-wrap gap-1">
                        {user.roles?.map((role) => (
                          <span
                            key={role.id}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            <Shield className="h-3 w-3 mr-1" />
                            {role.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap align-top">
                      <button
                        onClick={() => handleToggleUserStatus(user.id)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.enabled
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {user.enabled ? (
                          <>
                            <Check className="h-3 w-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <X className="h-3 w-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap align-top text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={deletingUserId === user.id || user.roles.some(role => role.name === 'SUPER_ADMIN')}
                          className={`${
                            deletingUserId === user.id || user.roles.some(role => role.name === 'SUPER_ADMIN')
                              ? 'text-gray-400 cursor-not-allowed' 
                              : 'text-red-600 hover:text-red-900'
                          }`}
                          title={user.roles.some(role => role.name === 'SUPER_ADMIN') ? 'Cannot delete Super Admin users' : 'Delete user'}
                        >
                          {deletingUserId === user.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <Pagination 
            page={users} 
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Empty State */}
      {users && users.content.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <User className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new user.
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </button>
          </div>
        </div>
      )}

      {/* Create User Form */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-6 border w-full max-w-md shadow-xl rounded-lg bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Create New User</h3>
                  <p className="text-sm text-gray-500 mt-1">User will receive a password setup link via email</p>
                </div>
                <button
                  onClick={() => {
                    setShowCreateForm(false)
                    setCreateSelectedRoles([])
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleCreateUser} className="space-y-5">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>
                </div>
                


                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                    Department
                  </label>
                  <select
                    id="department"
                    name="department"
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="roles" className="block text-sm font-medium text-gray-700 mb-2">
                    User Roles *
                  </label>
                  <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-4 bg-gray-50">
                    {roles.map((role) => (
                      <label key={role.id} className="flex items-center space-x-3 cursor-pointer hover:bg-white p-3 rounded-md border border-transparent hover:border-gray-200 transition-all">
                        <input
                          type="checkbox"
                          name="roles"
                          value={role.name}
                          checked={createSelectedRoles.includes(role.name)}
                          onChange={(e) => {
                            setCreateSelectedRoles((prev) => {
                              if (e.target.checked) {
                                return Array.from(new Set([...prev, role.name]))
                              }
                              return prev.filter((r) => r !== role.name)
                            })
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-900">
                            {role.name.replace('_', ' ')}
                          </span>
                          {role.description && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              {role.description}
                            </p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      Select one or more roles for this user
                    </p>
                    {createSelectedRoles.length > 0 && (
                      <span className="text-sm text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-md">
                        {createSelectedRoles.length} selected
                      </span>
                    )}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <label htmlFor="sendEmailNotification" className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      id="sendEmailNotification"
                      name="sendEmailNotification"
                      value="true"
                      defaultChecked={true}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">Send password setup email</span>
                      <p className="text-xs text-gray-600 mt-1">
                        User will receive an email with a secure link to set up their password
                      </p>
                    </div>
                  </label>
                </div>

                <div>
                  <label htmlFor="customMessage" className="block text-sm font-medium text-gray-700">
                    Welcome Message (Optional)
                  </label>
                  <textarea
                    id="customMessage"
                    name="customMessage"
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add a personalized welcome message to include in the setup email..."
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    This message will be included in the password setup email sent to the user
                  </p>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false)
                      setCreateSelectedRoles([])
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <LoadingButton
                    type="submit"
                    loading={isCreatingUser}
                    loadingText="Creating User..."
                    variant="primary"
                    size="md"
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Create User
                  </LoadingButton>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Form */}
      {showEditForm && editingUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Edit User</h3>
                <button
                  onClick={() => setShowEditForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handleUpdateUser} className="space-y-4">
                <div>
                  <label htmlFor="edit-username" className="block text-sm font-medium text-gray-700">
                    Username
                  </label>
                  <input
                    type="text"
                    id="edit-username"
                    defaultValue={editingUser.username}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    id="edit-email"
                    defaultValue={editingUser.email}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="edit-firstName" className="block text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="edit-firstName"
                      defaultValue={editingUser.firstName || ''}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="edit-lastName" className="block text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="edit-lastName"
                      defaultValue={editingUser.lastName || ''}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="edit-department" className="block text-sm font-medium text-gray-700">
                    Department
                  </label>
                  <select
                    id="edit-department"
                    defaultValue={editingUser.departmentId || ''}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Roles *
                  </label>
                  <div className="mt-2 space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-3 bg-white">
                    {roles.map((role) => {
                      const checked = editSelectedRoles.includes(role.name)
                      return (
                        <label key={role.id} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            checked={checked}
                            onChange={(e) => {
                              setEditSelectedRoles((prev) => {
                                if (e.target.checked) {
                                  return Array.from(new Set([...prev, role.name]))
                                }
                                return prev.filter((r) => r !== role.name)
                              })
                            }}
                          />
                          <span className="text-sm text-gray-700 font-medium">
                            {role.name.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({role.description || 'No description'})
                          </span>
                        </label>
                      )
                    })}
                  </div>
                  <p className="mt-1 text-sm text-gray-500">Select one or more roles for this user</p>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowEditForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <LoadingButton
                    type="submit"
                    loading={isUpdatingUser}
                    loadingText="Updating..."
                    variant="primary"
                    size="md"
                  >
                    Update User
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
        title="User Management Error"
        showRetry={true}
        onRetry={fetchData}
        showCopy={true}
      />
    </div>
  )
} 