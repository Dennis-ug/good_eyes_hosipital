'use client'
// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Eye, Edit, Trash2 } from 'lucide-react'
import { mainExamApi } from '@/lib/api'
import { MainExam, Page } from '@/lib/types'
import { LoadingPage } from '@/components/loading-page'
import { ConfirmationDialog } from '@/components/confirmation-dialog'

export default function MainExamsPage() {
  const router = useRouter()
  const [page, setPage] = useState<Page<MainExam> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showDelete, setShowDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [selected, setSelected] = useState<MainExam | null>(null)

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const data = await mainExamApi.getAll({ page: 0, size: 20, sort: 'timeCompleted,desc' })
      console.log('Main exams API response:', data)
      console.log('Content type:', typeof data.content)
      console.log('Content is array:', Array.isArray(data.content))
      setPage(data)
    } catch (error) {
      console.error('Error fetching main exams:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const onDelete = async () => {
    if (!selected) return
    try {
      setIsDeleting(true)
      await mainExamApi.delete(selected.id)
      setPage(prev => {
        if (!prev) return prev
        const content = prev.content.filter(e => e.id !== selected.id)
        return { ...prev, content, totalElements: Math.max(0, prev.totalElements - 1), numberOfElements: content.length, empty: content.length === 0 }
      })
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to delete')
    } finally {
      setIsDeleting(false)
      setShowDelete(false)
      setSelected(null)
    }
  }

  if (isLoading) return <LoadingPage message="Loading main exams..." />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Main Exams</h1>
          <p className="text-gray-600">Manage main examinations</p>
        </div>
        <button onClick={() => router.push('/dashboard/main-exams/create')} className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" /> New Exam
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Main Exams ({page?.totalElements ?? 0})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visit Session</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CDR (R/L)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IOP (R/L)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {page?.content && Array.isArray(page.content) && page.content.map(exam => (
                <tr key={exam.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{exam.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{exam.visitSessionId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{exam.cdrRight ?? '-'} / {exam.cdrLeft ?? '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{exam.iopRight !== null && exam.iopRight !== undefined ? exam.iopRight : '-'} / {exam.iopLeft !== null && exam.iopLeft !== undefined ? exam.iopLeft : '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exam.timeCompleted ? new Date(exam.timeCompleted).toLocaleString() : '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button onClick={() => router.push(`/dashboard/main-exams/${exam.id}`)} className="text-blue-600 hover:text-blue-900"><Eye className="h-4 w-4" /></button>
                      <button onClick={() => router.push(`/dashboard/main-exams/${exam.id}/edit`)} className="text-indigo-600 hover:text-indigo-900"><Edit className="h-4 w-4" /></button>
                      <button onClick={() => { setSelected(exam); setShowDelete(true) }} className="text-red-600 hover:text-red-900"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!page || !page.content || !Array.isArray(page.content) || page.content.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">No main exams found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={showDelete}
        onClose={() => { if (!isDeleting) { setShowDelete(false); setSelected(null) } }}
        onConfirm={onDelete}
        title="Delete Main Exam"
        message={`Are you sure you want to delete main exam #${selected?.id}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  )
}

