'use client'
// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { ArrowLeft, Edit, User, Phone, MapPin, Calendar, FileText } from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import { patientApi } from '@/lib/api'
import { Patient } from '@/lib/types'
import { LoadingPage } from '@/components/loading-page'

export default function PatientViewPage() {
  const router = useRouter()
  const params = useParams()
  const patientId = Number(params.id)
  
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [patient, setPatient] = useState<Patient | null>(null)

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const patientData = await patientApi.getById(patientId)
        setPatient(patientData)
      } catch (error) {
        console.error('Failed to fetch patient:', error)
        setError('Failed to load patient data')
        if (error instanceof Error) {
          alert(`Error: ${error.message}`)
        }
      } finally {
        setIsLoading(false)
      }
    }

    if (patientId) {
      fetchPatient()
    }
  }, [patientId])

  if (isLoading) {
    return (
      <LoadingPage 
        message="Loading patient data..."
        variant="spinner"
        size="lg"
        color="blue"
        layout="top"
      />
    )
  }

  if (error || !patient) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Patient not found'}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Patient Details</h1>
            <p className="text-gray-600">View patient information</p>
          </div>
        </div>
        <button
          onClick={() => router.push(`/dashboard/patients/${patient.id}/edit`)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Patient
        </button>
      </div>

      {/* Patient Information Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <User className="h-5 w-5 text-blue-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Patient Number</label>
                <p className="mt-1 text-sm text-gray-900 font-medium">{patient.patientNumber || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Full Name</label>
                <p className="mt-1 text-sm text-gray-900">{patient.firstName} {patient.lastName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Gender</label>
                <p className="mt-1 text-sm text-gray-900">{patient.gender || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">National ID</label>
                <p className="mt-1 text-sm text-gray-900">{patient.nationalId || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Age</label>
                <p className="mt-1 text-sm text-gray-900">
                  {patient.ageInYears} years, {patient.ageInMonths} months
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Marital Status</label>
                <p className="mt-1 text-sm text-gray-900">{patient.maritalStatus || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Occupation</label>
                <p className="mt-1 text-sm text-gray-900">{patient.occupation || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <Phone className="h-5 w-5 text-green-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Phone Number</label>
                <p className="mt-1 text-sm text-gray-900">{patient.phone || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Alternative Phone</label>
                <p className="mt-1 text-sm text-gray-900">{patient.alternativePhone || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Phone Owner</label>
                <p className="mt-1 text-sm text-gray-900">{patient.phoneOwner || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Owner Name</label>
                <p className="mt-1 text-sm text-gray-900">{patient.ownerName || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Next of Kin */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <User className="h-5 w-5 text-purple-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Next of Kin</h3>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Name</label>
                <p className="mt-1 text-sm text-gray-900">{patient.nextOfKin || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Relationship</label>
                <p className="mt-1 text-sm text-gray-900">{patient.nextOfKinRelationship || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Phone</label>
                <p className="mt-1 text-sm text-gray-900">{patient.nextOfKinPhone || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-orange-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Additional Information</h3>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Patient Category</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                  patient.patientCategory === 'VIP' 
                    ? 'bg-purple-100 text-purple-800' 
                    : patient.patientCategory === 'Emergency'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {patient.patientCategory || 'N/A'}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Company</label>
                <p className="mt-1 text-sm text-gray-900">{patient.company || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Preferred Language</label>
                <p className="mt-1 text-sm text-gray-900">{patient.preferredLanguage || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Research Number</label>
                <p className="mt-1 text-sm text-gray-900">{patient.researchNumber || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Citizenship Information */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-indigo-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Citizenship Information</h3>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Citizenship</label>
                <p className="mt-1 text-sm text-gray-900">{patient.citizenship || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Country ID</label>
                <p className="mt-1 text-sm text-gray-900">{patient.countryId || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Foreigner/Refugee Status</label>
                <p className="mt-1 text-sm text-gray-900">{patient.foreignerOrRefugee || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Non-Ugandan National ID</label>
                <p className="mt-1 text-sm text-gray-900">{patient.nonUgandanNationalIdNo || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Residence */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-teal-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Residence</h3>
            </div>
          </div>
          <div className="p-6">
            <div>
              <label className="block text-sm font-medium text-gray-500">Address</label>
              <p className="mt-1 text-sm text-gray-900">{patient.residence || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Registration Information */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Registration Information</h3>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Reception Timestamp</label>
                <p className="mt-1 text-sm text-gray-900">
                  {patient.receptionTimestamp ? formatDate(patient.receptionTimestamp) : 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Received By</label>
                <p className="mt-1 text-sm text-gray-900">{patient.receivedBy || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 