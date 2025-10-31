
'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Calendar, User as UserIcon, Clock, CheckCircle, XCircle, Edit, Trash2, Phone, RefreshCw } from 'lucide-react'
import { LoadingPage } from '@/components/loading-page'
import { LoadingButton } from '@/components/loading-button'
import { Pagination } from '@/components/pagination'
import { usePagination } from '@/lib/hooks/use-pagination'
import { PatientSearch, DoctorSearch } from '@/components/dropdown-search'
import { appointmentApi, patientApi, userManagementApi } from '@/lib/api'
import { 
  Appointment, 
  CreateAppointmentRequest, 
  CancelAppointmentRequest,
  AppointmentStatus,
  AppointmentType,
  AppointmentPriority,
  PaymentStatus,
  PaymentMethod,
  Patient,
  Page,
  Pageable,
  User,
  Role
} from '@/lib/types'

export default function AppointmentsPageNew() {
  const [appointments, setAppointments] = useState<Page<Appointment> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  // const [showEditForm, setShowEditForm] = useState(false)
  // const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  // const [isUpdating, setIsUpdating] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [cancellingId, setCancellingId] = useState<number | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Patient search states
  const [patientSearchTerm, setPatientSearchTerm] = useState('')
  const [patients, setPatients] = useState<Patient[]>([])
  const [isLoadingPatients, setIsLoadingPatients] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  
  // Doctor search states
  const [doctorSearchTerm, setDoctorSearchTerm] = useState('')
  const [doctors, setDoctors] = useState<User[]>([])
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<User | null>(null)
  
  const {
    pageable,
    handlePageChange  } = usePagination({
    initialPage: 0,
    initialSize: 10,
    initialSort: 'appointmentDate,desc'
  })

  // Fetch appointments
  const fetchAppointments = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }
      setError(null)
      console.log('Fetching appointments with pagination:', pageable)
      
      const data = await appointmentApi.getAppointments(pageable)
      console.log('Appointments fetched successfully:', data)
      setAppointments(data)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to fetch appointments:', error)
      setError('Failed to fetch appointments. Please try again.')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [pageable])

  // Manual refresh function
  const handleManualRefresh = useCallback(() => {
    fetchAppointments(true)
  }, [fetchAppointments])

  // Search patients using backend API with debouncing
  const searchPatients = useCallback(async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      setPatients([])
      return
    }

    setIsLoadingPatients(true)
    setError(null)

    try {
      // Use backend search with pagination
      const pageable: Pageable = {
        page: 0,
        size: 50, // Reasonable page size for search results
        sort: 'firstName,asc'
      }

      const response: Page<Patient> = await patientApi.search(searchTerm, pageable)
      setPatients(response.content)
    } catch (error) {
      console.error('Failed to search patients:', error)
      setError('Failed to search patients. Please try again.')
      setPatients([])
    } finally {
      setIsLoadingPatients(false)
    }
  }, [])

  // Search doctors using real API
  const searchDoctors = useCallback(async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      setDoctors([])
      return
    }

    setIsLoadingDoctors(true)
    setError(null)

    try {
      const pageable: Pageable = {
        page: 0,
        size: 20,
        sort: 'firstName,asc'
      }

      const response: Page<User> = await userManagementApi.getAllUsers(pageable)
      
      const doctorUsers = response.content.filter(user => 
        user.roles?.some((role: Role) => 
          role.name === 'OPTOMETRIST' || role.name === 'OPHTHALMOLOGIST'
        )
      )

      const filteredDoctors = doctorUsers.filter(doctor => 
        doctor.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )

      setDoctors(filteredDoctors)
    } catch (error) {
      console.error('Failed to search doctors:', error)
      setError('Failed to search doctors. Please try again.')
      setDoctors([])
    } finally {
      setIsLoadingDoctors(false)
    }
  }, [])

  // Handle patient search with debouncing
  const handlePatientSearchChange = useCallback((value: string) => {
    setPatientSearchTerm(value)
    
    if (value.length >= 2) {
      const timeoutId = setTimeout(() => {
        searchPatients(value)
      }, 300)
      
      return () => clearTimeout(timeoutId)
    } else {
      setPatients([])
    }
  }, [searchPatients])

  // Handle doctor search with debouncing
  const handleDoctorSearchChange = useCallback((value: string) => {
    setDoctorSearchTerm(value)
    
    if (value.length >= 2) {
      const timeoutId = setTimeout(() => {
        searchDoctors(value)
      }, 300)
      
      return () => clearTimeout(timeoutId)
    } else {
      setDoctors([])
    }
  }, [searchDoctors])

  // Handle patient selection
  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient)
    setPatientSearchTerm(`${patient.firstName} ${patient.lastName}`)
  }

  // Handle doctor selection
  const handleDoctorSelect = (doctor: User) => {
    setSelectedDoctor(doctor)
    setDoctorSearchTerm(`Dr. ${doctor.firstName} ${doctor.lastName}`)
  }

  // Handle patient clear
  const handlePatientClear = () => {
    setSelectedPatient(null)
    setPatientSearchTerm('')
  }

  // Handle doctor clear
  const handleDoctorClear = () => {
    setSelectedDoctor(null)
    setDoctorSearchTerm('')
  }

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  // Auto-refresh appointments every 30 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAppointments()
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [fetchAppointments])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    handlePageChange(0)
    fetchAppointments()
  }

  const handleCreateAppointment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!selectedPatient) {
      setError('Please select a patient')
      return
    }
    
    if (!selectedDoctor) {
      setError('Please select a doctor')
      return
    }
    
    setIsCreating(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    
    try {
      const appointmentData: CreateAppointmentRequest = {
        patientId: selectedPatient.id,
        patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
        patientPhone: selectedPatient.phone || undefined,
        patientEmail: undefined, // Patient doesn't have email field
        doctorId: selectedDoctor.id,
        doctorName: `Dr. ${selectedDoctor.firstName} ${selectedDoctor.lastName}`,
        doctorSpecialty: selectedDoctor.roles?.map((role: Role) => role.name).join(', ') || undefined,
        appointmentDate: formData.get('appointmentDate') as string,
        appointmentTime: formData.get('appointmentTime') as string,
        duration: parseInt(formData.get('duration') as string),
        appointmentType: formData.get('appointmentType') as AppointmentType,
        reason: formData.get('reason') as string,
        priority: formData.get('priority') as AppointmentPriority,
        notes: (formData.get('notes') as string) || undefined,
        followUpRequired: formData.get('followUpRequired') === 'on',
        followUpDate: (formData.get('followUpDate') as string) || undefined,
        insuranceProvider: (formData.get('insuranceProvider') as string) || undefined,
        insuranceNumber: (formData.get('insuranceNumber') as string) || undefined,
        cost: formData.get('cost') ? parseFloat(formData.get('cost') as string) : undefined,
        paymentMethod: formData.get('paymentMethod') as PaymentMethod
      }

      await appointmentApi.createAppointment(appointmentData)
      setShowCreateForm(false)
      fetchAppointments()
      
      // Reset form
      setSelectedPatient(null)
      setSelectedDoctor(null)
      setPatientSearchTerm('')
      setDoctorSearchTerm('')
    } catch (error) {
      console.error('Failed to create appointment:', error)
      setError(error instanceof Error ? error.message : 'Failed to create appointment')
    } finally {
      setIsCreating(false)
    }
  }

  const handleCancelAppointment = async (appointmentId: number) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return
    
    setIsCancelling(true)
    setCancellingId(appointmentId)
    setError(null)

    try {
      const cancelData: CancelAppointmentRequest = {
        cancellationReason: 'Cancelled by user'
      }
      
      await appointmentApi.cancelAppointment(appointmentId, cancelData)
      fetchAppointments()
    } catch (error) {
      console.error('Failed to cancel appointment:', error)
      setError(error instanceof Error ? error.message : 'Failed to cancel appointment')
    } finally {
      setIsCancelling(false)
      setCancellingId(null)
    }
  }


  const getStatusBadge = (status: AppointmentStatus) => {
    const statusConfig = {
      SCHEDULED: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', icon: Calendar },
      CONFIRMED: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', icon: CheckCircle },
              CHECKED_IN: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', icon: UserIcon },
      IN_PROGRESS: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300', icon: Clock },
      COMPLETED: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', icon: CheckCircle },
      CANCELLED: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', icon: XCircle },
      NO_SHOW: { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300', icon: XCircle },
      RESCHEDULED: { color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300', icon: Calendar },
      WAITING: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', icon: Clock },
      READY: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', icon: CheckCircle }
    }

    const config = statusConfig[status]
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {status.replace('_', ' ')}
      </span>
    )
  }

  const getPriorityBadge = (priority: AppointmentPriority) => {
    const priorityConfig = {
      LOW: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      NORMAL: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      URGENT: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      EMERGENCY: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityConfig[priority]}`}>
        {priority}
      </span>
    )
  }

  const getPaymentStatusBadge = (status: PaymentStatus) => {
    const statusConfig = {
      PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      PAID: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      PARTIAL: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      OVERDUE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      REFUNDED: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[status]}`}>
        {status}
      </span>
    )
  }

  if (isLoading) {
    return (
      <LoadingPage 
        message="Loading appointments..."
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Appointments</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage patient appointments and scheduling</p>
          {lastUpdated && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()} (Auto-refresh every 30s)
            </p>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            title="Refresh appointments"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Appointment
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Search
              </label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  id="search"
                  placeholder="Search appointments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Status
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Statuses</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="CHECKED_IN">Checked In</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="NO_SHOW">No Show</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Type
              </label>
              <select
                id="type"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Types</option>
                <option value="ROUTINE_EXAMINATION">Routine Examination</option>
                <option value="FOLLOW_UP">Follow Up</option>
                <option value="EMERGENCY">Emergency</option>
                <option value="SURGERY_CONSULTATION">Surgery Consultation</option>
                <option value="PRESCRIPTION_RENEWAL">Prescription Renewal</option>
                <option value="DIAGNOSTIC_TEST">Diagnostic Test</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Date
              </label>
              <input
                type="date"
                id="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Appointments List */}
      {appointments && appointments.content.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                All Appointments ({appointments.totalElements})
              </h3>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Live</span>
                </div>
                {isRefreshing && (
                  <div className="flex items-center space-x-1">
                    <RefreshCw className="h-3 w-3 animate-spin text-blue-500" />
                    <span className="text-xs text-blue-500">Updating...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type & Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {appointments.content.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                            <UserIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {appointment.patientName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {appointment.patientId}
                          </div>
                          {appointment.patientPhone && (
                            <div className="flex items-center text-xs text-gray-400 dark:text-gray-500">
                              <Phone className="h-3 w-3 mr-1" />
                              {appointment.patientPhone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{appointment.doctorName}</div>
                      {appointment.doctorSpecialty && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">{appointment.doctorSpecialty}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {new Date(appointment.appointmentDate).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {appointment.appointmentTime} - {appointment.endTime}
                      </div>
                      <div className="flex items-center text-xs text-gray-400 dark:text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {appointment.duration} min
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {appointment.appointmentType.replace('_', ' ')}
                      </div>
                      {getPriorityBadge(appointment.priority)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(appointment.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPaymentStatusBadge(appointment.paymentStatus)}
                      {appointment.cost && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          ${appointment.cost}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => {
                            // setEditingAppointment(appointment)
                            // setShowEditForm(true)
                          }}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleCancelAppointment(appointment.id)}
                          disabled={isCancelling && cancellingId === appointment.id}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
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
            page={appointments} 
            onPageChange={handlePageChange}
          />
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500">
            <Calendar className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No appointments found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Get started by scheduling a new appointment.
          </p>
          <div className="mt-6">
            <button 
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Appointment
            </button>
          </div>
        </div>
      )}

      {/* Create Appointment Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Create New Appointment</h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              {error && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <div className="text-sm text-red-800 dark:text-red-400">{error}</div>
                </div>
              )}
              
              <form onSubmit={handleCreateAppointment} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Patient Search using Dropdown Component */}
                  <PatientSearch
                    value={patientSearchTerm}
                    onChange={handlePatientSearchChange}
                    onSelect={handlePatientSelect}
                    onClear={handlePatientClear}
                    patients={patients}
                    isLoading={isLoadingPatients}
                    required
                    label="Patient"
                  />

                  {/* Doctor Search using Dropdown Component */}
                  <DoctorSearch
                    value={doctorSearchTerm}
                    onChange={handleDoctorSearchChange}
                    onSelect={handleDoctorSelect}
                    onClear={handleDoctorClear}
                    doctors={doctors}
                    isLoading={isLoadingDoctors}
                    required
                    label="Doctor"
                  />
                </div>

                {/* Selected Patient Display */}
                {selectedPatient && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-green-800 dark:text-green-400">
                          Selected Patient: {selectedPatient.firstName} {selectedPatient.lastName}
                        </div>
                        <div className="text-xs text-green-600 dark:text-green-500">
                          Phone: {selectedPatient.phone || selectedPatient.alternativePhone || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Selected Doctor Display */}
                {selectedDoctor && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-blue-800 dark:text-blue-400">
                          Selected Doctor: Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-500">
                          {selectedDoctor.roles?.map((role: Role) => role.name).join(', ')} • {selectedDoctor.email}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Appointment Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="appointmentDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="appointmentDate"
                      name="appointmentDate"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="appointmentTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      id="appointmentTime"
                      name="appointmentTime"
                      required
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Duration
                    </label>
                    <select
                      id="duration"
                      name="duration"
                      defaultValue="30"
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={45}>45 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={90}>1.5 hours</option>
                      <option value={120}>2 hours</option>
                    </select>
                  </div>
                </div>

                {/* Appointment Type and Priority */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="appointmentType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Appointment Type
                    </label>
                    <select
                      id="appointmentType"
                      name="appointmentType"
                      defaultValue="ROUTINE_EXAMINATION"
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="ROUTINE_EXAMINATION">Routine Examination</option>
                      <option value="FOLLOW_UP">Follow Up</option>
                      <option value="EMERGENCY">Emergency</option>
                      <option value="SURGERY_CONSULTATION">Surgery Consultation</option>
                      <option value="PRESCRIPTION_RENEWAL">Prescription Renewal</option>
                      <option value="DIAGNOSTIC_TEST">Diagnostic Test</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Priority
                    </label>
                    <select
                      id="priority"
                      name="priority"
                      defaultValue="NORMAL"
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="LOW">Low</option>
                      <option value="NORMAL">Normal</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                      <option value="EMERGENCY">Emergency</option>
                    </select>
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="reason"
                    name="reason"
                    rows={3}
                    required
                    placeholder="Describe the reason for this appointment..."
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={2}
                    placeholder="Additional notes or instructions..."
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <LoadingButton
                    type="submit"
                    loading={isCreating}
                    loadingText="Creating..."
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Create Appointment
                  </LoadingButton>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 