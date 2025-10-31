'use client'
// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, Search, DollarSign } from 'lucide-react'
import VisitSessionHeader from '../../_components/VisitSessionHeader'
import { inventoryApi, patientTreatmentApi, patientVisitSessionApi, financeApi } from '@/lib/api'
import type { InventoryItem, PatientVisitSession } from '@/lib/types'

export default function TreatmentsPage() {
  const params = useParams()
  const router = useRouter()
  const visitSessionId = Number(params.id)

  const [visitSession, setVisitSession] = useState<PatientVisitSession | null>(null)
  const [treatments, setTreatments] = useState<any[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [search, setSearch] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [dosage, setDosage] = useState('')
  const [route, setRoute] = useState('')
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [creating, setCreating] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    (async () => {
      const vs = await patientVisitSessionApi.getVisitSession(visitSessionId)
      setVisitSession(vs)
      const inv = await inventoryApi.getAllItems({ page: 0, size: 200, sort: '' })
      setInventory(inv.content || [])
      const existing = await patientTreatmentApi.getByVisitSession(visitSessionId)
      setTreatments(existing)
    })()
  }, [visitSessionId])

  const filteredInventory = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return inventory
    return inventory.filter(i =>
      (i.name || '').toLowerCase().includes(q) ||
      (i.sku || '').toLowerCase().includes(q)
    )
  }, [inventory, search])

  //

  const handleAddTreatment = async () => {
    if (!selectedItem) return
    setCreating(true)
    try {
      const created = await patientTreatmentApi.create({
        visitSessionId,
        inventoryItemId: selectedItem.id,
        quantity,
        unitPrice: selectedItem.unitPrice,
        dosage,
        administrationRoute: route
      })
      setTreatments(prev => {
        const idx = prev.findIndex(t => t.inventoryItemId === created.inventoryItemId)
        if (idx !== -1) {
          return prev.map(t => (t.inventoryItemId === created.inventoryItemId ? created : t))
        }
        return [...prev, created]
      })
      setSelectedItem(null)
      setQuantity(1)
      setDosage('')
      setRoute('')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: number) => {
    await patientTreatmentApi.delete(id)
    setTreatments(prev => prev.filter(t => t.id !== id))
  }

  const handleSubmitTreatments = async () => {
    if (treatments.length === 0) {
      alert('Add treatment items first.')
      return
    }
    if (!confirm('Submit treatments and create invoice?')) return
    setSubmitting(true)
    try {
      const invoice = await financeApi.createInvoiceFromTreatments(visitSessionId)
      router.push(`/dashboard/finance/invoices?newInvoiceId=${invoice.id}`)
    } catch (e: any) {
      alert(e?.message || 'Failed to create treatment invoice')
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search Treatment Item</label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or SKU" className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Item</label>
              <select
                value={selectedItem?.id || ''}
                onChange={e => setSelectedItem(inventory.find(i => i.id === Number(e.target.value)) || null)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              >
                <option value="">-- Select --</option>
                {filteredInventory.map(i => (
                  <option key={i.id} value={i.id}>{i.name} {i.sku ? `(${i.sku})` : ''} - {i.unitPrice?.toLocaleString()} UGX</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Dosage</label>
              <input value={dosage} onChange={e => setDosage(e.target.value)} placeholder="e.g., 500mg x 3 days" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Route</label>
              <input value={route} onChange={e => setRoute(e.target.value)} placeholder="e.g., oral, IV, topical" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
            </div>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quantity</label>
                <input type="number" min={1} value={quantity} onChange={e => setQuantity(Number(e.target.value) || 1)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
              </div>
              <button onClick={handleAddTreatment} disabled={!selectedItem || creating} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50">
                <Plus className="h-4 w-4 mr-2" /> Add
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Treatments</h3>
            <button onClick={handleSubmitTreatments} disabled={submitting || treatments.length === 0} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
              <DollarSign className="h-4 w-4 mr-2" /> {submitting ? 'Submitting...' : 'Submit Treatments'}
            </button>
          </div>
          {treatments.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">No treatments added</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Item</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">SKU</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Dosage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Route</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Qty</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Unit Price</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {treatments.map(t => (
                    <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{t.itemName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{t.sku || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{t.dosage || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{t.administrationRoute || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right">{t.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right">{(t.unitPrice || 0).toLocaleString()} UGX</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right">{((t.unitPrice || 0) * (t.quantity || 1)).toLocaleString()} UGX</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <button onClick={() => handleDelete(t.id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


