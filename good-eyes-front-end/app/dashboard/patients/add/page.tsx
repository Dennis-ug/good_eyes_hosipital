'use client'
// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { ArrowLeft, Save, UserPlus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { receptionApi } from '@/lib/api'
import { CreatePatientRequest } from '@/lib/types'
import { LoadingButton } from '@/components/loading-button'

export default function AddPatientPage() {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [patient, setPatient] = useState<CreatePatientRequest>({
    firstName: '',
    lastName: '',
    gender: '',
    nationalId: '',
    dateOfBirth: '',
    ageInYears: 0,
    ageInMonths: 0,
    maritalStatus: '',
    occupation: '',
    nextOfKin: '',
    nextOfKinRelationship: '',
    nextOfKinPhone: '',
    phone: '',
    alternativePhone: '',
    phoneOwner: '',
    ownerName: '',
    patientCategory: '',
    company: '',
    preferredLanguage: '',
    citizenship: '',
    countryId: '',
    foreignerOrRefugee: '',
    nonUgandanNationalIdNo: '',
    residence: '',
    researchNumber: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)
    setError(null)
    setSuccessMessage(null)

    try {
      console.log('Creating patient with reception API (user-based system):', patient)
      
      // Use reception API which handles the new user-based invoice system
      const createdPatient = await receptionApi.receiveNewPatient(patient)
      
      console.log('Patient created successfully via reception:', createdPatient)
      // Redirect to patients list after creation
      router.push('/dashboard/patients')
    } catch (error) {
      console.error('Failed to create patient:', error)
      
      let errorMessage = 'Failed to create patient'
      
      if (error instanceof Error) {
        // Handle specific error cases based on the new API structure
        if (error.message.includes('Cannot delete this resource because it has related data')) {
          errorMessage = 'Patient creation failed due to database constraints. Please try with different data or contact support.'
        } else if (error.message.includes('Phone number') && error.message.includes('already registered')) {
          errorMessage = error.message
        } else if (error.message.includes('Alternative phone number') && error.message.includes('already registered')) {
          errorMessage = error.message
        } else if (error.message.includes('Primary phone and alternative phone cannot be the same')) {
          errorMessage = error.message
        } else if (error.message.includes('duplicate') || error.message.includes('already exists')) {
          errorMessage = 'A patient with this National ID already exists. Please use a different National ID.'
        } else if (error.message.includes('Unauthorized') || error.message.includes('Access denied')) {
          errorMessage = 'You do not have permission to create patients. Please contact your administrator.'
        } else {
          errorMessage = error.message
        }
      }
      
      setError(errorMessage)
      alert(errorMessage)
    } finally {
      setIsCreating(false)
    }
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
            <h1 className="text-2xl font-bold text-gray-900">Add New Patient</h1>
            <p className="text-gray-600">Enter patient information</p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{successMessage}</p>
              <p className="text-sm text-green-700 mt-1">The form has been reset for the next patient entry.</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setSuccessMessage(null)}
                className="inline-flex text-green-400 hover:text-green-600"
              >
                <span className="sr-only">Dismiss</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Patient Form */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <UserPlus className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Patient Information</h3>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Personal Information */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">Personal Information</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={patient.firstName}
                  onChange={(e) => setPatient({ ...patient, firstName: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={patient.lastName}
                  onChange={(e) => setPatient({ ...patient, lastName: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                  Gender *
                </label>
                <select
                  id="gender"
                  value={patient.gender}
                  onChange={(e) => setPatient({ ...patient, gender: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div>
                <label htmlFor="nationalId" className="block text-sm font-medium text-gray-700">
                  National ID
                </label>
                <input
                  type="text"
                  id="nationalId"
                  value={patient.nationalId}
                  onChange={(e) => setPatient({ ...patient, nationalId: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="ageInYears" className="block text-sm font-medium text-gray-700">
                  Age (Years) *
                </label>
                <input
                  type="number"
                  id="ageInYears"
                  min="0"
                  max="150"
                  value={patient.ageInYears}
                  onChange={(e) => setPatient({ ...patient, ageInYears: parseInt(e.target.value) || 0 })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="maritalStatus" className="block text-sm font-medium text-gray-700">
                  Marital Status
                </label>
                <select
                  id="maritalStatus"
                  value={patient.maritalStatus}
                  onChange={(e) => setPatient({ ...patient, maritalStatus: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>



              <div>
                <label htmlFor="occupation" className="block text-sm font-medium text-gray-700">
                  Occupation
                </label>
                <input
                  type="text"
                  id="occupation"
                  value={patient.occupation}
                  onChange={(e) => setPatient({ ...patient, occupation: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">Contact Information</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={patient.phone}
                  onChange={(e) => setPatient({ ...patient, phone: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="alternativePhone" className="block text-sm font-medium text-gray-700">
                  Alternative Phone
                </label>
                <input
                  type="tel"
                  id="alternativePhone"
                  value={patient.alternativePhone}
                  onChange={(e) => setPatient({ ...patient, alternativePhone: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="phoneOwner" className="block text-sm font-medium text-gray-700">
                  Phone Owner *
                </label>
                <input
                  type="text"
                  id="phoneOwner"
                  value={patient.phoneOwner}
                  onChange={(e) => setPatient({ ...patient, phoneOwner: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700">
                  Owner Name *
                </label>
                <input
                  type="text"
                  id="ownerName"
                  value={patient.ownerName}
                  onChange={(e) => setPatient({ ...patient, ownerName: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Next of Kin */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">Next of Kin</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label htmlFor="nextOfKin" className="block text-sm font-medium text-gray-700">
                  Next of Kin
                </label>
                <input
                  type="text"
                  id="nextOfKin"
                  value={patient.nextOfKin}
                  onChange={(e) => setPatient({ ...patient, nextOfKin: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="nextOfKinRelationship" className="block text-sm font-medium text-gray-700">
                  Relationship
                </label>
                <input
                  type="text"
                  id="nextOfKinRelationship"
                  value={patient.nextOfKinRelationship}
                  onChange={(e) => setPatient({ ...patient, nextOfKinRelationship: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="nextOfKinPhone" className="block text-sm font-medium text-gray-700">
                  Next of Kin Phone
                </label>
                <input
                  type="tel"
                  id="nextOfKinPhone"
                  value={patient.nextOfKinPhone}
                  onChange={(e) => setPatient({ ...patient, nextOfKinPhone: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">Additional Information</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label htmlFor="patientCategory" className="block text-sm font-medium text-gray-700">
                  Patient Category *
                </label>
                <select
                  id="patientCategory"
                  value={patient.patientCategory}
                  onChange={(e) => setPatient({ ...patient, patientCategory: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Regular">Regular</option>
                  <option value="VIP">VIP</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>

              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                  Company
                </label>
                <input
                  type="text"
                  id="company"
                  value={patient.company}
                  onChange={(e) => setPatient({ ...patient, company: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="preferredLanguage" className="block text-sm font-medium text-gray-700">
                  Preferred Language
                </label>
                <select
                  id="preferredLanguage"
                  value={patient.preferredLanguage}
                  onChange={(e) => setPatient({ ...patient, preferredLanguage: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Language</option>
                  <option value="English">English</option>
                  <option value="Luganda">Luganda</option>
                  <option value="Swahili">Swahili</option>
                  <option value="French">French</option>
                </select>
              </div>

              <div>
                <label htmlFor="residence" className="block text-sm font-medium text-gray-700">
                  Residence *
                </label>
                <input
                  type="text"
                  id="residence"
                  value={patient.residence}
                  onChange={(e) => setPatient({ ...patient, residence: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Citizenship Information */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">Citizenship Information</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label htmlFor="citizenship" className="block text-sm font-medium text-gray-700">
                  Citizenship *
                </label>
                <select
                  id="citizenship"
                  value={patient.citizenship}
                  onChange={(e) => setPatient({ ...patient, citizenship: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Citizenship</option>
                  <option value="Ugandan">Ugandan</option>
                  <option value="Non-Ugandan">Non-Ugandan</option>
                </select>
              </div>

              <div>
                <label htmlFor="countryId" className="block text-sm font-medium text-gray-700">
                  Country ID *
                </label>
                <input
                  type="text"
                  id="countryId"
                  value={patient.countryId}
                  onChange={(e) => setPatient({ ...patient, countryId: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="foreignerOrRefugee" className="block text-sm font-medium text-gray-700">
                  Foreigner/Refugee
                </label>
                <select
                  id="foreignerOrRefugee"
                  value={patient.foreignerOrRefugee}
                  onChange={(e) => setPatient({ ...patient, foreignerOrRefugee: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Status</option>
                  <option value="No">No</option>
                  <option value="Foreigner">Foreigner</option>
                  <option value="Refugee">Refugee</option>
                </select>
              </div>

              <div>
                <label htmlFor="nonUgandanNationalIdNo" className="block text-sm font-medium text-gray-700">
                  Non-Ugandan National ID
                </label>
                <input
                  type="text"
                  id="nonUgandanNationalIdNo"
                  value={patient.nonUgandanNationalIdNo}
                  onChange={(e) => setPatient({ ...patient, nonUgandanNationalIdNo: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="researchNumber" className="block text-sm font-medium text-gray-700">
                  Research Number
                </label>
                <input
                  type="text"
                  id="researchNumber"
                  value={patient.researchNumber}
                  onChange={(e) => setPatient({ ...patient, researchNumber: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => router.push('/dashboard/patients')}
                className="px-4 py-2 border border-blue-300 rounded-md text-sm font-medium text-blue-700 hover:bg-blue-50"
              >
                View All Patients
              </button>
            </div>
            <LoadingButton
              type="submit"
              loading={isCreating}
              loadingText="Creating Patient..."
              variant="primary"
              size="md"
            >
              <Save className="h-4 w-4 mr-2" />
              Create Patient
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  )
}
