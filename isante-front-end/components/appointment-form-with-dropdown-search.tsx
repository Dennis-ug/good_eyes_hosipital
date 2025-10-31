'use client'

import { useState, useCallback } from 'react'
import { XCircle } from 'lucide-react'
import { LoadingButton } from '@/components/loading-button'
import { PatientSearch, DoctorSearch } from '@/components/dropdown-search'
import { patientApi, userManagementApi, appointmentApi } from '@/lib/api'
import { 
  Patient, 
  CreateAppointmentRequest, 
  AppointmentType,
  AppointmentPriority,
  PaymentMethod,
  Page,
  Pageable,
  User,
  Role
} from '@/lib/types'

interface AppointmentFormWithDropdownProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function AppointmentFormWithDropdown({ onSuccess, onCancel }: AppointmentFormWithDropdownProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
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
  
  // Form data
  const [formData, setFormData] = useState({
    appointmentDate: '',
    appointmentTime: '',
    duration: 30,
    appointmentType: 'ROUTINE_EXAMINATION' as AppointmentType,
    reason: '',
    priority: 'NORMAL' as AppointmentPriority,
    notes: '',
    followUpRequired: false,
    followUpDate: '',
    insuranceProvider: '',
    insuranceNumber: '',
    cost: '',
    paymentMethod: PaymentMethod.CASH
  })

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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedPatient) {
      setError('Please select a patient')
      return
    }
    
    if (!selectedDoctor) {
      setError('Please select a doctor')
      return
    }
    
    if (!formData.appointmentDate || !formData.appointmentTime) {
      setError('Please select appointment date and time')
      return
    }
    
    if (!formData.reason) {
      setError('Please provide a reason for the appointment')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const startTime = new Date(`2000-01-01T${formData.appointmentTime}`)
      const endTime = new Date(startTime.getTime() + formData.duration * 60000)
      const endTimeString = endTime.toTimeString().slice(0, 5)

      const appointmentData: CreateAppointmentRequest = {
        patientId: selectedPatient.id,
        patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
        patientPhone: selectedPatient.phone || undefined,
        patientEmail: undefined, // Patient doesn't have email field
        doctorId: selectedDoctor.id,
        doctorName: `Dr. ${selectedDoctor.firstName} ${selectedDoctor.lastName}`,
        doctorSpecialty: selectedDoctor.roles?.map((role: Role) => role.name).join(', ') || undefined,
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime,
        duration: formData.duration,
        appointmentType: formData.appointmentType,
        reason: formData.reason,
        priority: formData.priority,
        notes: formData.notes || undefined,
        followUpRequired: formData.followUpRequired,
        followUpDate: formData.followUpDate || undefined,
        insuranceProvider: formData.insuranceProvider || undefined,
        insuranceNumber: formData.insuranceNumber || undefined,
        cost: formData.cost ? parseFloat(formData.cost) : undefined,
        paymentMethod: formData.paymentMethod
      }

      await appointmentApi.createAppointment(appointmentData)
      
      // Reset form
      setSelectedPatient(null)
      setSelectedDoctor(null)
      setPatientSearchTerm('')
      setDoctorSearchTerm('')
      setFormData({
        appointmentDate: '',
        appointmentTime: '',
        duration: 30,
        appointmentType: 'ROUTINE_EXAMINATION',
        reason: '',
        priority: 'NORMAL',
        notes: '',
        followUpRequired: false,
        followUpDate: '',
        insuranceProvider: '',
        insuranceNumber: '',
        cost: '',
        paymentMethod: PaymentMethod.CASH
      })
      
      onSuccess?.()
    } catch (error) {
      console.error('Failed to create appointment:', error)
      setError(error instanceof Error ? error.message : 'Failed to create appointment')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Create New Appointment</h3>
        {onCancel && (
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <XCircle className="h-6 w-6" />
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <div className="text-sm text-red-800 dark:text-red-400">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <div className="text-xs text-green-600 dark:text-green-500">
                  Age: {selectedPatient.ageInYears || 'N/A'} years
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.appointmentDate}
              onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              value={formData.appointmentTime}
              onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Duration (minutes)
            </label>
            <select
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Appointment Type
            </label>
            <select
              value={formData.appointmentType}
              onChange={(e) => setFormData({ ...formData, appointmentType: e.target.value as AppointmentType })}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as AppointmentPriority })}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={3}
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            placeholder="Describe the reason for this appointment..."
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Notes
          </label>
          <textarea
            rows={2}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Additional notes or instructions..."
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3 pt-6">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
          )}
          <LoadingButton
            type="submit"
                            loading={isSubmitting}
            loadingText="Creating Appointment..."
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create Appointment
          </LoadingButton>
        </div>
      </form>
    </div>
  )
} 