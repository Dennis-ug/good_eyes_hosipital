'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Save, ArrowLeft, Package } from 'lucide-react'
import PageHeader from '@/components/PageHeader'
import { inventoryApi } from '@/lib/api'
import { InventoryCategory, InventoryItem, CreateInventoryItemRequest } from '@/lib/types'
import { LoadingButton } from '@/components/loading-button'
import { ErrorDialog, useErrorDialog } from '@/components/error-dialog'

export default function EditInventoryItemPage() {
  const params = useParams()
  const router = useRouter()
  const id = Number(params.id)

  const [categories, setCategories] = useState<InventoryCategory[]>([])
  const [item, setItem] = useState<InventoryItem | null>(null)
  const [saving, setSaving] = useState(false)
  const { error, isErrorOpen, handleError, hideError } = useErrorDialog()

  const [formData, setFormData] = useState<Partial<CreateInventoryItemRequest>>({})

  const handleInputChange = (field: keyof CreateInventoryItemRequest, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const loadData = useCallback(async () => {
    try {
      const [catPage, itemResp] = await Promise.all([
        inventoryApi.getActiveCategories(),
        inventoryApi.getItemById(id)
      ])
      setCategories(catPage)
      setItem(itemResp)
      setFormData({
        name: itemResp.name,
        description: itemResp.description,
        sku: itemResp.sku,
        unitPrice: itemResp.unitPrice,
        costPrice: itemResp.costPrice,
        quantityInStock: itemResp.quantityInStock,
        minimumStockLevel: itemResp.minimumStockLevel,
        maximumStockLevel: itemResp.maximumStockLevel,
        unitOfMeasure: itemResp.unitOfMeasure,
        categoryId: itemResp.categoryId,
        supplierName: itemResp.supplierName,
        supplierContact: itemResp.supplierContact,
        reorderPoint: itemResp.reorderPoint,
        reorderQuantity: itemResp.reorderQuantity,
        genericName: itemResp.genericName,
        dosageForm: itemResp.dosageForm,
        strength: itemResp.strength,
        activeIngredient: itemResp.activeIngredient,
        expiryDate: itemResp.expiryDate,
        batchNumber: itemResp.batchNumber,
        requiresPrescription: itemResp.requiresPrescription,
        controlledSubstance: itemResp.controlledSubstance,
        storageConditions: itemResp.storageConditions
      })
    } catch (e) {
      handleError(e)
    }
  }, [id])

  useEffect(() => { loadData() }, [loadData])

  // no fallback needed

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      await inventoryApi.updateItem(id, formData)
      router.push('/dashboard/inventory/items')
    } catch (e) {
      handleError(e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Inventory', href: '/dashboard/inventory' },
          { label: 'Items', href: '/dashboard/inventory/items' },
          { label: 'Edit' }
        ]}
        title="Edit Inventory Item"
        subtitle="Update product details."
        icon={<Package className="h-5 w-5" />}
        action={(
          <Link
            href="/dashboard/inventory/items"
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Items
          </Link>
        )}
      />

      {item && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Item Name</label>
                <input className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={formData.name || ''} onChange={e=>handleInputChange('name', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">SKU</label>
                <input className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={formData.sku || ''} onChange={e=>handleInputChange('sku', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={formData.categoryId || 0} onChange={e=>handleInputChange('categoryId', Number(e.target.value))}>
                  <option value="0">Select</option>
                  {categories.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Unit of Measure</label>
                <input className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={formData.unitOfMeasure || ''} onChange={e=>handleInputChange('unitOfMeasure', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Unit Price (UGX)</label>
                <input type="number" step="0.01" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={formData.unitPrice ?? 0} onChange={e=>handleInputChange('unitPrice', parseFloat(e.target.value)||0)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cost Price (UGX)</label>
                <input type="number" step="0.01" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={formData.costPrice ?? 0} onChange={e=>handleInputChange('costPrice', parseFloat(e.target.value)||0)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Minimum Stock</label>
                <input type="number" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={formData.minimumStockLevel ?? 0} onChange={e=>handleInputChange('minimumStockLevel', parseInt(e.target.value)||0)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Maximum Stock</label>
                <input type="number" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={formData.maximumStockLevel ?? 0} onChange={e=>handleInputChange('maximumStockLevel', parseInt(e.target.value)||0)} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                <textarea rows={4} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={formData.description || ''} onChange={e=>handleInputChange('description', e.target.value)} />
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Optional Medicine Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Generic Name</label>
                  <input className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={formData.genericName || ''} onChange={e=>handleInputChange('genericName', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Active Ingredient</label>
                  <input className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={formData.activeIngredient || ''} onChange={e=>handleInputChange('activeIngredient', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Dosage Form</label>
                  <input className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={formData.dosageForm || ''} onChange={e=>handleInputChange('dosageForm', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Strength</label>
                  <input className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={formData.strength || ''} onChange={e=>handleInputChange('strength', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Batch Number</label>
                  <input className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={formData.batchNumber || ''} onChange={e=>handleInputChange('batchNumber', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Expiry Date</label>
                  <input type="date" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={formData.expiryDate || ''} onChange={e=>handleInputChange('expiryDate', e.target.value)} />
                </div>
                <div className="flex items-center gap-3">
                  <input id="requiresPrescription" type="checkbox" checked={!!formData.requiresPrescription} onChange={e=>handleInputChange('requiresPrescription', e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                  <label htmlFor="requiresPrescription" className="text-sm text-gray-700 dark:text-gray-300">Requires Prescription</label>
                </div>
                <div className="flex items-center gap-3">
                  <input id="controlledSubstance" type="checkbox" checked={!!formData.controlledSubstance} onChange={e=>handleInputChange('controlledSubstance', e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                  <label htmlFor="controlledSubstance" className="text-sm text-gray-700 dark:text-gray-300">Controlled Substance</label>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Storage Conditions</label>
                  <input className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={formData.storageConditions || ''} onChange={e=>handleInputChange('storageConditions', e.target.value)} />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Link href="/dashboard/inventory/items" className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                Cancel
              </Link>
              <LoadingButton type="submit" loading={saving} loadingText="Saving..." className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                <Save className="h-4 w-4 mr-2" /> Save Changes
              </LoadingButton>
            </div>
          </form>
        </div>
      )}

      <ErrorDialog isOpen={isErrorOpen} onClose={hideError} error={error} title="Update Error" showRetry={false} showCopy={true} />
    </div>
  )
}


