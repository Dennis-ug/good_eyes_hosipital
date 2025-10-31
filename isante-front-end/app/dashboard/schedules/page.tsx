'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, Search, Calendar, Clock, User, Edit, Trash2, X, Check, Eye, EyeOff, Filter, RefreshCw, CheckCircle } from 'lucide-react'
import { doctorScheduleApi, userManagementApi } from '@/lib/api'
import { 
  DoctorSchedule, 
  CreateDoctorScheduleRequest, 
  UpdateDoctorScheduleRequest,
  User as UserType,
  DAYS_OF_WEEK,
  DAY_NAMES,
  Page
} from '@/lib/types'
import { LoadingPage } from '@/components/loading-page'
import { LoadingButton } from '@/components/loading-button'
import { ErrorDialog, useErrorDialog } from '@/components/error-dialog'

export default function DoctorSchedulesPage() {
  const [schedules, setSchedules] = useState<Page<DoctorSchedule> | null>(null)
  const [doctors, setDoctors] = useState<UserType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<DoctorSchedule | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDoctor, setSelectedDoctor] = useState<number | ''>('')
  const [selectedDay, setSelectedDay] = useState<number | ''>('')
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'unavailable'>('all')
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  
  // Create schedule form states
  const [createFormData, setCreateFormData] = useState({
    doctorId: '',
    dayOfWeek: '',
    startTime: '',
    endTime: '',
    isAvailable: true
  })
  
  // Error dialog hook
  const { error, isErrorOpen, handleError, hideError } = useErrorDialog()
  const handleErrorRef = useRef(handleError)
  handleErrorRef.current = handleError

  // Edit schedule form states
  const [editFormData, setEditFormData] = useState({
    doctorId: '',
    dayOfWeek: '',
    startTime: '',
    endTime: '',
    breakStart: '',
    breakEnd: '',
    isAvailable: true
  })

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // Fetch doctors first
      const doctorsData = await userManagementApi.getAllUsers({ page: 0, size: 100 })
      const filteredDoctors = doctorsData.content.filter(user => 
        user.roles.some(role => 
          ['DOCTOR', 'OPTOMETRIST', 'OPHTHALMOLOGIST'].includes(role.name)
        )
      )
      setDoctors(filteredDoctors)
      
      // Try to fetch schedules, but handle gracefully if API doesn't exist yet
      try {
        const schedulesData = await doctorScheduleApi.getAllAvailableSchedules()
        console.log('Schedules data fetched successfully:', schedulesData)
        console.log('Schedules content length:', schedulesData?.content?.length)
        console.log('Schedules total elements:', schedulesData?.totalElements)
        setSchedules(schedulesData)
      } catch (scheduleError) {
        console.warn('Could not fetch schedules from /available endpoint:', scheduleError)
        
        // Check if it's a JSON parsing error
        if (scheduleError instanceof Error && scheduleError.message.includes('JSON')) {
          console.log('JSON parsing error, trying alternative endpoint...')
          
          try {
            // Try the alternative endpoint
            const alternativeSchedulesData = await doctorScheduleApi.getAllSchedules()
            console.log('Alternative schedules data fetched successfully:', alternativeSchedulesData)
            console.log('Alternative schedules content length:', alternativeSchedulesData?.content?.length)
            setSchedules(alternativeSchedulesData)
          } catch (alternativeError) {
            console.error('Alternative endpoint also failed:', alternativeError)
            handleErrorRef.current({
              message: 'Unable to fetch schedule data from server. Please check backend logs.',
              error: 'API_ERROR',
              path: '/doctor-schedules'
            })
            setSchedules(null)
          }
        } else {
          console.warn('Schedules API not available yet, setting empty array:', scheduleError)
          setSchedules(null) // Set to null to indicate no data
        }
      }
      
    } catch (error) {
      console.error('Failed to fetch data:', error)
      handleErrorRef.current(error)
      // Set empty arrays to prevent infinite loading
      setSchedules(null)
      setDoctors([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Global test function for debugging (can be called from browser console)
  if (typeof window !== 'undefined') {
    (window as unknown as Record<string, unknown>).testSchedulesAPI = async () => {
      console.log('Testing schedules API...')
      try {
        const response = await fetch('http://localhost:5025/api/doctor-schedules/available', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
          }
        })
        const text = await response.text()
        console.log('Raw response:', text)
        console.log('Response status:', response.status)
        console.log('Response headers:', response.headers)
        
        if (text.trim()) {
          try {
            const json = JSON.parse(text)
            console.log('Parsed JSON:', json)
          } catch (parseError) {
            console.error('JSON parse error:', parseError)
            
            // Specific debugging for position 140149 error
            if (parseError instanceof SyntaxError && parseError.message.includes('140149')) {
              console.log('=== DEBUGGING POSITION 140149 ERROR ===')
              console.log('Text length:', text.length)
              console.log('Character at position 140149:', text.charAt(140149))
              console.log('Character at position 140148:', text.charAt(140148))
              console.log('Character at position 140150:', text.charAt(140150))
              console.log('Context around position 140149 (100 chars before and after):', 
                text.substring(Math.max(0, 140149 - 100), 140149 + 100))
              
              // Try to find where the JSON actually ends
              const lastBrace = text.lastIndexOf('}')
              const lastBracket = text.lastIndexOf(']')
              const lastJsonChar = Math.max(lastBrace, lastBracket)
              console.log('Last JSON character position:', lastJsonChar)
              console.log('Characters after last JSON char:', text.substring(lastJsonChar + 1, lastJsonChar + 50))
              
              // Try to parse just the valid JSON part
              if (lastJsonChar > 0) {
                const validJson = text.substring(0, lastJsonChar + 1)
                try {
                  const parsed = JSON.parse(validJson)
                  console.log('Successfully parsed truncated JSON:', parsed)
                } catch (truncatedError) {
                  console.error('Truncated JSON also failed:', truncatedError)
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Fetch error:', error)
      }
    }
  }

  // Create schedule function
  const handleCreateSchedule = async () => {
    if (!createFormData.doctorId || !createFormData.dayOfWeek || !createFormData.startTime || !createFormData.endTime) {
      handleErrorRef.current({ message: 'Please fill in all required fields' })
      return
    }

    // Validate that end time is after start time
    if (createFormData.startTime >= createFormData.endTime) {
      handleErrorRef.current({ message: 'End time must be after start time' })
      return
    }

    try {
      setIsCreating(true)
      
      const selectedDoctor = doctors.find(d => d.id === Number(createFormData.doctorId))
      if (!selectedDoctor) {
        handleErrorRef.current({ message: 'Selected doctor not found' })
        return
      }

      const scheduleData: CreateDoctorScheduleRequest = {
        doctor: {
          id: Number(createFormData.doctorId)
        },
        dayOfWeek: Number(createFormData.dayOfWeek),
        startTime: createFormData.startTime,
        endTime: createFormData.endTime,
        isAvailable: createFormData.isAvailable
      }

      await doctorScheduleApi.createSchedule(scheduleData)
      
      // Reset form and close modal
      resetCreateForm()
      setShowCreateForm(false)
      
      // Show success message
      setSuccessMessage('Schedule created successfully!')
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 3000)
      
      // Refresh data
      fetchData()
      
    } catch (error) {
      console.error('Failed to create schedule:', error)
      handleErrorRef.current(error)
    } finally {
      setIsCreating(false)
    }
  }

  // Handle form input changes
  const handleCreateFormChange = (field: string, value: string | boolean) => {
    setCreateFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Reset create form
  const resetCreateForm = () => {
    setCreateFormData({
      doctorId: '',
      dayOfWeek: '',
      startTime: '',
      endTime: '',
      isAvailable: true
    })
  }

  // Handle modal close
  const handleCloseCreateModal = () => {
    setShowCreateForm(false)
    resetCreateForm()
  }

  // Edit schedule functions
  const handleEditSchedule = async () => {
    if (!editingSchedule) return
    
    try {
      setIsUpdating(true)
      
      const updateData: UpdateDoctorScheduleRequest = {
        startTime: editFormData.startTime,
        endTime: editFormData.endTime,
        breakStart: editFormData.breakStart || undefined,
        breakEnd: editFormData.breakEnd || undefined,
        isAvailable: editFormData.isAvailable
      }
      
      await doctorScheduleApi.updateSchedule(editingSchedule.id, updateData)
      
      // Refresh data
      await fetchData()
      
      // Close modal and show success message
      setShowEditForm(false)
      setEditingSchedule(null)
      setSuccessMessage('Schedule updated successfully!')
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 3000)
      
    } catch (error) {
      console.error('Failed to update schedule:', error)
      handleErrorRef.current({
        message: 'Failed to update schedule. Please try again.',
        error: 'UPDATE_ERROR',
        path: `/doctor-schedules/${editingSchedule.id}`
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleEditFormChange = (field: string, value: string | boolean) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const resetEditForm = () => {
    setEditFormData({
      doctorId: '',
      dayOfWeek: '',
      startTime: '',
      endTime: '',
      breakStart: '',
      breakEnd: '',
      isAvailable: true
    })
  }

  const handleCloseEditModal = () => {
    setShowEditForm(false)
    setEditingSchedule(null)
    resetEditForm()
  }

  const handleOpenEditModal = (schedule: DoctorSchedule) => {
    setEditingSchedule(schedule)
    setEditFormData({
      doctorId: schedule.doctorId.toString(),
      dayOfWeek: schedule.dayOfWeek.toString(),
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      breakStart: schedule.breakStart || '',
      breakEnd: schedule.breakEnd || '',
      isAvailable: schedule.isAvailable
    })
    setShowEditForm(true)
  }

  // Delete schedule functions
  const handleDeleteSchedule = async () => {
    if (!deletingId) return
    
    try {
      setIsDeleting(true)
      
      const response = await doctorScheduleApi.deleteSchedule(deletingId)
      console.log('Delete response:', response)
      
      // Refresh data
      await fetchData()
      
      // Close modal and show success message
      setDeletingId(null)
      
      // Show success message with details from response
      const successMessage = (response?.message as string) || 'Schedule deleted successfully'
      setSuccessMessage(successMessage)
      setShowSuccessMessage(true)
      
      // Update success message to show more details
      const scheduleInfo = response?.doctorName && response?.dayName 
        ? ` (${response.doctorName} - ${response.dayName})`
        : ''
      
      // You could enhance this to show a more detailed success message
      console.log(`Successfully deleted schedule: ${successMessage}${scheduleInfo}`)
      
      setTimeout(() => setShowSuccessMessage(false), 3000)
      
    } catch (error) {
      console.error('Failed to delete schedule:', error)
      handleErrorRef.current({
        message: 'Failed to delete schedule. Please try again.',
        error: 'DELETE_ERROR',
        path: `/doctor-schedules/${deletingId}`
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleOpenDeleteModal = (scheduleId: number) => {
    setDeletingId(scheduleId)
  }

  const handleCloseDeleteModal = () => {
    setDeletingId(null)
  }

  // Filter schedules based on search and filters
  const filteredSchedules = schedules?.content?.filter(schedule => {
    const matchesSearch = searchTerm === '' || 
      schedule.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (schedule.doctorEmail && schedule.doctorEmail.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesDoctor = selectedDoctor === '' || schedule.doctorId === selectedDoctor
    const matchesDay = selectedDay === '' || schedule.dayOfWeek === selectedDay
    const matchesAvailability = availabilityFilter === 'all' || 
      (availabilityFilter === 'available' && schedule.isAvailable) ||
      (availabilityFilter === 'unavailable' && !schedule.isAvailable)
    
    return matchesSearch && matchesDoctor && matchesDay && matchesAvailability
  }) || []

  console.log('Schedules state:', schedules)
  console.log('Filtered schedules:', filteredSchedules)
  console.log('Schedules content:', schedules?.content)

  if (isLoading) {
    return (
      <LoadingPage 
        message="Loading doctor schedules..."
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Doctor Schedules</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage doctor working schedules and availability</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Schedule
        </button>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                {successMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by doctor name..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Doctor
            </label>
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value ? Number(e.target.value) : '')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Doctors</option>
              {doctors.map(doctor => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.username} ({doctor.departmentName || 'No Department'})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Day of Week
            </label>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value ? Number(e.target.value) : '')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Days</option>
              {Object.entries(DAYS_OF_WEEK).map(([key, value]) => (
                <option key={value} value={value}>
                  {DAY_NAMES[value as keyof typeof DAY_NAMES]}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Availability
            </label>
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value as 'all' | 'available' | 'unavailable')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>
        </div>
      </div>

      {/* Schedules List */}
      {filteredSchedules.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Doctor Schedules ({schedules?.totalElements || 0})
            </h3>
          </div>
          
          {/* Debug info */}
          <div className="px-6 py-2 bg-yellow-50 dark:bg-yellow-900/20 text-xs text-gray-600 dark:text-gray-400">
            Debug: {schedules?.content?.length || 0} schedules loaded, {filteredSchedules.length} filtered
            {schedules?.content?.length > 0 && (
              <div className="mt-1">
                <div>Doctor names: {schedules.content.map(s => s.doctorName || 'NULL').join(', ')}</div>
                <div>Doctor specialties: {schedules.content.map(s => s.doctorSpecialty || 'NULL').join(', ')}</div>
                <div>First schedule details: {JSON.stringify(schedules.content[0], null, 2)}</div>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Day
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Schedule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Duration
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
                {filteredSchedules.map((schedule) => (
                  <tr key={schedule.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {schedule.doctorName || `Doctor ID: ${schedule.doctorId}`}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {schedule.doctorSpecialty || 'No Specialty'}
                          </div>
                          {schedule.doctorEmail && (
                            <div className="text-xs text-gray-400 dark:text-gray-500">
                              {schedule.doctorEmail}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {schedule.dayName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {schedule.scheduleTime}
                      </div>
                      {schedule.breakTime && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Break: {schedule.breakTime}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {Math.round(schedule.totalWorkingHours / 60)}h {schedule.totalWorkingHours % 60}m
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        schedule.isAvailable 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }`}>
                        {schedule.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(schedule)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                          title="Edit Schedule"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(schedule.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                          title="Delete Schedule"
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
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500">
            <Calendar className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No schedules found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {schedules?.content?.length ? 
              `Found ${schedules.content.length} schedules but none match the current filters.` :
              doctors.length > 0 
                ? "Get started by creating a doctor schedule."
                : "No doctors available. Please add doctors first."
            }
          </p>
          {schedules?.content?.length && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Raw data available:</p>
              <pre className="text-xs text-gray-500 dark:text-gray-400 overflow-auto">
                {JSON.stringify(schedules.content.slice(0, 2), null, 2)}
              </pre>
            </div>
          )}
          {doctors.length > 0 && !schedules?.content?.length && (
            <div className="mt-6">
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Schedule
              </button>
            </div>
          )}
        </div>
      )}

      {/* Create Schedule Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Create Doctor Schedule
                </h3>
                <button
                  onClick={handleCloseCreateModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Doctor <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={createFormData.doctorId}
                    onChange={(e) => handleCreateFormChange('doctorId', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Select a doctor</option>
                    {doctors.map(doctor => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.username} ({doctor.departmentName || 'No Department'})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Day of Week <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={createFormData.dayOfWeek}
                    onChange={(e) => handleCreateFormChange('dayOfWeek', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Select a day</option>
                    {Object.entries(DAYS_OF_WEEK).map(([key, value]) => (
                      <option key={value} value={value}>
                        {DAY_NAMES[value as keyof typeof DAY_NAMES]}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Start Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={createFormData.startTime}
                      onChange={(e) => handleCreateFormChange('startTime', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      End Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={createFormData.endTime}
                      onChange={(e) => handleCreateFormChange('endTime', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={createFormData.isAvailable}
                      onChange={(e) => handleCreateFormChange('isAvailable', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Available for appointments
                    </span>
                  </label>
                </div>
              </form>
              
              <div className="flex justify-end mt-6 space-x-3">
                <button
                  onClick={handleCloseCreateModal}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <LoadingButton
                  onClick={handleCreateSchedule}
                  loading={isCreating}
                  loadingText="Creating..."
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Create Schedule
                </LoadingButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Schedule Modal */}
      {showEditForm && editingSchedule && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Edit Doctor Schedule
                </h3>
                <button
                  onClick={handleCloseEditModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Doctor
                  </label>
                  <input
                    type="text"
                    value={editingSchedule.doctorName}
                    disabled
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Day of Week
                  </label>
                  <input
                    type="text"
                    value={editingSchedule.dayName}
                    disabled
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Start Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={editFormData.startTime}
                      onChange={(e) => handleEditFormChange('startTime', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      End Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={editFormData.endTime}
                      onChange={(e) => handleEditFormChange('endTime', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Break Start Time
                    </label>
                    <input
                      type="time"
                      value={editFormData.breakStart}
                      onChange={(e) => handleEditFormChange('breakStart', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Break End Time
                    </label>
                    <input
                      type="time"
                      value={editFormData.breakEnd}
                      onChange={(e) => handleEditFormChange('breakEnd', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editFormData.isAvailable}
                      onChange={(e) => handleEditFormChange('isAvailable', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Available for appointments
                    </span>
                  </label>
                </div>
              </form>
              
              <div className="flex justify-end mt-6 space-x-3">
                <button
                  onClick={handleCloseEditModal}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <LoadingButton
                  onClick={handleEditSchedule}
                  loading={isUpdating}
                  loadingText="Updating..."
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Update Schedule
                </LoadingButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/3 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Delete Schedule
                </h3>
                <button
                  onClick={handleCloseDeleteModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Are you sure you want to delete this schedule? This action cannot be undone.
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCloseDeleteModal}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <LoadingButton
                  onClick={handleDeleteSchedule}
                  loading={isDeleting}
                  loadingText="Deleting..."
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  Delete Schedule
                </LoadingButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Dialog */}
      <ErrorDialog
        isOpen={isErrorOpen}
        onClose={hideError}
        error={error}
        title="Doctor Schedule Error"
        showRetry={true}
        onRetry={fetchData}
        showCopy={true}
      />
    </div>
  )
} 