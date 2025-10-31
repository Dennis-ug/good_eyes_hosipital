'use client'

import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, Plus, Minus, FileText, CheckCircle } from 'lucide-react'
import { LoadingPage } from '@/components/loading-page'
import { LoadingButton } from '@/components/loading-button'
import { ErrorDialog, useErrorDialog } from '@/components/error-dialog'
import { financeApi, patientApi, userManagementApi, inventoryApi } from '@/lib/api'
import { Invoice, Patient, User as UserType, InventoryItem } from '@/lib/types'
import Link from 'next/link'

interface InvoiceItem {
  itemName: string
  itemDescription: string
  itemType: string
  quantity: number
  unitPrice: number
  discountPercentage: number
  taxPercentage: number
  insuranceCovered: boolean
  insuranceCoveragePercentage: number
  notes: string
}

export default function CreateInvoicePage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<UserType[]>([])
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false)
  const [generatedInvoice, setGeneratedInvoice] = useState<Invoice | null>(null)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  
  const { error, isErrorOpen, handleError, hideError } = useErrorDialog()

  const [formData, setFormData] = useState({
    patientId: 0,
    doctorId: 0,
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    taxAmount: 0,
    discountAmount: 0,
    notes: '',
    internalNotes: '',
    insuranceProvider: '',
    insuranceNumber: '',
    insuranceCoverage: 0,
    invoiceItems: [
      {
        itemName: '',
        itemDescription: '',
        itemType: 'CONSULTATION',
        quantity: 1,
        unitPrice: 0,
        discountPercentage: 0,
        taxPercentage: 0,
        insuranceCovered: false,
        insuranceCoveragePercentage: 0,
        notes: '',
        inventoryItemId: undefined,
        sku: ''
      }
    ]
  })

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // Fetch patients
      const patientsData = await patientApi.getAll()
      setPatients(patientsData.content || [])
      
      // Fetch doctors
      const doctorsData = await userManagementApi.getAllUsers({ page: 0, size: 100 })
      const filteredDoctors = doctorsData.content.filter(user => 
        user.roles.some(role => 
          ['DOCTOR', 'OPTOMETRIST', 'OPHTHALMOLOGIST'].includes(role.name)
        )
      )
      setDoctors(filteredDoctors)
      
      // Fetch inventory items
      const inventoryData = await inventoryApi.getAvailableItemsForInvoice()
      setInventoryItems(inventoryData)
      
    } catch (error) {
      console.error('Failed to fetch data:', error)
      handleError(error)
    } finally {
      setIsLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleFormChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleItemChange = (index: number, field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      invoiceItems: prev.invoiceItems.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const addInvoiceItem = () => {
    setFormData(prev => ({
      ...prev,
      invoiceItems: [
        ...prev.invoiceItems,
        {
                  itemName: '',
        itemDescription: '',
        itemType: 'CONSULTATION',
        quantity: 1,
          unitPrice: 0,
          discountPercentage: 0,
          taxPercentage: 0,
          insuranceCovered: false,
          insuranceCoveragePercentage: 0,
          notes: '',
          inventoryItemId: undefined,
          sku: ''
        }
      ]
    }))
  }

  const removeInvoiceItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      invoiceItems: prev.invoiceItems.filter((_, i) => i !== index)
    }))
  }

  const calculateItemTotal = (item: InvoiceItem) => {
    const subtotal = item.quantity * item.unitPrice
    const discount = subtotal * (item.discountPercentage / 100)
    const afterDiscount = subtotal - discount
    const tax = afterDiscount * (item.taxPercentage / 100)
    return afterDiscount + tax
  }

  const calculateInvoiceTotal = () => {
    const itemsTotal = formData.invoiceItems.reduce((sum, item) => sum + calculateItemTotal(item), 0)
    return itemsTotal + formData.taxAmount - formData.discountAmount
  }

  const handleCreateInvoice = async () => {
    if (!formData.patientId || !formData.doctorId || formData.invoiceItems.length === 0) {
      handleError(new Error('Please fill in all required fields'))
      return
    }
    
    try {
      setIsCreatingInvoice(true)
      const invoice = await financeApi.createInvoice(formData)
      setGeneratedInvoice(invoice)
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 5000)
      
    } catch (error) {
      console.error('Failed to create invoice:', error)
      handleError(error)
    } finally {
      setIsCreatingInvoice(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX'
    }).format(amount)
  }

  if (isLoading) {
    return (
      <LoadingPage 
        message="Loading data..."
        variant="spinner"
        size="lg"
        color="blue"
        layout="top"
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard/finance/invoices"
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Invoices
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Invoice</h1>
            <p className="text-gray-600 dark:text-gray-400">Create a new invoice manually</p>
          </div>
        </div>
      </div>

      {showSuccessMessage && generatedInvoice && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                Invoice created successfully!
              </p>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                Invoice Number: {generatedInvoice.invoiceNumber} | Amount: {formatCurrency(generatedInvoice.totalAmount)}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Invoice Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Patient <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.patientId}
              onChange={(e) => handleFormChange('patientId', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            >
              <option value="">Select a patient</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>
                  {patient.firstName} {patient.lastName} - {patient.phone}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Doctor <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.doctorId}
              onChange={(e) => handleFormChange('doctorId', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            >
              <option value="">Select a doctor</option>
              {doctors.map(doctor => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.username} ({doctor.departmentName || 'No Department'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Invoice Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.invoiceDate}
              onChange={(e) => handleFormChange('invoiceDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Due Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleFormChange('dueDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tax Amount
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.taxAmount}
              onChange={(e) => handleFormChange('taxAmount', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Discount Amount
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.discountAmount}
              onChange={(e) => handleFormChange('discountAmount', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleFormChange('notes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Invoice Items */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Invoice Items</h3>
          <button
            onClick={addInvoiceItem}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </button>
        </div>

        {formData.invoiceItems.map((item, index) => (
          <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">Item {index + 1}</h4>
              {formData.invoiceItems.length > 1 && (
                <button
                  onClick={() => removeInvoiceItem(index)}
                  className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                >
                  <Minus className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Item Name <span className="text-red-500">*</span>
                </label>
                {item.itemType === 'INVENTORY_ITEM' ? (
                  <select
                    value={item.inventoryItemId || ''}
                    onChange={(e) => {
                      const selectedItem = inventoryItems.find(inv => inv.id === Number(e.target.value))
                      if (selectedItem) {
                        handleItemChange(index, 'inventoryItemId', selectedItem.id)
                        handleItemChange(index, 'itemName', selectedItem.name)
                        handleItemChange(index, 'itemDescription', selectedItem.description)
                        handleItemChange(index, 'unitPrice', selectedItem.unitPrice)
                        handleItemChange(index, 'sku', selectedItem.sku)
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Select inventory item</option>
                    {inventoryItems.map(invItem => (
                      <option key={invItem.id} value={invItem.id}>
                        {invItem.name} - {invItem.sku} (Stock: {invItem.quantityInStock})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={item.itemName}
                    onChange={(e) => handleItemChange(index, 'itemName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Item Type
                </label>
                <select
                  value={item.itemType}
                  onChange={(e) => handleItemChange(index, 'itemType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="CONSULTATION">Consultation</option>
                  <option value="PROCEDURE">Procedure</option>
                  <option value="MEDICATION">Medication</option>
                  <option value="EQUIPMENT">Equipment</option>
                  <option value="INVENTORY_ITEM">Inventory Item</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Unit Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={item.unitPrice}
                  onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Discount (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={item.discountPercentage}
                  onChange={(e) => handleItemChange(index, 'discountPercentage', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tax (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={item.taxPercentage}
                  onChange={(e) => handleItemChange(index, 'taxPercentage', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={item.itemDescription}
                  onChange={(e) => handleItemChange(index, 'itemDescription', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="mt-4 text-right">
              <div className="flex items-center justify-end space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Item Total:</span>
                <input
                  type="number"
                  step="0.01"
                  value={calculateItemTotal(item)}
                  onChange={(e) => {
                    const newTotal = parseFloat(e.target.value) || 0
                    // const currentTotal = calculateItemTotal(item)
                    // const difference = newTotal - currentTotal
                    
                    // Adjust unit price to match the new total
                    const newUnitPrice = (newTotal / item.quantity) + (item.discountPercentage / 100 * item.unitPrice) - (item.taxPercentage / 100 * item.unitPrice)
                    handleItemChange(index, 'unitPrice', Math.max(0, newUnitPrice))
                  }}
                  className="w-24 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-right"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">UGX</span>
              </div>
            </div>
          </div>
        ))}

        <div className="mt-6 text-right">
          <div className="flex items-center justify-end space-x-2">
            <span className="text-lg font-medium text-gray-900 dark:text-white">Total:</span>
            <input
              type="number"
              step="0.01"
              value={calculateInvoiceTotal()}
              onChange={(e) => {
                const newTotal = parseFloat(e.target.value) || 0
                const currentTotal = calculateInvoiceTotal()
                const difference = newTotal - currentTotal
                
                // Adjust the discount amount to match the new total
                const newDiscountAmount = formData.discountAmount - difference
                handleFormChange('discountAmount', Math.max(0, newDiscountAmount))
              }}
              className="w-32 px-3 py-2 text-lg border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-right font-medium"
            />
            <span className="text-lg font-medium text-gray-900 dark:text-white">UGX</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <Link
          href="/dashboard/finance/invoices"
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          Cancel
        </Link>
        <LoadingButton
          onClick={handleCreateInvoice}
          loading={isCreatingInvoice}
          loadingText="Creating Invoice..."
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <FileText className="h-4 w-4 mr-2" />
          Create Invoice
        </LoadingButton>
      </div>

      <ErrorDialog
        isOpen={isErrorOpen}
        onClose={hideError}
        error={error}
        title="Invoice Creation Error"
        showRetry={true}
        onRetry={fetchData}
        showCopy={true}
      />
    </div>
  )
}