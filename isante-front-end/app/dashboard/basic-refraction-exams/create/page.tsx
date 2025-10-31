'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Save, Eye, User, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { LoadingButton } from '@/components/loading-button'
import { basicRefractionExamApi, patientVisitSessionApi, patientApi } from '@/lib/api'
import { CreateBasicRefractionExamRequest, PatientVisitSession, Patient, VisitPurpose, VisitStage, VisitStatus, EmergencyLevel } from '@/lib/types'

export default function CreateBasicRefractionExamPage() {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [isLoadingSessions, setIsLoadingSessions] = useState(false)
  const [isLoadingPatients, setIsLoadingPatients] = useState(false)
  const [visitSessions, setVisitSessions] = useState<PatientVisitSession[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedSession, setSelectedSession] = useState<PatientVisitSession | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)

  const [exam, setExam] = useState<CreateBasicRefractionExamRequest>({
    visitSessionId: 0,
    neuroOriented: false,
    neuroMood: '',
    neuroPsychNotes: '',
    pupilsPerrl: false,
    pupilsRightDark: '',
    pupilsLeftDark: '',
    pupilsRightLight: '',
    pupilsLeftLight: '',
    pupilsRightShape: '',
    pupilsLeftShape: '',
    pupilsRightReact: '',
    pupilsLeftReact: '',
    pupilsRightApd: '',
    pupilsLeftApd: '',
    pupilsNotes: '',
    visualAcuityDistanceScRight: '',
    visualAcuityDistanceScLeft: '',
    visualAcuityDistancePhRight: '',
    visualAcuityDistancePhLeft: '',
    visualAcuityDistanceCcRight: '',
    visualAcuityDistanceCcLeft: '',
    visualAcuityNearScRight: '',
    visualAcuityNearScLeft: '',
    visualAcuityNearCcRight: '',
    visualAcuityNearCcLeft: '',
    visualAcuityNotes: '',
    manifestAutoRightSphere: '',
    manifestAutoRightCylinder: '',
    manifestAutoRightAxis: '',
    manifestAutoLeftSphere: '',
    manifestAutoLeftCylinder: '',
    manifestAutoLeftAxis: '',
    manifestRetRightSphere: '',
    manifestRetRightCylinder: '',
    manifestRetRightAxis: '',
    manifestRetLeftSphere: '',
    manifestRetLeftCylinder: '',
    manifestRetLeftAxis: '',
    subjectiveRightSphere: '',
    subjectiveRightCylinder: '',
    subjectiveRightAxis: '',
    subjectiveLeftSphere: '',
    subjectiveLeftCylinder: '',
    subjectiveLeftAxis: '',
    addedValues: '',
    bestRightVision: '',
    bestLeftVision: '',
    pdRightEye: '',
    pdLeftEye: '',
    refractionNotes: '',
    comment: '',
    examinedBy: '',
    
    // Enhanced fields from API examples
    keratometryK1Right: '',
    keratometryK2Right: '',
    keratometryAxisRight: '',
    keratometryK1Left: '',
    keratometryK2Left: '',
    keratometryAxisLeft: '',
    pupilSizeRight: '',
    pupilSizeLeft: '',
    pupilSizeUnit: 'mm',
    iopRight: '',
    iopLeft: '',
    iopMethod: '',
    colorVisionRight: '',
    colorVisionLeft: '',
    colorVisionTest: '',
    stereopsis: '',
    stereopsisUnit: 'arcseconds',
    nearAdditionRight: '',
    nearAdditionLeft: '',
    clinicalAssessment: '',
    diagnosis: '',
    treatmentPlan: '',
    equipmentUsed: '',
    equipmentCalibrationDate: ''
  })


  // Helper functions
  const getPatientById = (patientId: number) => {
    return patients.find(patient => patient.id === patientId)
  }

  const getPatientByVisitSession = (session: PatientVisitSession) => {
    return getPatientById(session.patientId)
  }

  const filteredSessions = visitSessions.filter(session => {
    const patient = getPatientByVisitSession(session)
    if (!patient) {
      console.log('No patient found for session:', session.id)
      return false
    }
    
    const searchLower = searchTerm.toLowerCase()
    const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase()
    const matches = (
      fullName.includes(searchLower) ||
      patient.phone?.toLowerCase().includes(searchLower) ||
      patient.alternativePhone?.toLowerCase().includes(searchLower) ||
      patient.nationalId?.toLowerCase().includes(searchLower) ||
      session.visitPurpose?.toLowerCase().includes(searchLower) ||
      session.id.toString().includes(searchTerm)
    )
    
    if (searchTerm && matches) {
      console.log('Match found:', { sessionId: session.id, patientName: fullName, searchTerm })
    }
    
    return matches
  })

  const handleSessionSelect = (session: PatientVisitSession) => {
    setSelectedSession(session)
    setExam({ ...exam, visitSessionId: session.id })
    setShowDropdown(false)
    setSearchTerm('')
    setHighlightedIndex(-1)
  }

  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as Element
    if (!target.closest('.searchable-dropdown')) {
      setShowDropdown(false)
      setHighlightedIndex(-1)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!showDropdown) return

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setHighlightedIndex(prev => 
          prev < filteredSessions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        event.preventDefault()
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        event.preventDefault()
        if (highlightedIndex >= 0 && filteredSessions[highlightedIndex]) {
          handleSessionSelect(filteredSessions[highlightedIndex])
        }
        break
      case 'Escape':
        setShowDropdown(false)
        setHighlightedIndex(-1)
        break
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingSessions(true)
        setIsLoadingPatients(true)
        
        const [sessionsData, patientsData] = await Promise.all([
          patientVisitSessionApi.getAllVisitSessions({ page: 0, size: 1000 }),
          patientApi.getAll({ page: 0, size: 1000 })
        ])
        
        console.log('Fetched sessions data:', sessionsData)
        console.log('Fetched patients data:', patientsData)
        setVisitSessions(sessionsData.content || [])
        setPatients(patientsData.content || [])
      } catch (error) {
        console.error('Failed to fetch data:', error)
        // Demo mode - use sample data
        const demoSessions: PatientVisitSession[] = [
          {
            id: 1,
            patientId: 1,
            patientName: 'John Doe',
            visitDate: '2025-01-15T10:00:00',
            visitPurpose: VisitPurpose.NEW_CONSULTATION,
            currentStage: VisitStage.TRIAGE,
            status: VisitStatus.TRIAGE_COMPLETED,
            consultationFeePaid: true,
            consultationFeeAmount: 50.0,
            emergencyLevel: EmergencyLevel.NONE,
            requiresTriage: true,
            requiresDoctorVisit: true,
            isEmergency: false,
            createdAt: '2025-01-15T10:00:00',
            updatedAt: '2025-01-15T10:00:00',
            createdBy: 'demo',
            updatedBy: 'demo'
          }
        ]
        
        const demoPatients: Patient[] = [
          {
            id: 1,
            patientNumber: 'P001',
            firstName: 'John',
            lastName: 'Doe',
            gender: 'Male',
            nationalId: '123456789',
            dateOfBirth: '1990-01-01',
            ageInYears: 35,
            ageInMonths: 420,
            maritalStatus: 'Single',

            occupation: 'Engineer',
            nextOfKin: 'Jane Doe',
            nextOfKinRelationship: 'Spouse',
            nextOfKinPhone: '1234567890',
            phone: '1234567890',
            alternativePhone: '0987654321',
            phoneOwner: 'Self',
            ownerName: 'John Doe',
            patientCategory: 'Regular',
            company: 'Tech Corp',
            preferredLanguage: 'English',
            citizenship: 'Ugandan',
            countryId: 'UG',
            foreignerOrRefugee: 'No',
            nonUgandanNationalIdNo: '',
            residence: 'Kampala',
            researchNumber: 'R001'
          }
        ]
        
        setVisitSessions(demoSessions)
        setPatients(demoPatients)
      } finally {
        setIsLoadingSessions(false)
        setIsLoadingPatients(false)
      }
    }
    
    fetchData()
  }, [])


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)
    try {
      console.log('Submitting basic refraction exam data:', exam)
      if (!exam.visitSessionId || exam.visitSessionId <= 0) {
        throw new Error('Visit Session ID is required and must be greater than 0')
      }
      const token = localStorage.getItem('accessToken')
      if (!token) {
        throw new Error('User not authenticated. Please login again.')
      }
      // Enhanced workflow validation
      if (selectedSession) {
        console.log('Visit session state:', {
          id: selectedSession.id,
          currentStage: selectedSession.currentStage,
          status: selectedSession.status,
          consultationFeePaid: selectedSession.consultationFeePaid
        })
        
        // Check if triage is completed
        if (selectedSession.currentStage !== 'TRIAGE') {
          throw new Error(`Cannot proceed to basic refraction exam: Current stage is "${selectedSession.currentStage}". Triage must be completed first.`)
        }
        
        // Check if payment is completed
        if (!selectedSession.consultationFeePaid) {
          throw new Error('Cannot proceed to basic refraction exam: Consultation fee must be paid first.')
        }
        
        // Check if there's already a basic refraction exam for this visit session
        // This might be causing the "related data" error
        try {
          const existingExam = await basicRefractionExamApi.getByVisitSession(selectedSession.id)
          if (existingExam) {
            throw new Error(`A basic refraction exam already exists for visit session ${selectedSession.id}. Cannot create duplicate.`)
          }
        } catch (error) {
          // If getByVisitSession returns 404, that's good - no existing exam
          if (error instanceof Error && error.message.includes('404')) {
            console.log('No existing exam found - proceeding with creation')
          } else {
            console.log('Error checking for existing exam:', error)
          }
        }
        
        console.log('All workflow validations passed for visit session:', selectedSession.id)
      }
              try {
          console.log('Submitting exam data:', JSON.stringify(exam, null, 2))
          console.log('Selected session:', selectedSession)
          
          const result = await basicRefractionExamApi.create(exam)
          console.log('Basic refraction exam created successfully:', result)
          
          // Check if it's demo mode
          if (result.createdBy === 'demo') {
            alert('Basic refraction exam created successfully! (Demo Mode - Backend API not available)')
          } else {
            alert('Basic refraction exam created successfully!')
          }
          
          router.push('/dashboard/basic-refraction-exams')
        } catch (apiError) {
          console.error('Basic refraction exam API failed:', apiError)
          
          // Enhanced error handling
          let errorMessage = 'Failed to create basic refraction exam'
          if (apiError instanceof Error) {
            errorMessage = apiError.message
            
            // Check for specific error types
            if (apiError.message.includes('related data')) {
              errorMessage = 'Cannot create exam: Visit session has related data that prevents this operation. Please check if triage is completed and the visit session is in the correct state.'
            } else if (apiError.message.includes('404')) {
              errorMessage = 'Basic refraction exam API endpoint not found. Please check if the backend is running.'
            } else if (apiError.message.includes('401') || apiError.message.includes('403')) {
              errorMessage = 'You do not have permission to create basic refraction exams.'
            } else if (apiError.message.includes('400')) {
              errorMessage = 'Invalid data provided. Please check your input.'
            } else if (apiError.message.includes('500')) {
              errorMessage = 'Server error. Please try again later.'
            }
          }
          
          console.error('Error details:', errorMessage)
          alert(errorMessage)
        }
    } catch (error) {
      console.error('Failed to create basic refraction exam:', error)
      let errorMessage = 'Failed to create basic refraction exam'
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          errorMessage = 'Basic refraction exam API endpoint not found. Please check if the backend is running.'
        } else if (error.message.includes('401') || error.message.includes('403')) {
          errorMessage = 'You do not have permission to create basic refraction exams.'
        } else if (error.message.includes('400')) {
          errorMessage = 'Invalid data provided. Please check your input.'
        } else if (error.message.includes('500')) {
          errorMessage = 'Server error. Please try again later.'
        } else if (error.message.includes('triage') || error.message.includes('Triage')) {
          errorMessage = 'Workflow validation failed: ' + error.message
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
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button onClick={() => router.back()} className="p-2 text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Basic Refraction Exam</h1>
          <p className="text-gray-600">Add a new basic refraction examination</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Visit Session Selection */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Visit Session Selection</h3>
          {/* Debug info */}
          <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
            <div>Total Sessions: {visitSessions.length}</div>
            <div>Total Patients: {patients.length}</div>
            <div>Search Term: &quot;{searchTerm}&quot;</div>
            <div>Filtered Sessions: {filteredSessions.length}</div>
            <div>Show Dropdown: {showDropdown ? 'Yes' : 'No'}</div>
          </div>
          <div className="relative searchable-dropdown">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by patient name, phone number, or national ID..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setShowDropdown(true)
                  setHighlightedIndex(-1)
                }}
                onFocus={() => setShowDropdown(true)}
                onKeyDown={handleKeyDown}
                className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {showDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                {filteredSessions.length > 0 ? (
                  filteredSessions.map((session, index) => {
                    const patient = getPatientByVisitSession(session)
                    return (
                      <div
                        key={session.id}
                        className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                          index === highlightedIndex ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => handleSessionSelect(session)}
                      >
                        <div className="font-medium text-gray-900">
                          {patient ? `${patient.firstName} ${patient.lastName}` : `Patient #${session.patientId}`}
                        </div>
                        <div className="text-sm text-gray-500">
                          {patient?.phone || 'No phone'} • Visit #{session.id} • {session.visitPurpose}
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="px-4 py-2 text-gray-500">
                    No visit sessions found matching &quot;{searchTerm}&quot;
                  </div>
                )}
              </div>
            )}

            {selectedSession && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-blue-900">
                      Visit #{selectedSession.id} - {getPatientByVisitSession(selectedSession) ? `${getPatientByVisitSession(selectedSession)?.firstName} ${getPatientByVisitSession(selectedSession)?.lastName}` : 'Unknown Patient'}
                    </div>
                    <div className="text-sm text-blue-700">
                      Purpose: {selectedSession.visitPurpose} | Date: {new Date(selectedSession.visitDate).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-blue-600 mt-1">
                      Stage: 
                      <span className={`ml-1 font-medium ${selectedSession.currentStage === 'TRIAGE' ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedSession.currentStage}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSession(null)
                      setExam({ ...exam, visitSessionId: 0 })
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {selectedSession && selectedSession.currentStage !== 'TRIAGE' && (
            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-800">
                    <strong>Workflow Required:</strong> Basic refraction exam can only be performed after triage is completed. Current stage: {selectedSession.currentStage}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>


        {/* Tabbed Form Structure */}
        <div className="bg-white shadow rounded-lg">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              <div className="border-b-2 border-blue-500 py-2 px-1 text-sm font-medium text-blue-600">
                Basic Exam Refraction
              </div>
            </nav>
          </div>

          {/* Form Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Neuro/Psych Table */}
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-300">
                    <h3 className="text-sm font-medium text-gray-900">Neuro/Psych</h3>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center mb-4">
                      <input
                        type="checkbox"
                        id="neuroOriented"
                        checked={exam.neuroOriented}
                        onChange={(e) => setExam({ ...exam, neuroOriented: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="neuroOriented" className="ml-2 text-sm text-gray-900">
                        Oriented x3
                      </label>
                    </div>
                    <hr className="my-4" />
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Mood/Affect</p>
                      <div className="grid grid-cols-4 gap-2">
                        <div className="col-span-1">
                          <button 
                            type="button" 
                            onClick={() => setExam({ ...exam, neuroMood: 'nl' })}
                            className="w-full px-3 py-1 text-xs bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            nl
                          </button>
                        </div>
                        <div className="col-span-3">
                          <input
                            type="text"
                            value={exam.neuroMood}
                            onChange={(e) => setExam({ ...exam, neuroMood: e.target.value })}
                            className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Mood description"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Neuro/Psych Notes</label>
                      <textarea
                        value={exam.neuroPsychNotes}
                        onChange={(e) => setExam({ ...exam, neuroPsychNotes: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Additional neuro/psych observations..."
                      />
                    </div>
                  </div>
                </div>

                {/* Pupils Table */}
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-300">
                    <h3 className="text-sm font-medium text-gray-900">Pupils</h3>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center mb-4">
                      <input
                        type="checkbox"
                        id="pupilsPerrl"
                        checked={exam.pupilsPerrl}
                        onChange={(e) => setExam({ ...exam, pupilsPerrl: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="pupilsPerrl" className="ml-2 text-sm text-gray-900">
                        PERRL
                      </label>
                    </div>
                    
                    <div className="grid grid-cols-6 gap-2 mb-2 text-xs font-medium text-gray-700">
                      <div className="col-span-1"></div>
                      <div className="col-span-1 text-center">Dark</div>
                      <div className="col-span-1 text-center">Light</div>
                      <div className="col-span-1 text-center">Shape</div>
                      <div className="col-span-1 text-center">React</div>
                      <div className="col-span-1 text-center">APD</div>
                    </div>
                    
                    <div className="grid grid-cols-6 gap-2 mb-2">
                      <div className="col-span-1 text-center text-sm font-medium">R</div>
                      <div className="col-span-1">
                        <input
                          type="text"
                          value={exam.pupilsRightDark}
                          onChange={(e) => setExam({ ...exam, pupilsRightDark: e.target.value })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="3mm"
                        />
                      </div>
                      <div className="col-span-1">
                        <input
                          type="text"
                          value={exam.pupilsRightLight}
                          onChange={(e) => setExam({ ...exam, pupilsRightLight: e.target.value })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="2mm"
                        />
                      </div>
                      <div className="col-span-1">
                        <input
                          type="text"
                          value={exam.pupilsRightShape}
                          onChange={(e) => setExam({ ...exam, pupilsRightShape: e.target.value })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Round"
                        />
                      </div>
                      <div className="col-span-1">
                        <input
                          type="text"
                          value={exam.pupilsRightReact}
                          onChange={(e) => setExam({ ...exam, pupilsRightReact: e.target.value })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Brisk"
                        />
                      </div>
                      <div className="col-span-1">
                        <input
                          type="text"
                          value={exam.pupilsRightApd}
                          onChange={(e) => setExam({ ...exam, pupilsRightApd: e.target.value })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="None"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-6 gap-2">
                      <div className="col-span-1 text-center text-sm font-medium">L</div>
                      <div className="col-span-1">
                        <input
                          type="text"
                          value={exam.pupilsLeftDark}
                          onChange={(e) => setExam({ ...exam, pupilsLeftDark: e.target.value })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="3mm"
                        />
                      </div>
                      <div className="col-span-1">
                        <input
                          type="text"
                          value={exam.pupilsLeftLight}
                          onChange={(e) => setExam({ ...exam, pupilsLeftLight: e.target.value })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="2mm"
                        />
                      </div>
                      <div className="col-span-1">
                        <input
                          type="text"
                          value={exam.pupilsLeftShape}
                          onChange={(e) => setExam({ ...exam, pupilsLeftShape: e.target.value })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Round"
                        />
                      </div>
                      <div className="col-span-1">
                        <input
                          type="text"
                          value={exam.pupilsLeftReact}
                          onChange={(e) => setExam({ ...exam, pupilsLeftReact: e.target.value })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Brisk"
                        />
                      </div>
                      <div className="col-span-1">
                        <input
                          type="text"
                          value={exam.pupilsLeftApd}
                          onChange={(e) => setExam({ ...exam, pupilsLeftApd: e.target.value })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="None"
                        />
                      </div>
                    </div>
                    
                    {/* Pupils notes removed per HTML-only fields */}
                  </div>
                </div>


                {/* Visual Acuity Table */}
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-300">
                    <h3 className="text-sm font-medium text-gray-900">Visual Acuity</h3>
                  </div>
                  <div className="p-4">
                    <div className="mb-4">
                      <div className="grid grid-cols-3 gap-2 mb-2 text-xs font-medium text-gray-700">
                        <div className="col-span-1">Distance</div>
                        <div className="col-span-1 text-center">Right</div>
                        <div className="col-span-1 text-center">Left</div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        <div className="col-span-1 text-center text-xs">sc</div>
                        <div className="col-span-1">
                          <select
                            value={exam.visualAcuityDistanceScRight}
                            onChange={(e) => setExam({ ...exam, visualAcuityDistanceScRight: e.target.value })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="">--Select--</option>
                            <option value="6/4">6/4</option>
                            <option value="6/5">6/5</option>
                            <option value="6/6">6/6</option>
                            <option value="6/9">6/9</option>
                            <option value="6/12">6/12</option>
                            <option value="6/18">6/18</option>
                            <option value="6/24">6/24</option>
                            <option value="6/36">6/36</option>
                            <option value="6/60">6/60</option>
                            <option value="5/60">5/60</option>
                            <option value="4/60">4/60</option>
                            <option value="3/60">3/60</option>
                            <option value="2/60">2/60</option>
                            <option value="1/60">1/60</option>
                            <option value="HM">HM</option>
                            <option value="PL">PL</option>
                            <option value="NPL">NPL</option>
                          </select>
                        </div>
                        <div className="col-span-1">
                          <select
                            value={exam.visualAcuityDistanceScLeft}
                            onChange={(e) => setExam({ ...exam, visualAcuityDistanceScLeft: e.target.value })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="">--Select--</option>
                            <option value="6/4">6/4</option>
                            <option value="6/5">6/5</option>
                            <option value="6/6">6/6</option>
                            <option value="6/9">6/9</option>
                            <option value="6/12">6/12</option>
                            <option value="6/18">6/18</option>
                            <option value="6/24">6/24</option>
                            <option value="6/36">6/36</option>
                            <option value="6/60">6/60</option>
                            <option value="5/60">5/60</option>
                            <option value="4/60">4/60</option>
                            <option value="3/60">3/60</option>
                            <option value="2/60">2/60</option>
                            <option value="1/60">1/60</option>
                            <option value="HM">HM</option>
                            <option value="PL">PL</option>
                            <option value="NPL">NPL</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        <div className="col-span-1 text-center text-xs">ph</div>
                        <div className="col-span-1">
                          <select
                            value={exam.visualAcuityDistancePhRight}
                            onChange={(e) => setExam({ ...exam, visualAcuityDistancePhRight: e.target.value })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="">--Select--</option>
                            <option value="6/4">6/4</option>
                            <option value="6/5">6/5</option>
                            <option value="6/6">6/6</option>
                            <option value="6/9">6/9</option>
                            <option value="6/12">6/12</option>
                            <option value="6/18">6/18</option>
                            <option value="6/24">6/24</option>
                            <option value="6/36">6/36</option>
                            <option value="6/60">6/60</option>
                            <option value="5/60">5/60</option>
                            <option value="4/60">4/60</option>
                            <option value="3/60">3/60</option>
                            <option value="2/60">2/60</option>
                            <option value="1/60">1/60</option>
                            <option value="HM">HM</option>
                            <option value="PL">PL</option>
                            <option value="NPL">NPL</option>
                          </select>
                        </div>
                        <div className="col-span-1">
                          <select
                            value={exam.visualAcuityDistancePhLeft}
                            onChange={(e) => setExam({ ...exam, visualAcuityDistancePhLeft: e.target.value })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="">--Select--</option>
                            <option value="6/4">6/4</option>
                            <option value="6/5">6/5</option>
                            <option value="6/6">6/6</option>
                            <option value="6/9">6/9</option>
                            <option value="6/12">6/12</option>
                            <option value="6/18">6/18</option>
                            <option value="6/24">6/24</option>
                            <option value="6/36">6/36</option>
                            <option value="6/60">6/60</option>
                            <option value="5/60">5/60</option>
                            <option value="4/60">4/60</option>
                            <option value="3/60">3/60</option>
                            <option value="2/60">2/60</option>
                            <option value="1/60">1/60</option>
                            <option value="HM">HM</option>
                            <option value="PL">PL</option>
                            <option value="NPL">NPL</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="col-span-1 text-center text-xs">cc</div>
                        <div className="col-span-1">
                          <select
                            value={exam.visualAcuityDistanceCcRight}
                            onChange={(e) => setExam({ ...exam, visualAcuityDistanceCcRight: e.target.value })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="">--Select--</option>
                            <option value="6/4">6/4</option>
                            <option value="6/5">6/5</option>
                            <option value="6/6">6/6</option>
                            <option value="6/9">6/9</option>
                            <option value="6/12">6/12</option>
                            <option value="6/18">6/18</option>
                            <option value="6/24">6/24</option>
                            <option value="6/36">6/36</option>
                            <option value="6/60">6/60</option>
                            <option value="5/60">5/60</option>
                            <option value="4/60">4/60</option>
                            <option value="3/60">3/60</option>
                            <option value="2/60">2/60</option>
                            <option value="1/60">1/60</option>
                            <option value="HM">HM</option>
                            <option value="PL">PL</option>
                            <option value="NPL">NPL</option>
                          </select>
                        </div>
                        <div className="col-span-1">
                          <select
                            value={exam.visualAcuityDistanceCcLeft}
                            onChange={(e) => setExam({ ...exam, visualAcuityDistanceCcLeft: e.target.value })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="">--Select--</option>
                            <option value="6/4">6/4</option>
                            <option value="6/5">6/5</option>
                            <option value="6/6">6/6</option>
                            <option value="6/9">6/9</option>
                            <option value="6/12">6/12</option>
                            <option value="6/18">6/18</option>
                            <option value="6/24">6/24</option>
                            <option value="6/36">6/36</option>
                            <option value="6/60">6/60</option>
                            <option value="5/60">5/60</option>
                            <option value="4/60">4/60</option>
                            <option value="3/60">3/60</option>
                            <option value="2/60">2/60</option>
                            <option value="1/60">1/60</option>
                            <option value="HM">HM</option>
                            <option value="PL">PL</option>
                            <option value="NPL">NPL</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="grid grid-cols-3 gap-2 mb-2 text-xs font-medium text-gray-700">
                        <div className="col-span-1">Near</div>
                        <div className="col-span-1 text-center">Right</div>
                        <div className="col-span-1 text-center">Left</div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        <div className="col-span-1 text-center text-xs">sc</div>
                        <div className="col-span-1">
                          <select
                            value={exam.visualAcuityNearScRight}
                            onChange={(e) => setExam({ ...exam, visualAcuityNearScRight: e.target.value })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="">--Select--</option>
                            <option value="N4">N4</option>
                            <option value="N5">N5</option>
                            <option value="N6">N6</option>
                            <option value="N7">N7</option>
                            <option value="N8">N8</option>
                            <option value="N9">N9</option>
                            <option value="N10">N10</option>
                            <option value="N11">N11</option>
                          </select>
                        </div>
                        <div className="col-span-1">
                          <select
                            value={exam.visualAcuityNearScLeft}
                            onChange={(e) => setExam({ ...exam, visualAcuityNearScLeft: e.target.value })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="">--Select--</option>
                            <option value="N4">N4</option>
                            <option value="N5">N5</option>
                            <option value="N6">N6</option>
                            <option value="N7">N7</option>
                            <option value="N8">N8</option>
                            <option value="N9">N9</option>
                            <option value="N10">N10</option>
                            <option value="N11">N11</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-1 text-center text-xs">cc</div>
                        <div className="col-span-1">
                          <select
                            value={exam.visualAcuityNearCcRight}
                            onChange={(e) => setExam({ ...exam, visualAcuityNearCcRight: e.target.value })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="">--Select--</option>
                            <option value="N4">N4</option>
                            <option value="N5">N5</option>
                            <option value="N6">N6</option>
                            <option value="N7">N7</option>
                            <option value="N8">N8</option>
                            <option value="N9">N9</option>
                            <option value="N10">N10</option>
                            <option value="N11">N11</option>
                          </select>
                        </div>
                        <div className="col-span-1">
                          <select
                            value={exam.visualAcuityNearCcLeft}
                            onChange={(e) => setExam({ ...exam, visualAcuityNearCcLeft: e.target.value })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="">--Select--</option>
                            <option value="N4">N4</option>
                            <option value="N5">N5</option>
                            <option value="N6">N6</option>
                            <option value="N7">N7</option>
                            <option value="N8">N8</option>
                            <option value="N9">N9</option>
                            <option value="N10">N10</option>
                            <option value="N11">N11</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
                     {/* Visual Acuity notes removed per HTML-only fields */}
                  </div>
                </div>
              </div>


              {/* Right Column */}
              <div className="space-y-6">
                {/* Refraction Table */}
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <div className="bg-green-50 px-4 py-2 border-b border-gray-300">
                    <h3 className="text-sm font-medium text-gray-900 text-center">Refraction</h3>
                  </div>
                  <div className="p-4">
                    <div className="mb-4">
                      <div className="text-sm font-medium text-gray-700 mb-2">Autorefractor</div>
                      <div className="grid grid-cols-4 gap-2 mb-2 text-xs font-medium text-gray-700">
                        <div className="col-span-1"></div>
                        <div className="col-span-1 text-center">Sphere</div>
                        <div className="col-span-1 text-center">Cylinder</div>
                        <div className="col-span-1 text-center">Axis</div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-2 mb-2">
                        <div className="col-span-1 text-center text-sm font-medium">R</div>
                        <div className="col-span-1">
                          <input
                            type="number"
                            step="0.25"
                            value={exam.manifestAutoRightSphere}
                            onChange={(e) => setExam({ ...exam, manifestAutoRightSphere: e.target.value })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="0.00"
                          />
                        </div>
                        <div className="col-span-1">
                          <input
                            type="number"
                            step="0.25"
                            value={exam.manifestAutoRightCylinder}
                            onChange={(e) => setExam({ ...exam, manifestAutoRightCylinder: e.target.value })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="0.00"
                          />
                        </div>
                        <div className="col-span-1">
                          <input
                            type="number"
                            step="1"
                            min="0"
                            max="180"
                            value={exam.manifestAutoRightAxis}
                            onChange={(e) => setExam({ ...exam, manifestAutoRightAxis: e.target.value })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="0"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-2 mb-4">
                        <div className="col-span-1 text-center text-sm font-medium">L</div>
                        <div className="col-span-1">
                          <input
                            type="number"
                            step="0.25"
                            value={exam.manifestAutoLeftSphere}
                            onChange={(e) => setExam({ ...exam, manifestAutoLeftSphere: e.target.value })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="0.00"
                          />
                        </div>
                        <div className="col-span-1">
                          <input
                            type="number"
                            step="0.25"
                            value={exam.manifestAutoLeftCylinder}
                            onChange={(e) => setExam({ ...exam, manifestAutoLeftCylinder: e.target.value })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="0.00"
                          />
                        </div>
                        <div className="col-span-1">
                          <input
                            type="number"
                            step="1"
                            min="0"
                            max="180"
                            value={exam.manifestAutoLeftAxis}
                            onChange={(e) => setExam({ ...exam, manifestAutoLeftAxis: e.target.value })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="text-sm font-medium text-gray-700 mb-2">Keratometry</div>
                      <div className="grid grid-cols-4 gap-2 mb-2 text-xs font-medium text-gray-700">
                        <div className="col-span-1"></div>
                        <div className="col-span-1 text-center">K1</div>
                        <div className="col-span-1 text-center">K2</div>
                        <div className="col-span-1 text-center">Axis</div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-2 mb-2">
                        <div className="col-span-1 text-center text-sm font-medium">R</div>
                        <div className="col-span-1">
                          <input
                            type="number"
                            step="0.01"
                            value={exam.keratometryK1Right || ''}
                            onChange={(e) => setExam({ ...exam, keratometryK1Right: e.target.value })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="0.00"
                          />
                        </div>
                        <div className="col-span-1">
                          <input
                            type="number"
                            step="0.01"
                            value={exam.keratometryK2Right || ''}
                            onChange={(e) => setExam({ ...exam, keratometryK2Right: e.target.value })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="0.00"
                          />
                        </div>
                        <div className="col-span-1">
                          <input
                            type="number"
                            step="1"
                            min="0"
                            max="180"
                            value={exam.keratometryAxisRight || ''}
                            onChange={(e) => setExam({ ...exam, keratometryAxisRight: e.target.value })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="0"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-2 mb-4">
                        <div className="col-span-1 text-center text-sm font-medium">L</div>
                        <div className="col-span-1">
                          <input
                            type="number"
                            step="0.01"
                            value={exam.keratometryK1Left || ''}
                            onChange={(e) => setExam({ ...exam, keratometryK1Left: e.target.value })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="0.00"
                          />
                        </div>
                        <div className="col-span-1">
                          <input
                            type="number"
                            step="0.01"
                            value={exam.keratometryK2Left || ''}
                            onChange={(e) => setExam({ ...exam, keratometryK2Left: e.target.value })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="0.00"
                          />
                        </div>
                        <div className="col-span-1">
                          <input
                            type="number"
                            step="1"
                            min="0"
                            max="180"
                            value={exam.keratometryAxisLeft || ''}
                            onChange={(e) => setExam({ ...exam, keratometryAxisLeft: e.target.value })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="text-sm font-medium text-gray-700 mb-2">Retinoscope</div>
                      <div className="grid grid-cols-4 gap-2 mb-2 text-xs font-medium text-gray-700">
                        <div className="col-span-1"></div>
                        <div className="col-span-1 text-center">Sphere</div>
                        <div className="col-span-1 text-center">Cylinder</div>
                        <div className="col-span-1 text-center">Axis</div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-2 mb-2">
                        <div className="col-span-1 text-center text-sm font-medium">R</div>
                        <div className="col-span-1">
                          <input
                            type="number"
                            step="0.25"
                            value={exam.manifestRetRightSphere}
                            onChange={(e) => setExam({ ...exam, manifestRetRightSphere: e.target.value })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="0.00"
                          />
                        </div>
                        <div className="col-span-1">
                          <input
                            type="number"
                            step="0.25"
                            value={exam.manifestRetRightCylinder}
                            onChange={(e) => setExam({ ...exam, manifestRetRightCylinder: e.target.value })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="0.00"
                          />
                        </div>
                        <div className="col-span-1">
                          <input
                            type="number"
                            step="1"
                            min="0"
                            max="180"
                            value={exam.manifestRetRightAxis}
                            onChange={(e) => setExam({ ...exam, manifestRetRightAxis: e.target.value })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="0"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-2 mb-4">
                        <div className="col-span-1 text-center text-sm font-medium">L</div>
                        <div className="col-span-1">
                          <input
                            type="number"
                            step="0.25"
                            value={exam.manifestRetLeftSphere}
                            onChange={(e) => setExam({ ...exam, manifestRetLeftSphere: e.target.value })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="0.00"
                          />
                        </div>
                        <div className="col-span-1">
                          <input
                            type="number"
                            step="0.25"
                            value={exam.manifestRetLeftCylinder}
                            onChange={(e) => setExam({ ...exam, manifestRetLeftCylinder: e.target.value })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="0.00"
                          />
                        </div>
                        <div className="col-span-1">
                          <input
                            type="number"
                            step="1"
                            min="0"
                            max="180"
                            value={exam.manifestRetLeftAxis}
                            onChange={(e) => setExam({ ...exam, manifestRetLeftAxis: e.target.value })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="text-sm font-medium text-gray-700 mb-2">Subjective</div>
                      <div className="grid grid-cols-4 gap-2 mb-2 text-xs font-medium text-gray-700">
                        <div className="col-span-1"></div>
                        <div className="col-span-1 text-center">Sphere</div>
                        <div className="col-span-1 text-center">Cylinder</div>
                        <div className="col-span-1 text-center">Axis</div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-2 mb-2">
                        <div className="col-span-1 text-center text-sm font-medium">R</div>
                        <div className="col-span-1">
                          <input
                            type="number"
                            step="0.25"
                            value={exam.subjectiveRightSphere}
                            onChange={(e) => setExam({ ...exam, subjectiveRightSphere: e.target.value })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="0.00"
                          />
                        </div>
                        <div className="col-span-1">
                          <input
                            type="number"
                            step="0.25"
                            value={exam.subjectiveRightCylinder}
                            onChange={(e) => setExam({ ...exam, subjectiveRightCylinder: e.target.value })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="0.00"
                          />
                        </div>
                        <div className="col-span-1">
                          <input
                            type="number"
                            step="1"
                            min="0"
                            max="180"
                            value={exam.subjectiveRightAxis}
                            onChange={(e) => setExam({ ...exam, subjectiveRightAxis: e.target.value })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="0"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-2">
                        <div className="col-span-1 text-center text-sm font-medium">L</div>
                        <div className="col-span-1">
                          <input
                            type="number"
                            step="0.25"
                            value={exam.subjectiveLeftSphere}
                            onChange={(e) => setExam({ ...exam, subjectiveLeftSphere: e.target.value })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="0.00"
                          />
                        </div>
                        <div className="col-span-1">
                          <input
                            type="number"
                            step="0.25"
                            value={exam.subjectiveLeftCylinder}
                            onChange={(e) => setExam({ ...exam, subjectiveLeftCylinder: e.target.value })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="0.00"
                          />
                        </div>
                        <div className="col-span-1">
                          <input
                            type="number"
                            step="1"
                            min="0"
                            max="180"
                            value={exam.subjectiveLeftAxis}
                            onChange={(e) => setExam({ ...exam, subjectiveLeftAxis: e.target.value })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="text-sm font-medium text-gray-700 mb-2">Add</div>
                      <input
                        type="text"
                        value={exam.addedValues}
                        onChange={(e) => setExam({ ...exam, addedValues: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="e.g., +1.50 for reading"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Best Vision Right Eye</label>
                        <select
                          value={exam.bestRightVision}
                          onChange={(e) => setExam({ ...exam, bestRightVision: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="">--Select--</option>
                          <option value="6/4">6/4</option>
                          <option value="6/5">6/5</option>
                          <option value="6/6">6/6</option>
                          <option value="6/9">6/9</option>
                          <option value="6/12">6/12</option>
                          <option value="6/18">6/18</option>
                          <option value="6/24">6/24</option>
                          <option value="6/36">6/36</option>
                          <option value="6/60">6/60</option>
                          <option value="5/60">5/60</option>
                          <option value="4/60">4/60</option>
                          <option value="3/60">3/60</option>
                          <option value="2/60">2/60</option>
                          <option value="1/60">1/60</option>
                          <option value="HM">HM</option>
                          <option value="PL">PL</option>
                          <option value="NPL">NPL</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Best Vision Left Eye</label>
                        <select
                          value={exam.bestLeftVision}
                          onChange={(e) => setExam({ ...exam, bestLeftVision: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="">--Select--</option>
                          <option value="6/4">6/4</option>
                          <option value="6/5">6/5</option>
                          <option value="6/6">6/6</option>
                          <option value="6/9">6/9</option>
                          <option value="6/12">6/12</option>
                          <option value="6/18">6/18</option>
                          <option value="6/24">6/24</option>
                          <option value="6/36">6/36</option>
                          <option value="6/60">6/60</option>
                          <option value="5/60">5/60</option>
                          <option value="4/60">4/60</option>
                          <option value="3/60">3/60</option>
                          <option value="2/60">2/60</option>
                          <option value="1/60">1/60</option>
                          <option value="HM">HM</option>
                          <option value="PL">PL</option>
                          <option value="NPL">NPL</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">PD for Right Eye</label>
                        <input
                          type="text"
                          value={String(exam.pdRightEye ?? '')}
                          onChange={(e) => setExam({ ...exam, pdRightEye: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">PD for Left Eye</label>
                        <input
                          type="text"
                          value={String(exam.pdLeftEye ?? '')}
                          onChange={(e) => setExam({ ...exam, pdLeftEye: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            

            {/* Enhanced Measurements removed per HTML-only fields */}
            {false && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Enhanced Measurements</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pupil Measurements */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-800">Pupil Measurements</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Right Eye Size</label>
                      <input
                        type="number"
                        step="0.1"
                        value={exam.pupilSizeRight || ''}
                        onChange={(e) => setExam({ ...exam, pupilSizeRight: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="4.5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Left Eye Size</label>
                      <input
                        type="number"
                        step="0.1"
                        value={exam.pupilSizeLeft || ''}
                        onChange={(e) => setExam({ ...exam, pupilSizeLeft: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="4.5"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                    <select
                      value={exam.pupilSizeUnit}
                      onChange={(e) => setExam({ ...exam, pupilSizeUnit: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="mm">mm</option>
                      <option value="cm">cm</option>
                    </select>
                  </div>
                </div>

                {/* Intraocular Pressure */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-800">Intraocular Pressure (IOP)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Right Eye (mmHg)</label>
                      <input
                        type="number"
                        step="1"
                        min="5"
                        max="50"
                        value={exam.iopRight || ''}
                        onChange={(e) => setExam({ ...exam, iopRight: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="16"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Left Eye (mmHg)</label>
                      <input
                        type="number"
                        step="1"
                        min="5"
                        max="50"
                        value={exam.iopLeft || ''}
                        onChange={(e) => setExam({ ...exam, iopLeft: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="16"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
                    <select
                      value={exam.iopMethod}
                      onChange={(e) => setExam({ ...exam, iopMethod: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">--Select--</option>
                      <option value="GOLDMANN_TONOMETRY">Goldmann Tonometry</option>
                      <option value="NON_CONTACT_TONOMETRY">Non-Contact Tonometry</option>
                      <option value="APPLANATION_TONOMETRY">Applanation Tonometry</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* Color Vision Testing */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-800">Color Vision Testing</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Right Eye</label>
                      <select
                        value={exam.colorVisionRight}
                        onChange={(e) => setExam({ ...exam, colorVisionRight: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">--Select--</option>
                        <option value="Normal">Normal</option>
                        <option value="Color Deficient">Color Deficient</option>
                        <option value="Unable to Test">Unable to Test</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Left Eye</label>
                      <select
                        value={exam.colorVisionLeft}
                        onChange={(e) => setExam({ ...exam, colorVisionLeft: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">--Select--</option>
                        <option value="Normal">Normal</option>
                        <option value="Color Deficient">Color Deficient</option>
                        <option value="Unable to Test">Unable to Test</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Test Used</label>
                    <select
                      value={exam.colorVisionTest}
                      onChange={(e) => setExam({ ...exam, colorVisionTest: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">--Select--</option>
                      <option value="ISHIHARA">Ishihara</option>
                      <option value="FARNSWORTH">Farnsworth</option>
                      <option value="HARDY_RAND_RITTLER">Hardy-Rand-Rittler</option>
                    </select>
                  </div>
                </div>

                {/* Stereopsis and Near Addition */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-800">Stereopsis & Near Addition</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stereopsis (arcseconds)</label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={exam.stereopsis || ''}
                      onChange={(e) => setExam({ ...exam, stereopsis: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="40"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Near Addition Right</label>
                      <input
                        type="number"
                        step="0.25"
                        value={exam.nearAdditionRight || ''}
                        onChange={(e) => setExam({ ...exam, nearAdditionRight: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="1.50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Near Addition Left</label>
                      <input
                        type="number"
                        step="0.25"
                        value={exam.nearAdditionLeft || ''}
                        onChange={(e) => setExam({ ...exam, nearAdditionLeft: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="1.50"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            )}
            

            {/* Clinical Assessment removed per HTML-only fields */}
            {false && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Clinical Assessment</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Clinical Assessment</label>
                  <textarea
                    value={exam.clinicalAssessment}
                    onChange={(e) => setExam({ ...exam, clinicalAssessment: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Describe the clinical assessment findings..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis</label>
                  <input
                    type="text"
                    value={exam.diagnosis}
                    onChange={(e) => setExam({ ...exam, diagnosis: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g., Myopia with astigmatism and presbyopia"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Treatment Plan</label>
                  <textarea
                    value={exam.treatmentPlan}
                    onChange={(e) => setExam({ ...exam, treatmentPlan: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Describe the recommended treatment plan..."
                  />
                </div>
              </div>
            </div>
            )}
            

            {/* Equipment Tracking removed per HTML-only fields */}
            {false && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Equipment Tracking</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Equipment Used</label>
                  <input
                    type="text"
                    value={exam.equipmentUsed}
                    onChange={(e) => setExam({ ...exam, equipmentUsed: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g., Autorefractor, Keratometer, Tonometer, Color Vision Test"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Equipment Calibration Date</label>
                  <input
                    type="date"
                    value={exam.equipmentCalibrationDate}
                    onChange={(e) => setExam({ ...exam, equipmentCalibrationDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            )}

            

            {/* Comments Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Comments</label>
              <textarea
                value={exam.comment}
                onChange={(e) => setExam({ ...exam, comment: e.target.value })}
                rows={10}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter examination comments and recommendations..."
              />
            </div>

            

            {/* Form Actions */}
            <div className="flex justify-end space-x-4">
              <button
                type="reset"
                onClick={() => router.back()}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <LoadingButton
                type="submit"
                loading={isCreating}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <Save className="h-4 w-4 mr-2" />
                {isCreating ? 'Submitting...' : 'Submit'}
              </LoadingButton>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
