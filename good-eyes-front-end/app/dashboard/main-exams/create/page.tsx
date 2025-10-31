'use client'
// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save } from 'lucide-react'
import { LoadingButton } from '@/components/loading-button'
import { mainExamApi, patientVisitSessionApi } from '@/lib/api'
import { CreateMainExamRequest, PatientVisitSession } from '@/lib/types'
import { LoadingPage } from '@/components/loading-page'

type SlitRow = { structure: string; finding: string; eyeSide: 'R'|'L'|'Both' }

export default function CreateMainExamPage() {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [isLoadingSessions, setIsLoadingSessions] = useState(true)
  const [sessions, setSessions] = useState<PatientVisitSession[]>([])
  const [selectedSession, setSelectedSession] = useState<number>(0)
  const [exam, setExam] = useState<CreateMainExamRequest>({ visitSessionId: 0 })
  const [rows, setRows] = useState<SlitRow[]>([])
  const SLIT_STRUCTURES = ['Lid','Conjunctiva','Cornea','AC','Iris','Lens','Vitreous'] as const

  useEffect(() => {
    const load = async () => {
      setIsLoadingSessions(true)
      try {
        const res = await patientVisitSessionApi.getAllVisitSessions({ page: 0, size: 1000 })
        setSessions(res.content || [])
      } finally {
        setIsLoadingSessions(false)
      }
    }
    load()
  }, [])

  const addRow = () => setRows(prev => [...prev, { structure: '', finding: '', eyeSide: 'R' }])
  const removeRow = (idx: number) => setRows(prev => prev.filter((_, i) => i !== idx))
  const updateRow = (idx: number, field: keyof SlitRow, value: string) => setRows(prev => prev.map((r,i) => i===idx ? { ...r, [field]: value } as SlitRow : r))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSession) {
      alert('Please select a visit session')
      return
    }
    try {
      setIsCreating(true)
      const payload: CreateMainExamRequest = {
        visitSessionId: selectedSession,
        externalRight: exam.externalRight,
        externalLeft: exam.externalLeft,
        slitLampObservations: rows.length ? rows.map(r => ({ structure: r.structure, finding: r.finding, eyeSide: r.eyeSide })) : undefined,
        cdrRight: typeof exam.cdrRight === 'number' ? exam.cdrRight : 0,
        cdrLeft: typeof exam.cdrLeft === 'number' ? exam.cdrLeft : 0,
        iopRight: typeof exam.iopRight === 'number' ? exam.iopRight : 0,
        iopLeft: typeof exam.iopLeft === 'number' ? exam.iopLeft : 0,
        advice: exam.advice,
        historyComments: exam.historyComments,
        doctorsNotes: exam.doctorsNotes,
        timeCompleted: exam.timeCompleted,
      }
      const result = await mainExamApi.create(payload)
      router.push(`/dashboard/main-exams/${result.id}`)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to create main exam')
    } finally {
      setIsCreating(false)
    }
  }

  if (isLoadingSessions) return <LoadingPage message="Loading visit sessions..." />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create Main Exam</h1>
        <p className="text-gray-600">Enter details for the main examination</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Visit Session</label>
            <select
              value={selectedSession}
              onChange={e => setSelectedSession(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value={0}>-- Select Visit Session --</option>
              {sessions.map(s => (
                <option key={s.id} value={s.id}>#{s.id} • {s.patientName} • {new Date(s.visitDate).toLocaleDateString()}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">External Right</label>
              <textarea value={exam.externalRight || ''} onChange={e => setExam({ ...exam, externalRight: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">External Left</label>
              <textarea value={exam.externalLeft || ''} onChange={e => setExam({ ...exam, externalLeft: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Slit Lamp Observations</label>
              <button type="button" onClick={addRow} className="text-sm text-blue-600 hover:text-blue-800">Add Row</button>
            </div>
            <div className="space-y-2">
              {rows.map((row, idx) => {
                const isPredefined = SLIT_STRUCTURES.includes(row.structure as any)
                const selectValue = isPredefined ? row.structure : 'Other'
                return (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center">
                  <select
                    value={selectValue}
                    onChange={e => {
                      const val = e.target.value
                      if (val === 'Other') {
                        // keep current custom value or clear
                        updateRow(idx, 'structure', row.structure && isPredefined ? '' : row.structure)
                      } else {
                        updateRow(idx, 'structure', val)
                      }
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {SLIT_STRUCTURES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                    <option value="Other">Other...</option>
                  </select>
                  {selectValue === 'Other' && (
                    <input type="text" value={row.structure} onChange={e => updateRow(idx, 'structure', e.target.value)} placeholder="Custom structure" className="px-3 py-2 border border-gray-300 rounded-md" />
                  )}
                  <input type="text" value={row.finding} onChange={e => updateRow(idx, 'finding', e.target.value)} placeholder="Finding" className="px-3 py-2 border border-gray-300 rounded-md" />
                  <select value={row.eyeSide} onChange={e => updateRow(idx, 'eyeSide', e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md">
                    <option value="R">R</option>
                    <option value="L">L</option>
                    <option value="Both">Both</option>
                  </select>
                  <button type="button" onClick={() => removeRow(idx)} className="text-sm text-red-600 hover:text-red-800">Remove</button>
                </div>
              )})}
              {rows.length === 0 && <p className="text-sm text-gray-500">No observations added.</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CDR Right</label>
              <input type="number" step="0.01" value={exam.cdrRight ?? ''} onChange={e => setExam({ ...exam, cdrRight: e.target.value ? parseFloat(e.target.value) : undefined })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CDR Left</label>
              <input type="number" step="0.01" value={exam.cdrLeft ?? ''} onChange={e => setExam({ ...exam, cdrLeft: e.target.value ? parseFloat(e.target.value) : undefined })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">IOP Right</label>
              <input type="number" step="0.1" value={exam.iopRight ?? ''} onChange={e => setExam({ ...exam, iopRight: e.target.value !== '' ? parseFloat(e.target.value) : undefined })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">IOP Left</label>
              <input type="number" step="0.1" value={exam.iopLeft ?? ''} onChange={e => setExam({ ...exam, iopLeft: e.target.value !== '' ? parseFloat(e.target.value) : undefined })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Advice</label>
              <textarea value={exam.advice || ''} onChange={e => setExam({ ...exam, advice: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">History Comments</label>
              <textarea value={exam.historyComments || ''} onChange={e => setExam({ ...exam, historyComments: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Doctor's Notes</label>
            <textarea value={exam.doctorsNotes || ''} onChange={e => setExam({ ...exam, doctorsNotes: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Completed</label>
            <input type="datetime-local" value={exam.timeCompleted || ''} onChange={e => setExam({ ...exam, timeCompleted: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
        </div>

        <div className="flex justify-end">
          <LoadingButton type="submit" loading={isCreating} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
            <Save className="h-4 w-4 mr-2" />
            Create
          </LoadingButton>
        </div>
      </form>
    </div>
  )
}

