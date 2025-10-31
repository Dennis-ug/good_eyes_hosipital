'use client'
// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { Calendar, Clock, User, Phone, FileText, ArrowLeft, Stethoscope, Eye, Activity, DollarSign, Syringe, Microscope } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { patientVisitSessionApi, patientApi, triageApi, basicRefractionExamApi, mainExamApi, patientDiagnosisApi, patientProcedureApi, patientTreatmentApi, investigationApi } from '@/lib/api'
import { PatientVisitSession, Patient, TriageMeasurement, BasicRefractionExam, MainExam, PatientDiagnosis, PatientProcedure, PatientInvestigation } from '@/lib/types'

export default function PatientVisitSessionPage() {
  const params = useParams()
  const visitSessionId = Number(params.id)
  
  const [visitSession, setVisitSession] = useState<PatientVisitSession | null>(null)
  const [patient, setPatient] = useState<Patient | null>(null)
  const [triageData, setTriageData] = useState<TriageMeasurement | null>(null)
  const [refractionData, setRefractionData] = useState<BasicRefractionExam | null>(null)
  const [mainExamData, setMainExamData] = useState<MainExam | null>(null)
  const [diagnosesData, setDiagnosesData] = useState<PatientDiagnosis[]>([])
  const [proceduresData, setProceduresData] = useState<PatientProcedure[]>([])
  const [treatmentsData, setTreatmentsData] = useState<any[]>([])
  const [investigationsData, setInvestigationsData] = useState<PatientInvestigation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [visitSessionId])

  const fetchData = async () => {
    try {
      setLoading(true)
      const visitData = await patientVisitSessionApi.getVisitSession(visitSessionId)
      setVisitSession(visitData)
      
      if (visitData.patientId) {
        try {
          const patientData = await patientApi.getById(visitData.patientId)
          setPatient(patientData)
        } catch (patientErr) {
          console.error('Failed to fetch patient details:', patientErr)
        }
      }

      // Fetch all exam data
      const [triageResult, refractionResult, mainExamResult, diagnosesResult, proceduresResult, treatmentsResult, investigationsResult] = await Promise.allSettled([
        triageApi.getByVisitSession(visitSessionId),
        basicRefractionExamApi.getByVisitSession(visitSessionId),
        mainExamApi.getByVisitSession(visitSessionId),
        patientDiagnosisApi.getByVisitSession(visitSessionId),
        patientProcedureApi.getByVisitSession(visitSessionId),
        patientTreatmentApi.getByVisitSession(visitSessionId),
        investigationApi.getByVisitSession(visitSessionId, false)
      ])

      if (triageResult.status === 'fulfilled') setTriageData(triageResult.value)
      if (refractionResult.status === 'fulfilled') setRefractionData(refractionResult.value)
      if (mainExamResult.status === 'fulfilled') setMainExamData(mainExamResult.value)
      if (diagnosesResult.status === 'fulfilled') {
        const uniq = Array.from(new Map(diagnosesResult.value.map((d:any) => [d.id, d])).values())
        setDiagnosesData(uniq)
      }
      if (proceduresResult.status === 'fulfilled') {
        const uniq = Array.from(new Map(proceduresResult.value.map((p:any) => [p.id, p])).values())
        setProceduresData(uniq)
      }
      if (treatmentsResult.status === 'fulfilled') {
        const uniq = Array.from(new Map(treatmentsResult.value.map((t:any) => [t.id, t])).values())
        setTreatmentsData(uniq)
      }
      if (investigationsResult.status === 'fulfilled') {
        const uniq = Array.from(new Map((investigationsResult.value as any[]).map((i:any) => [i.id, i])).values()) as PatientInvestigation[]
        setInvestigationsData(uniq)
      }
    } catch (err) {
      console.error('Failed to fetch visit session:', err)
      setError('Failed to load visit session data')
    } finally {
      setLoading(false)
    }
  }

  const calculateAge = (birthDate: string) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    // Display time in 12-hour format with AM/PM
    // The backend now sends EAT timezone, so this should display the correct local time
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Africa/Kampala' // Explicitly use EAT timezone
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading visit session...</p>
        </div>
      </div>
    )
  }

  if (error || !visitSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Error Loading Visit Session</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error || 'Visit session not found'}</p>
          <Link
            href="/dashboard/patient-visit-sessions"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Visit Sessions
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/dashboard/patient-visit-sessions"
                className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Visit Sessions
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Visit Session #{visitSession.id}
              </h1>
            </div>
          </div>
        </div>

        {/* Visit Summary Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {/* Patient Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center mb-4">
              <User className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Patient Information</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{visitSession.patientName}</p>
              </div>
              {patient && (
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Age</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {patient.ageInYears} years, {patient.ageInMonths} months
                  </p>
                  {/* Debug info */}
                  <p className="text-xs text-gray-400">DOB: {patient.dateOfBirth}</p>
                </div>
              )}
              {patient && (
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Gender</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{patient.gender}</p>
                </div>
              )}
              {patient && (
                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-900 dark:text-white">{patient.phone}</span>
                </div>
              )}
              {visitSession.chiefComplaint && (
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Chief Complaint</p>
                  <p className="text-sm text-gray-900 dark:text-white truncate">{visitSession.chiefComplaint}</p>
                </div>
              )}
            </div>
          </div>

          {/* Visit Details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center mb-4">
              <Calendar className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Visit Details</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Date</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatDate(visitSession.visitDate)}
                </p>
                {/* Debug info */}
                <p className="text-xs text-gray-400">Raw: {visitSession.visitDate}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Time</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatTime(visitSession.visitDate)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Purpose</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {visitSession.visitPurpose.replace(/_/g, ' ')}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Emergency Level</p>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  visitSession.emergencyLevel === 'HIGH' ? 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20' :
                  visitSession.emergencyLevel === 'MEDIUM' ? 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20' :
                  'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20'
                }`}>
                  {visitSession.emergencyLevel.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Status Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center mb-4">
              <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Status</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Status</p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20">
                  {visitSession.status.replace(/_/g, ' ')}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Stage</p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20">
                  {visitSession.currentStage.replace(/_/g, ' ')}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Requires Triage</p>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  visitSession.requiresTriage 
                    ? 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/20'
                    : 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20'
                }`}>
                  {visitSession.requiresTriage ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Doctor Visit</p>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  visitSession.requiresDoctorVisit 
                    ? 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20'
                    : 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20'
                }`}>
                  {visitSession.requiresDoctorVisit ? 'Required' : 'Not Required'}
                </span>
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center mb-4">
              <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Financial</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Status</p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  visitSession.consultationFeePaid 
                    ? 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20'
                    : 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20'
                }`}>
                  {visitSession.consultationFeePaid ? 'Paid' : 'Pending'}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Consultation Fee</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {visitSession.consultationFeeAmount ? `$${visitSession.consultationFeeAmount.toFixed(2)}` : 'Not Set'}
                </p>
              </div>
              {visitSession.paymentMethod && (
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Method</p>
                  <p className="text-sm text-gray-900 dark:text-white">{visitSession.paymentMethod.replace(/_/g, ' ')}</p>
                </div>
              )}
              {visitSession.paymentReference && (
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Reference</p>
                  <p className="text-sm text-gray-900 dark:text-white truncate">{visitSession.paymentReference}</p>
                </div>
              )}
            </div>
          </div>


        </div>

        {/* Exam Management Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Exam Management</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Triage */}
            <Link
              href={`/dashboard/patient-visit-sessions/${visitSessionId}/triage`}
              className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <Activity className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white text-center">Triage</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 text-center">Vital Signs & Measurements</span>
            </Link>

            {/* Basic Refraction */}
            <Link
              href={`/dashboard/patient-visit-sessions/${visitSessionId}/basic-refraction`}
              className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <Eye className="h-8 w-8 text-green-600 dark:text-green-400 mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white text-center">Basic Refraction</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 text-center">Visual Acuity & Refraction</span>
            </Link>

            {/* Main Exam */}
            <Link
              href={`/dashboard/patient-visit-sessions/${visitSessionId}/main-exam`}
              className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <Stethoscope className="h-8 w-8 text-purple-600 dark:text-purple-400 mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white text-center">Main Exam</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 text-center">Comprehensive Examination</span>
            </Link>

            {/* Diagnoses */}
            <Link
              href={`/dashboard/patient-visit-sessions/${visitSessionId}/diagnoses`}
              className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <FileText className="h-8 w-8 text-orange-600 dark:text-orange-400 mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white text-center">Diagnoses</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 text-center">Manage Patient Diagnoses</span>
            </Link>

            {/* Procedures */}
            <Link
              href={`/dashboard/patient-visit-sessions/${visitSessionId}/procedures`}
              className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400 mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white text-center">Procedures</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 text-center">Manage Procedures & Billing</span>
            </Link>

            {/* Investigations */}
            <Link
              href={`/dashboard/patient-visit-sessions/${visitSessionId}/investigations`}
              className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <Microscope className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white text-center">Investigations</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 text-center">Manage Investigations & Billing</span>
            </Link>

            {/* Treatments */}
            <Link
              href={`/dashboard/patient-visit-sessions/${visitSessionId}/treatments`}
              className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <Syringe className="h-8 w-8 text-teal-600 dark:text-teal-400 mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white text-center">Treatments</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 text-center">Manage Treatments & Billing</span>
            </Link>

            {/* Optics */}
            <Link
              href={`/dashboard/patient-visit-sessions/${visitSessionId}/optics`}
              className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <Eye className="h-8 w-8 text-cyan-600 dark:text-cyan-400 mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white text-center">Optics</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 text-center">Manage Lenses & Frames</span>
            </Link>
          </div>
        </div>

        {/* Exam Details Section */}
        {(triageData || refractionData || mainExamData || diagnosesData.length > 0 || proceduresData.length > 0 || investigationsData.length > 0 || treatmentsData.length > 0) && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Exam Details</h3>
              <Link
                href={`/dashboard/patient-visit-sessions/${visitSessionId}/optics`}
                className="inline-flex items-center px-4 py-2 border border-cyan-600 text-cyan-600 dark:border-cyan-400 dark:text-cyan-400 rounded-md hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-colors"
              >
                <Eye className="h-4 w-4 mr-2" />
                Manage Optics
              </Link>
            </div>
            <div className="space-y-6">
              {/* Triage Details */}
              {triageData && (
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white">Triage Measurements</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    {triageData.systolicBp && triageData.diastolicBp && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Blood Pressure:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{triageData.systolicBp}/{triageData.diastolicBp} mmHg</span>
                      </div>
                    )}
                    {triageData.rbsValue && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">RBS:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{triageData.rbsValue} {triageData.rbsUnit}</span>
                      </div>
                    )}
                    {triageData.iopRight && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">IOP Right:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{triageData.iopRight} mmHg</span>
                      </div>
                    )}
                    {triageData.iopLeft && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">IOP Left:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{triageData.iopLeft} mmHg</span>
                      </div>
                    )}
                    {triageData.weightKg && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Weight:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{triageData.weightKg} kg</span>
                      </div>
                    )}
                  </div>
                  {triageData.notes && (
                    <div className="mt-3">
                      <span className="text-gray-500 dark:text-gray-400">Notes:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{triageData.notes}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Basic Refraction Details */}
              {refractionData && (
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <Eye className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white">Basic Refraction</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {refractionData.visualAcuityDistanceScRight && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">VA Distance SC Right:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{refractionData.visualAcuityDistanceScRight}</span>
                      </div>
                    )}
                    {refractionData.visualAcuityDistanceScLeft && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">VA Distance SC Left:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{refractionData.visualAcuityDistanceScLeft}</span>
                      </div>
                    )}
                    {refractionData.visualAcuityDistancePhRight && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">VA Distance PH Right:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{refractionData.visualAcuityDistancePhRight}</span>
                      </div>
                    )}
                    {refractionData.visualAcuityDistancePhLeft && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">VA Distance PH Left:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{refractionData.visualAcuityDistancePhLeft}</span>
                      </div>
                    )}
                    {refractionData.manifestAutoRightSphere && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Manifest Auto Sphere Right:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{refractionData.manifestAutoRightSphere}</span>
                      </div>
                    )}
                    {refractionData.manifestAutoLeftSphere && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Manifest Auto Sphere Left:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{refractionData.manifestAutoLeftSphere}</span>
                      </div>
                    )}
                    {refractionData.manifestAutoRightCylinder && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Manifest Auto Cylinder Right:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{refractionData.manifestAutoRightCylinder}</span>
                      </div>
                    )}
                    {refractionData.manifestAutoLeftCylinder && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Manifest Auto Cylinder Left:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{refractionData.manifestAutoLeftCylinder}</span>
                      </div>
                    )}
                    {refractionData.bestRightVision && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Best Vision Right:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{refractionData.bestRightVision}</span>
                      </div>
                    )}
                    {refractionData.bestLeftVision && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Best Vision Left:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{refractionData.bestLeftVision}</span>
                      </div>
                    )}
                    {refractionData.pdRightEye && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">PD Right Eye:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{refractionData.pdRightEye} mm</span>
                      </div>
                    )}
                    {refractionData.pdLeftEye && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">PD Left Eye:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{refractionData.pdLeftEye} mm</span>
                      </div>
                    )}
                  </div>
                  {refractionData.refractionNotes && (
                    <div className="mt-3">
                      <span className="text-gray-500 dark:text-gray-400">Notes:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{refractionData.refractionNotes}</span>
                    </div>
                  )}
                  {refractionData.clinicalAssessment && (
                    <div className="mt-3">
                      <span className="text-gray-500 dark:text-gray-400">Clinical Assessment:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{refractionData.clinicalAssessment}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Main Exam Details */}
              {mainExamData && (
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <Stethoscope className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-2" />
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white">Main Examination</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {mainExamData.externalRight && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">External Right:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{mainExamData.externalRight}</span>
                      </div>
                    )}
                    {mainExamData.externalLeft && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">External Left:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{mainExamData.externalLeft}</span>
                      </div>
                    )}
                    {mainExamData.cdrRight && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">CDR Right:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{mainExamData.cdrRight}</span>
                      </div>
                    )}
                    {mainExamData.cdrLeft && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">CDR Left:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{mainExamData.cdrLeft}</span>
                      </div>
                    )}
                    {mainExamData.iopRight && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">IOP Right:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{mainExamData.iopRight} mmHg</span>
                      </div>
                    )}
                    {mainExamData.iopLeft && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">IOP Left:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{mainExamData.iopLeft} mmHg</span>
                      </div>
                    )}
                    {mainExamData.advice && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Advice:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{mainExamData.advice}</span>
                      </div>
                    )}
                    {mainExamData.doctorsNotes && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Doctor's Notes:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{mainExamData.doctorsNotes}</span>
                      </div>
                    )}
                  </div>
                  {mainExamData.historyComments && (
                    <div className="mt-3">
                      <span className="text-gray-500 dark:text-gray-400">History Comments:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{mainExamData.historyComments}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Diagnoses Details */}
              {diagnosesData.length > 0 && (
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400 mr-2" />
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white">Diagnoses ({diagnosesData.length})</h4>
                  </div>
                  <div className="space-y-2">
                    {diagnosesData.map((diagnosis, index) => (
                      <div key={diagnosis.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white">{diagnosis.diagnosis.name}</span>
                          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">({diagnosis.diagnosis.categoryName})</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {diagnosis.isPrimaryDiagnosis && (
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">Primary</span>
                          )}
                          {diagnosis.isConfirmed && (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">Confirmed</span>
                          )}
                          <span className={`px-2 py-1 text-xs rounded ${
                            diagnosis.severity === 'CRITICAL' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                            diagnosis.severity === 'SEVERE' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                            diagnosis.severity === 'MODERATE' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                          }`}>
                            {diagnosis.severity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Procedures Details */}
              {proceduresData.length > 0 && (
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white">Procedures ({proceduresData.length})</h4>
                  </div>
                  <div className="space-y-3">
                    {proceduresData.map((procedure) => (
                      <div key={procedure.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900 dark:text-white">{procedure.procedureName}</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">({procedure.procedureCategory})</span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Eye Side:</span>
                              <span className="ml-2 text-gray-900 dark:text-white">{procedure.eyeSide}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Cost:</span>
                              <span className="ml-2 text-gray-900 dark:text-white">{procedure.cost.toLocaleString()} UGX</span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Staff Fee:</span>
                              <span className="ml-2 text-gray-900 dark:text-white">{(procedure.staffFee || 0).toLocaleString()} UGX</span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Status:</span>
                              <span className={`ml-2 px-2 py-1 text-xs rounded ${
                                procedure.performed 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              }`}>
                                {procedure.performed ? 'Performed' : 'Pending'}
                              </span>
                            </div>
                          </div>
                          {procedure.performedBy && (
                            <div className="mt-2 text-sm">
                              <span className="text-gray-500 dark:text-gray-400">Performed by:</span>
                              <span className="ml-2 text-gray-900 dark:text-white">{procedure.performedBy}</span>
                            </div>
                          )}
                          {procedure.notes && (
                            <div className="mt-2 text-sm">
                              <span className="text-gray-500 dark:text-gray-400">Notes:</span>
                              <span className="ml-2 text-gray-900 dark:text-white">{procedure.notes}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Cost:</span>
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        {proceduresData.reduce((sum, proc) => sum + proc.cost, 0).toLocaleString()} UGX
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Staff Fees:</span>
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        {proceduresData.reduce((sum, proc) => sum + (proc.staffFee || 0), 0).toLocaleString()} UGX
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                      <span className="text-lg font-medium text-gray-900 dark:text-white">Grand Total:</span>
                      <span className="text-xl font-bold text-green-600 dark:text-green-400">
                        {proceduresData.reduce((sum, proc) => sum + proc.cost + (proc.staffFee || 0), 0).toLocaleString()} UGX
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Investigations Details */}
              {investigationsData.length > 0 && (
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <Microscope className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" />
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white">Investigations ({investigationsData.length})</h4>
                  </div>
                  <div className="space-y-3">
                    {investigationsData.map((inv) => (
                      <div key={inv.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-gray-900 dark:text-white">{inv.investigationName}</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">Qty: {inv.quantity}</span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Eye Side:</span>
                              <span className="ml-2 text-gray-900 dark:text-white">{inv.eyeSide || '-'}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Unit Cost:</span>
                              <span className="ml-2 text-gray-900 dark:text-white">{(inv.cost || 0).toLocaleString()} UGX</span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Line Total:</span>
                              <span className="ml-2 text-gray-900 dark:text-white">{((inv.cost || 0) * (inv.quantity || 1)).toLocaleString()} UGX</span>
                            </div>
                            {inv.notes && (
                              <div className="md:col-span-2">
                                <span className="text-gray-500 dark:text-gray-400">Notes:</span>
                                <span className="ml-2 text-gray-900 dark:text-white">{inv.notes}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Cost:</span>
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        {investigationsData.reduce((sum, inv) => sum + (inv.cost || 0) * (inv.quantity || 1), 0).toLocaleString()} UGX
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Treatments Details */}
              {treatmentsData.length > 0 && (
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <DollarSign className="h-5 w-5 text-teal-600 dark:text-teal-400 mr-2" />
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white">Treatments ({treatmentsData.length})</h4>
                  </div>
                  <div className="space-y-3">
                    {treatmentsData.map((t: any) => (
                      <div key={`${t.id}-${t.inventoryItemId}`} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900 dark:text-white">{t.itemName}</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">{t.sku || '-'}</span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Qty:</span>
                              <span className="ml-2 text-gray-900 dark:text-white">{t.quantity}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Unit Price:</span>
                              <span className="ml-2 text-gray-900 dark:text-white">{(t.unitPrice || 0).toLocaleString()} UGX</span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Dosage:</span>
                              <span className="ml-2 text-gray-900 dark:text-white">{t.dosage || '-'}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Route:</span>
                              <span className="ml-2 text-gray-900 dark:text-white">{t.administrationRoute || '-'}</span>
                            </div>
                          </div>
                          {t.notes && (
                            <div className="mt-2 text-sm">
                              <span className="text-gray-500 dark:text-gray-400">Notes:</span>
                              <span className="ml-2 text-gray-900 dark:text-white">{t.notes}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Cost:</span>
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        {treatmentsData.reduce((sum: number, t: any) => sum + (t.unitPrice || 0) * (t.quantity || 1), 0).toLocaleString()} UGX
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Additional Details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Additional Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {visitSession.chiefComplaint && (
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Chief Complaint</p>
                  <p className="text-gray-900 dark:text-white">{visitSession.chiefComplaint}</p>
                </div>
              )}
              {visitSession.notes && (
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Notes</p>
                  <p className="text-gray-900 dark:text-white">{visitSession.notes}</p>
                </div>
              )}
              {visitSession.consultationFeeAmount && (
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Consultation Fee</p>
                  <p className="text-gray-900 dark:text-white">UGX {visitSession.consultationFeeAmount.toLocaleString()}</p>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Emergency Level</p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/20">
                  {visitSession.emergencyLevel}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Requires Triage</p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  visitSession.requiresTriage 
                    ? 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20'
                    : 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20'
                }`}>
                  {visitSession.requiresTriage ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Requires Doctor Visit</p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  visitSession.requiresDoctorVisit 
                    ? 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20'
                    : 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20'
                }`}>
                  {visitSession.requiresDoctorVisit ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
