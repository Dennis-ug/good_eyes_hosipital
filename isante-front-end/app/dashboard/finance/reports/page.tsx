'use client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback, useRef } from 'react'
import { TrendingUp, DollarSign, FileText, Calendar, Download } from 'lucide-react'
import { LoadingPage } from '@/components/loading-page'
import { ErrorDialog, useErrorDialog } from '@/components/error-dialog'
import { financeApi } from '@/lib/api'
import { FinancialSummary, Invoice } from '@/lib/types'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import * as XLSX from 'xlsx'

export default function FinancialReportsPage() {
  const [summary, setSummary] = useState<FinancialSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })
  
  // Error dialog hook
  const { error, isErrorOpen, handleError, hideError } = useErrorDialog()
  const handleErrorRef = useRef(handleError)
  handleErrorRef.current = handleError

  // Fetch financial summary
  const fetchFinancialSummary = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await financeApi.getFinancialSummary(dateRange.startDate, dateRange.endDate)
      setSummary(data)
    } catch (error) {
      console.error('Failed to fetch financial summary:', error)
      handleErrorRef.current(error)
    } finally {
      setIsLoading(false)
    }
  }, [dateRange])

  useEffect(() => {
    fetchFinancialSummary()
  }, [fetchFinancialSummary])

  const formatCurrency = (amount: number) => {
    if (!amount || isNaN(amount)) return 'UGX 0'
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX'
    }).format(amount)
  }

  const handleDateRangeChange = (field: 'startDate' | 'endDate', value: string) => {
    setDateRange(prev => ({ ...prev, [field]: value }))
  }

  // Export to Excel functionality
  const handleExportToExcel = async () => {
    try {
      setIsLoading(true)
      // Fetch all invoices for the date range
      const invoices = await financeApi.getInvoicesByDateRange(
        dateRange.startDate, 
        dateRange.endDate, 
        { page: 0, size: 10000, sort: 'invoiceDate,desc' }
      )
      
      // Prepare data for Excel
      const excelData = invoices.content.map(invoice => ({
        'Invoice Number': invoice.invoiceNumber,
        'Date': invoice.invoiceDate,
        'Patient Name': invoice.patientName,
        'Patient Phone': invoice.patientPhone,
        'Doctor Name': invoice.doctorName,
        'Total Amount': invoice.totalAmount,
        'Amount Paid': invoice.amountPaid || 0,
        'Balance Due': invoice.balanceDue || 0,
        'Status': invoice.status,
        'Payment Status': invoice.paymentStatus,
        'Payment Method': invoice.paymentMethod || 'N/A',
        'Payment Date': invoice.paymentDate || 'N/A',
        'Notes': invoice.notes || ''
      }))
      
      // Create workbook and worksheet
      const ws = XLSX.utils.json_to_sheet(excelData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Invoices')
      
      // Generate filename with date range
      const startDateStr = dateRange.startDate.replace(/-/g, '')
      const endDateStr = dateRange.endDate.replace(/-/g, '')
      const filename = `financial_report_${startDateStr}_to_${endDateStr}.xlsx`
      
      // Download file
      XLSX.writeFile(wb, filename)
    } catch (error) {
      console.error('Failed to export to Excel:', error)
      handleErrorRef.current(error)
    } finally {
      setIsLoading(false)
    }
  }

  // Chart data preparation
  const getPaymentMethodChartData = () => {
    if (!summary?.paymentMethodBreakdown) return []
    return Object.entries(summary.paymentMethodBreakdown).map(([method, amount]) => ({
      name: method.replace('_', ' '),
      value: amount,
      formattedValue: formatCurrency(amount)
    }))
  }

  const getStatusChartData = () => {
    if (!summary?.statusBreakdown) return []
    return Object.entries(summary.statusBreakdown).map(([status, count]) => ({
      name: status,
      value: count,
      formattedValue: count.toString()
    }))
  }

  const getTopDoctorsChartData = () => {
    if (!summary?.topDoctors) return []
    return summary.topDoctors.map(doctor => ({
      name: doctor.doctorName,
      revenue: doctor.totalRevenue,
      invoices: doctor.totalInvoices,
      formattedRevenue: formatCurrency(doctor.totalRevenue)
    }))
  }

  const getTopServicesChartData = () => {
    if (!summary?.topServices) return []
    return summary.topServices.map(service => ({
      name: service.serviceName,
      revenue: service.totalRevenue,
      invoices: service.totalInvoices,
      formattedRevenue: formatCurrency(service.totalRevenue)
    }))
  }

  // Chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

  if (isLoading) {
    return (
      <LoadingPage 
        message="Loading financial reports..."
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Reports</h1>
          <p className="text-gray-600 dark:text-gray-400">Detailed financial analytics and insights</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleExportToExcel}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4 mr-2" />
            {isLoading ? 'Exporting...' : 'Export Report'}
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
              className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
              className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchFinancialSummary}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Update Report
            </button>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      {summary && (
        <>
          {/* Key Metrics */}
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
                    <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
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

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Average Invoice
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        {formatCurrency(summary.averageInvoiceAmount)}
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
                    <Calendar className="h-6 w-6 text-orange-600 dark:text-orange-400" />
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
          </div>

          {/* Detailed Breakdowns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Method Breakdown */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Payment Methods</h3>
              </div>
              <div className="p-6">
                {getPaymentMethodChartData().length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={getPaymentMethodChartData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, formattedValue }) => `${name}: ${formattedValue}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getPaymentMethodChartData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                    No payment method data available
                  </div>
                )}
              </div>
            </div>

            {/* Status Breakdown */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Invoice Status</h3>
              </div>
              <div className="p-6">
                {getStatusChartData().length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getStatusChartData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [value, 'Count']} />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                    No status data available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Top Performers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Doctors */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Top Doctors</h3>
              </div>
              <div className="p-6">
                {getTopDoctorsChartData().length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getTopDoctorsChartData()} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Revenue']} />
                      <Bar dataKey="revenue" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                    No doctor data available
                  </div>
                )}
              </div>
            </div>

            {/* Top Services */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Top Services</h3>
              </div>
              <div className="p-6">
                {getTopServicesChartData().length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getTopServicesChartData()} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Revenue']} />
                      <Bar dataKey="revenue" fill="#82CA9D" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                    No service data available
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Error Dialog */}
      <ErrorDialog
        isOpen={isErrorOpen}
        onClose={hideError}
        error={error}
        title="Financial Reports Error"
        showRetry={true}
        onRetry={fetchFinancialSummary}
        showCopy={true}
      />
    </div>
  )
} 