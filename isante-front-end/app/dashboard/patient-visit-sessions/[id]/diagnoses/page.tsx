'use client'
// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { FileText, ArrowLeft, Search, Plus } from 'lucide-react'
import { patientDiagnosisApi, diagnosisApi, patientVisitSessionApi } from '@/lib/api'
import type { PatientDiagnosis, PatientVisitSession, Diagnosis, DiagnosisCategory, Pageable, Page } from '@/lib/types'
import VisitSessionHeader from '../../_components/VisitSessionHeader'

export default function PatientDiagnosesPage() {
  const params = useParams()
  const visitSessionId = Number(params.id)
  
  const [visitSession, setVisitSession] = useState<PatientVisitSession | null>(null)
  const [diagnoses, setDiagnoses] = useState<PatientDiagnosis[]>([])
  const [allDiagnoses, setAllDiagnoses] = useState<Diagnosis[]>([])
  const [categories, setCategories] = useState<DiagnosisCategory[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(0)
  const [addingCategory, setAddingCategory] = useState(false)
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [showAddDiagnosis, setShowAddDiagnosis] = useState(false)
  const [addingDiagnosis, setAddingDiagnosis] = useState(false)
  const [newDiagnosisName, setNewDiagnosisName] = useState('')
  const [newDiagnosisDescription, setNewDiagnosisDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  // form
  const [selectedDiagnosisId, setSelectedDiagnosisId] = useState<number>(0)
  const [severity, setSeverity] = useState<'MILD'|'MODERATE'|'SEVERE'|'CRITICAL'>('MILD')
  const [eyeSide, setEyeSide] = useState<'LEFT'|'RIGHT'|'BOTH'|''>('')
  const [notes, setNotes] = useState('')
  const [isPrimary, setIsPrimary] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)

  useEffect(() => {
    load()
  }, [visitSessionId])

  const load = async () => {
    try {
      setLoading(true)
      const vs = await patientVisitSessionApi.getVisitSession(visitSessionId)
      setVisitSession(vs)
      const list = await patientDiagnosisApi.getByVisitSession(visitSessionId)
      setDiagnoses(list)
      // fetch diagnoses (first 500)
      try {
        const page: Page<Diagnosis> = await diagnosisApi.getAllDiagnoses({ page: 0, size: 500 } as Pageable)
        setAllDiagnoses(page.content || [])
      } catch {
        setAllDiagnoses([])
      }
      try {
        const cats = await diagnosisApi.getAllCategories()
        setCategories(cats)
      } catch {
        setCategories([])
      }
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    let base = allDiagnoses
    if (selectedCategoryId) {
      base = base.filter(d => d.categoryId === selectedCategoryId)
    }
    if (!q) return base
    return base.filter(d => (d.name || '').toLowerCase().includes(q) || (d.description || '').toLowerCase().includes(q))
  }, [allDiagnoses, search, selectedCategoryId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDiagnosisId) return alert('Select a diagnosis')
    setSaving(true)
    try {
      await patientDiagnosisApi.create({
        visitSessionId,
        diagnosisId: selectedDiagnosisId,
        severity,
        eyeSide: eyeSide || undefined,
        notes,
        isPrimaryDiagnosis: isPrimary,
        isConfirmed,
        diagnosedBy: ''
      })
      await load()
      setSelectedDiagnosisId(0)
      setSeverity('MILD')
      setEyeSide('')
      setNotes('')
      setIsPrimary(false)
      setIsConfirmed(false)
    } catch (e: any) {
      alert(e?.message || 'Failed to add diagnosis')
    } finally {
      setSaving(false)
    }
  }

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return alert('Provide an eye part name')
    setAddingCategory(true)
    try {
      const created = await diagnosisApi.createCategory({ name: newCategoryName.trim() })
      await load()
      setSelectedCategoryId((created as any).id || 0)
      setNewCategoryName('')
      setShowAddCategory(false)
    } catch (e: any) {
      alert(e?.message || 'Failed to create eye part')
    } finally {
      setAddingCategory(false)
    }
  }

  const handleCreateDiagnosis = async () => {
    if (!selectedCategoryId) return alert('Select an eye part first')
    if (!newDiagnosisName.trim()) return alert('Provide diagnosis name')
    setAddingDiagnosis(true)
    try {
      const created = await diagnosisApi.createDiagnosis({
        name: newDiagnosisName.trim(),
        description: newDiagnosisDescription.trim() || undefined,
        categoryId: selectedCategoryId,
      })
      await load()
      const createdId = (created as any).id
      if (createdId) setSelectedDiagnosisId(createdId)
      setNewDiagnosisName('')
      setNewDiagnosisDescription('')
      setShowAddDiagnosis(false)
    } catch (e: any) {
      alert(e?.message || 'Failed to create diagnosis')
    } finally {
      setAddingDiagnosis(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading diagnoses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4">
          <Link href={`/dashboard/patient-visit-sessions/${visitSessionId}`} className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Visit Session
          </Link>
      </div>

        {visitSession && (<VisitSessionHeader visitSession={visitSession} />)}

        {/* Add Diagnosis */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6 mt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Diagnosis</h3>
            <div className="text-xs text-gray-500 dark:text-gray-400">Select an eye part, choose a diagnosis, set details, then add</div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search</label>
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search diagnosis names" className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Tip: type at least 2 letters</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Eye Part</label>
                <select value={selectedCategoryId} onChange={e => setSelectedCategoryId(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white">
                  <option value={0}>All Eye Parts</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <div className="mt-2 text-xs">
                  <button type="button" onClick={() => setShowAddCategory(true)} className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline">
                    <Plus className="h-3 w-3 mr-1" /> Add Eye Part
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Diagnosis</label>
                <select value={selectedDiagnosisId} onChange={e => setSelectedDiagnosisId(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white">
                  <option value={0}>-- Select --</option>
                  {filtered.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
                <div className="mt-2 text-xs">
                  <button type="button" onClick={() => setShowAddDiagnosis(true)} className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline">
                    <Plus className="h-3 w-3 mr-1" /> Add Diagnosis
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Severity</label>
                  <select value={severity} onChange={e => setSeverity(e.target.value as any)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white">
                  <option value="MILD">Mild</option>
                  <option value="MODERATE">Moderate</option>
                  <option value="SEVERE">Severe</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
              </div>
              <div className="flex items-center gap-4 w-full justify-start">
                <label className="inline-flex items-center text-sm">
                  <input type="checkbox" checked={isPrimary} onChange={e => setIsPrimary(e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">Primary</span>
                </label>
                <label className="inline-flex items-center text-sm">
                  <input type="checkbox" checked={isConfirmed} onChange={e => setIsConfirmed(e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">Confirmed</span>
                </label>
              </div>
              </div>

            {/* Notes full-width row */}
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" placeholder="Optional notes" />
            </div>

            <div className="flex justify-end">
              <button type="submit" disabled={saving || !selectedDiagnosisId} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" /> Add Diagnosis
                  </>
                )}
                </button>
              </div>
            </form>
            {showAddDiagnosis && (
              <div className="fixed inset-0 z-50 grid place-items-center p-4">
                <div className="absolute inset-0 bg-black/40" onClick={() => { setShowAddDiagnosis(false); setNewDiagnosisName(''); setNewDiagnosisDescription('') }} />
                <div className="relative z-10 w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
                  <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white">Add Diagnosis</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Create a diagnosis under the selected eye part</p>
                  </div>
                  <div className="px-5 py-4 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Diagnosis name</label>
                      <input value={newDiagnosisName} onChange={e => setNewDiagnosisName(e.target.value)} placeholder="e.g., Keratitis" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (optional)</label>
                      <input value={newDiagnosisDescription} onChange={e => setNewDiagnosisDescription(e.target.value)} placeholder="Short description" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
                    </div>
                  </div>
                  <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
                    <button type="button" onClick={() => { setShowAddDiagnosis(false); setNewDiagnosisName(''); setNewDiagnosisDescription('') }} className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300">Cancel</button>
                    <button type="button" onClick={handleCreateDiagnosis} disabled={addingDiagnosis || !newDiagnosisName.trim()} className="px-4 py-2 text-sm rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50">
                      {addingDiagnosis ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              </div>
            )}
            {showAddCategory && (
              <div className="fixed inset-0 z-50 grid place-items-center p-4">
                <div className="absolute inset-0 bg-black/40" onClick={() => { setShowAddCategory(false); setNewCategoryName('') }} />
                <div className="relative z-10 w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
                  <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white">Add Eye Part</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Create a new eye part to categorize diagnoses</p>
                  </div>
                  <div className="px-5 py-4 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Eye part name</label>
                      <input value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} placeholder="e.g., Cornea" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
                    </div>
                  </div>
                  <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
                    <button type="button" onClick={() => { setShowAddCategory(false); setNewCategoryName('') }} className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300">Cancel</button>
                    <button type="button" onClick={handleCreateCategory} disabled={addingCategory || !newCategoryName.trim()} className="px-4 py-2 text-sm rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
                      {addingCategory ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

        {/* Existing Diagnoses */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Diagnoses</h3>
          </div>
          {diagnoses.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">No diagnoses added</div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {diagnoses.map(d => (
                <div key={d.id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{d.diagnosis.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{d.diagnosis.categoryName}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {d.isPrimaryDiagnosis && <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">Primary</span>}
                    {d.isConfirmed && <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">Confirmed</span>}
                    <span className={`px-2 py-1 text-xs rounded ${
                      d.severity === 'CRITICAL' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      d.severity === 'SEVERE' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                      d.severity === 'MODERATE' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>{d.severity}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
