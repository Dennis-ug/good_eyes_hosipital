'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Save, Eye, User, UserCheck, Activity, Target } from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import { LoadingPage } from '@/components/loading-page'
import { LoadingButton } from '@/components/loading-button'
import { basicRefractionExamApi, patientVisitSessionApi } from '@/lib/api'
import { BasicRefractionExam, CreateBasicRefractionExamRequest, PatientVisitSession, EmergencyLevel, VisitStage, VisitStatus, VisitPurpose } from '@/lib/types'

export default function EditBasicRefractionExamPage() {
  const router = useRouter()
  const params = useParams()
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
    stereopsisUnit: 'arc seconds',
    nearAdditionRight: '',
    nearAdditionLeft: '',
    clinicalAssessment: '',
    diagnosis: '',
    treatmentPlan: '',
    equipmentUsed: '',
    equipmentCalibrationDate: ''
  })
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [visitSessions, setVisitSessions] = useState<PatientVisitSession[]>([])
  const [selectedSession, setSelectedSession] = useState<PatientVisitSession | null>(null)

  const examId = params.id ? parseInt(params.id as string) : null 

  // No patient lookup needed on edit; patient info comes from exam payload

  // Fetch exam data
  const fetchExam = async () => {
    if (!examId) return

    try {
      setIsLoading(true)
      console.log('Fetching basic refraction exam for editing with ID:', examId)
      const data = await basicRefractionExamApi.getById(examId)
      console.log('Basic refraction exam data received for editing:', data)
      
      // Map the exam data to the form state
      console.log('Setting exam data:', data)
      const examData = {
        visitSessionId: data.visitSessionId,
        neuroOriented: data.neuroOriented || false,
        neuroMood: data.neuroMood || '',
        neuroPsychNotes: data.neuroPsychNotes || '',
        pupilsPerrl: data.pupilsPerrl || false,
        pupilsRightDark: data.pupilsRightDark || '',
        pupilsLeftDark: data.pupilsLeftDark || '',
        pupilsRightLight: data.pupilsRightLight || '',
        pupilsLeftLight: data.pupilsLeftLight || '',
        pupilsRightShape: data.pupilsRightShape || '',
        pupilsLeftShape: data.pupilsLeftShape || '',
        pupilsRightReact: data.pupilsRightReact || '',
        pupilsLeftReact: data.pupilsLeftReact || '',
        pupilsRightApd: data.pupilsRightApd || '',
        pupilsLeftApd: data.pupilsLeftApd || '',
        pupilsNotes: data.pupilsNotes || '',
        visualAcuityDistanceScRight: data.visualAcuityDistanceScRight || '',
        visualAcuityDistanceScLeft: data.visualAcuityDistanceScLeft || '',
        visualAcuityDistancePhRight: data.visualAcuityDistancePhRight || '',
        visualAcuityDistancePhLeft: data.visualAcuityDistancePhLeft || '',
        visualAcuityDistanceCcRight: data.visualAcuityDistanceCcRight || '',
        visualAcuityDistanceCcLeft: data.visualAcuityDistanceCcLeft || '',
        visualAcuityNearScRight: data.visualAcuityNearScRight || '',
        visualAcuityNearScLeft: data.visualAcuityNearScLeft || '',
        visualAcuityNearCcRight: data.visualAcuityNearCcRight || '',
        visualAcuityNearCcLeft: data.visualAcuityNearCcLeft || '',
        visualAcuityNotes: data.visualAcuityNotes || '',
        manifestAutoRightSphere: data.manifestAutoRightSphere?.toString() || '',
        manifestAutoRightCylinder: data.manifestAutoRightCylinder?.toString() || '',
        manifestAutoRightAxis: data.manifestAutoRightAxis?.toString() || '',
        manifestAutoLeftSphere: data.manifestAutoLeftSphere?.toString() || '',
        manifestAutoLeftCylinder: data.manifestAutoLeftCylinder?.toString() || '',
        manifestAutoLeftAxis: data.manifestAutoLeftAxis?.toString() || '',
        manifestRetRightSphere: data.manifestRetRightSphere?.toString() || '',
        manifestRetRightCylinder: data.manifestRetRightCylinder?.toString() || '',
        manifestRetRightAxis: data.manifestRetRightAxis?.toString() || '',
        manifestRetLeftSphere: data.manifestRetLeftSphere?.toString() || '',
        manifestRetLeftCylinder: data.manifestRetLeftCylinder?.toString() || '',
        manifestRetLeftAxis: data.manifestRetLeftAxis?.toString() || '',
        subjectiveRightSphere: data.subjectiveRightSphere?.toString() || '',
        subjectiveRightCylinder: data.subjectiveRightCylinder?.toString() || '',
        subjectiveRightAxis: data.subjectiveRightAxis?.toString() || '',
        subjectiveLeftSphere: data.subjectiveLeftSphere?.toString() || '',
        subjectiveLeftCylinder: data.subjectiveLeftCylinder?.toString() || '',
        subjectiveLeftAxis: data.subjectiveLeftAxis?.toString() || '',
        addedValues: data.addedValues || '',
        bestRightVision: data.bestRightVision || '',
        bestLeftVision: data.bestLeftVision || '',
        pdRightEye: data.pdRightEye?.toString() || '',
        pdLeftEye: data.pdLeftEye?.toString() || '',
        refractionNotes: data.refractionNotes || '',
        comment: data.comment || '',
        examinedBy: data.examinedBy || '',
        keratometryK1Right: data.keratometryK1Right?.toString() || '',
        keratometryK2Right: data.keratometryK2Right?.toString() || '',
        keratometryAxisRight: data.keratometryAxisRight?.toString() || '',
        keratometryK1Left: data.keratometryK1Left?.toString() || '',
        keratometryK2Left: data.keratometryK2Left?.toString() || '',
        keratometryAxisLeft: data.keratometryAxisLeft?.toString() || '',
        pupilSizeRight: data.pupilSizeRight?.toString() || '',
        pupilSizeLeft: data.pupilSizeLeft?.toString() || '',
        pupilSizeUnit: data.pupilSizeUnit || 'mm',
        iopRight: data.iopRight?.toString() || '',
        iopLeft: data.iopLeft?.toString() || '',
        iopMethod: data.iopMethod || '',
        colorVisionRight: data.colorVisionRight || '',
        colorVisionLeft: data.colorVisionLeft || '',
        colorVisionTest: data.colorVisionTest || '',
        stereopsis: data.stereopsis?.toString() || '',
        stereopsisUnit: data.stereopsisUnit || 'arc seconds',
        nearAdditionRight: data.nearAdditionRight?.toString() || '',
        nearAdditionLeft: data.nearAdditionLeft?.toString() || '',
        clinicalAssessment: data.clinicalAssessment || '',
        diagnosis: data.diagnosis || '',
        treatmentPlan: data.treatmentPlan || '',
        equipmentUsed: data.equipmentUsed || '',
        equipmentCalibrationDate: data.equipmentCalibrationDate || '',
        patientName: data.patientName || '',
        patientPhone: data.patientPhone || ''
      }
      
      setExam(examData)
      console.log('Exam state set:', examData)
      
      // Set the selected session
      const session = visitSessions.find(s => s.id === data.visitSessionId)
      if (session) {
        setSelectedSession(session)
      } else {
        // If session not found in current list, create a temporary one
        console.log('Visit session not found in list, creating temporary session')
        const tempSession: PatientVisitSession = {
          id: data.visitSessionId,
          patientId: 0, // Will be updated when patients are loaded
          patientName: 'Loading...',
          consultationFeeAmount: 0,
          emergencyLevel: EmergencyLevel.NONE,
          requiresTriage: false,
          requiresDoctorVisit: false,
          isEmergency: false,
          currentStage: VisitStage.TRIAGE,
          status: VisitStatus.TRIAGE_COMPLETED,
          visitDate: new Date().toISOString(),
          visitPurpose: VisitPurpose.NEW_CONSULTATION,
          consultationFeePaid: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'system',
          updatedBy: 'system'
        }
        setSelectedSession(tempSession)
      }
      
      setIsDemoMode(false)
    } catch (error) {
      console.error('Failed to fetch basic refraction exam for editing:', error)
      
      // Check if it's a 404 error (exam not found or API not available)
      if (error instanceof Error && (
        error.message.includes('404') ||
        error.message.includes('Failed to fetch') ||
        error.message.includes('NetworkError')
      )) {
        console.log('API not available or exam not found, using demo mode for editing')
        setIsDemoMode(true)
        
        // Set demo data
        setExam({
          visitSessionId: 1,
          neuroOriented: true,
          neuroMood: 'Alert and cooperative',
          neuroPsychNotes: 'Patient is alert and oriented to time, place, and person',
          pupilsPerrl: true,
          pupilsRightDark: '4.5',
          pupilsLeftDark: '4.5',
          pupilsRightLight: '3.0',
          pupilsLeftLight: '3.0',
          pupilsRightShape: 'Round',
          pupilsLeftShape: 'Round',
          pupilsRightReact: 'Brisk',
          pupilsLeftReact: 'Brisk',
          pupilsRightApd: 'Negative',
          pupilsLeftApd: 'Negative',
          pupilsNotes: 'Pupils are equal, round, and reactive to light',
          visualAcuityDistanceScRight: '20/20',
          visualAcuityDistanceScLeft: '20/25',
          visualAcuityDistancePhRight: '20/20',
          visualAcuityDistancePhLeft: '20/25',
          visualAcuityDistanceCcRight: '20/20',
          visualAcuityDistanceCcLeft: '20/20',
          visualAcuityNearScRight: 'J1',
          visualAcuityNearScLeft: 'J2',
          visualAcuityNearCcRight: 'J1',
          visualAcuityNearCcLeft: 'J1',
          visualAcuityNotes: 'Distance vision improved with correction',
          manifestAutoRightSphere: '-1.25',
          manifestAutoRightCylinder: '-0.50',
          manifestAutoRightAxis: '90',
          manifestAutoLeftSphere: '-1.00',
          manifestAutoLeftCylinder: '-0.25',
          manifestAutoLeftAxis: '85',
          manifestRetRightSphere: '-1.50',
          manifestRetRightCylinder: '-0.75',
          manifestRetRightAxis: '88',
          manifestRetLeftSphere: '-1.25',
          manifestRetLeftCylinder: '-0.50',
          manifestRetLeftAxis: '82',
          subjectiveRightSphere: '-1.25',
          subjectiveRightCylinder: '-0.50',
          subjectiveRightAxis: '90',
          subjectiveLeftSphere: '-1.00',
          subjectiveLeftCylinder: '-0.25',
          subjectiveLeftAxis: '85',
          addedValues: '+1.50',
          bestRightVision: '20/20',
          bestLeftVision: '20/20',
          pdRightEye: '32.0',
          pdLeftEye: '32.0',
          refractionNotes: 'Patient shows mild myopia with astigmatism',
          comment: 'Recommend prescription glasses',
          examinedBy: 'Dr. Smith',
          keratometryK1Right: '43.50',
          keratometryK2Right: '44.25',
          keratometryAxisRight: '90',
          keratometryK1Left: '43.75',
          keratometryK2Left: '44.00',
          keratometryAxisLeft: '85',
          pupilSizeRight: '4.5',
          pupilSizeLeft: '4.5',
          pupilSizeUnit: 'mm',
          iopRight: '16',
          iopLeft: '15',
          iopMethod: 'Goldmann',
          colorVisionRight: 'Normal',
          colorVisionLeft: 'Normal',
          colorVisionTest: 'Ishihara',
          stereopsis: '40',
          stereopsisUnit: 'arc seconds',
          nearAdditionRight: '1.50',
          nearAdditionLeft: '1.50',
          clinicalAssessment: 'Patient has mild myopia with astigmatism. No signs of pathology.',
          diagnosis: 'Myopia with astigmatism',
          treatmentPlan: 'Prescribe corrective lenses. Follow up in 6 months.',
          equipmentUsed: 'Auto-refractor, Phoropter, Trial lenses',
          equipmentCalibrationDate: '2025-01-01'
        })
      } else {
        alert('Failed to load basic refraction exam for editing. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch visit sessions
  const fetchData = async () => {
    try {
      console.log('Fetching visit sessions for edit form')
      const sessionsResponse = await patientVisitSessionApi.getAllVisitSessions({ page: 0, size: 1000 })
      setVisitSessions(sessionsResponse.content || [])
      console.log('Visit sessions loaded for edit form')
    } catch (error) {
      console.error('Failed to fetch visit sessions for edit form:', error)
      // Continue with empty array
    }
  }



  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsSaving(true)
      console.log('Updating basic refraction exam with data:', exam)
      
      const result = await basicRefractionExamApi.update(examId!, { ...exam, id: examId! })
      console.log('Basic refraction exam updated successfully:', result)
      
      // Check if it's demo mode
      if (result.createdBy === 'demo') {
        alert('Basic refraction exam updated successfully! (Demo Mode - Backend API not available)')
      } else {
        alert('Basic refraction exam updated successfully!')
      }
      
      router.push(`/dashboard/basic-refraction-exams/${examId}`)
    } catch (error) {
      console.error('Failed to update basic refraction exam:', error)
      
      // Enhanced error handling
      let errorMessage = 'Failed to update basic refraction exam'
      if (error instanceof Error) {
        errorMessage = error.message
        
        // Check for specific error types
        if (error.message.includes('404')) {
          errorMessage = 'Basic refraction exam not found or API endpoint not available.'
        } else if (error.message.includes('401') || error.message.includes('403')) {
          errorMessage = 'You do not have permission to update basic refraction exams.'
        } else if (error.message.includes('400')) {
          errorMessage = 'Invalid data provided. Please check your input.'
        } else if (error.message.includes('500')) {
          errorMessage = 'Server error. Please try again later.'
        }
      }
      
      console.error('Error details:', errorMessage)
      alert(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  // Handle input changes
  const handleInputChange = (field: keyof CreateBasicRefractionExamRequest, value: string | number | boolean) => {
    setExam(prev => ({ ...prev, [field]: value }))
  }



  // Initialize data
  useEffect(() => {
    fetchData()
    fetchExam()
  }, [examId])

  // When visit sessions load, bind the real session to replace any temporary placeholder
  useEffect(() => {
    if (visitSessions.length > 0 && exam.visitSessionId) {
      const session = visitSessions.find(s => s.id === exam.visitSessionId)
      if (session && (!selectedSession || selectedSession.patientName === 'Loading...')) {
        setSelectedSession(session)
      }
    }
  }, [visitSessions, exam.visitSessionId])

  // Debug: Log exam state changes
  useEffect(() => {
    console.log('Exam state updated:', exam)
  }, [exam])

  if (isLoading) {
    return <LoadingPage message="Loading basic refraction exam for editing..." />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={() => router.back()} className="p-2 text-gray-400 hover:text-gray-600">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Basic Refraction Exam</h1>
            <p className="text-gray-600">Exam #{examId}</p>
            {isDemoMode && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  <strong>Demo Mode:</strong> Backend API not available. Showing sample data.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Visit Session Information - Top of Form */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <User className="h-4 w-4 text-blue-600" />
          </div>
          <h2 className="text-lg font-medium text-blue-900">Patient & Visit Information</h2>
        </div>
        
        {selectedSession ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-3 rounded-md border border-blue-100">
              <label className="block text-xs font-medium text-blue-600 uppercase tracking-wide">Visit Session ID</label>
              <p className="mt-1 text-lg font-semibold text-gray-900">#{selectedSession.id}</p>
            </div>
            <div className="bg-white p-3 rounded-md border border-blue-100">
              <label className="block text-xs font-medium text-blue-600 uppercase tracking-wide">Patient Name</label>
              <p className="mt-1 text-lg font-semibold text-gray-900">{selectedSession.patientName || exam.patientName || 'Not available'}</p>
            </div>
            <div className="bg-white p-3 rounded-md border border-blue-100">
              <label className="block text-xs font-medium text-blue-600 uppercase tracking-wide">Patient Phone</label>
              <p className="mt-1 text-lg font-semibold text-gray-900">{exam.patientPhone || 'Not available'}</p>
            </div>
            <div className="bg-white p-3 rounded-md border border-blue-100">
              <label className="block text-xs font-medium text-blue-600 uppercase tracking-wide">Current Stage</label>
              <p className="mt-1 text-lg font-semibold text-gray-900">{selectedSession.currentStage}</p>
            </div>
            <div className="bg-white p-3 rounded-md border border-blue-100">
              <label className="block text-xs font-medium text-blue-600 uppercase tracking-wide">Visit Purpose</label>
              <p className="mt-1 text-lg font-semibold text-gray-900">{selectedSession.visitPurpose}</p>
            </div>
            <div className="bg-white p-3 rounded-md border border-blue-100">
              <label className="block text-xs font-medium text-blue-600 uppercase tracking-wide">Visit Status</label>
              <p className="mt-1 text-lg font-semibold text-gray-900">{selectedSession.status}</p>
            </div>
            <div className="bg-white p-3 rounded-md border border-blue-100">
              <label className="block text-xs font-medium text-blue-600 uppercase tracking-wide">Visit Date</label>
              <p className="mt-1 text-lg font-semibold text-gray-900">{new Date(selectedSession.visitDate).toLocaleString()}</p>
            </div>
            <div className="bg-white p-3 rounded-md border border-blue-100">
              <label className="block text-xs font-medium text-blue-600 uppercase tracking-wide">Consultation Fee Paid</label>
              <p className="mt-1 text-lg font-semibold text-gray-900">{selectedSession.consultationFeePaid ? 'Yes' : 'No'}</p>
            </div>
            <div className="bg-white p-3 rounded-md border border-blue-100">
              <label className="block text-xs font-medium text-blue-600 uppercase tracking-wide">Payment Method</label>
              <p className="mt-1 text-lg font-semibold text-gray-900">{selectedSession.paymentMethod || 'N/A'}</p>
            </div>
            <div className="bg-white p-3 rounded-md border border-blue-100">
              <label className="block text-xs font-medium text-blue-600 uppercase tracking-wide">Exam ID</label>
              <p className="mt-1 text-lg font-semibold text-gray-900">#{examId}</p>
            </div>
            <div className="bg-white p-3 rounded-md border border-blue-100">
              <label className="block text-xs font-medium text-blue-600 uppercase tracking-wide">Examined By</label>
              <p className="mt-1 text-lg font-semibold text-gray-900">{exam.examinedBy || 'Not specified'}</p>
            </div>
          </div>
        ) : (
          <div className="bg-white p-4 rounded-md border border-blue-100">
            <p className="text-gray-600">Loading visit session information...</p>
            <p className="text-sm text-gray-500 mt-1">Visit Session ID: {exam.visitSessionId}</p>
            <p className="text-sm text-gray-500 mt-1">Patient Name: {exam.patientName || 'Loading...'}</p>
            <p className="text-sm text-gray-500 mt-1">Patient Phone: {exam.patientPhone || 'Loading...'}</p>
          </div>
        )}
      </div>

      {/* Debug Information removed per HTML-only requirement */}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Neuro/Psych Assessment */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
              <UserCheck className="h-4 w-4 text-green-600" />
            </div>
            <h2 className="text-lg font-medium text-gray-900">Neuro/Psych Assessment</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <input
                  type="checkbox"
                  checked={exam.neuroOriented}
                  onChange={(e) => handleInputChange('neuroOriented', e.target.checked)}
                  className="mr-2"
                />
                Neuro Oriented
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mood/Affect</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleInputChange('neuroMood', 'nl')}
                  className="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm bg-white hover:bg-gray-50"
                >
                  nl
                </button>
                <input
                  type="text"
                  value={exam.neuroMood}
                  onChange={(e) => handleInputChange('neuroMood', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            {/* Neuro/Psych notes removed per HTML */}
          </div>
        </div>

        {/* Pupils Assessment */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
              <Target className="h-4 w-4 text-purple-600" />
            </div>
            <h2 className="text-lg font-medium text-gray-900">Pupils Assessment</h2>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <input
                type="checkbox"
                checked={exam.pupilsPerrl}
                onChange={(e) => handleInputChange('pupilsPerrl', e.target.checked)}
                className="mr-2"
              />
              PERRL (Pupils Equal, Round, Reactive to Light)
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-md font-medium text-gray-800 mb-3">Right Eye</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dark (mm)</label>
                  <input
                    type="text"
                    value={exam.pupilsRightDark}
                    onChange={(e) => handleInputChange('pupilsRightDark', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 4.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Light (mm)</label>
                  <input
                    type="text"
                    value={exam.pupilsRightLight}
                    onChange={(e) => handleInputChange('pupilsRightLight', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 3.0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Shape</label>
                  <input
                    type="text"
                    value={exam.pupilsRightShape}
                    onChange={(e) => handleInputChange('pupilsRightShape', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Round"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reaction</label>
                  <input
                    type="text"
                    value={exam.pupilsRightReact}
                    onChange={(e) => handleInputChange('pupilsRightReact', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Brisk"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">APD</label>
                  <input
                    type="text"
                    value={exam.pupilsRightApd}
                    onChange={(e) => handleInputChange('pupilsRightApd', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-md font-medium text-gray-800 mb-3">Left Eye</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dark (mm)</label>
                  <input
                    type="text"
                    value={exam.pupilsLeftDark}
                    onChange={(e) => handleInputChange('pupilsLeftDark', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 4.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Light (mm)</label>
                  <input
                    type="text"
                    value={exam.pupilsLeftLight}
                    onChange={(e) => handleInputChange('pupilsLeftLight', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 3.0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Shape</label>
                  <input
                    type="text"
                    value={exam.pupilsLeftShape}
                    onChange={(e) => handleInputChange('pupilsLeftShape', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Round"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reaction</label>
                  <input
                    type="text"
                    value={exam.pupilsLeftReact}
                    onChange={(e) => handleInputChange('pupilsLeftReact', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Brisk"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">APD</label>
                  <input
                    type="text"
                    value={exam.pupilsLeftApd}
                    onChange={(e) => handleInputChange('pupilsLeftApd', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Pupils notes removed per HTML */}
        </div>

        {/* Visual Acuity (Distance SC/PH/CC and Near SC/CC) */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Eye className="h-4 w-4 text-blue-600" />
            </div>
            <h2 className="text-lg font-medium text-gray-900">Visual Acuity</h2>
          </div>
          {/* Distance */}
          <div className="mb-4">
            <div className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-2 text-gray-700 font-medium">Distance</div>
              <div className="col-span-5 text-gray-700">Right</div>
              <div className="col-span-5 text-gray-700">Left</div>
            </div>
            {/* SC */}
            <div className="grid grid-cols-12 gap-2 items-center mt-2">
              <div className="col-span-2 text-center text-gray-600">sc</div>
              <div className="col-span-5">
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={exam.visualAcuityDistanceScRight}
                  onChange={(e) => handleInputChange('visualAcuityDistanceScRight', e.target.value)}
                >
                  <option value="">--Select--</option>
                  <option value="6/4">6/4</option><option value="6/5">6/5</option><option value="6/6">6/6</option><option value="6/9">6/9</option><option value="6/12">6/12</option><option value="6/18">6/18</option><option value="6/24">6/24</option><option value="6/36">6/36</option><option value="6/60">6/60</option><option value="5/60">5/60</option><option value="4/60">4/60</option><option value="3/60">3/60</option><option value="2/60">2/60</option><option value="1/60">1/60</option><option value="HM">HM</option><option value="PL">PL</option><option value="NPL">NPL</option>
                </select>
              </div>
              <div className="col-span-5">
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={exam.visualAcuityDistanceScLeft}
                  onChange={(e) => handleInputChange('visualAcuityDistanceScLeft', e.target.value)}
                >
                  <option value="">--Select--</option>
                  <option value="6/4">6/4</option><option value="6/5">6/5</option><option value="6/6">6/6</option><option value="6/9">6/9</option><option value="6/12">6/12</option><option value="6/18">6/18</option><option value="6/24">6/24</option><option value="6/36">6/36</option><option value="6/60">6/60</option><option value="5/60">5/60</option><option value="4/60">4/60</option><option value="3/60">3/60</option><option value="2/60">2/60</option><option value="1/60">1/60</option><option value="HM">HM</option><option value="PL">PL</option><option value="NPL">NPL</option>
                </select>
              </div>
            </div>
            {/* PH */}
            <div className="grid grid-cols-12 gap-2 items-center mt-2">
              <div className="col-span-2 text-center text-gray-600">ph</div>
              <div className="col-span-5">
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={exam.visualAcuityDistancePhRight || ''}
                  onChange={(e) => handleInputChange('visualAcuityDistancePhRight', e.target.value)}
                >
                  <option value="">--Select--</option>
                  <option value="6/4">6/4</option><option value="6/5">6/5</option><option value="6/6">6/6</option><option value="6/9">6/9</option><option value="6/12">6/12</option><option value="6/18">6/18</option><option value="6/24">6/24</option><option value="6/36">6/36</option><option value="6/60">6/60</option><option value="5/60">5/60</option><option value="4/60">4/60</option><option value="3/60">3/60</option><option value="2/60">2/60</option><option value="1/60">1/60</option><option value="HM">HM</option><option value="PL">PL</option><option value="NPL">NPL</option>
                </select>
              </div>
              <div className="col-span-5">
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={exam.visualAcuityDistancePhLeft || ''}
                  onChange={(e) => handleInputChange('visualAcuityDistancePhLeft', e.target.value)}
                >
                  <option value="">--Select--</option>
                  <option value="6/4">6/4</option><option value="6/5">6/5</option><option value="6/6">6/6</option><option value="6/9">6/9</option><option value="6/12">6/12</option><option value="6/18">6/18</option><option value="6/24">6/24</option><option value="6/36">6/36</option><option value="6/60">6/60</option><option value="5/60">5/60</option><option value="4/60">4/60</option><option value="3/60">3/60</option><option value="2/60">2/60</option><option value="1/60">1/60</option><option value="HM">HM</option><option value="PL">PL</option><option value="NPL">NPL</option>
                </select>
              </div>
            </div>
            {/* CC */}
            <div className="grid grid-cols-12 gap-2 items-center mt-2">
              <div className="col-span-2 text-center text-gray-600">cc</div>
              <div className="col-span-5">
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={exam.visualAcuityDistanceCcRight}
                  onChange={(e) => handleInputChange('visualAcuityDistanceCcRight', e.target.value)}
                >
                  <option value="">--Select--</option>
                  <option value="6/4">6/4</option><option value="6/5">6/5</option><option value="6/6">6/6</option><option value="6/9">6/9</option><option value="6/12">6/12</option><option value="6/18">6/18</option><option value="6/24">6/24</option><option value="6/36">6/36</option><option value="6/60">6/60</option><option value="5/60">5/60</option><option value="4/60">4/60</option><option value="3/60">3/60</option><option value="2/60">2/60</option><option value="1/60">1/60</option><option value="HM">HM</option><option value="PL">PL</option><option value="NPL">NPL</option>
                </select>
              </div>
              <div className="col-span-5">
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={exam.visualAcuityDistanceCcLeft}
                  onChange={(e) => handleInputChange('visualAcuityDistanceCcLeft', e.target.value)}
                >
                  <option value="">--Select--</option>
                  <option value="6/4">6/4</option><option value="6/5">6/5</option><option value="6/6">6/6</option><option value="6/9">6/9</option><option value="6/12">6/12</option><option value="6/18">6/18</option><option value="6/24">6/24</option><option value="6/36">6/36</option><option value="6/60">6/60</option><option value="5/60">5/60</option><option value="4/60">4/60</option><option value="3/60">3/60</option><option value="2/60">2/60</option><option value="1/60">1/60</option><option value="HM">HM</option><option value="PL">PL</option><option value="NPL">NPL</option>
                </select>
              </div>
            </div>
          </div>
          {/* Near */}
          <div>
            <div className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-2 text-gray-700 font-medium">Near</div>
              <div className="col-span-5 text-gray-700">Right</div>
              <div className="col-span-5 text-gray-700">Left</div>
            </div>
            {/* SC */}
            <div className="grid grid-cols-12 gap-2 items-center mt-2">
              <div className="col-span-2 text-center text-gray-600">sc</div>
              <div className="col-span-5">
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={exam.visualAcuityNearScRight}
                  onChange={(e) => handleInputChange('visualAcuityNearScRight', e.target.value)}
                >
                  <option value="">--Select--</option>
                  <option value="N4">N4</option><option value="N5">N5</option><option value="N6">N6</option><option value="N7">N7</option><option value="N8">N8</option><option value="N9">N9</option><option value="N10">N10</option><option value="N11">N11</option>
                </select>
              </div>
              <div className="col-span-5">
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={exam.visualAcuityNearScLeft}
                  onChange={(e) => handleInputChange('visualAcuityNearScLeft', e.target.value)}
                >
                  <option value="">--Select--</option>
                  <option value="N4">N4</option><option value="N5">N5</option><option value="N6">N6</option><option value="N7">N7</option><option value="N8">N8</option><option value="N9">N9</option><option value="N10">N10</option><option value="N11">N11</option>
                </select>
              </div>
            </div>
            {/* CC */}
            <div className="grid grid-cols-12 gap-2 items-center mt-2">
              <div className="col-span-2 text-center text-gray-600">cc</div>
              <div className="col-span-5">
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={exam.visualAcuityNearCcRight}
                  onChange={(e) => handleInputChange('visualAcuityNearCcRight', e.target.value)}
                >
                  <option value="">--Select--</option>
                  <option value="N4">N4</option><option value="N5">N5</option><option value="N6">N6</option><option value="N7">N7</option><option value="N8">N8</option><option value="N9">N9</option><option value="N10">N10</option><option value="N11">N11</option>
                </select>
              </div>
              <div className="col-span-5">
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={exam.visualAcuityNearCcLeft}
                  onChange={(e) => handleInputChange('visualAcuityNearCcLeft', e.target.value)}
                >
                  <option value="">--Select--</option>
                  <option value="N4">N4</option><option value="N5">N5</option><option value="N6">N6</option><option value="N7">N7</option><option value="N8">N8</option><option value="N9">N9</option><option value="N10">N10</option><option value="N11">N11</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Removed Enhanced Measurements per HTML-only fields */}
        {false && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
              <Activity className="h-4 w-4 text-orange-600" />
            </div>
            <h2 className="text-lg font-medium text-gray-900">Enhanced Measurements</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pupil Size */}
            <div>
              <h3 className="text-md font-medium text-gray-800 mb-3">Pupil Size</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Right Eye ({exam.pupilSizeUnit || 'mm'})</label>
                  <input
                    type="number"
                    step="0.1"
                    value={exam.pupilSizeRight}
                    onChange={(e) => handleInputChange('pupilSizeRight', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 4.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Left Eye ({exam.pupilSizeUnit || 'mm'})</label>
                  <input
                    type="number"
                    step="0.1"
                    value={exam.pupilSizeLeft}
                    onChange={(e) => handleInputChange('pupilSizeLeft', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 4.5"
                  />
                </div>
              </div>
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                <select
                  value={exam.pupilSizeUnit}
                  onChange={(e) => handleInputChange('pupilSizeUnit', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="mm">mm</option>
                  <option value="cm">cm</option>
                </select>
              </div>
            </div>
            
            {/* IOP */}
            <div>
              <h3 className="text-md font-medium text-gray-800 mb-3">Intraocular Pressure</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Right Eye (mmHg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={exam.iopRight}
                    onChange={(e) => handleInputChange('iopRight', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 16"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Left Eye (mmHg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={exam.iopLeft}
                    onChange={(e) => handleInputChange('iopLeft', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 15"
                  />
                </div>
              </div>
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Method</label>
                <input
                  type="text"
                  value={exam.iopMethod}
                  onChange={(e) => handleInputChange('iopMethod', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Goldmann"
                />
              </div>
            </div>
            
            {/* Color Vision */}
            <div>
              <h3 className="text-md font-medium text-gray-800 mb-3">Color Vision</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Right Eye</label>
                  <input
                    type="text"
                    value={exam.colorVisionRight}
                    onChange={(e) => handleInputChange('colorVisionRight', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Normal"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Left Eye</label>
                  <input
                    type="text"
                    value={exam.colorVisionLeft}
                    onChange={(e) => handleInputChange('colorVisionLeft', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Normal"
                  />
                </div>
              </div>
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Test Used</label>
                <input
                  type="text"
                  value={exam.colorVisionTest}
                  onChange={(e) => handleInputChange('colorVisionTest', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Ishihara"
                />
              </div>
            </div>
            
            {/* Stereopsis & Near Addition */}
            <div>
              <h3 className="text-md font-medium text-gray-800 mb-3">Stereopsis & Near Addition</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stereopsis ({exam.stereopsisUnit || 'arc seconds'})</label>
                  <input
                    type="number"
                    step="0.1"
                    value={exam.stereopsis}
                    onChange={(e) => handleInputChange('stereopsis', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Near Addition Right</label>
                  <input
                    type="number"
                    step="0.25"
                    value={exam.nearAdditionRight}
                    onChange={(e) => handleInputChange('nearAdditionRight', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 1.50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Near Addition Left</label>
                  <input
                    type="number"
                    step="0.25"
                    value={exam.nearAdditionLeft}
                    onChange={(e) => handleInputChange('nearAdditionLeft', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 1.50"
                  />
                </div>
              </div>
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Stereopsis Unit</label>
                <select
                  value={exam.stereopsisUnit}
                  onChange={(e) => handleInputChange('stereopsisUnit', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="arc seconds">arc seconds</option>
                  <option value="arc minutes">arc minutes</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Refraction Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <Eye className="h-4 w-4 text-indigo-600" />
            </div>
            <h2 className="text-lg font-medium text-gray-900">Refraction</h2>
          </div>
          
          {/* Keratometry */}
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-800 mb-3">Keratometry</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Right Eye</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">K1</label>
                    <input
                      type="number"
                      step="0.01"
                      value={exam.keratometryK1Right}
                      onChange={(e) => handleInputChange('keratometryK1Right', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="K1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">K2</label>
                    <input
                      type="number"
                      step="0.01"
                      value={exam.keratometryK2Right}
                      onChange={(e) => handleInputChange('keratometryK2Right', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="K2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Axis</label>
                    <input
                      type="number"
                      step="1"
                      value={exam.keratometryAxisRight}
                      onChange={(e) => handleInputChange('keratometryAxisRight', parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Axis"
                    />
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Left Eye</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">K1</label>
                    <input
                      type="number"
                      step="0.01"
                      value={exam.keratometryK1Left}
                      onChange={(e) => handleInputChange('keratometryK1Left', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="K1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">K2</label>
                    <input
                      type="number"
                      step="0.01"
                      value={exam.keratometryK2Left}
                      onChange={(e) => handleInputChange('keratometryK2Left', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="K2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Axis</label>
                    <input
                      type="number"
                      step="1"
                      value={exam.keratometryAxisLeft}
                      onChange={(e) => handleInputChange('keratometryAxisLeft', parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Axis"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Manifest Refraction */}
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-800 mb-3">Manifest Refraction</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Auto Refraction - Right Eye</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Sphere</label>
                    <input
                      type="number"
                      step="0.25"
                      value={exam.manifestAutoRightSphere}
                      onChange={(e) => handleInputChange('manifestAutoRightSphere', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Sphere"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Cylinder</label>
                    <input
                      type="number"
                      step="0.25"
                      value={exam.manifestAutoRightCylinder}
                      onChange={(e) => handleInputChange('manifestAutoRightCylinder', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Cylinder"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Axis</label>
                    <input
                      type="number"
                      step="1"
                      value={exam.manifestAutoRightAxis}
                      onChange={(e) => handleInputChange('manifestAutoRightAxis', parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Axis"
                    />
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Auto Refraction - Left Eye</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Sphere</label>
                    <input
                      type="number"
                      step="0.25"
                      value={exam.manifestAutoLeftSphere}
                      onChange={(e) => handleInputChange('manifestAutoLeftSphere', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Sphere"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Cylinder</label>
                    <input
                      type="number"
                      step="0.25"
                      value={exam.manifestAutoLeftCylinder}
                      onChange={(e) => handleInputChange('manifestAutoLeftCylinder', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Cylinder"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Axis</label>
                    <input
                      type="number"
                      step="1"
                      value={exam.manifestAutoLeftAxis}
                      onChange={(e) => handleInputChange('manifestAutoLeftAxis', parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Axis"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Retinoscopy */}
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-800 mb-3">Retinoscopy</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Right Eye</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Sphere</label>
                    <input
                      type="number"
                      step="0.25"
                      value={exam.manifestRetRightSphere}
                      onChange={(e) => handleInputChange('manifestRetRightSphere', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Sphere"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Cylinder</label>
                    <input
                      type="number"
                      step="0.25"
                      value={exam.manifestRetRightCylinder}
                      onChange={(e) => handleInputChange('manifestRetRightCylinder', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Cylinder"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Axis</label>
                    <input
                      type="number"
                      step="1"
                      value={exam.manifestRetRightAxis}
                      onChange={(e) => handleInputChange('manifestRetRightAxis', parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Axis"
                    />
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Left Eye</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Sphere</label>
                    <input
                      type="number"
                      step="0.25"
                      value={exam.manifestRetLeftSphere}
                      onChange={(e) => handleInputChange('manifestRetLeftSphere', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Sphere"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Cylinder</label>
                    <input
                      type="number"
                      step="0.25"
                      value={exam.manifestRetLeftCylinder}
                      onChange={(e) => handleInputChange('manifestRetLeftCylinder', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Cylinder"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Axis</label>
                    <input
                      type="number"
                      step="1"
                      value={exam.manifestRetLeftAxis}
                      onChange={(e) => handleInputChange('manifestRetLeftAxis', parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Axis"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Subjective Refraction */}
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-800 mb-3">Subjective Refraction</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Right Eye</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Sphere</label>
                    <input
                      type="number"
                      step="0.25"
                      value={exam.subjectiveRightSphere}
                      onChange={(e) => handleInputChange('subjectiveRightSphere', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Sphere"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Cylinder</label>
                    <input
                      type="number"
                      step="0.25"
                      value={exam.subjectiveRightCylinder}
                      onChange={(e) => handleInputChange('subjectiveRightCylinder', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Cylinder"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Axis</label>
                    <input
                      type="number"
                      step="1"
                      value={exam.subjectiveRightAxis}
                      onChange={(e) => handleInputChange('subjectiveRightAxis', parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Axis"
                    />
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Left Eye</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Sphere</label>
                    <input
                      type="number"
                      step="0.25"
                      value={exam.subjectiveLeftSphere}
                      onChange={(e) => handleInputChange('subjectiveLeftSphere', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Sphere"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Cylinder</label>
                    <input
                      type="number"
                      step="0.25"
                      value={exam.subjectiveLeftCylinder}
                      onChange={(e) => handleInputChange('subjectiveLeftCylinder', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Cylinder"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Axis</label>
                    <input
                      type="number"
                      step="1"
                      value={exam.subjectiveLeftAxis}
                      onChange={(e) => handleInputChange('subjectiveLeftAxis', parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Axis"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Refraction Data */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Added Values</label>
              <input
                type="text"
                value={exam.addedValues}
                onChange={(e) => handleInputChange('addedValues', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., +1.50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Best Vision Right Eye</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={exam.bestRightVision}
                onChange={(e) => handleInputChange('bestRightVision', e.target.value)}
              >
                <option value="">--Select--</option>
                <option value="6/4">6/4</option><option value="6/5">6/5</option><option value="6/6">6/6</option><option value="6/9">6/9</option><option value="6/12">6/12</option><option value="6/18">6/18</option><option value="6/24">6/24</option><option value="6/36">6/36</option><option value="6/60">6/60</option><option value="5/60">5/60</option><option value="4/60">4/60</option><option value="3/60">3/60</option><option value="2/60">2/60</option><option value="1/60">1/60</option><option value="HM">HM</option><option value="PL">PL</option><option value="NPL">NPL</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Best Vision Left Eye</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={exam.bestLeftVision}
                onChange={(e) => handleInputChange('bestLeftVision', e.target.value)}
              >
                <option value="">--Select--</option>
                <option value="6/4">6/4</option><option value="6/5">6/5</option><option value="6/6">6/6</option><option value="6/9">6/9</option><option value="6/12">6/12</option><option value="6/18">6/18</option><option value="6/24">6/24</option><option value="6/36">6/36</option><option value="6/60">6/60</option><option value="5/60">5/60</option><option value="4/60">4/60</option><option value="3/60">3/60</option><option value="2/60">2/60</option><option value="1/60">1/60</option><option value="HM">HM</option><option value="PL">PL</option><option value="NPL">NPL</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">PD Right Eye</label>
              <input
                type="text"
                value={String(exam.pdRightEye ?? '')}
                onChange={(e) => handleInputChange('pdRightEye', e.target.value ? parseFloat(e.target.value) : 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">PD Left Eye</label>
              <input
                type="text"
                value={String(exam.pdLeftEye ?? '')}
                onChange={(e) => handleInputChange('pdLeftEye', e.target.value ? parseFloat(e.target.value) : 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          {/* Refraction notes removed per HTML */}
        </div>

        {/* Removed Clinical Assessment per HTML-only fields */}

        {/* Removed Equipment Tracking per HTML-only fields */}

        {/* Comments */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Comments</h2>
          <div>
            <textarea
              value={exam.comment}
              onChange={(e) => handleInputChange('comment', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <LoadingButton
            type="submit"
            loading={isSaving}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
          >
            <Save className="h-4 w-4 mr-2" />
            Update Exam
          </LoadingButton>
        </div>
      </form>
    </div>
  )
}