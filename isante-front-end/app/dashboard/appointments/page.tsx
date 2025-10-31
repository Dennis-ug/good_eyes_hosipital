
'use client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, Calendar, User as UserIcon, Clock, CheckCircle, XCircle, Edit, Trash2, RefreshCw } from 'lucide-react'
import { LoadingPage } from '@/components/loading-page'
import { LoadingButton } from '@/components/loading-button'
import { Pagination } from '@/components/pagination'
import { usePagination } from '@/lib/hooks/use-pagination'
import { PatientSearch, DoctorSearch } from '@/components/dropdown-search'
import { ErrorDialog, useErrorDialog } from '@/components/error-dialog'
import { appointmentApi, patientApi, userManagementApi } from '@/lib/api'
import { 
  Appointment, 
  CreateAppointmentRequest, 
  AppointmentStatus,
  AppointmentType,
  AppointmentPriority,
  PaymentMethod,
  Patient,
  Page,
  Pageable,
  User,
  Role,
  UpdateAppointmentRequest
} from '@/lib/types'

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Page<Appointment> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Days remaining helpers
  const daysUntil = (dateStr: string) => {
    try {
      const today = new Date()
      const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const d = new Date(dateStr)
      const apptMid = new Date(d.getFullYear(), d.getMonth(), d.getDate())
      const diffMs = apptMid.getTime() - todayMid.getTime()
      return Math.round(diffMs / 86400000)
    } catch {
      return NaN
    }
  }

  const formatDaysRemaining = (days: number) => {
    if (Number.isNaN(days)) return ''
    if (days === 0) return 'Today'
    if (days === 1) return 'Tomorrow'
    if (days === -1) return 'Yesterday'
    if (days > 1) return `${days} days left`
    return `${Math.abs(days)} days ago`
  }

  const getDaysColor = (days: number) => {
    if (Number.isNaN(days)) return 'text-gray-500 dark:text-gray-400'
    if (days < 0) return 'text-orange-600 dark:text-orange-400'
    if (days === 0) return 'text-green-600 dark:text-green-400'
    return 'text-blue-600 dark:text-blue-400'
  }
  
  // Error dialog hook
  const { error, isErrorOpen, handleError, hideError } = useErrorDialog()
  const handleErrorRef = useRef(handleError)
  handleErrorRef.current = handleError
  
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
  
  // Availability checking states
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false)
  const [availabilityError, setAvailabilityError] = useState<string | null>(null)
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  // const [showAvailabilityModal, setShowAvailabilityModal] = useState(false)
  
  // Refs for debouncing
  const patientSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const doctorSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
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
      const data = await appointmentApi.getAppointments(pageable)
      setAppointments(data)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to fetch appointments:', error)
      handleErrorRef.current(error)
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
    setAvailabilityError(null)

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
      handleErrorRef.current(error)
      setPatients([])
    } finally {
    setIsLoadingPatients(false)
  }
  }, [])

  // Search doctors using real API - search all system users
  const searchHospitalPersonnel = useCallback(async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      setDoctors([])
      return
    }

    setIsLoadingDoctors(true)
    setAvailabilityError(null)

    try {
      const pageable: Pageable = {
        page: 0,
        size: 100, // Increased to get more users
        sort: 'firstName,asc'
      }

      const response: Page<User> = await userManagementApi.getAllUsers(pageable)
      
      console.log('Fetched users for hospital personnel search:', response.content)
      
      // Filter all users by search term - search through all system users
      const filteredUsers = response.content.filter(user => 
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.departmentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.roles?.some((role: Role) => 
          role.name?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )

      console.log('Filtered hospital personnel:', filteredUsers)
      setDoctors(filteredUsers)
    } catch (error) {
      console.error('Failed to search hospital personnel:', error)
      handleErrorRef.current(error)
      setDoctors([])
    } finally {
    setIsLoadingDoctors(false)
  }
  }, [])

  // Handle patient search with debouncing
  const handlePatientSearchChange = useCallback((value: string) => {
    setPatientSearchTerm(value)
    
    // Clear previous timeout
    if (patientSearchTimeoutRef.current) {
      clearTimeout(patientSearchTimeoutRef.current)
    }
    
    if (value.length >= 2) {
      patientSearchTimeoutRef.current = setTimeout(() => {
      searchPatients(value)
      }, 300)
    } else {
      setPatients([])
    }
  }, [searchPatients])

  // Handle doctor search with debouncing
  const handleDoctorSearchChange = useCallback((value: string) => {
    setDoctorSearchTerm(value)
    
    // Clear previous timeout
    if (doctorSearchTimeoutRef.current) {
      clearTimeout(doctorSearchTimeoutRef.current)
    }
    
    if (value.length >= 2) {
      doctorSearchTimeoutRef.current = setTimeout(() => {
        searchHospitalPersonnel(value)
      }, 300)
    } else {
      setDoctors([])
    }
  }, [searchHospitalPersonnel])

  // Handle patient selection
  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient)
    setPatientSearchTerm(`${patient.firstName} ${patient.lastName}`)
  }

  // Handle doctor selection
  const handleDoctorSelect = (doctor: User) => {
    setSelectedDoctor(doctor)
    setDoctorSearchTerm(doctor.username)
    
    // Check availability for selected date if available
    const dateInput = document.getElementById('appointmentDate') as HTMLInputElement
    if (dateInput && dateInput.value) {
      checkAvailability(doctor.id, dateInput.value)
    }
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
    setAvailableSlots([])
  }

  const openEdit = (appt: Appointment) => {
    setEditingAppointment(appt)
    setShowEditForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this appointment? This is a soft delete.')) return
    try {
      setIsDeletingId(id)
      await appointmentApi.deleteAppointment(id)
      await fetchAppointments()
    } catch (error) {
      handleErrorRef.current(error)
    } finally {
      setIsDeletingId(null)
    }
  }

  const handleUpdateAppointment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingAppointment) return
    setIsUpdating(true)
    try {
      const formData = new FormData(e.currentTarget)
      const payload: UpdateAppointmentRequest = {}
      const patientName = (formData.get('patientName') as string) || ''
      const doctorName = (formData.get('doctorName') as string) || ''
      const doctorSpecialty = (formData.get('doctorSpecialty') as string) || ''
      const appointmentDate = formData.get('appointmentDate') as string
      const appointmentTime = formData.get('appointmentTime') as string
      const durationStr = formData.get('duration') as string
      const reason = formData.get('reason') as string
      const notes = formData.get('notes') as string
      const priority = formData.get('priority') as AppointmentPriority
      const appointmentType = formData.get('appointmentType') as AppointmentType

      if (patientName) payload.patientName = patientName
      if (doctorName) payload.doctorName = doctorName
      if (doctorSpecialty) payload.doctorSpecialty = doctorSpecialty
      if (appointmentDate) payload.appointmentDate = appointmentDate
      if (appointmentTime) payload.appointmentTime = appointmentTime
      if (durationStr) payload.duration = parseInt(durationStr, 10)
      if (reason) payload.reason = reason
      if (notes) payload.notes = notes
      if (priority) payload.priority = priority
      if (appointmentType) payload.appointmentType = appointmentType

      await appointmentApi.updateAppointment(editingAppointment.id, payload)
      setShowEditForm(false)
      setEditingAppointment(null)
      await fetchAppointments()
    } catch (error) {
      handleErrorRef.current(error)
    } finally {
      setIsUpdating(false)
    }
  }

  // Helper function to calculate end time
  const calculateEndTime = (startTime: string, durationMinutes: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number)
    const startDate = new Date()
    startDate.setHours(hours, minutes, 0, 0)
    
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000)
    const endHours = endDate.getHours().toString().padStart(2, '0')
    const endMinutes = endDate.getMinutes().toString().padStart(2, '0')
    
    return `${endHours}:${endMinutes}`
  }

  // Check availability for selected personnel and date
  const checkAvailability = useCallback(async (doctorId: number, date: string) => {
    if (!doctorId || !date) return

    setIsCheckingAvailability(true)
    setAvailabilityError(null)
    setAvailableSlots([])

    try {
      // Generate time slots for the day (8 AM to 6 PM, 30-minute intervals)
      const timeSlots = []
      for (let hour = 8; hour < 18; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
          timeSlots.push(time)
        }
      }

      // Use batch availability check instead of individual calls
      const batchRequest = {
        doctorId: doctorId,
        date: date,
        duration: 30, // 30-minute slots
        timeSlots: timeSlots
      }
      
      const batchResponse = await appointmentApi.checkBatchAvailability(batchRequest)
      
      // Extract available slots from the response
      const availableSlotsList = Object.entries(batchResponse)
        .filter(([_, available]) => available)
        .map(([timeSlot, _]) => timeSlot)

      setAvailableSlots(availableSlotsList)
    } catch (error) {
      console.error('Failed to check availability:', error)
      setAvailabilityError('Failed to check availability. Please try again.')
    } finally {
      setIsCheckingAvailability(false)
    }
  }, [])

  // Handle date change to check availability
  const handleDateChange = (date: string) => {
    if (selectedDoctor && date) {
      checkAvailability(selectedDoctor.id, date)
    }
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

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (patientSearchTimeoutRef.current) {
        clearTimeout(patientSearchTimeoutRef.current)
      }
      if (doctorSearchTimeoutRef.current) {
        clearTimeout(doctorSearchTimeoutRef.current)
      }
    }
  }, [])

  const handleCreateAppointment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!selectedPatient) {
      handleErrorRef.current({ message: 'Please select a patient' })
      return
    }
    
    if (!selectedDoctor) {
      handleErrorRef.current({ message: 'Please select hospital personnel' })
      return
    }
    
    setIsCreating(true)

    try {
      const formData = new FormData(e.currentTarget)
      const appointmentDate = formData.get('appointmentDate') as string
      const appointmentTime = formData.get('appointmentTime') as string
      const duration = parseInt(formData.get('duration') as string)
      
      const appointmentData: CreateAppointmentRequest = {
        patientId: selectedPatient.id,
        patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
        patientPhone: selectedPatient.phone || undefined,
        patientEmail: undefined,
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.username,
        doctorSpecialty: selectedDoctor.roles?.map((role: Role) => role.name).join(', ') || undefined,
        appointmentDate: appointmentDate,
        appointmentTime: appointmentTime,
        duration: duration,
        appointmentType: formData.get('appointmentType') as AppointmentType,
        reason: formData.get('reason') as string,
        priority: formData.get('priority') as AppointmentPriority,
        notes: formData.get('notes') as string || undefined,
        followUpRequired: formData.get('followUpRequired') === 'on',
        followUpDate: formData.get('followUpDate') as string || undefined,
        insuranceProvider: formData.get('insuranceProvider') as string || undefined,
        insuranceNumber: formData.get('insuranceNumber') as string || undefined,
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
      handleErrorRef.current(error)
    } finally {
      setIsCreating(false)
    }
  }

  const getStatusBadge = (appointment: Appointment) => {
    const baseConfig = {
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
    } as const

    const status = appointment.status
    let config = baseConfig[status]
    let label = status.replace(/_/g, ' ')

    const days = daysUntil(appointment.appointmentDate)
    const pendingStatuses: AppointmentStatus[] = ['SCHEDULED', 'CONFIRMED', 'RESCHEDULED', 'WAITING', 'READY']
    if (days < 0 && pendingStatuses.includes(status)) {
      // Overdue pending appointment -> highlight in orange
      config = { ...config, color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' }
      label = 'OVERDUE'
    }

    const Icon = config.icon

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {label}
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
                    Hospital Personnel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
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
                      {(() => { const d = daysUntil(appointment.appointmentDate); return (
                        <div className={`text-xs mt-1 ${getDaysColor(d)}`}>
                          {formatDaysRemaining(d)}
                        </div>
                      )})()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {appointment.appointmentType.replace('_', ' ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(appointment)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300">
                          <Edit className="h-4 w-4" onClick={() => openEdit(appointment)} />
                        </button>
                        <button className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300" onClick={() => handleDelete(appointment.id)}>
                          <Trash2 className={`h-4 w-4 ${isDeletingId === appointment.id ? 'opacity-50 animate-pulse' : ''}`} />
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
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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

                  {/* Hospital Personnel Search using Dropdown Component */}
                  <DoctorSearch
                    value={doctorSearchTerm}
                    onChange={handleDoctorSearchChange}
                    onSelect={handleDoctorSelect}
                    onClear={handleDoctorClear}
                    doctors={doctors}
                    isLoading={isLoadingDoctors}
                    required
                    label="Hospital Personnel"
                  />
</div>
                    
                                         {/* Selected Patient Display */}
                     {selectedPatient && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                             <div className="text-sm font-medium text-green-800 dark:text-green-400">
                      Selected Patient: {selectedPatient.firstName} {selectedPatient.lastName}
                             </div>
                             <div className="text-xs text-green-600 dark:text-green-500">
                      Phone: {selectedPatient.phone || selectedPatient.alternativePhone || 'N/A'}
                             </div>
                       </div>
                     )}
                    
                                         {/* Selected Doctor Display */}
                     {selectedDoctor && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                             <div className="text-sm font-medium text-blue-800 dark:text-blue-400">
                      Selected User: {selectedDoctor.username}
                             </div>
                             <div className="text-xs text-blue-600 dark:text-blue-500">
                      {selectedDoctor.roles?.map((role: Role) => role.name).join(', ')} • {selectedDoctor.email} {selectedDoctor.departmentName ? `• ${selectedDoctor.departmentName}` : ''}
                         </div>
                       </div>
                     )}
                     
                {/* Availability Display */}
                     {selectedDoctor && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium text-gray-800 dark:text-gray-400">
                        Availability Check
                           </div>
                      {isCheckingAvailability && (
                        <div className="text-xs text-blue-600 dark:text-blue-500">
                          Checking availability...
                       </div>
                     )}
                  </div>
                  
                    {availabilityError && (
                      <div className="text-xs text-red-600 dark:text-red-500 mb-2">
                        {availabilityError}
                  </div>
                    )}
                  
                    {availableSlots.length > 0 && (
                  <div>
                        <div className="text-xs text-gray-600 dark:text-gray-500 mb-1">
                          Available time slots (30-minute intervals):
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {availableSlots.slice(0, 8).map((slot) => (
                            <span
                              key={slot}
                              className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded"
                            >
                              {slot}
                            </span>
                          ))}
                          {availableSlots.length > 8 && (
                            <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded">
                              +{availableSlots.length - 8} more
                            </span>
                          )}
                  </div>
                      </div>
                    )}
                    
                    {!isCheckingAvailability && availableSlots.length === 0 && !availabilityError && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Select a date to check availability
                      </div>
                    )}
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
                      onChange={(e) => handleDateChange(e.target.value)}
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
                      <option value="PRE_OPERATIVE_ASSESSMENT">Pre-Operative Assessment</option>
                      <option value="POST_OPERATIVE_FOLLOW_UP">Post-Operative Follow Up</option>
                      <option value="VISION_THERAPY">Vision Therapy</option>
                      <option value="CONTACT_LENS_FITTING">Contact Lens Fitting</option>
                      <option value="GLASSES_FITTING">Glasses Fitting</option>
                      <option value="GLAUCOMA_SCREENING">Glaucoma Screening</option>
                      <option value="CATARACT_EVALUATION">Cataract Evaluation</option>
                      <option value="RETINAL_EXAMINATION">Retinal Examination</option>
                      <option value="PEDIATRIC_EXAMINATION">Pediatric Examination</option>
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

      {/* Edit Appointment Form Modal */}
      {showEditForm && editingAppointment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Edit Appointment</h3>
                <button
                  onClick={() => { setShowEditForm(false); setEditingAppointment(null) }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleUpdateAppointment} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="patientName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Patient</label>
                    <input id="patientName" name="patientName" defaultValue={editingAppointment.patientName} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label htmlFor="doctorName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hospital Personnel</label>
                    <input id="doctorName" name="doctorName" defaultValue={editingAppointment.doctorName} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label htmlFor="doctorSpecialty" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Specialty</label>
                    <input id="doctorSpecialty" name="doctorSpecialty" defaultValue={editingAppointment.doctorSpecialty || ''} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="appointmentDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                    <input type="date" id="appointmentDate" name="appointmentDate" defaultValue={editingAppointment.appointmentDate} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label htmlFor="appointmentTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Time</label>
                    <input type="time" id="appointmentTime" name="appointmentTime" defaultValue={editingAppointment.appointmentTime} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Duration</label>
                    <select id="duration" name="duration" defaultValue={String(editingAppointment.duration)} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={45}>45 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={90}>1.5 hours</option>
                      <option value={120}>2 hours</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="appointmentType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Appointment Type</label>
                    <select id="appointmentType" name="appointmentType" defaultValue={editingAppointment.appointmentType} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                      <option value="ROUTINE_EXAMINATION">Routine Examination</option>
                      <option value="FOLLOW_UP">Follow Up</option>
                      <option value="EMERGENCY">Emergency</option>
                      <option value="SURGERY_CONSULTATION">Surgery Consultation</option>
                      <option value="PRESCRIPTION_RENEWAL">Prescription Renewal</option>
                      <option value="DIAGNOSTIC_TEST">Diagnostic Test</option>
                      <option value="PRE_OPERATIVE_ASSESSMENT">Pre-Operative Assessment</option>
                      <option value="POST_OPERATIVE_FOLLOW_UP">Post-Operative Follow Up</option>
                      <option value="VISION_THERAPY">Vision Therapy</option>
                      <option value="CONTACT_LENS_FITTING">Contact Lens Fitting</option>
                      <option value="GLASSES_FITTING">Glasses Fitting</option>
                      <option value="GLAUCOMA_SCREENING">Glaucoma Screening</option>
                      <option value="CATARACT_EVALUATION">Cataract Evaluation</option>
                      <option value="RETINAL_EXAMINATION">Retinal Examination</option>
                      <option value="PEDIATRIC_EXAMINATION">Pediatric Examination</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Priority</label>
                    <select id="priority" name="priority" defaultValue={editingAppointment.priority} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                      <option value="LOW">Low</option>
                      <option value="NORMAL">Normal</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                      <option value="EMERGENCY">Emergency</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reason</label>
                  <textarea id="reason" name="reason" rows={3} defaultValue={editingAppointment.reason} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
                  <textarea id="notes" name="notes" rows={2} defaultValue={editingAppointment.notes || ''} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button type="button" onClick={() => { setShowEditForm(false); setEditingAppointment(null) }} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Cancel</button>
                  <LoadingButton type="submit" loading={isUpdating} loadingText="Updating..." className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Update Appointment</LoadingButton>
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
        title="Appointment Error"
        showRetry={true}
        onRetry={fetchAppointments}
        showCopy={true}
      />
    </div>
  )
} 