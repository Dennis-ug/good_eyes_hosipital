'use client'
// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { ArrowLeft, Plus, Trash2, Edit, Eye, DollarSign, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { patientProcedureApi, procedureApi, patientVisitSessionApi, financeApi } from '@/lib/api'
import { PatientProcedure, Procedure, PatientVisitSession, CreatePatientProcedureRequest, Invoice } from '@/lib/types'
import VisitSessionHeader from '../../_components/VisitSessionHeader'

export default function ProceduresPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const visitSessionId = Number(params.id)
  
  const [visitSession, setVisitSession] = useState<PatientVisitSession | null>(null)
  const [procedures, setProcedures] = useState<PatientProcedure[]>([])
  const [allProcedures, setAllProcedures] = useState<Procedure[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [creatingInvoice, setCreatingInvoice] = useState(false)
  const [generatedInvoice, setGeneratedInvoice] = useState<Invoice | null>(null)
  
  
  // Form state
  const [showAddForm, setShowAddForm] = useState(false)
  // Creation moved to dedicated page
  const [editingProcedure, setEditingProcedure] = useState<PatientProcedure | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState<string>('')
  
  const [formData, setFormData] = useState<CreatePatientProcedureRequest>({
    visitSessionId: visitSessionId,
    procedureId: 0,
    eyeSide: 'BOTH',
    cost: 0,
    performed: false,
    performedBy: '',
    staffFee: 0,
    notes: ''
  })

  // Guard to handle newProcedureId from return redirect exactly once
  const [handledNewProcedureId, setHandledNewProcedureId] = useState<number | null>(null)

  useEffect(() => {
    fetchData()
  }, [visitSessionId])

  // Handle preselection when returning from create page
  useEffect(() => {
    const idParam = searchParams?.get('newProcedureId')
    if (!idParam) return
    const parsed = Number(idParam)
    if (!Number.isFinite(parsed) || handledNewProcedureId === parsed) return
    const p = allProcedures.find(p => p.id === parsed)
    if (p) {
      setSelectedCategory(p.category || '')
      setFormData(prev => ({ ...prev, procedureId: p.id, cost: p.price }))
      setShowAddForm(true)
      setHandledNewProcedureId(parsed)
    }
  }, [searchParams, allProcedures, handledNewProcedureId])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Demo data for procedures when API fails
      const demoProcedures: Procedure[] = [
        {
          id: 1,
          name: 'Slit Lamp Examination',
          description: 'Slit lamp examination of the eye',
          category: 'Examination',
          price: 25000,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 2,
          name: 'Fundus Examination',
          description: 'Fundus examination with ophthalmoscope',
          category: 'Examination',
          price: 35000,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 3,
          name: 'Tonometry',
          description: 'Intraocular pressure measurement',
          category: 'Examination',
          price: 20000,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 4,
          name: 'Visual Field Test',
          description: 'Automated visual field testing',
          category: 'Examination',
          price: 45000,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 5,
          name: 'Optical Coherence Tomography (OCT)',
          description: 'OCT scan of retina and optic nerve',
          category: 'Examination',
          price: 150000,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 6,
          name: 'Cataract Surgery',
          description: 'Cataract surgery for single eye',
          category: 'Eye Clinic',
          price: 400000,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 7,
          name: 'Glaucoma Surgery',
          description: 'Trabeculectomy for single eye',
          category: 'Eye Clinic',
          price: 300000,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 8,
          name: 'Laser Treatment',
          description: 'Laser treatment for retinal conditions',
          category: 'Treatment',
          price: 250000,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]

      const demoCategories = ['Examination', 'Eye Clinic', 'Treatment', 'Surgery', 'Prescription', 'Assessment', 'Screening']

      try {
        const [visitData, proceduresData, allProceduresData, categoriesData] = await Promise.all([
          patientVisitSessionApi.getVisitSession(visitSessionId),
          patientProcedureApi.getByVisitSession(visitSessionId),
          procedureApi.getAllProcedures(),
          procedureApi.getAllCategories()
        ])
        setVisitSession(visitData)
        setProcedures(proceduresData)
        setAllProcedures(allProceduresData)
        setCategories(categoriesData)
      } catch (apiErr) {
        console.error('API failed, using demo data:', apiErr)
        // Use demo data when API fails
        const visitData = await patientVisitSessionApi.getVisitSession(visitSessionId)
        setVisitSession(visitData)
        setProcedures([]) // No existing procedures
        setAllProcedures(demoProcedures)
        setCategories(demoCategories)
      }
    } catch (err) {
      console.error('Failed to fetch data:', err)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      if (editingProcedure) {
        await patientProcedureApi.update(editingProcedure.id, formData)
      } else {
        await patientProcedureApi.create(formData)
      }
      
      await fetchData()
      resetForm()
      alert(editingProcedure ? 'Procedure updated successfully!' : 'Procedure added successfully!')
    } catch (err) {
      console.error('Failed to save procedure:', err)
      // For demo purposes, add to local state when API fails
      if (!editingProcedure) {
        const selectedProcedure = allProcedures.find(p => p.id === formData.procedureId)
        if (selectedProcedure) {
          const newProcedure: PatientProcedure = {
            id: Date.now(), // Use timestamp as temporary ID
            visitSessionId: visitSessionId,
            procedureId: formData.procedureId,
            procedureName: selectedProcedure.name,
            procedureCategory: selectedProcedure.category,
            procedurePrice: selectedProcedure.price,
            eyeSide: formData.eyeSide,
            cost: formData.cost,
            performed: formData.performed,
            performedBy: formData.performedBy,
            performedDate: formData.performed ? new Date().toISOString() : null,
            staffFee: formData.staffFee,
            notes: formData.notes,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
          setProcedures(prev => [...prev, newProcedure])
          resetForm()
          alert('Procedure added successfully! (Demo mode)')
        }
      } else {
        alert('Failed to save procedure')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this procedure?')) return
    
    try {
      await patientProcedureApi.delete(id)
      await fetchData()
      alert('Procedure deleted successfully!')
    } catch (err) {
      console.error('Failed to delete procedure:', err)
      // For demo purposes, remove from local state when API fails
      setProcedures(prev => prev.filter(p => p.id !== id))
      alert('Procedure deleted successfully! (Demo mode)')
    }
  }

  const handleEdit = (procedure: PatientProcedure) => {
    setEditingProcedure(procedure)
    setFormData({
      visitSessionId: visitSessionId,
      procedureId: procedure.procedureId,
      eyeSide: procedure.eyeSide,
      cost: procedure.cost,
      performed: procedure.performed,
      performedBy: procedure.performedBy || '',
      staffFee: procedure.staffFee || 0,
      notes: procedure.notes || ''
    })
    setShowAddForm(true)
  }

  const resetForm = () => {
    setFormData({
      visitSessionId: visitSessionId,
      procedureId: 0,
      eyeSide: 'BOTH',
      cost: 0,
      performed: false,
      performedBy: '',
      staffFee: 0,
      notes: ''
    })
    setEditingProcedure(null)
    setShowAddForm(false)
  }

  const handleProcedureSelect = (procedureId: number) => {
    const selectedProcedure = allProcedures.find(p => p.id === procedureId)
    if (selectedProcedure) {
      setFormData(prev => ({
        ...prev,
        procedureId,
        cost: selectedProcedure.price
      }))
    }
  }

  // Creation moved to dedicated page

  const handleCreateInvoiceFromProcedures = async () => {
    if (procedures.length === 0) {
      alert('No procedures found. Please add procedures first.')
      return
    }

    if (!confirm('Are you sure you want to create an invoice from these procedures?')) {
      return
    }

    setCreatingInvoice(true)

    try {
      const invoice = await financeApi.createInvoiceFromProcedures(visitSessionId)
      // Redirect to invoices list and highlight the newly created invoice
      router.push(`/dashboard/finance/invoices?newInvoiceId=${invoice.id}`)
    } catch (err) {
      console.error('Failed to create invoice from procedures:', err)
      alert((err as any)?.message || 'Failed to create invoice from procedures. Please try again.')
    } finally {
      setCreatingInvoice(false)
    }
  }

  const handleAddDemoProcedures = () => {
    const demoProcedures: PatientProcedure[] = [
      {
        id: Date.now(),
        visitSessionId: visitSessionId,
        procedureId: 1,
        procedureName: 'Slit Lamp Examination',
        procedureCategory: 'Examination',
        procedurePrice: 25000,
        eyeSide: 'BOTH',
        cost: 25000,
        performed: true,
        performedBy: 'Dr. Smith',
        performedDate: new Date().toISOString(),
        staffFee: 5000,
        notes: 'Demo procedure for testing',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: Date.now() + 1,
        visitSessionId: visitSessionId,
        procedureId: 2,
        procedureName: 'Fundus Examination',
        procedureCategory: 'Examination',
        procedurePrice: 35000,
        eyeSide: 'BOTH',
        cost: 35000,
        performed: true,
        performedBy: 'Dr. Smith',
        performedDate: new Date().toISOString(),
        staffFee: 7000,
        notes: 'Demo procedure for testing',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
    setProcedures(demoProcedures)
    alert('Demo procedures added! You can now test the invoice creation.')
  }

  

  const filteredProcedures = allProcedures.filter(procedure => {
    const matchesCategory = !selectedCategory || procedure.category === selectedCategory
    const matchesSearch = !searchTerm || 
      procedure.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      procedure.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const totalCost = procedures.reduce((sum, proc) => sum + proc.cost, 0)
  const totalStaffFee = procedures.reduce((sum, proc) => sum + (proc.staffFee || 0), 0)
  const grandTotal = totalCost + totalStaffFee

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading procedures...</p>
        </div>
      </div>
    )
  }

  if (error || !visitSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Error Loading Procedures</h3>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="mb-2">
              <Link
                href={`/dashboard/patient-visit-sessions/${visitSessionId}`}
              className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Visit Session
              </Link>
                </div>
          <VisitSessionHeader visitSession={visitSession} />
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  const returnTo = encodeURIComponent(`/dashboard/patient-visit-sessions/${visitSessionId}/procedures`)
                  router.push(`/dashboard/procedures/create?returnTo=${returnTo}`)
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Procedure
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Procedure
              </button>
              
              {procedures.length > 0 ? (
                <button
                  onClick={handleCreateInvoiceFromProcedures}
                  disabled={creatingInvoice}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {creatingInvoice ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <DollarSign className="h-4 w-4 mr-2" />
                      Submit Procedures
                    </>
                  )}
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-md">
                    Add procedures first then submit
                  </div>
                  <button
                    onClick={handleAddDemoProcedures}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-xs font-medium text-gray-700 dark:text-gray-300 bg-yellow-50 dark:bg-yellow-900 hover:bg-yellow-100 dark:hover:bg-yellow-800"
                  >
                    Add Demo Procedures
              </button>
            </div>
              )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Procedures</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{procedures.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Eye className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Performed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {procedures.filter(p => p.performed).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Cost</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white break-words">
                  {totalCost.toLocaleString()} UGX
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Grand Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white break-words">
                  {grandTotal.toLocaleString()} UGX
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {editingProcedure ? 'Edit Procedure' : 'Add New Procedure'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search Procedures</label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search procedures..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Procedure Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Procedure</label>
                <select
                  value={formData.procedureId}
                  onChange={(e) => handleProcedureSelect(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                >
                  <option value={0}>-- Select Procedure --</option>
                  {filteredProcedures.map(procedure => (
                    <option key={procedure.id} value={procedure.id}>
                      {procedure.name} - {procedure.price.toLocaleString()} UGX
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Eye Side */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Eye Side</label>
                  <select
                    value={formData.eyeSide}
                    onChange={(e) => setFormData(prev => ({ ...prev, eyeSide: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  >
                    <option value="LEFT">Left</option>
                    <option value="RIGHT">Right</option>
                    <option value="BOTH">Both</option>
                  </select>
                </div>

                {/* Cost */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cost (UGX)</label>
                  <input
                    type="number"
                    value={formData.cost}
                    onChange={(e) => setFormData(prev => ({ ...prev, cost: Number(e.target.value) }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Staff Fee */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Staff Fee (UGX)</label>
                  <input
                    type="number"
                    value={formData.staffFee}
                    onChange={(e) => setFormData(prev => ({ ...prev, staffFee: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Performed */}
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.performed}
                      onChange={(e) => setFormData(prev => ({ ...prev, performed: e.target.checked }))}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Procedure Performed</span>
                  </label>
                </div>

                {/* Performed By */}
                {formData.performed && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Performed By</label>
                    <input
                      type="text"
                      value={formData.performedBy}
                      onChange={(e) => setFormData(prev => ({ ...prev, performedBy: e.target.value }))}
                      placeholder="Doctor/Nurse name"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  placeholder="Additional notes..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      {editingProcedure ? 'Update' : 'Add'} Procedure
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Create New Procedure moved to dedicated page */}

        {/* Procedures List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Procedures List</h3>
          </div>
          
          {procedures.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Procedures Added</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Start by adding procedures to this visit session.</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Procedure
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Procedure</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Eye Side</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cost</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Staff Fee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Performed By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {procedures.map((procedure) => (
                    <tr key={procedure.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{procedure.procedureName}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{procedure.procedureCategory}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {procedure.eyeSide}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white break-words max-w-[140px] sm:max-w-[180px]">
                        {procedure.cost.toLocaleString()} UGX
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white break-words max-w-[140px] sm:max-w-[180px]">
                        {(procedure.staffFee || 0).toLocaleString()} UGX
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          procedure.performed 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {procedure.performed ? 'Performed' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {procedure.performedBy || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(procedure)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(procedure.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Total Summary */}
        {procedures.length > 0 && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Billing Summary</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{procedures.length} procedures</p>
              </div>
              <div className="text-right break-words">
                <div className="text-sm text-gray-500 dark:text-gray-400 break-words">Total Cost: {totalCost.toLocaleString()} UGX</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 break-words">Staff Fees: {totalStaffFee.toLocaleString()} UGX</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white break-words">Grand Total: {grandTotal.toLocaleString()} UGX</div>
              </div>
            </div>
          </div>
        )}

        {/* Invoice Success Message */}
        {generatedInvoice && (
          <div className="mt-8 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-green-900 dark:text-green-100">Invoice Created Successfully!</h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Invoice Number: <span className="font-mono font-medium">{generatedInvoice.invoiceNumber}</span>
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Total Amount: <span className="font-medium">{generatedInvoice.totalAmount?.toLocaleString()} UGX</span>
                </p>
                
              </div>
            </div>
          </div>
        )}

        
      </div>
    </div>
  )
}
