'use client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, Eye, CreditCard, FileText, Printer, Trash } from 'lucide-react'
import { LoadingPage } from '@/components/loading-page'
import { LoadingButton } from '@/components/loading-button'
import { Pagination } from '@/components/pagination'
import { usePagination } from '@/lib/hooks/use-pagination'
import { ErrorDialog, useErrorDialog } from '@/components/error-dialog'
import { financeApi } from '@/lib/api'
import { Invoice, InvoiceStatus, PaymentStatus, PaymentMethod, Page } from '@/lib/types'
import { ReceiptPrinter } from '@/components/receipt-printer'
import { useReceiptPrinter } from '@/lib/hooks/use-receipt-printer'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function InvoicesPage() {
  const { user } = useAuth()
  const [invoices, setInvoices] = useState<Page<Invoice> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  
  // Payment modal states
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [paymentReference, setPaymentReference] = useState('')
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [showReceiptPrinter, setShowReceiptPrinter] = useState(false)
  const [selectedInvoiceForReceipt, setSelectedInvoiceForReceipt] = useState<Invoice | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Error dialog hook
  const { error, isErrorOpen, handleError, hideError } = useErrorDialog()
  const { generateReceiptFromInvoice } = useReceiptPrinter()
  const handleErrorRef = useRef(handleError)
  handleErrorRef.current = handleError
  const searchParams = useSearchParams()
  
  const {
    pageable,
    handlePageChange,
    handleSortChange
  } = usePagination({
    initialPage: 0,
    initialSize: 20,
    initialSort: 'invoiceDate,desc'
  })

  // Fetch invoices
  const fetchInvoices = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await financeApi.getAllInvoices(pageable)
      setInvoices(data)
    } catch (error) {
      console.error('Failed to fetch invoices:', error)
      handleErrorRef.current(error)
    } finally {
      setIsLoading(false)
    }
  }, [pageable])

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  // Auto-open newly created invoice if redirected with newInvoiceId
  useEffect(() => {
    const idParam = searchParams?.get('newInvoiceId')
    if (!idParam) return
    const idNum = Number(idParam)
    if (!Number.isFinite(idNum)) return
    // Always fetch by ID to ensure we open the exact invoice (e.g., procedures invoice)
    financeApi.getInvoiceById(idNum).then((inv) => {
      setSelectedInvoice(inv)
      setShowInvoiceModal(true)
    }).catch((e) => console.error('Failed to fetch new invoice by id:', e))
  }, [searchParams])



  const handleRecordPayment = async () => {
    if (!selectedInvoice || !paymentAmount) return
    
    try {
      setIsProcessingPayment(true)
      await financeApi.recordPayment(selectedInvoice.id, {
        amount: parseFloat(paymentAmount),
        method: paymentMethod as PaymentMethod,
        reference: paymentReference || undefined
      })
      
      setShowPaymentModal(false)
      setSelectedInvoice(null)
      setPaymentAmount('')
      setPaymentMethod('CASH')
      setPaymentReference('')
      fetchInvoices()
    } catch (error) {
      console.error('Failed to record payment:', error)
      handleError(error)
    } finally {
      setIsProcessingPayment(false)
    }
  }

  const generateInvoiceHTML = (invoice: Invoice) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - ${invoice.invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .invoice-info { margin-bottom: 20px; }
          .patient-info { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f8f9fa; }
          .total { font-weight: bold; text-align: right; }
          .footer { margin-top: 30px; text-align: center; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Eyesante Healthcare</h1>
          <h2>Invoice</h2>
        </div>
        
        <div class="invoice-info">
          <p><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
          <p><strong>Date:</strong> ${new Date(invoice.invoiceDate).toLocaleDateString()}</p>
          <p><strong>Due Date:</strong> ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'Not set'}</p>
        </div>
        
        <div class="patient-info">
          <p><strong>Patient:</strong> ${invoice.patientName} (ID: ${invoice.patientId})</p>
          <p><strong>Doctor:</strong> ${invoice.doctorName}${invoice.doctorSpecialty ? ` - ${invoice.doctorSpecialty}` : ''}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Description</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.invoiceItems?.map(item => `
              <tr>
                <td>${item.itemName}</td>
                <td>${item.itemDescription || '-'}</td>
                <td>${item.quantity}</td>
                <td>${formatCurrency(item.unitPrice)}</td>
                <td>${formatCurrency(item.quantity * item.unitPrice)}</td>
              </tr>
            `).join('') || ''}
          </tbody>
        </table>
        
        <div class="total">
          <p><strong>Subtotal:</strong> ${formatCurrency(invoice.subtotal)}</p>
          ${invoice.taxAmount > 0 ? `<p><strong>Tax:</strong> ${formatCurrency(invoice.taxAmount)}</p>` : ''}
          ${invoice.discountAmount > 0 ? `<p><strong>Discount:</strong> -${formatCurrency(invoice.discountAmount)}</p>` : ''}
          <p><strong>Total Amount:</strong> ${formatCurrency(invoice.totalAmount)}</p>
          <p><strong>Amount Paid:</strong> ${formatCurrency(invoice.amountPaid)}</p>
          <p><strong>Balance Due:</strong> ${formatCurrency(invoice.balanceDue)}</p>
        </div>
        
        ${invoice.notes ? `
          <div class="footer">
            <p><strong>Notes:</strong> ${invoice.notes}</p>
          </div>
        ` : ''}
      </body>
      </html>
    `
  }

  const handlePrintInvoice = () => {
    if (!selectedInvoice) return
    
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      const htmlContent = generateInvoiceHTML(selectedInvoice)
      printWindow.document.write(htmlContent)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const getStatusBadge = (status: InvoiceStatus) => {
    const statusConfig = {
      [InvoiceStatus.DRAFT]: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', text: 'Draft' },
      [InvoiceStatus.PENDING]: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', text: 'Pending' },
      [InvoiceStatus.SENT]: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', text: 'Sent' },
      [InvoiceStatus.PAID]: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', text: 'Paid' },
      [InvoiceStatus.OVERDUE]: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', text: 'Overdue' },
      [InvoiceStatus.CANCELLED]: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', text: 'Cancelled' },
      [InvoiceStatus.REFUNDED]: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300', text: 'Refunded' }
    }

    const config = statusConfig[status]
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    )
  }

  const getPaymentStatusBadge = (status: PaymentStatus) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
      'PENDING': { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', text: 'Pending' },
      'PARTIAL': { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300', text: 'Partial' },
      'PAID': { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', text: 'Paid' },
      'OVERDUE': { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', text: 'Overdue' },
      'REFUNDED': { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300', text: 'Refunded' }
    }

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', text: status }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    )
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
        message="Loading invoices..."
        variant="spinner"
        size="lg"
        color="blue"
        layout="top"
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoices</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage and track all invoices</p>
        </div>
        <Link
          href="/dashboard/finance/invoices/create"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Invoice
        </Link>
      </div>

      {/* Sort Options */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            All Invoices ({invoices?.totalElements || 0})
          </h3>
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Sort by:
            </label>
            <select
              value={pageable.sort || 'invoiceDate,desc'}
              onChange={(e) => handleSortChange(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="invoiceDate,desc">Latest First</option>
              <option value="invoiceDate,asc">Oldest First</option>
              <option value="totalAmount,desc">Highest Amount</option>
              <option value="totalAmount,asc">Lowest Amount</option>
              <option value="invoiceNumber,desc">Invoice Number (Z-A)</option>
              <option value="invoiceNumber,asc">Invoice Number (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Invoices List */}
      {invoices && invoices.content.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Invoice Details
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Purpose
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {invoices.content.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {invoice.invoiceNumber}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(invoice.invoiceDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{invoice.patientName}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Patient No: {invoice.patientNumber || invoice.patientId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{invoice.doctorName}</div>
                      {invoice.doctorSpecialty && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">{invoice.doctorSpecialty}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(invoice.totalAmount)}
                      </div>
                      {invoice.balanceDue > 0 && (
                        <div className="text-sm text-red-600 dark:text-red-400">
                          Due: {formatCurrency(invoice.balanceDue)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{invoice.invoicePurpose || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(invoice.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPaymentStatusBadge(invoice.paymentStatus)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedInvoice(invoice)
                            setShowInvoiceModal(true)
                          }}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {invoice.balanceDue > 0 && (
                          <button
                            onClick={() => {
                              setSelectedInvoice(invoice)
                              setPaymentAmount(invoice.balanceDue.toString())
                              setShowPaymentModal(true)
                            }}
                            className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                            title="Record Payment"
                          >
                            <CreditCard className="h-4 w-4" />
                          </button>
                        )}
                        {/* Delete (visible only for SUPER_ADMIN; rely on backend auth to enforce) */}
                        <button
                          onClick={async () => {
                            if (!confirm('Delete this invoice? This will archive it for accountability.')) return
                            try {
                              setIsDeleting(true)
                              await financeApi.deleteInvoice(invoice.id)
                              fetchInvoices()
                            } catch (e) {
                              handleError(e)
                            } finally {
                              setIsDeleting(false)
                            }
                          }}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 disabled:opacity-50"
                          title="Delete Invoice"
                          disabled={isDeleting}
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <Pagination 
            page={invoices} 
            onPageChange={handlePageChange}
          />
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500">
            <FileText className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No invoices found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Get started by creating a new invoice.
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard/finance/invoices/create"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Invoice
            </Link>
          </div>
        </div>
      )}

      {/* Invoice Details Modal */}
      {showInvoiceModal && selectedInvoice && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Invoice Details - {selectedInvoice.invoiceNumber}
                </h3>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Invoice Information */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Invoice Information</h4>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Invoice Number:</span>
                        <span className="text-sm text-gray-900 dark:text-white">{selectedInvoice.invoiceNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Date:</span>
                        <span className="text-sm text-gray-900 dark:text-white">
                          {new Date(selectedInvoice.invoiceDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Due Date:</span>
                        <span className="text-sm text-gray-900 dark:text-white">
                          {selectedInvoice.dueDate ? new Date(selectedInvoice.dueDate).toLocaleDateString() : 'Not set'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Status:</span>
                        <span>{getStatusBadge(selectedInvoice.status)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Payment Status:</span>
                        <span>{getPaymentStatusBadge(selectedInvoice.paymentStatus)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Patient & Doctor Information */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Patient & Doctor</h4>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Patient:</span>
                        <div className="text-sm text-gray-900 dark:text-white font-medium">{selectedInvoice.patientName}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">ID: {selectedInvoice.patientId}</div>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Doctor:</span>
                        <div className="text-sm text-gray-900 dark:text-white font-medium">{selectedInvoice.doctorName}</div>
                        {selectedInvoice.doctorSpecialty && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">{selectedInvoice.doctorSpecialty}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Invoice Items */}
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Invoice Items</h4>
                <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Item
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Qty
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Unit Price
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                      {selectedInvoice.invoiceItems?.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {item.itemName}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {item.itemDescription || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right">
                            {formatCurrency(item.unitPrice)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right">
                            {formatCurrency(item.quantity * item.unitPrice)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Financial Summary</h4>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Subtotal:</span>
                        <span className="text-sm text-gray-900 dark:text-white">{formatCurrency(selectedInvoice.subtotal)}</span>
                      </div>
                      {selectedInvoice.taxAmount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Tax:</span>
                          <span className="text-sm text-gray-900 dark:text-white">{formatCurrency(selectedInvoice.taxAmount)}</span>
                        </div>
                      )}
                      {selectedInvoice.discountAmount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Discount:</span>
                          <span className="text-sm text-gray-900 dark:text-white">-{formatCurrency(selectedInvoice.discountAmount)}</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-lg font-semibold">
                        <span className="text-gray-900 dark:text-white">Total Amount:</span>
                        <span className="text-gray-900 dark:text-white">{formatCurrency(selectedInvoice.totalAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Amount Paid:</span>
                        <span className="text-sm text-gray-900 dark:text-white">{formatCurrency(selectedInvoice.amountPaid)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-red-600 dark:text-red-400">Balance Due:</span>
                        <span className="text-sm font-medium text-red-600 dark:text-red-400">{formatCurrency(selectedInvoice.balanceDue)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedInvoice.notes && (
                <div className="mb-6">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Notes</h4>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <p className="text-sm text-gray-900 dark:text-white">{selectedInvoice.notes}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handlePrintInvoice}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print Invoice
                </button>
                {selectedInvoice.amountPaid > 0 && (
                  <button
                    onClick={() => {
                      setSelectedInvoiceForReceipt(selectedInvoice)
                      setShowReceiptPrinter(true)
                    }}
                    className="px-4 py-2 border border-green-300 dark:border-green-600 rounded-md text-sm font-medium text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 flex items-center"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Print Receipt
                  </button>
                )}
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Close
                </button>
                {selectedInvoice.balanceDue > 0 && (
                  <button
                    onClick={() => {
                      setShowInvoiceModal(false)
                      setPaymentAmount(selectedInvoice.balanceDue.toString())
                      setShowPaymentModal(true)
                    }}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                  >
                    Record Payment
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Record Payment - {selectedInvoice.invoiceNumber}
                </h3>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Payment Amount <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Payment Method <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="CASH">Cash</option>
                    <option value="MOBILE_MONEY">Mobile Money</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="CARD">Card</option>
                    <option value="INSURANCE">Insurance</option>
                    <option value="CHEQUE">Cheque</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Payment Reference
                  </label>
                  <input
                    type="text"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Transaction reference number"
                  />
                </div>
              </div>
              
              <div className="flex justify-end mt-6 space-x-3">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <LoadingButton
                  onClick={handleRecordPayment}
                  loading={isProcessingPayment}
                  loadingText="Processing..."
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                >
                  Record Payment
                </LoadingButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Printer Modal */}
      {showReceiptPrinter && selectedInvoiceForReceipt && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <ReceiptPrinter
              receiptData={generateReceiptFromInvoice(selectedInvoiceForReceipt, {
                id: selectedInvoiceForReceipt.patientId,
                firstName: selectedInvoiceForReceipt.patientName.split(' ')[0] || '',
                lastName: selectedInvoiceForReceipt.patientName.split(' ').slice(1).join(' ') || '',
                patientNumber: selectedInvoiceForReceipt.patientNumber
              }, user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.username)}
              onClose={() => {
                setShowReceiptPrinter(false)
                setSelectedInvoiceForReceipt(null)
              }}
              showPreview={true}
            />
          </div>
        </div>
      )}

      {/* Error Dialog */}
      <ErrorDialog
        isOpen={isErrorOpen}
        onClose={hideError}
        error={error}
        title="Invoice Error"
        showRetry={true}
        onRetry={fetchInvoices}
        showCopy={true}
      />
    </div>
  )
} 