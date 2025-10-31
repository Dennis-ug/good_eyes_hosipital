'use client'
// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { mainExamApi, patientVisitSessionApi } from '@/lib/api'
import { MainExam, PatientVisitSession, CreateMainExamRequest } from '@/lib/types'
import VisitSessionHeader from '../../_components/VisitSessionHeader'

type SlitRow = { structure: string; finding: string; eyeSide: 'R'|'L'|'Both' }

export default function MainExamPage() {
  const params = useParams()
  const visitSessionId = Number(params.id)
  const router = useRouter()
  
  const [visitSession, setVisitSession] = useState<PatientVisitSession | null>(null)
  const [mainExamData, setMainExamData] = useState<MainExam | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rows, setRows] = useState<SlitRow[]>([])
  const [editing, setEditing] = useState<boolean>(false)

  const [formData, setFormData] = useState<CreateMainExamRequest>({
    visitSessionId: visitSessionId,
    externalRight: '',
    externalLeft: '',
    cdrRight: undefined,
    cdrLeft: undefined,
    iopRight: undefined,
    iopLeft: undefined,
    advice: '',
    historyComments: '',
    doctorsNotes: '',
    timeCompleted: ''
  })

  const SLIT_STRUCTURES = ['Lid','Conjunctiva','Cornea','AC','Iris','Lens','Vitreous'] as const

  useEffect(() => {
    fetchData()
  }, [visitSessionId])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [visitData, examData] = await Promise.all([
        patientVisitSessionApi.getVisitSession(visitSessionId),
        mainExamApi.getByVisitSession(visitSessionId).catch(() => null)
      ])
      setVisitSession(visitData)
      setMainExamData(examData)
      setEditing(!Boolean(examData))
      
      if (examData) {
        setFormData({
          visitSessionId: visitSessionId,
          externalRight: examData.externalRight || '',
          externalLeft: examData.externalLeft || '',
          cdrRight: examData.cdrRight,
          cdrLeft: examData.cdrLeft,
          iopRight: examData.iopRight,
          iopLeft: examData.iopLeft,
          advice: examData.advice || '',
          historyComments: examData.historyComments || '',
          doctorsNotes: examData.doctorsNotes || '',
          timeCompleted: examData.timeCompleted || ''
        })
        
        // Set slit lamp observations
        if (examData.slitLampObservations && examData.slitLampObservations.length > 0) {
          setRows(examData.slitLampObservations.map(obs => ({
            structure: obs.structure,
            finding: obs.finding,
            eyeSide: obs.eyeSide
          })))
        }
      }
    } catch (err) {
      console.error('Failed to fetch data:', err)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const addRow = () => setRows(prev => [...prev, { structure: '', finding: '', eyeSide: 'R' }])
  const removeRow = (idx: number) => setRows(prev => prev.filter((_, i) => i !== idx))
  const updateRow = (idx: number, field: keyof SlitRow, value: string) => setRows(prev => prev.map((r,i) => i===idx ? { ...r, [field]: value } as SlitRow : r))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      const examRequest: CreateMainExamRequest = {
        visitSessionId: visitSessionId,
        externalRight: formData.externalRight || undefined,
        externalLeft: formData.externalLeft || undefined,
        slitLampObservations: rows.length ? rows.map(r => ({ structure: r.structure, finding: r.finding, eyeSide: r.eyeSide })) : undefined,
        cdrRight: typeof formData.cdrRight === 'number' ? formData.cdrRight : undefined,
        cdrLeft: typeof formData.cdrLeft === 'number' ? formData.cdrLeft : undefined,
        iopRight: typeof formData.iopRight === 'number' ? formData.iopRight : undefined,
        iopLeft: typeof formData.iopLeft === 'number' ? formData.iopLeft : undefined,
        advice: formData.advice || undefined,
        historyComments: formData.historyComments || undefined,
        doctorsNotes: formData.doctorsNotes || undefined,
        timeCompleted: formData.timeCompleted || undefined
      }

      if (mainExamData) {
        await mainExamApi.update(mainExamData.id, {
          ...examRequest,
          id: mainExamData.id
        })
      } else {
        await mainExamApi.create(examRequest)
      }

      // Redirect back to the visit session view
      router.push(`/dashboard/patient-visit-sessions/${visitSessionId}`)
    } catch (err) {
      console.error('Failed to save exam:', err)
      alert('Failed to save exam data')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading exam data...</p>
        </div>
      </div>
    )
  }

  if (error || !visitSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Error Loading Exam</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error || 'Visit session not found'}</p>
          <Link
            href={`/dashboard/patient-visit-sessions/${visitSessionId}`}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Visit Session
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4">
          <Link
            href={`/dashboard/patient-visit-sessions/${visitSessionId}`}
            className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Visit Session
          </Link>
        </div>
        <VisitSessionHeader visitSession={visitSession} />

        {/* Summary when exists and not editing */}
        {mainExamData && !editing && (
          <div className="mb-6 rounded-lg border border-gray-200 bg-white shadow-sm p-6 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Main Exam Summary</h2>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Update
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-500">External (Right)</div>
                <div className="text-gray-900 dark:text-white">{mainExamData.externalRight || '-'}</div>
              </div>
              <div>
                <div className="text-gray-500">External (Left)</div>
                <div className="text-gray-900 dark:text-white">{mainExamData.externalLeft || '-'}</div>
              </div>
              <div>
                <div className="text-gray-500">CDR (R/L)</div>
                <div className="text-gray-900 dark:text-white">{mainExamData.cdrRight ?? '-'} / {mainExamData.cdrLeft ?? '-'}</div>
              </div>
              <div>
                <div className="text-gray-500">IOP (R/L)</div>
                <div className="text-gray-900 dark:text-white">{mainExamData.iopRight ?? '-'} / {mainExamData.iopLeft ?? '-'}</div>
              </div>
              <div className="md:col-span-2">
                <div className="text-gray-500">Slit Lamp Observations</div>
                {mainExamData.slitLampObservations && mainExamData.slitLampObservations.length > 0 ? (
                  <div className="mt-1 divide-y divide-gray-100 dark:divide-gray-700 rounded border border-gray-100 dark:border-gray-700">
                    {mainExamData.slitLampObservations.map((o, idx) => (
                      <div key={idx} className="px-3 py-2 flex justify-between text-xs text-gray-700 dark:text-gray-300">
                        <span className="font-medium">{o.structure}</span>
                        <span className="truncate mx-2">{o.finding}</span>
                        <span className="text-gray-500">{o.eyeSide}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-900 dark:text-white">-</div>
                )}
              </div>
              <div>
                <div className="text-gray-500">Advice</div>
                <div className="text-gray-900 dark:text-white">{mainExamData.advice || '-'}</div>
              </div>
              <div>
                <div className="text-gray-500">History Comments</div>
                <div className="text-gray-900 dark:text-white">{mainExamData.historyComments || '-'}</div>
              </div>
              <div className="md:col-span-2">
                <div className="text-gray-500">Doctor's Notes</div>
                <div className="text-gray-900 dark:text-white">{mainExamData.doctorsNotes || '-'}</div>
              </div>
            </div>
          </div>
        )}

        {/* Main Exam Form (create or update) */}
        {(editing || !mainExamData) && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
            {/* External Examination */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">External Right</label>
                <textarea
                  value={formData.externalRight || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, externalRight: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  placeholder="External examination findings for right eye..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">External Left</label>
                <textarea
                  value={formData.externalLeft || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, externalLeft: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  placeholder="External examination findings for left eye..."
                />
              </div>
            </div>

            {/* Slit Lamp Observations */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Slit Lamp Observations</label>
                <button 
                  type="button" 
                  onClick={addRow} 
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Add Row
                </button>
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
                            updateRow(idx, 'structure', row.structure && isPredefined ? '' : row.structure)
                          } else {
                            updateRow(idx, 'structure', val)
                          }
                        }}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                      >
                        {SLIT_STRUCTURES.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                        <option value="Other">Other...</option>
                      </select>
                      {selectValue === 'Other' && (
                        <input 
                          type="text" 
                          value={row.structure} 
                          onChange={e => updateRow(idx, 'structure', e.target.value)} 
                          placeholder="Custom structure" 
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" 
                        />
                      )}
                      <input 
                        type="text" 
                        value={row.finding} 
                        onChange={e => updateRow(idx, 'finding', e.target.value)} 
                        placeholder="Finding" 
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" 
                      />
                      <select 
                        value={row.eyeSide} 
                        onChange={e => updateRow(idx, 'eyeSide', e.target.value)} 
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                      >
                        <option value="R">R</option>
                        <option value="L">L</option>
                        <option value="Both">Both</option>
                      </select>
                      <button 
                        type="button" 
                        onClick={() => removeRow(idx)} 
                        className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                  )
                })}
                {rows.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">No observations added.</p>}
              </div>
            </div>

            {/* CDR and IOP */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">CDR Right</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={formData.cdrRight ?? ''} 
                  onChange={e => setFormData(prev => ({ ...prev, cdrRight: e.target.value ? parseFloat(e.target.value) : undefined }))} 
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">CDR Left</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={formData.cdrLeft ?? ''} 
                  onChange={e => setFormData(prev => ({ ...prev, cdrLeft: e.target.value ? parseFloat(e.target.value) : undefined }))} 
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">IOP Right</label>
                <input 
                  type="number" 
                  step="0.1" 
                  value={formData.iopRight ?? ''} 
                  onChange={e => setFormData(prev => ({ ...prev, iopRight: e.target.value !== '' ? parseFloat(e.target.value) : undefined }))} 
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">IOP Left</label>
                <input 
                  type="number" 
                  step="0.1" 
                  value={formData.iopLeft ?? ''} 
                  onChange={e => setFormData(prev => ({ ...prev, iopLeft: e.target.value !== '' ? parseFloat(e.target.value) : undefined }))} 
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" 
                />
              </div>
            </div>

            {/* Advice and History Comments */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Advice</label>
                <textarea 
                  value={formData.advice || ''} 
                  onChange={e => setFormData(prev => ({ ...prev, advice: e.target.value }))} 
                  rows={2} 
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" 
                  placeholder="Medical advice..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">History Comments</label>
                <textarea 
                  value={formData.historyComments || ''} 
                  onChange={e => setFormData(prev => ({ ...prev, historyComments: e.target.value }))} 
                  rows={2} 
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" 
                  placeholder="History comments..."
                />
              </div>
            </div>

            {/* Doctor's Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Doctor's Notes</label>
              <textarea 
                value={formData.doctorsNotes || ''} 
                onChange={e => setFormData(prev => ({ ...prev, doctorsNotes: e.target.value }))} 
                rows={3} 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" 
                placeholder="Doctor's notes and findings..."
              />
            </div>

            {/* Time Completed */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Time Completed</label>
              <input 
                type="datetime-local" 
                value={formData.timeCompleted || ''} 
                onChange={e => setFormData(prev => ({ ...prev, timeCompleted: e.target.value }))} 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" 
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {mainExamData ? 'Update Exam' : 'Save Exam'}
                  </>
                )}
              </button>
            </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
