'use client'

import { useState, useEffect } from 'react'
import { Plus, Eye, Edit, Trash2, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { LoadingPage } from '@/components/loading-page'
import { ConfirmationDialog } from '@/components/confirmation-dialog'
import { basicRefractionExamApi } from '@/lib/api'
import { BasicRefractionExam, Page } from '@/lib/types'

export default function BasicRefractionExamsPage() {
  const [basicRefractionExams, setBasicRefractionExams] = useState<Page<BasicRefractionExam> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [examToDelete, setExamToDelete] = useState<BasicRefractionExam | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  const router = useRouter()

  const fetchBasicRefractionExams = async () => {
    try {
      setIsLoading(true)
      const data = await basicRefractionExamApi.getAll({ page: 0, size: 20, sort: 'examinationDate,desc' })
      setBasicRefractionExams(data)
      setIsDemoMode(false)
    } catch (error) {
      console.error('Failed to fetch basic refraction exams:', error)
      
      // Demo mode with sample data
      const demoData: Page<BasicRefractionExam> = {
        content: [
          {
            id: 1,
            visitSessionId: 1,
            neuroOriented: true,
            neuroMood: 'Alert and cooperative',
            pupilsPerrl: true,
            visualAcuityDistanceScRight: '20/20',
            visualAcuityDistanceScLeft: '20/25',
            manifestAutoRightSphere: '-1.25',
            manifestAutoRightCylinder: '-0.50',
            manifestAutoRightAxis: '90',
            manifestAutoLeftSphere: '-1.00',
            manifestAutoLeftCylinder: '-0.25',
            manifestAutoLeftAxis: '85',
            bestRightVision: '20/20',
            bestLeftVision: '20/20',
            pdRightEye: 32.0,
            pdLeftEye: 32.0,
            refractionNotes: 'Patient shows mild myopia with astigmatism',
            comment: 'Good candidate for corrective lenses',
            examinationDate: '2025-01-15T10:30:00',
            examinedBy: 'Dr. Smith',
            createdAt: '2025-01-15T10:30:00',
            updatedAt: '2025-01-15T10:30:00',
            createdBy: 'Dr. Smith',
            updatedBy: 'Dr. Smith',
            patientName: 'John Doe',
            patientPhone: '1234567890'
          }
        ],
        totalElements: 1,
        totalPages: 1,
        size: 20,
        number: 0,
        first: true,
        last: true,
        numberOfElements: 1,
        empty: false,
        pageable: {
          pageNumber: 0,
          pageSize: 20,
          sort: { empty: true, sorted: false, unsorted: true },
          offset: 0,
          paged: true,
          unpaged: false
        },
        sort: { empty: true, sorted: false, unsorted: true }
      }
      
      setBasicRefractionExams(demoData)
      setIsDemoMode(true)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBasicRefractionExams()
  }, [])

  const handleDeleteClick = (exam: BasicRefractionExam) => {
    setExamToDelete(exam)
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = async () => {
    if (!examToDelete) return
    try {
      setIsDeleting(true)
      // If in demo mode, just remove locally
      if (isDemoMode) {
        setBasicRefractionExams(prev => {
          if (!prev) return prev
          const updatedContent = prev.content.filter(e => e.id !== examToDelete.id)
          return {
            ...prev,
            content: updatedContent,
            totalElements: Math.max(0, prev.totalElements - 1),
            numberOfElements: updatedContent.length,
            empty: updatedContent.length === 0,
          }
        })
      } else {
        await basicRefractionExamApi.delete(examToDelete.id)
        // Optimistically update list
        setBasicRefractionExams(prev => {
          if (!prev) return prev
          const updatedContent = prev.content.filter(e => e.id !== examToDelete.id)
          return {
            ...prev,
            content: updatedContent,
            totalElements: Math.max(0, prev.totalElements - 1),
            numberOfElements: updatedContent.length,
            empty: updatedContent.length === 0,
          }
        })
      }
    } catch (error) {
      console.error('Failed to delete basic refraction exam:', error)
      alert(error instanceof Error ? error.message : 'Failed to delete exam')
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
      setExamToDelete(null)
    }
  }

  if (isLoading) {
    return <LoadingPage message="Loading basic refraction exams..." />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Basic Refraction Exams</h1>
          <p className="text-gray-600">Manage basic refraction examinations</p>
          {isDemoMode && (
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Demo Mode:</strong> Backend API not available. Showing sample data.
              </p>
            </div>
          )}
        </div>
        <button
          onClick={() => router.push('/dashboard/basic-refraction-exams/create')}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Exam
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Basic Refraction Exams ({basicRefractionExams?.totalElements || 0})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient & Visit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Neuro Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visual Acuity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Refraction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Exam Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {basicRefractionExams?.content && basicRefractionExams.content.length > 0 ? (
                basicRefractionExams.content.map((exam) => (
                  <tr key={exam.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {exam.patientName || `Patient #${exam.visitSessionId}`}
                          </div>
                          <div className="text-sm text-gray-500">
                            {exam.patientPhone || `Visit #${exam.visitSessionId}`}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {exam.neuroOriented ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Oriented
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Not Oriented
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>R: {exam.visualAcuityDistanceScRight || 'N/A'}</div>
                        <div>L: {exam.visualAcuityDistanceScLeft || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>R: {exam.manifestAutoRightSphere || 0} {exam.manifestAutoRightCylinder ? `/${exam.manifestAutoRightCylinder}` : ''} {exam.manifestAutoRightAxis ? `@${exam.manifestAutoRightAxis}°` : ''}</div>
                        <div>L: {exam.manifestAutoLeftSphere || 0} {exam.manifestAutoLeftCylinder ? `/${exam.manifestAutoLeftCylinder}` : ''} {exam.manifestAutoLeftAxis ? `@${exam.manifestAutoLeftAxis}°` : ''}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {exam.examinationDate ? new Date(exam.examinationDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => router.push(`/dashboard/basic-refraction-exams/${exam.id}`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => router.push(`/dashboard/basic-refraction-exams/${exam.id}/edit`)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(exam)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No basic refraction exams found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => { if (!isDeleting) { setShowDeleteDialog(false); setExamToDelete(null) } }}
        onConfirm={handleConfirmDelete}
        title="Delete Basic Refraction Exam"
        message={`Are you sure you want to delete exam #${examToDelete?.id}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  )
}
