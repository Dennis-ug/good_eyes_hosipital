'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Edit, User, Eye, Calendar, UserCheck, Activity, Target, Palette, Ruler, Stethoscope, Settings } from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import { LoadingPage } from '@/components/loading-page'
import { basicRefractionExamApi } from '@/lib/api'
import { BasicRefractionExam } from '@/lib/types'

export default function BasicRefractionExamViewPage() {
  const router = useRouter()
  const params = useParams()
  const [exam, setExam] = useState<BasicRefractionExam | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDemoMode, setIsDemoMode] = useState(false)

  const examId = params.id ? parseInt(params.id as string) : null

  const fetchExam = async () => {
    if (!examId) return

    try {
      setIsLoading(true)
      console.log('Fetching basic refraction exam with ID:', examId)
      const data = await basicRefractionExamApi.getById(examId)
      console.log('Basic refraction exam data received:', data)
      setExam(data)
      setIsDemoMode(false)
    } catch (error) {
      console.error('Failed to fetch basic refraction exam:', error)
      
      // Check if it's a 404 error (exam not found or API not available)
      if (error instanceof Error && (
        error.message.includes('404') ||
        error.message.includes('Failed to fetch') ||
        error.message.includes('NetworkError')
      )) {
        console.log('API not available or exam not found, using demo mode')
        
                // Demo mode with comprehensive sample data
        const demoData: BasicRefractionExam = {
          id: examId,
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
          pdRightEye: 32.0,
          pdLeftEye: 32.0,
          refractionNotes: 'Patient shows mild myopia with astigmatism',
          comment: 'Recommend prescription glasses',
          examinationDate: '2025-01-15T10:30:00',
          examinedBy: 'Dr. Smith',
          keratometryK1Right: 43.50,
          keratometryK2Right: 44.25,
          keratometryAxisRight: 90,
          keratometryK1Left: 43.75,
          keratometryK2Left: 44.00,
          keratometryAxisLeft: 85,
          pupilSizeRight: 4.5,
          pupilSizeLeft: 4.5,
          pupilSizeUnit: 'mm',
          iopRight: 16,
          iopLeft: 15,
          iopMethod: 'Goldmann',
          colorVisionRight: 'Normal',
          colorVisionLeft: 'Normal',
          colorVisionTest: 'Ishihara',
          stereopsis: 40,
          stereopsisUnit: 'arc seconds',
          nearAdditionRight: 1.50,
          nearAdditionLeft: 1.50,
          clinicalAssessment: 'Patient has mild myopia with astigmatism. No signs of pathology.',
          diagnosis: 'Myopia with astigmatism',
          treatmentPlan: 'Prescribe corrective lenses. Follow up in 6 months.',
          equipmentUsed: 'Auto-refractor, Phoropter, Trial lenses',
          equipmentCalibrationDate: '2025-01-01',
          createdAt: '2025-01-15T10:30:00',
          updatedAt: '2025-01-15T10:30:00',
          createdBy: 'Dr. Smith',
          updatedBy: 'Dr. Smith',
          patientName: 'John Doe',
          patientPhone: '1234567890'
        }
        
        setExam(demoData)
        setIsDemoMode(true)
      } else {
        // Handle other types of errors
        console.error('Unexpected error:', error)
        alert('Failed to load basic refraction exam. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchExam()
  }, [examId])

  if (isLoading) {
    return <LoadingPage message="Loading basic refraction exam..." />
  }

  if (!exam) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button onClick={() => router.back()} className="p-2 text-gray-400 hover:text-gray-600">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Basic Refraction Exam</h1>
            <p className="text-gray-600">Exam not found</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={() => router.back()} className="p-2 text-gray-400 hover:text-gray-600">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Basic Refraction Exam</h1>
            <p className="text-gray-600">Exam #{exam.id}</p>
            {isDemoMode && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  <strong>Demo Mode:</strong> Backend API not available or exam not found. Showing sample data.
                </p>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={() => router.push(`/dashboard/basic-refraction-exams/${exam.id}/edit`)}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Exam
        </button>
      </div>

      {/* Patient Information */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <User className="h-4 w-4 text-blue-600" />
          </div>
          <h2 className="text-lg font-medium text-gray-900">Patient Information</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500">Patient Name</label>
            <p className="mt-1 text-sm text-gray-900">{exam.patientName || 'Not specified'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Phone Number</label>
            <p className="mt-1 text-sm text-gray-900">{exam.patientPhone || 'Not specified'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Visit Session ID</label>
            <p className="mt-1 text-sm text-gray-900">#{exam.visitSessionId}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Examined By</label>
            <p className="mt-1 text-sm text-gray-900">{exam.examinedBy || 'Not specified'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Examination Date</label>
            <p className="mt-1 text-sm text-gray-900">
              {exam.examinationDate ? new Date(exam.examinationDate).toLocaleString() : 'Not specified'}
            </p>
          </div>
        </div>
      </div>

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
            <label className="block text-sm font-medium text-gray-500">Neuro Oriented</label>
            <p className="mt-1 text-sm text-gray-900">
              {exam.neuroOriented ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Yes
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  No
                </span>
              )}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Mood</label>
            <p className="mt-1 text-sm text-gray-900">{exam.neuroMood || 'Not recorded'}</p>
          </div>
          {exam.neuroPsychNotes && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-500">Neuro/Psych Notes</label>
              <p className="mt-1 text-sm text-gray-900">{exam.neuroPsychNotes}</p>
            </div>
          )}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-md font-medium text-gray-800 mb-3">Right Eye</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Dark (mm)</label>
                <p className="mt-1 text-sm text-gray-900">{exam.pupilsRightDark || 'Not recorded'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Light (mm)</label>
                <p className="mt-1 text-sm text-gray-900">{exam.pupilsRightLight || 'Not recorded'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Shape</label>
                <p className="mt-1 text-sm text-gray-900">{exam.pupilsRightShape || 'Not recorded'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Reaction</label>
                <p className="mt-1 text-sm text-gray-900">{exam.pupilsRightReact || 'Not recorded'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">APD</label>
                <p className="mt-1 text-sm text-gray-900">
                  {exam.pupilsRightApd ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Positive
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Negative
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-md font-medium text-gray-800 mb-3">Left Eye</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Dark (mm)</label>
                <p className="mt-1 text-sm text-gray-900">{exam.pupilsLeftDark || 'Not recorded'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Light (mm)</label>
                <p className="mt-1 text-sm text-gray-900">{exam.pupilsLeftLight || 'Not recorded'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Shape</label>
                <p className="mt-1 text-sm text-gray-900">{exam.pupilsLeftShape || 'Not recorded'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Reaction</label>
                <p className="mt-1 text-sm text-gray-900">{exam.pupilsLeftReact || 'Not recorded'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">APD</label>
                <p className="mt-1 text-sm text-gray-900">
                  {exam.pupilsLeftApd ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Positive
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Negative
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
        {exam.pupilsNotes && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-500">Pupils Notes</label>
            <p className="mt-1 text-sm text-gray-900">{exam.pupilsNotes}</p>
          </div>
        )}
      </div>

      {/* Visual Acuity */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <Eye className="h-4 w-4 text-blue-600" />
          </div>
          <h2 className="text-lg font-medium text-gray-900">Visual Acuity</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-md font-medium text-gray-800 mb-3">Distance Vision</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Right Eye - SC</label>
                <p className="mt-1 text-sm text-gray-900">{exam.visualAcuityDistanceScRight || 'Not recorded'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Left Eye - SC</label>
                <p className="mt-1 text-sm text-gray-900">{exam.visualAcuityDistanceScLeft || 'Not recorded'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Right Eye - PH</label>
                <p className="mt-1 text-sm text-gray-900">{exam.visualAcuityDistancePhRight || 'Not recorded'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Left Eye - PH</label>
                <p className="mt-1 text-sm text-gray-900">{exam.visualAcuityDistancePhLeft || 'Not recorded'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Right Eye - CC</label>
                <p className="mt-1 text-sm text-gray-900">{exam.visualAcuityDistanceCcRight || 'Not recorded'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Left Eye - CC</label>
                <p className="mt-1 text-sm text-gray-900">{exam.visualAcuityDistanceCcLeft || 'Not recorded'}</p>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-md font-medium text-gray-800 mb-3">Near Vision</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Right Eye - SC</label>
                <p className="mt-1 text-sm text-gray-900">{exam.visualAcuityNearScRight || 'Not recorded'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Left Eye - SC</label>
                <p className="mt-1 text-sm text-gray-900">{exam.visualAcuityNearScLeft || 'Not recorded'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Right Eye - CC</label>
                <p className="mt-1 text-sm text-gray-900">{exam.visualAcuityNearCcRight || 'Not recorded'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Left Eye - CC</label>
                <p className="mt-1 text-sm text-gray-900">{exam.visualAcuityNearCcLeft || 'Not recorded'}</p>
              </div>
            </div>
          </div>
        </div>
        {exam.visualAcuityNotes && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-500">Visual Acuity Notes</label>
            <p className="mt-1 text-sm text-gray-900">{exam.visualAcuityNotes}</p>
          </div>
        )}
      </div>

      {/* Enhanced Measurements */}
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
                <label className="block text-sm font-medium text-gray-500">Right Eye ({exam.pupilSizeUnit || 'mm'})</label>
                <p className="mt-1 text-sm text-gray-900">{exam.pupilSizeRight || 'Not recorded'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Left Eye ({exam.pupilSizeUnit || 'mm'})</label>
                <p className="mt-1 text-sm text-gray-900">{exam.pupilSizeLeft || 'Not recorded'}</p>
              </div>
            </div>
          </div>
          
          {/* IOP */}
          <div>
            <h3 className="text-md font-medium text-gray-800 mb-3">Intraocular Pressure</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Right Eye (mmHg)</label>
                <p className="mt-1 text-sm text-gray-900">{exam.iopRight || 'Not recorded'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Left Eye (mmHg)</label>
                <p className="mt-1 text-sm text-gray-900">{exam.iopLeft || 'Not recorded'}</p>
              </div>
            </div>
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-500">Method</label>
              <p className="mt-1 text-sm text-gray-900">{exam.iopMethod || 'Not specified'}</p>
            </div>
          </div>
          
          {/* Color Vision */}
          <div>
            <h3 className="text-md font-medium text-gray-800 mb-3">Color Vision</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Right Eye</label>
                <p className="mt-1 text-sm text-gray-900">{exam.colorVisionRight || 'Not recorded'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Left Eye</label>
                <p className="mt-1 text-sm text-gray-900">{exam.colorVisionLeft || 'Not recorded'}</p>
              </div>
            </div>
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-500">Test Used</label>
              <p className="mt-1 text-sm text-gray-900">{exam.colorVisionTest || 'Not specified'}</p>
            </div>
          </div>
          
          {/* Stereopsis & Near Addition */}
          <div>
            <h3 className="text-md font-medium text-gray-800 mb-3">Stereopsis & Near Addition</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Stereopsis ({exam.stereopsisUnit || 'arc seconds'})</label>
                <p className="mt-1 text-sm text-gray-900">{exam.stereopsis || 'Not recorded'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Near Addition Right</label>
                <p className="mt-1 text-sm text-gray-900">{exam.nearAdditionRight || 'Not recorded'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Near Addition Left</label>
                <p className="mt-1 text-sm text-gray-900">{exam.nearAdditionLeft || 'Not recorded'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Measurements */}
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
                <label className="block text-sm font-medium text-gray-500">Right Eye ({exam.pupilSizeUnit || 'mm'})</label>
                <p className="mt-1 text-sm text-gray-900">{exam.pupilSizeRight || 'Not recorded'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Left Eye ({exam.pupilSizeUnit || 'mm'})</label>
                <p className="mt-1 text-sm text-gray-900">{exam.pupilSizeLeft || 'Not recorded'}</p>
              </div>
            </div>
          </div>
          
          {/* IOP */}
          <div>
            <h3 className="text-md font-medium text-gray-800 mb-3">Intraocular Pressure</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Right Eye (mmHg)</label>
                <p className="mt-1 text-sm text-gray-900">{exam.iopRight || 'Not recorded'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Left Eye (mmHg)</label>
                <p className="mt-1 text-sm text-gray-900">{exam.iopLeft || 'Not recorded'}</p>
              </div>
            </div>
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-500">Method</label>
              <p className="mt-1 text-sm text-gray-900">{exam.iopMethod || 'Not specified'}</p>
            </div>
          </div>
          
          {/* Color Vision */}
          <div>
            <h3 className="text-md font-medium text-gray-800 mb-3">Color Vision</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Right Eye</label>
                <p className="mt-1 text-sm text-gray-900">{exam.colorVisionRight || 'Not recorded'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Left Eye</label>
                <p className="mt-1 text-sm text-gray-900">{exam.colorVisionLeft || 'Not recorded'}</p>
              </div>
            </div>
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-500">Test Used</label>
              <p className="mt-1 text-sm text-gray-900">{exam.colorVisionTest || 'Not specified'}</p>
            </div>
          </div>
          
          {/* Stereopsis & Near Addition */}
          <div>
            <h3 className="text-md font-medium text-gray-800 mb-3">Stereopsis & Near Addition</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Stereopsis ({exam.stereopsisUnit || 'arc seconds'})</label>
                <p className="mt-1 text-sm text-gray-900">{exam.stereopsis || 'Not recorded'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Near Addition Right</label>
                <p className="mt-1 text-sm text-gray-900">{exam.nearAdditionRight || 'Not recorded'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Near Addition Left</label>
                <p className="mt-1 text-sm text-gray-900">{exam.nearAdditionLeft || 'Not recorded'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Refraction */}
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
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">K1</label>
                  <p className="mt-1 text-sm text-gray-900">{exam.keratometryK1Right || 'Not recorded'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">K2</label>
                  <p className="mt-1 text-sm text-gray-900">{exam.keratometryK2Right || 'Not recorded'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Axis</label>
                  <p className="mt-1 text-sm text-gray-900">{exam.keratometryAxisRight || 'Not recorded'}</p>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Left Eye</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">K1</label>
                  <p className="mt-1 text-sm text-gray-900">{exam.keratometryK1Left || 'Not recorded'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">K2</label>
                  <p className="mt-1 text-sm text-gray-900">{exam.keratometryK2Left || 'Not recorded'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Axis</label>
                  <p className="mt-1 text-sm text-gray-900">{exam.keratometryAxisLeft || 'Not recorded'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Manifest Auto */}
        <div className="mb-6">
          <h3 className="text-md font-medium text-gray-800 mb-3">Manifest Auto</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Right Eye</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Sphere</label>
                  <p className="mt-1 text-sm text-gray-900">{exam.manifestAutoRightSphere || 'Not recorded'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Cylinder</label>
                  <p className="mt-1 text-sm text-gray-900">{exam.manifestAutoRightCylinder || 'Not recorded'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Axis</label>
                  <p className="mt-1 text-sm text-gray-900">{exam.manifestAutoRightAxis || 'Not recorded'}</p>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Left Eye</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Sphere</label>
                  <p className="mt-1 text-sm text-gray-900">{exam.manifestAutoLeftSphere || 'Not recorded'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Cylinder</label>
                  <p className="mt-1 text-sm text-gray-900">{exam.manifestAutoLeftCylinder || 'Not recorded'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Axis</label>
                  <p className="mt-1 text-sm text-gray-900">{exam.manifestAutoLeftAxis || 'Not recorded'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Manifest Ret */}
        <div className="mb-6">
          <h3 className="text-md font-medium text-gray-800 mb-3">Manifest Ret</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Right Eye</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Sphere</label>
                  <p className="mt-1 text-sm text-gray-900">{exam.manifestRetRightSphere || 'Not recorded'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Cylinder</label>
                  <p className="mt-1 text-sm text-gray-900">{exam.manifestRetRightCylinder || 'Not recorded'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Axis</label>
                  <p className="mt-1 text-sm text-gray-900">{exam.manifestRetRightAxis || 'Not recorded'}</p>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Left Eye</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Sphere</label>
                  <p className="mt-1 text-sm text-gray-900">{exam.manifestRetLeftSphere || 'Not recorded'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Cylinder</label>
                  <p className="mt-1 text-sm text-gray-900">{exam.manifestRetLeftCylinder || 'Not recorded'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Axis</label>
                  <p className="mt-1 text-sm text-gray-900">{exam.manifestRetLeftAxis || 'Not recorded'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subjective */}
        <div className="mb-6">
          <h3 className="text-md font-medium text-gray-800 mb-3">Subjective</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Right Eye</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Sphere</label>
                  <p className="mt-1 text-sm text-gray-900">{exam.subjectiveRightSphere || 'Not recorded'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Cylinder</label>
                  <p className="mt-1 text-sm text-gray-900">{exam.subjectiveRightCylinder || 'Not recorded'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Axis</label>
                  <p className="mt-1 text-sm text-gray-900">{exam.subjectiveRightAxis || 'Not recorded'}</p>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Left Eye</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Sphere</label>
                  <p className="mt-1 text-sm text-gray-900">{exam.subjectiveLeftSphere || 'Not recorded'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Cylinder</label>
                  <p className="mt-1 text-sm text-gray-900">{exam.subjectiveLeftCylinder || 'Not recorded'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Axis</label>
                  <p className="mt-1 text-sm text-gray-900">{exam.subjectiveLeftAxis || 'Not recorded'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Refraction Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500">Added Values</label>
            <p className="mt-1 text-sm text-gray-900">{exam.addedValues || 'Not recorded'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Best Vision - Right Eye</label>
            <p className="mt-1 text-sm text-gray-900">{exam.bestRightVision || 'Not recorded'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Best Vision - Left Eye</label>
            <p className="mt-1 text-sm text-gray-900">{exam.bestLeftVision || 'Not recorded'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">PD - Right Eye (mm)</label>
            <p className="mt-1 text-sm text-gray-900">{exam.pdRightEye || 'Not recorded'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">PD - Left Eye (mm)</label>
            <p className="mt-1 text-sm text-gray-900">{exam.pdLeftEye || 'Not recorded'}</p>
          </div>
        </div>
        
        {exam.refractionNotes && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-500">Refraction Notes</label>
            <p className="mt-1 text-sm text-gray-900">{exam.refractionNotes}</p>
          </div>
        )}
      </div>

      {/* Clinical Assessment */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
            <Stethoscope className="h-4 w-4 text-red-600" />
          </div>
          <h2 className="text-lg font-medium text-gray-900">Clinical Assessment</h2>
        </div>
        <div className="space-y-4">
          {exam.clinicalAssessment && (
            <div>
              <label className="block text-sm font-medium text-gray-500">Clinical Assessment</label>
              <p className="mt-1 text-sm text-gray-900">{exam.clinicalAssessment}</p>
            </div>
          )}
          {exam.diagnosis && (
            <div>
              <label className="block text-sm font-medium text-gray-500">Diagnosis</label>
              <p className="mt-1 text-sm text-gray-900">{exam.diagnosis}</p>
            </div>
          )}
          {exam.treatmentPlan && (
            <div>
              <label className="block text-sm font-medium text-gray-500">Treatment Plan</label>
              <p className="mt-1 text-sm text-gray-900">{exam.treatmentPlan}</p>
            </div>
          )}
        </div>
      </div>

      {/* Equipment Tracking */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
            <Settings className="h-4 w-4 text-gray-600" />
          </div>
          <h2 className="text-lg font-medium text-gray-900">Equipment Tracking</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500">Equipment Used</label>
            <p className="mt-1 text-sm text-gray-900">{exam.equipmentUsed || 'Not specified'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Calibration Date</label>
            <p className="mt-1 text-sm text-gray-900">
              {exam.equipmentCalibrationDate ? new Date(exam.equipmentCalibrationDate).toLocaleDateString() : 'Not specified'}
            </p>
          </div>
        </div>
      </div>

      {/* Additional Notes */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center">
            <Calendar className="h-4 w-4 text-teal-600" />
          </div>
          <h2 className="text-lg font-medium text-gray-900">Additional Notes</h2>
        </div>
        <div className="space-y-4">
          {exam.comment && (
            <div>
              <label className="block text-sm font-medium text-gray-500">Comments</label>
              <p className="mt-1 text-sm text-gray-900">{exam.comment}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
