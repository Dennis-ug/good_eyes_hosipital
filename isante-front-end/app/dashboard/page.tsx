'use client'

import { useAuth } from '@/lib/auth-context'
import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Users, 
  UserPlus, 
  Calendar, 
  Eye, 
  Building2, 
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Package,
  AlertTriangle,
  FolderOpen
} from 'lucide-react'
import { LoadingPage } from '@/components/loading-page'
import { ErrorDialog, useErrorDialog } from '@/components/error-dialog'
import { DashboardSkeleton } from '@/components/skeleton-loader'
import { 
  receptionApi, 
  userManagementApi, 
  departmentApi, 
  adminApi, 
  patientApi, 
  appointmentApi,
  financeApi,
  inventoryApi,
  doctorScheduleApi,
  eyeExaminationApi
} from '@/lib/api'
import { PatientReception, Page, Pageable, Invoice, InventoryItem, Appointment } from '@/lib/types'
import { formatDateTime } from '@/lib/utils'

export default function DashboardPage() {
  const { user, userRoles } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<{
    totalPatients: number
    todayPatients: number
    totalUsers: number
    totalDepartments: number
    totalRoles: number
    totalAppointments: number
    // Finance stats
    totalInvoices: number
    totalRevenue: number
    pendingPayments: number
    // Inventory stats
    totalInventoryItems: number
    totalCategories: number
    lowStockItems: number
    totalInventoryValue: number
    // Clinical stats
    totalExaminations: number
    totalSchedules: number
    // Recent data
    recentInvoices: Invoice[]
    recentInventoryItems: InventoryItem[]
    recentAppointments: Appointment[]
  }>({
    totalPatients: 0,
    todayPatients: 0,
    totalUsers: 0,
    totalDepartments: 0,
    totalRoles: 0,
    totalAppointments: 0,
    // Finance stats
    totalInvoices: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    // Inventory stats
    totalInventoryItems: 0,
    totalCategories: 0,
    lowStockItems: 0,
    totalInventoryValue: 0,
    // Clinical stats
    totalExaminations: 0,
    totalSchedules: 0,
    // Recent data
    recentInvoices: [],
    recentInventoryItems: [],
    recentAppointments: []
  })
  
  // Error dialog hook
  const { error, isErrorOpen, handleError, hideError } = useErrorDialog()
  const handleErrorRef = useRef(handleError)
  handleErrorRef.current = handleError

  // Fetch dashboard statistics
  const fetchDashboardStats = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // Initialize stats with default values
      const statsData: typeof stats = {
        totalPatients: 0,
        todayPatients: 0,
        totalUsers: 0,
        totalDepartments: 0,
        totalRoles: 0,
        totalAppointments: 0,
        // Finance stats
        totalInvoices: 0,
        totalRevenue: 0,
        pendingPayments: 0,
        // Inventory stats
        totalInventoryItems: 0,
        totalCategories: 0,
        lowStockItems: 0,
        totalInventoryValue: 0,
        // Clinical stats
        totalExaminations: 0,
        totalSchedules: 0,
        // Recent data
        recentInvoices: [],
        recentInventoryItems: [],
        recentAppointments: []
      }

      console.log('Starting to fetch dashboard statistics...')

      // Fetch critical stats in parallel for faster loading
      const criticalStatsPromises = [
        // Core stats
        patientApi.getAll({ page: 0, size: 1, sort: 'id,desc' }).catch(() => ({ totalElements: 0 })),
        userManagementApi.getAllUsers({ page: 0, size: 1, sort: 'id,desc' }).catch(() => ({ totalElements: 0 })),
        departmentApi.getAll({ page: 0, size: 1, sort: 'id,desc' }).catch(() => ({ totalElements: 0 })),
        appointmentApi.getAppointments({ page: 0, size: 1, sort: 'id,desc' }).catch(() => ({ totalElements: 0 })),
        // Today's patients
        receptionApi.getPatientsReceivedToday({ page: 0, size: 1, sort: 'receptionTimestamp,desc' }).catch(() => ({ totalElements: 0 }))
      ]

      console.log('Fetching critical stats in parallel...')
      const criticalResults = await Promise.allSettled(criticalStatsPromises)
      
      // Update critical stats immediately
      if (criticalResults[0].status === 'fulfilled') {
        statsData.totalPatients = criticalResults[0].value.totalElements
      }
      if (criticalResults[1].status === 'fulfilled') {
        statsData.totalUsers = criticalResults[1].value.totalElements
      }
      if (criticalResults[2].status === 'fulfilled') {
        statsData.totalDepartments = criticalResults[2].value.totalElements
      }
      if (criticalResults[3].status === 'fulfilled') {
        statsData.totalAppointments = criticalResults[3].value.totalElements
      }
      if (criticalResults[4].status === 'fulfilled') {
        statsData.todayPatients = criticalResults[4].value.totalElements
      }

      // Update UI with critical stats first
      setStats({ ...statsData })
      console.log('✅ Critical stats loaded:', { 
        totalPatients: statsData.totalPatients,
        totalUsers: statsData.totalUsers,
        totalDepartments: statsData.totalDepartments,
        totalAppointments: statsData.totalAppointments,
        todayPatients: statsData.todayPatients
      })

      // Fetch secondary stats in parallel (non-blocking)
      const secondaryStatsPromises = [
        // Roles
        adminApi.getAllRoles({ page: 0, size: 1, sort: 'id,desc' }).catch(() => ({ totalElements: 0 })),
        // Finance
        financeApi.getAllInvoices({ page: 0, size: 1, sort: 'id,desc' }).catch(() => ({ totalElements: 0 })),
        financeApi.getAllInvoices({ page: 0, size: 5, sort: 'invoiceDate,desc' }).catch(() => ({ content: [] })),
        // Inventory
        inventoryApi.getAllItems({ page: 0, size: 1, sort: 'id,desc' }).catch(() => ({ totalElements: 0 })),
        inventoryApi.getAllCategories({ page: 0, size: 1, sort: 'id,desc' }).catch(() => ({ totalElements: 0 })),
        inventoryApi.getLowStockItems().catch(() => []),
        inventoryApi.getAllItems({ page: 0, size: 5, sort: 'id,desc' }).catch(() => ({ content: [] })),
        // Clinical
        eyeExaminationApi.getAll({ page: 0, size: 1, sort: 'id,desc' }).catch(() => ({ totalElements: 0 })),
        doctorScheduleApi.getAllAvailableSchedules().catch(() => ({ totalElements: 0 })),
        appointmentApi.getAppointments({ page: 0, size: 5, sort: 'appointmentDate,desc' }).catch(() => ({ content: [] }))
      ]

      console.log('Fetching secondary stats in parallel...')
      const secondaryResults = await Promise.allSettled(secondaryStatsPromises)

      // Update secondary stats
      if (secondaryResults[0].status === 'fulfilled') {
        const result = secondaryResults[0].value as any
        statsData.totalRoles = result.totalElements || 0
      }
      
      // Finance stats
      if (secondaryResults[1].status === 'fulfilled') {
        const result = secondaryResults[1].value as any
        statsData.totalInvoices = result.totalElements || 0
      }
      if (secondaryResults[2].status === 'fulfilled') {
        const result = secondaryResults[2].value as any
        const recentInvoices = result.content || []
        statsData.recentInvoices = recentInvoices
        
        // Calculate revenue and pending payments
        let totalRevenue = 0
        let pendingPayments = 0
        recentInvoices.forEach((invoice: any) => {
          totalRevenue += invoice.totalAmount || 0
          if ((invoice.balanceDue || 0) > 0) {
            pendingPayments += invoice.balanceDue
          }
        })
        statsData.totalRevenue = totalRevenue
        statsData.pendingPayments = pendingPayments
      }

      // Inventory stats
      if (secondaryResults[3].status === 'fulfilled') {
        const result = secondaryResults[3].value as any
        statsData.totalInventoryItems = result.totalElements || 0
      }
      if (secondaryResults[4].status === 'fulfilled') {
        const result = secondaryResults[4].value as any
        statsData.totalCategories = result.totalElements || 0
      }
      if (secondaryResults[5].status === 'fulfilled') {
        const result = secondaryResults[5].value as any
        statsData.lowStockItems = Array.isArray(result) ? result.length : 0
      }
      if (secondaryResults[6].status === 'fulfilled') {
        const result = secondaryResults[6].value as any
        const recentInventory = result.content || []
        statsData.recentInventoryItems = recentInventory
        
        // Calculate total inventory value
        let totalValue = 0
        recentInventory.forEach((item: any) => {
          totalValue += (item.unitPrice || 0) * (item.quantityInStock || 0)
        })
        statsData.totalInventoryValue = totalValue
      }

      // Clinical stats
      if (secondaryResults[7].status === 'fulfilled') {
        const result = secondaryResults[7].value as any
        statsData.totalExaminations = result.totalElements || 0
      }
      if (secondaryResults[8].status === 'fulfilled') {
        const result = secondaryResults[8].value as any
        statsData.totalSchedules = result.totalElements || 0
      }
      if (secondaryResults[9].status === 'fulfilled') {
        const result = secondaryResults[9].value as any
        statsData.recentAppointments = result.content || []
      }

      // Update final stats
      setStats(statsData)
      console.log('🎉 All dashboard stats loaded successfully')
    } catch (error) {
      console.error('💥 Failed to fetch dashboard stats:', error)
      handleErrorRef.current(error)
    } finally {
        setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardStats()
  }, [fetchDashboardStats])

  const isSuperAdmin = useMemo(() => userRoles.includes('SUPER_ADMIN'), [userRoles])
  const isReceptionist = useMemo(() => userRoles.includes('RECEPTIONIST'), [userRoles])

  if (isLoading) {
    return <DashboardSkeleton />
  }

  const ReceptionistDashboard = () => {
    const [patientsToday, setPatientsToday] = useState<Page<PatientReception> | null>(null)
    const [isLoadingPatients, setIsLoadingPatients] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
      fetchTodayPatients()
    }, [])

    const fetchTodayPatients = async () => {
      try {
        setIsLoadingPatients(true)
        setError(null)
        console.log('Fetching patients received today...')
        const data = await receptionApi.getPatientsReceivedToday({
          page: 0,
          size: 10,
          sort: 'receptionTimestamp,desc'
        })
        console.log('Patients received today fetched successfully:', data)
        setPatientsToday(data)
      } catch (error) {
        console.error('Failed to fetch patients today:', error)
        setError(error instanceof Error ? error.message : 'Failed to fetch patients')
        // Set empty data to show empty state
        setPatientsToday({ content: [], totalElements: 0, totalPages: 0, size: 10, number: 0, first: true, last: true, numberOfElements: 0, empty: true, pageable: { pageNumber: 0, pageSize: 10, sort: { empty: false, sorted: true, unsorted: false }, offset: 0, paged: true, unpaged: false }, sort: { empty: false, sorted: true, unsorted: false } })
      } finally {
        setIsLoadingPatients(false)
      }
    }

    // Quick action handlers for Receptionist
    const handleRegisterNewPatient = () => {
      router.push('/dashboard/patients/add')
    }

    const handleScheduleAppointment = () => {
      router.push('/dashboard/appointments')
    }

    const handleViewPatientList = () => {
      router.push('/dashboard/patients')
    }

    const handleReceiveNewPatient = () => {
      router.push('/dashboard/patients/add')
    }

  return (
    <div className="space-y-6">
      {/* Header */}
        <div className="flex items-center justify-between">
      <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reception Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Welcome back! Here&apos;s what&apos;s happening today.</p>
          </div>
          <button 
            onClick={handleReceiveNewPatient}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Receive New Patient
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
                           <div className="ml-4">
               <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today&apos;s Patients</p>
               <p className="text-2xl font-bold text-gray-900 dark:text-white">
                 {isLoadingPatients ? (
                   <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-8 w-12"></div>
                 ) : (
                   patientsToday?.totalElements || 0
                 )}
               </p>
             </div>
            </div>
      </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <UserPlus className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalPatients}</p>
              </div>
                  </div>
                </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today&apos;s Appointments</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalAppointments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Appointments</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalAppointments}</p>
              </div>
            </div>
          </div>
      </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Quick Actions</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button 
                onClick={handleRegisterNewPatient}
                className="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <UserPlus className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Register New Patient</span>
              </button>
              
              <button 
                onClick={handleScheduleAppointment}
                className="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <Calendar className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Schedule Appointment</span>
              </button>
              
              <button 
                onClick={handleViewPatientList}
                className="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <Users className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-3" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">View Patient List</span>
              </button>
            </div>
          </div>
        </div>

        {/* Today's Patients */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Today&apos;s Patients</h3>
            <button
              onClick={fetchTodayPatients}
              disabled={isLoadingPatients}
              className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className={`w-4 h-4 mr-2 ${isLoadingPatients ? 'animate-spin' : ''}`}>
                {isLoadingPatients ? (
                  <div className="rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
              </div>
              Refresh
            </button>
          </div>
          <div className="p-6">
            {isLoadingPatients ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">Loading patients...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Error loading patients</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{error}</p>
                <button 
                  onClick={fetchTodayPatients}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Retry
                </button>
              </div>
            ) : patientsToday?.content && patientsToday.content.length > 0 ? (
              <div className="space-y-4">
                {patientsToday.content.map((patient) => (
                  <div key={patient.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {patient.firstName} {patient.lastName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Received at {patient.receptionTimestamp ? formatDateTime(patient.receptionTimestamp) : 'N/A'} by {patient.receivedBy || 'Unknown'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 text-sm">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No patients today</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Start by receiving a new patient.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const SuperAdminDashboard = () => {
    // Quick action handlers for Super Admin
    const handleManageUsers = () => {
      router.push('/dashboard/users')
    }

    const handleManageDepartments = () => {
      router.push('/dashboard/departments')
    }

    const handleRolesPermissions = () => {
      router.push('/dashboard/roles')
    }

    return (
      <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Super Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">System overview and administrative controls</p>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Building2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Departments</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalDepartments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Roles</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalRoles}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <TrendingUp className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
           </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Patients</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalPatients}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Finance Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
            <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
            Finance Overview
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalInvoices}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Invoices</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX' }).format(stats.totalRevenue)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX' }).format(stats.pendingPayments)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending Payments</p>
            </div>
          </div>
          
          {/* Recent Invoices */}
          {stats.recentInvoices.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Recent Invoices</h4>
              <div className="space-y-2">
                {stats.recentInvoices.slice(0, 3).map((invoice, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{invoice.invoiceNumber}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{invoice.patientName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX' }).format(invoice.totalAmount)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(invoice.invoiceDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Inventory Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
            <Package className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
            Inventory Overview
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalInventoryItems}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Items</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCategories}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Categories</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.lowStockItems}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Low Stock Items</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX' }).format(stats.totalInventoryValue)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Value</p>
            </div>
          </div>
          
          {/* Recent Inventory Items */}
          {stats.recentInventoryItems.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Recent Items</h4>
              <div className="space-y-2">
                {stats.recentInventoryItems.slice(0, 3).map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{item.categoryName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX' }).format(item.unitPrice)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Stock: {item.quantityInStock}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Clinical Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
            <Eye className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-2" />
            Clinical Overview
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalPatients}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Patients</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalAppointments}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Appointments</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalExaminations}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Examinations</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalSchedules}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Doctor Schedules</p>
            </div>
          </div>
          
          {/* Recent Appointments */}
          {stats.recentAppointments.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Recent Appointments</h4>
              <div className="space-y-2">
                {stats.recentAppointments.slice(0, 3).map((appointment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{appointment.patientName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{appointment.appointmentType}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{appointment.doctorName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(appointment.appointmentDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Administrative Actions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button 
              onClick={handleManageUsers}
              className="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Manage Users</span>
            </button>
            
            <button 
              onClick={handleManageDepartments}
              className="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              <Building2 className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Manage Departments</span>
            </button>
            
            <button 
              onClick={handleRolesPermissions}
              className="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-3" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Roles & Permissions</span>
            </button>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">System Status</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Database Connection</span>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-sm text-green-600 dark:text-green-400">Connected</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">API Services</span>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-sm text-green-600 dark:text-green-400">All Operational</span>
              </div>
         </div>
              <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Security Status</span>
                <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-sm text-green-600 dark:text-green-400">Secure</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
  }

  const DefaultDashboard = () => {
    // Quick action handlers for Default Dashboard
    const handleViewPatients = () => {
      router.push('/dashboard/patients')
    }

    const handleViewAppointments = () => {
      router.push('/dashboard/appointments')
    }



    return (
      <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Welcome to Eyesante</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                                     <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Patients</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalPatients}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
                     </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Appointments</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalAppointments}</p>
                     </div>
                   </div>
                 </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                 <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <Users className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
            </div>
                </div>
              </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today&apos;s Patients</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.todayPatients}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Quick Actions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button 
              onClick={handleViewPatients}
              className="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">View Patients</span>
            </button>
            
            <button 
              onClick={handleViewAppointments}
              className="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              <Calendar className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">View Appointments</span>
            </button>
            

          </div>
        </div>
      </div>
    </div>
  )
  }

  // Render appropriate dashboard based on role
  return (
    <>
      {isReceptionist ? <ReceptionistDashboard /> : 
       isSuperAdmin ? <SuperAdminDashboard /> : 
       <DefaultDashboard />}
      
      <ErrorDialog
        isOpen={isErrorOpen}
        onClose={hideError}
        error={error}
        title="Dashboard Error"
        showRetry={true}
        onRetry={fetchDashboardStats}
        showCopy={true}
      />
    </>
  )

  // Error Dialog
  return (
    <>
      {/* Render appropriate dashboard based on role */}
      {isReceptionist ? <ReceptionistDashboard /> : 
       isSuperAdmin ? <SuperAdminDashboard /> : 
       <DefaultDashboard />}
      
      <ErrorDialog
        isOpen={isErrorOpen}
        onClose={hideError}
        error={error}
        title="Dashboard Error"
        showRetry={true}
        onRetry={fetchDashboardStats}
        showCopy={true}
      />
    </>
  )
} 