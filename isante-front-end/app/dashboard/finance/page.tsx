'use client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback, useRef } from 'react'
import { DollarSign, FileText, CreditCard, TrendingUp, AlertTriangle } from 'lucide-react'
import { LoadingPage } from '@/components/loading-page'
import { ErrorDialog, useErrorDialog } from '@/components/error-dialog'
import { financeApi } from '@/lib/api'
import { FinancialSummary, Invoice, InvoiceStatus, PaymentStatus } from '@/lib/types'
import Link from 'next/link'

export default function FinanceDashboardPage() {
  const [summary, setSummary] = useState<FinancialSummary | null>(null)
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([])
  const [overdueInvoices, setOverdueInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Error dialog hook
  const { error, isErrorOpen, handleError, hideError } = useErrorDialog()
  const handleErrorRef = useRef(handleError)
  handleErrorRef.current = handleError

  // Get current month date range
  const getCurrentMonthRange = () => {
    const now = new Date()
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    }
  }

  // Fetch financial data
  const fetchFinancialData = useCallback(async () => {
    try {
      setIsLoading(true)
      const { startDate, endDate } = getCurrentMonthRange()
      
      // Fetch financial summary
      const summaryData = await financeApi.getFinancialSummary(startDate, endDate)
      setSummary(summaryData)
      
      // Fetch recent invoices (last 5)
      const recentInvoicesData = await financeApi.getAllInvoices({
        page: 0,
        size: 5,
        sort: 'invoiceDate,desc'
      })
      setRecentInvoices(recentInvoicesData.content)
      
      // Fetch overdue invoices
      const overdueData = await financeApi.getOverdueInvoices()
      setOverdueInvoices(overdueData)
    } catch (error) {
      console.error('Failed to fetch financial data:', error)
      handleErrorRef.current(error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFinancialData()
  }, [fetchFinancialData])

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
    const statusConfig = {
      [PaymentStatus.PENDING]: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', text: 'Pending' },
      [PaymentStatus.PARTIAL]: { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300', text: 'Partial' },
      [PaymentStatus.PAID]: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', text: 'Paid' },
      [PaymentStatus.OVERDUE]: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', text: 'Overdue' },
      [PaymentStatus.REFUNDED]: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300', text: 'Refunded' }
    }

    const config = statusConfig[status]
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    )
  }

  const formatCurrency = (amount: number) => {
    if (!amount || isNaN(amount)) return 'UGX 0'
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX'
    }).format(amount)
  }

  if (isLoading) {
    return (
      <LoadingPage 
        message="Loading financial data..."
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Overview of financial performance and management</p>
        </div>
        <div className="flex space-x-3">
          <Link
            href="/dashboard/finance/invoices"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FileText className="h-4 w-4 mr-2" />
            Manage Invoices
          </Link>
          <Link
            href="/dashboard/finance/reports"
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            View Reports
          </Link>
        </div>
      </div>

      {/* Financial Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Total Revenue
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {formatCurrency(summary.totalRevenue)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Total Paid
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {formatCurrency(summary.totalPaid)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Outstanding
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {formatCurrency(summary.totalOutstanding)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Total Invoices
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {summary.totalInvoices}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {summary && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Method Breakdown */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Payment Methods</h3>
            </div>
                         <div className="p-6">
               <div className="space-y-4">
                 {Object.entries(summary.paymentMethodBreakdown || {}).map(([method, amount]) => (
                   <div key={method} className="flex items-center justify-between">
                     <span className="text-sm text-gray-600 dark:text-gray-400">
                       {method.replace('_', ' ')}
                     </span>
                     <span className="text-sm font-medium text-gray-900 dark:text-white">
                       {formatCurrency(amount)}
                     </span>
                   </div>
                 ))}
               </div>
             </div>
          </div>

          {/* Status Breakdown */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Invoice Status</h3>
            </div>
                         <div className="p-6">
               <div className="space-y-4">
                 {Object.entries(summary.statusBreakdown || {}).map(([status, count]) => (
                   <div key={status} className="flex items-center justify-between">
                     <span className="text-sm text-gray-600 dark:text-gray-400">
                       {status}
                     </span>
                     <span className="text-sm font-medium text-gray-900 dark:text-white">
                       {count}
                     </span>
                   </div>
                 ))}
               </div>
             </div>
          </div>
        </div>
      )}

      {/* Recent Invoices and Overdue Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Invoices</h3>
            <Link
              href="/dashboard/finance/invoices"
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              View all
            </Link>
          </div>
          <div className="overflow-hidden">
            {recentInvoices.length > 0 ? (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentInvoices.map((invoice) => (
                  <li key={invoice.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {invoice.invoiceNumber}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {invoice.patientName}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(invoice.totalAmount)}
                        </span>
                        {getStatusBadge(invoice.status)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                No recent invoices
              </div>
            )}
          </div>
        </div>

        {/* Overdue Invoices */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Overdue Invoices</h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
              {overdueInvoices.length}
            </span>
          </div>
          <div className="overflow-hidden">
            {overdueInvoices.length > 0 ? (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {overdueInvoices.slice(0, 5).map((invoice) => (
                  <li key={invoice.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {invoice.invoiceNumber}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {invoice.patientName}
                        </p>
                        <p className="text-xs text-red-600 dark:text-red-400">
                          Due: {new Date(invoice.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(invoice.balanceDue)}
                        </span>
                        {getPaymentStatusBadge(invoice.paymentStatus)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                No overdue invoices
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Quick Actions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/dashboard/finance/invoices/create"
              className="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Create Invoice</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">Generate new invoice</p>
              </div>
            </Link>

            <Link
              href="/dashboard/finance/payments"
              className="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <CreditCard className="h-8 w-8 text-green-600 dark:text-green-400 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Record Payment</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">Process payments</p>
              </div>
            </Link>

            <Link
              href="/dashboard/finance/reports"
              className="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Financial Reports</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">View detailed reports</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Error Dialog */}
      <ErrorDialog
        isOpen={isErrorOpen}
        onClose={hideError}
        error={error}
        title="Finance Error"
        showRetry={true}
        onRetry={fetchFinancialData}
        showCopy={true}
      />
    </div>
  )
} 