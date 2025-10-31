'use client'
// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, Search, DollarSign } from 'lucide-react'
import VisitSessionHeader from '../../_components/VisitSessionHeader'
import { financeApi, investigationApi, patientVisitSessionApi } from '@/lib/api'
import type { InvestigationType, PatientVisitSession } from '@/lib/types'

export default function InvestigationsPage() {
  const params = useParams()
  const router = useRouter()
  const visitSessionId = Number(params.id)

  const [visitSession, setVisitSession] = useState<PatientVisitSession | null>(null)
  const [investigationTypes, setInvestigationTypes] = useState<InvestigationType[]>([])
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<number | ''>('')
  const [items, setItems] = useState<{ id: number; name: string; quantity: number; cost: number }[]>([])
  const [quantity, setQuantity] = useState(1)
  const [cost, setCost] = useState<number>(0)
  const [submitting, setSubmitting] = useState(false)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        const vs = await patientVisitSessionApi.getVisitSession(visitSessionId)
        setVisitSession(vs)
      } catch {}
      try {
        const types = await investigationApi.getTypes()
        setInvestigationTypes(types)
      } catch {
        setInvestigationTypes([])
      }
    })()
  }, [visitSessionId])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return investigationTypes
    return investigationTypes.filter(t => (t.name || '').toLowerCase().includes(q))
  }, [investigationTypes, search])

  const addItem = async () => {
    if (!selectedId || !quantity || quantity <= 0) return
    const type = investigationTypes.find(t => t.id === Number(selectedId))
    if (!type) return
    setAdding(true)
    try {
      await investigationApi.create({
        visitSessionId,
        investigationTypeId: type.id,
        quantity,
        cost: (cost && cost > 0) ? cost : (type.price || 0),
      })
    } catch (e) {
      console.error('Failed to create investigation, falling back to local add', e)
    }
    const existsIdx = items.findIndex(i => i.id === type.id)
    if (existsIdx >= 0) {
      const updated = [...items]
      updated[existsIdx] = { ...updated[existsIdx], quantity: updated[existsIdx].quantity + quantity }
      setItems(updated)
    } else {
      const effectiveCost = (cost && cost > 0) ? cost : (type.price || 0)
      setItems(prev => [...prev, { id: type.id, name: type.name, quantity, cost: effectiveCost }])
    }
    setSelectedId('')
    setQuantity(1)
    setCost(0)
    setAdding(false)
  }

  const removeItem = (id: number) => setItems(prev => prev.filter(i => i.id !== id))

  const total = items.reduce((s, i) => s + (i.cost || 0) * (i.quantity || 1), 0)

  const submitInvoice = async () => {
    if (items.length === 0) return alert('Add investigations first')
    setSubmitting(true)
    try {
      const ids = items.map(i => i.id)
      const inv = await financeApi.createInvoiceFromInvestigations(visitSessionId, ids)
      router.push(`/dashboard/finance/invoices?newInvoiceId=${inv.id}`)
    } catch (e: any) {
      alert(e?.message || 'Failed to create investigations invoice')
    } finally {
      setSubmitting(false)
    }
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

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search Investigations</label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 text-gray-400 -translate-y-1/2" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name" className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Investigation</label>
              <select value={selectedId} onChange={e => setSelectedId(Number(e.target.value) || '')} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white">
                <option value="">-- Select --</option>
                {filtered.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <div className="mt-2 text-xs">
                <Link href={`/dashboard/investigations/types?returnTo=${encodeURIComponent(`/dashboard/patient-visit-sessions/${visitSessionId}/investigations`)}`} className="text-blue-600 dark:text-blue-400 hover:underline">Add new investigation item</Link>
              </div>
            </div>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quantity</label>
                <input type="number" min={1} value={quantity} onChange={e => setQuantity(Number(e.target.value) || 1)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cost</label>
                <input type="number" min={0} step={0.01} value={cost} onChange={e => setCost(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
              </div>
              <button onClick={addItem} disabled={adding} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50">
                {adding ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" /> Add
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Investigations</h3>
            <button onClick={submitInvoice} disabled={submitting || items.length === 0} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
              <DollarSign className="h-4 w-4 mr-2" /> {submitting ? 'Submitting...' : 'Submit Investigations'}
            </button>
          </div>
          {items.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">No investigations added</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Qty</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Unit Cost</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {items.map(it => (
                    <tr key={it.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{it.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right">{it.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right">{(it.cost || 0).toLocaleString()} UGX</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right">{((it.cost || 0) * (it.quantity || 1)).toLocaleString()} UGX</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <button onClick={() => removeItem(it.id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Grand Total:</span>
            <span className="text-xl font-bold text-green-600 dark:text-green-400">{total.toLocaleString()} UGX</span>
          </div>
        </div>
      </div>
    </div>
  )
}


