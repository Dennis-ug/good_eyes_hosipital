'use client'
// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { mainExamApi } from '@/lib/api'
import { MainExam } from '@/lib/types'
import { LoadingPage } from '@/components/loading-page'

export default function MainExamViewPage() {
  const params = useParams()
  const router = useRouter()
  const examId = params.id ? parseInt(params.id as string, 10) : null
  const [exam, setExam] = useState<MainExam | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      if (!examId) return
      setIsLoading(true)
      try {
        const data = await mainExamApi.getById(examId)
        setExam(data)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [examId])

  if (isLoading) return <LoadingPage message="Loading main exam..." />
  if (!exam) return <div className="text-gray-600">Main exam not found.</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Main Exam #{exam.id}</h1>
          <p className="text-gray-600">Visit Session #{exam.visitSessionId}</p>
        </div>
        <button onClick={() => router.push(`/dashboard/main-exams/${exam.id}/edit`)} className="px-4 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700">Edit</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6 space-y-2">
          <h2 className="text-lg font-medium text-gray-900 mb-2">External Examination</h2>
          <div>
            <label className="block text-xs text-gray-500 uppercase">Right</label>
            <p className="text-sm text-gray-900 whitespace-pre-line">{exam.externalRight || '—'}</p>
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase">Left</label>
            <p className="text-sm text-gray-900 whitespace-pre-line">{exam.externalLeft || '—'}</p>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6 space-y-2">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Metrics</h2>
          <p className="text-sm text-gray-900">CDR: {exam.cdrRight ?? '—'} / {exam.cdrLeft ?? '—'}</p>
          <p className="text-sm text-gray-900">IOP: {exam.iopRight !== null && exam.iopRight !== undefined ? exam.iopRight : '—'} / {exam.iopLeft !== null && exam.iopLeft !== undefined ? exam.iopLeft : '—'}</p>
          <p className="text-sm text-gray-500">Completed: {exam.timeCompleted ? new Date(exam.timeCompleted).toLocaleString() : '—'}</p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-3">Slit Lamp Observations</h2>
        {exam.slitLampObservations && exam.slitLampObservations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Structure</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Finding</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Eye</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {exam.slitLampObservations.map(obs => (
                  <tr key={obs.id}>
                    <td className="px-4 py-2 text-sm text-gray-900">{obs.structure}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{obs.finding}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{obs.eyeSide}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No observations.</p>
        )}
      </div>

      <div className="bg-white shadow rounded-lg p-6 space-y-2">
        <h2 className="text-lg font-medium text-gray-900 mb-2">Notes</h2>
        <p className="text-sm text-gray-900"><span className="text-gray-500">Advice:</span> {exam.advice || '—'}</p>
        <p className="text-sm text-gray-900"><span className="text-gray-500">History:</span> {exam.historyComments || '—'}</p>
        <p className="text-sm text-gray-900"><span className="text-gray-500">Doctor's Notes:</span> {exam.doctorsNotes || '—'}</p>
      </div>
    </div>
  )
}

