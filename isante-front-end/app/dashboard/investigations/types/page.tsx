'use client'
// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Microscope, Plus, Edit, Trash2, ArrowLeft } from 'lucide-react'
import PageHeader from '@/components/PageHeader'
import { investigationApi } from '@/lib/api'
import type { InvestigationType } from '@/lib/types'

export default function InvestigationTypesPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const returnTo = searchParams?.get('returnTo') || ''

  const [items, setItems] = useState<InvestigationType[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<Partial<InvestigationType>>({
    name: '',
    unit: '',
    normalRange: '',
    description: '',
    price: 0,
  })

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    try {
      setLoading(true)
      const list = await investigationApi.getTypes()
      setItems(list)
    } catch (e) {
      console.error('Failed to load investigation types', e)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter(it => (it.name || '').toLowerCase().includes(q) || (it.description || '').toLowerCase().includes(q))
  }, [items, search])

  const resetForm = () => {
    setEditingId(null)
    setForm({ name: '', unit: '', normalRange: '', description: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.name.trim()) {
      alert('Name is required')
      return
    }
    setSaving(true)
    try {
      if (editingId) {
        await investigationApi.updateType(editingId, {
          name: form.name?.trim(),
          unit: form.unit?.trim(),
          normalRange: form.normalRange?.trim(),
          description: form.description?.trim(),
          price: typeof form.price === 'number' ? form.price : parseFloat(String(form.price || 0)) || 0,
        })
        alert('Item updated')
      } else {
        await investigationApi.createType({
          name: form.name?.trim() || '',
          unit: form.unit?.trim(),
          normalRange: form.normalRange?.trim(),
          description: form.description?.trim(),
          price: typeof form.price === 'number' ? form.price : parseFloat(String(form.price || 0)) || 0,
        })
        alert('Item created')
      }
      await load()
      resetForm()
    } catch (e: any) {
      alert(e?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (it: InvestigationType) => {
    setEditingId(it.id)
    setForm({
      name: it.name,
      unit: it.unit,
      normalRange: it.normalRange,
      description: it.description,
      price: it.price || 0,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this investigation item?')) return
    try {
      await investigationApi.deleteType(id)
      await load()
    } catch (e: any) {
      alert(e?.message || 'Failed to delete')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4">
          {returnTo ? (
            <button onClick={() => router.push(returnTo)} className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </button>
          ) : (
            <Link href="/dashboard" className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
            </Link>
          )}
        </div>

        <PageHeader
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Investigations', href: '/dashboard/investigations/types' },
            { label: 'Items' },
          ]}
          title="Investigation Items"
          subtitle="Manage billable investigation types such as Full Blood Count, RBS, etc."
          icon={<Microscope className="h-8 w-8 text-indigo-600" />}
        />

        {/* Create / Edit Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6 mt-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{editingId ? 'Edit Item' : 'Add New Item'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name<span className="text-red-500">*</span></label>
                <input value={form.name || ''} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" placeholder="Full Blood Count (FBC)" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unit</label>
                <input value={form.unit || ''} onChange={e => setForm(prev => ({ ...prev, unit: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" placeholder="e.g., mg/dL" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Normal Range</label>
                <input value={form.normalRange || ''} onChange={e => setForm(prev => ({ ...prev, normalRange: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" placeholder="e.g., 70 - 110" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <input value={form.description || ''} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" placeholder="Optional notes" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (UGX)</label>
                <input type="number" min={0} step={0.01} value={form.price ?? 0} onChange={e => setForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" placeholder="e.g., 15000" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              {editingId && (
                <button type="button" onClick={resetForm} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
              )}
              <button type="submit" disabled={saving} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50">
                <Plus className="h-4 w-4 mr-2" /> {saving ? (editingId ? 'Updating...' : 'Saving...') : (editingId ? 'Update Item' : 'Save Item')}
              </button>
            </div>
          </form>
        </div>

        {/* Listing */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Items</h3>
            <div className="w-64">
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search items..." className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
            </div>
          </div>
          {loading ? (
            <div className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">No items found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Unit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Normal Range</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filtered.map(it => (
                    <tr key={it.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{it.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{it.unit || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{it.normalRange || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{it.description || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{(it.price || 0).toLocaleString()} UGX</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleEdit(it)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"><Edit className="h-4 w-4" /></button>
                          <button onClick={() => handleDelete(it.id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"><Trash2 className="h-4 w-4" /></button>
                        </div>
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


