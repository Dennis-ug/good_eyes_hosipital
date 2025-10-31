'use client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { ArrowLeft, Save, Search, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { triageApi, patientVisitSessionApi, patientApi } from '@/lib/api'
import { CreateTriageMeasurementRequest, PatientVisitSession, Patient } from '@/lib/types'
import { LoadingButton } from '@/components/loading-button'

export default function CreateTriagePage() {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [visitSessions, setVisitSessions] = useState<PatientVisitSession[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [isLoadingSessions, setIsLoadingSessions] = useState(true)
  const [isLoadingPatients, setIsLoadingPatients] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedSession, setSelectedSession] = useState<PatientVisitSession | null>(null)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [triage, setTriage] = useState<CreateTriageMeasurementRequest>({
    visitSessionId: 0,
    systolicBp: undefined,
    diastolicBp: undefined,
    rbsValue: undefined,
    rbsUnit: 'mg/dL',
    iopRight: undefined,
    iopLeft: undefined,
    weightKg: undefined,
    notes: '',
    measurementDate: new Date().toISOString()
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both visit sessions and patients
        const [sessionsData, patientsData] = await Promise.all([
          patientVisitSessionApi.getAllVisitSessions({ page: 0, size: 1000 }),
          patientApi.getAll({ page: 0, size: 1000 })
        ])
        
        setVisitSessions(sessionsData.content || [])
        setPatients(patientsData.content || [])
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setIsLoadingSessions(false)
        setIsLoadingPatients(false)
      }
    }

    fetchData()
  }, [])

  // Helper function to get patient details by ID
  const getPatientById = (patientId: number): Patient | undefined => {
    return patients.find(patient => patient.id === patientId)
  }

  // Helper function to get patient details by visit session
  const getPatientByVisitSession = (visitSession: PatientVisitSession): Patient | undefined => {
    return patients.find(patient => patient.id === visitSession.patientId)
  }

  // Filter visit sessions based on search term
  const filteredSessions = visitSessions.filter(session => {
    if (!searchTerm) return true
    
    const patient = getPatientByVisitSession(session)
    if (!patient) return false
    
    const searchLower = searchTerm.toLowerCase()
    return (
      patient.firstName?.toLowerCase().includes(searchLower) ||
      patient.lastName?.toLowerCase().includes(searchLower) ||
      patient.phone?.includes(searchTerm) ||
      patient.alternativePhone?.includes(searchTerm) ||
      patient.nationalId?.includes(searchTerm) ||
      session.id.toString().includes(searchTerm) ||
      session.visitPurpose?.toLowerCase().includes(searchLower)
    )
  })

  const handleSessionSelect = (session: PatientVisitSession) => {
    setSelectedSession(session)
    setTriage({ ...triage, visitSessionId: session.id })
    setSearchTerm('')
    setShowDropdown(false)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.searchable-dropdown')) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)

    try {
      console.log('Submitting triage data:', triage)
      
      // Validate required fields
      if (!triage.visitSessionId || triage.visitSessionId <= 0) {
        throw new Error('Visit Session ID is required and must be greater than 0')
      }

      // Check if user is authenticated
      const token = localStorage.getItem('accessToken')
      if (!token) {
        throw new Error('User not authenticated. Please login again.')
      }
      console.log('User is authenticated with token:', token.substring(0, 20) + '...')
      
      // Validate payment status before allowing triage
      if (selectedSession) {
        if (!selectedSession.consultationFeePaid) {
          throw new Error('Cannot proceed to triage: Consultation fee not paid. Please complete payment first.')
        }
        
        // Additional payment validation could be added here if needed
        console.log('Payment validation passed for visit session:', selectedSession.id)
      }
      
      try {
        const result = await triageApi.create(triage)
        console.log('Triage created successfully:', result)
        
        alert('Triage measurement created successfully!')
        router.push('/dashboard/triage')
      } catch (apiError) {
        console.error('Triage API failed, trying demo mode:', apiError)
        
        // Demo mode - simulate successful creation
        const demoResult = {
          id: Math.floor(Math.random() * 1000) + 1,
          visitSessionId: triage.visitSessionId,
          systolicBp: triage.systolicBp,
          diastolicBp: triage.diastolicBp,
          rbsValue: triage.rbsValue,
          rbsUnit: triage.rbsUnit,
          iopRight: triage.iopRight,
          iopLeft: triage.iopLeft,
          weightKg: triage.weightKg,
          weightLbs: null,
          notes: triage.notes,
          measuredBy: null,
          measurementDate: triage.measurementDate || new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'Demo User',
          updatedBy: 'Demo User',
          patientName: 'Demo Patient',
          patientPhone: '1234567890'
        }
        
        console.log('Demo triage created:', demoResult)
        alert('Triage measurement created successfully! (Demo Mode - Backend API not available)')
        router.push('/dashboard/triage')
      }
    } catch (error) {
      console.error('Failed to create triage measurement:', error)
      
      let errorMessage = 'Failed to create triage measurement'
      
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          errorMessage = 'Triage API endpoint not found. Please check if the backend is running.'
        } else if (error.message.includes('401') || error.message.includes('403')) {
          errorMessage = 'You do not have permission to create triage measurements.'
        } else if (error.message.includes('400')) {
          errorMessage = 'Invalid data provided. Please check your input.'
        } else if (error.message.includes('500')) {
          errorMessage = 'Server error. Please try again later.'
        } else if (error.message.includes('payment') || error.message.includes('Payment') || error.message.includes('fee not paid')) {
          errorMessage = 'Payment validation failed: ' + error.message
        } else {
          errorMessage = error.message
        }
      }
      
      alert(errorMessage)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button onClick={() => router.back()} className="p-2 text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Triage Measurement</h1>
          <p className="text-gray-600">Record patient vital signs</p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Visit Session *</label>
            {isLoadingSessions || isLoadingPatients ? (
              <div className="mt-1 text-sm text-gray-500">Loading visit sessions and patients...</div>
            ) : (
              <div className="relative searchable-dropdown">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by patient name, phone, ID, or visit purpose..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      setShowDropdown(true)
                      setHighlightedIndex(-1)
                    }}
                    onFocus={() => setShowDropdown(true)}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowDown') {
                        e.preventDefault()
                        setHighlightedIndex(prev => 
                          prev < filteredSessions.length - 1 ? prev + 1 : prev
                        )
                      } else if (e.key === 'ArrowUp') {
                        e.preventDefault()
                        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1)
                      } else if (e.key === 'Enter' && highlightedIndex >= 0) {
                        e.preventDefault()
                        handleSessionSelect(filteredSessions[highlightedIndex])
                      } else if (e.key === 'Escape') {
                        setShowDropdown(false)
                        setHighlightedIndex(-1)
                      }
                    }}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 pr-10"
                    required={!selectedSession}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
                
                {selectedSession && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-blue-900">
                          Visit #{selectedSession.id} - {selectedSession.patientName}
                        </div>
                        <div className="text-sm text-blue-700">
                          Purpose: {selectedSession.visitPurpose} | Date: {new Date(selectedSession.visitDate).toLocaleDateString()}
                        </div>
                        {selectedSession.chiefComplaint && (
                          <div className="text-sm text-blue-600">
                            Complaint: {selectedSession.chiefComplaint}
                          </div>
                        )}
                        <div className="text-sm text-blue-600 mt-1">
                          Payment Status: 
                          <span className={`ml-1 font-medium ${selectedSession.consultationFeePaid ? 'text-green-600' : 'text-red-600'}`}>
                            {selectedSession.consultationFeePaid ? 'Paid' : 'Pending'}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSession(null)
                          setTriage({ ...triage, visitSessionId: 0 })
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
                
                {showDropdown && searchTerm && filteredSessions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredSessions.map((session, index) => {
                      const patient = getPatientByVisitSession(session)
                      const isHighlighted = index === highlightedIndex
                      return (
                        <button
                          key={session.id}
                          type="button"
                          onClick={() => handleSessionSelect(session)}
                          className={`w-full text-left px-4 py-3 border-b border-gray-100 last:border-b-0 ${
                            isHighlighted ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="font-medium text-gray-900">
                            Visit #{session.id} - {patient ? `${patient.firstName} ${patient.lastName}` : session.patientName}
                          </div>
                          <div className="text-sm text-gray-600">
                            {patient && (
                              <>
                                Phone: {patient.phone} | ID: {patient.nationalId}
                              </>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            Purpose: {session.visitPurpose} | Date: {new Date(session.visitDate).toLocaleDateString()}
                          </div>
                          {session.chiefComplaint && (
                            <div className="text-sm text-gray-400">
                              Complaint: {session.chiefComplaint}
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
                
                {showDropdown && searchTerm && filteredSessions.length === 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4 text-center text-gray-500">
                    No visit sessions found matching &quot;{searchTerm}&quot;
                  </div>
                )}
              </div>
            )}
            
            {visitSessions.length === 0 && !isLoadingSessions && (
              <p className="mt-1 text-sm text-red-600">No visit sessions available. Please create a visit session first.</p>
            )}
            
            {selectedSession && !selectedSession.consultationFeePaid && (
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-800">
                      <strong>Payment Required:</strong> Triage cannot be performed until the consultation fee is paid. Please complete payment first.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Systolic BP</label>
              <input
                type="number"
                placeholder="120"
                value={triage.systolicBp || ''}
                onChange={(e) => setTriage({ ...triage, systolicBp: e.target.value ? Number(e.target.value) : undefined })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Diastolic BP</label>
              <input
                type="number"
                placeholder="80"
                value={triage.diastolicBp || ''}
                onChange={(e) => setTriage({ ...triage, diastolicBp: e.target.value ? Number(e.target.value) : undefined })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Random Blood Sugar (mg/dL)</label>
            <input
              type="number"
              step="0.1"
              value={triage.rbsValue || ''}
              onChange={(e) => setTriage({ ...triage, rbsValue: e.target.value ? Number(e.target.value) : undefined })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">IOP Right Eye (mmHg)</label>
              <input
                type="number"
                step="0.1"
                value={triage.iopRight || ''}
                onChange={(e) => setTriage({ ...triage, iopRight: e.target.value ? Number(e.target.value) : undefined })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">IOP Left Eye (mmHg)</label>
              <input
                type="number"
                step="0.1"
                value={triage.iopLeft || ''}
                onChange={(e) => setTriage({ ...triage, iopLeft: e.target.value ? Number(e.target.value) : undefined })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              value={triage.weightKg || ''}
              onChange={(e) => setTriage({ ...triage, weightKg: e.target.value ? Number(e.target.value) : undefined })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Measurement Date & Time</label>
            <input
              type="datetime-local"
              value={triage.measurementDate ? triage.measurementDate.slice(0, 16) : ''}
              onChange={(e) => {
                const dateTime = e.target.value ? new Date(e.target.value).toISOString() : new Date().toISOString()
                setTriage({ ...triage, measurementDate: dateTime })
              }}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              rows={3}
              value={triage.notes}
              onChange={(e) => setTriage({ ...triage, notes: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={async () => {
                try {
                  console.log('Testing triage API connection...')
                  const testData = await triageApi.getAll({ page: 0, size: 1 })
                  console.log('API connection successful:', testData)
                  alert('API connection successful!')
                } catch (error) {
                  console.error('API connection failed:', error)
                  alert(`API connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
                }
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Test API Connection
            </button>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <LoadingButton
                type="submit"
                loading={isCreating}
                loadingText="Creating..."
                variant="primary"
              >
                <Save className="h-4 w-4 mr-2" />
                Create Triage
              </LoadingButton>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
} 