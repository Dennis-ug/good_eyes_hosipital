'use client'
// Force dynamic rendering
export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react'
import { 
  BarChart3, 
  Package, 
  Beaker, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  Activity,
  History,
  FileText,
  Users,
  Eye,
  Building2
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { usePermissions } from '@/lib/hooks/use-permissions'
import { financeApi, inventoryApi, consumablesApi } from '@/lib/api'
import { FinancialSummary, InventoryItem, ConsumableItem, ConsumableUsage } from '@/lib/types'
import { ErrorDialog, useErrorDialog } from '@/components/error-dialog'

interface DashboardStats {
  totalRevenue: number
  totalInvoices: number
  pendingInvoices: number
  totalInventoryItems: number
  lowStockItems: number
  totalConsumables: number
  recentUsage: number
  totalCategories: number
}

export default function BusinessDashboard() {
  const { user } = useAuth()
  const { isAdmin } = usePermissions()
  const [activeTab, setActiveTab] = useState('finance')
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalInvoices: 0,
    pendingInvoices: 0,
    totalInventoryItems: 0,
    lowStockItems: 0,
    totalConsumables: 0,
    recentUsage: 0,
    totalCategories: 0
  })
  const [loading, setLoading] = useState(true)
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null)
  const [recentInvoices, setRecentInvoices] = useState<any[]>([])
  const [lowStockInventory, setLowStockInventory] = useState<InventoryItem[]>([])
  const [lowStockConsumables, setLowStockConsumables] = useState<ConsumableItem[]>([])
  const [recentConsumableUsage, setRecentConsumableUsage] = useState<ConsumableUsage[]>([])
  
  // Error dialog hook
  const { error, isErrorOpen, handleError, hideError } = useErrorDialog()

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

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)
        const { startDate, endDate } = getCurrentMonthRange()
        
        // Initialize with default values in case API calls fail
        let financialData = null
        let invoicesData = { content: [], totalElements: 0 }
        let pendingInvoicesData = { totalElements: 0 }
        let inventoryData = { totalElements: 0 }
        let lowStockInventoryData = []
        let consumablesData = { totalElements: 0 }
        let lowStockConsumablesData = []
        let usageData = { content: [], totalElements: 0 }
        
        try {
          // Fetch financial data
          financialData = await financeApi.getFinancialSummary(startDate, endDate)
          setFinancialSummary(financialData)
        } catch (error) {
          console.warn('Failed to fetch financial data:', error)
        }
        
        try {
          // Fetch recent invoices
          invoicesData = await financeApi.getAllInvoices({
            page: 0,
            size: 5,
            sort: 'invoiceDate,desc'
          })
          setRecentInvoices(invoicesData.content)
        } catch (error) {
          console.warn('Failed to fetch invoices data:', error)
        }
        
        try {
          // Fetch pending invoices
          pendingInvoicesData = await financeApi.getInvoicesByPaymentStatus('PENDING', {
            page: 0,
            size: 100,
            sort: 'invoiceDate,desc'
          })
        } catch (error) {
          console.warn('Failed to fetch pending invoices data:', error)
        }
        
        try {
          // Fetch inventory data
          inventoryData = await inventoryApi.getAllItems({
            page: 0,
            size: 1000,
            sort: 'name,asc'
          })
        } catch (error) {
          console.warn('Failed to fetch inventory data:', error)
        }
        
        try {
          const lowStockInventoryData = await inventoryApi.getLowStockItems()
          setLowStockInventory(lowStockInventoryData)
        } catch (error) {
          console.warn('Failed to fetch low stock inventory data:', error)
        }
        
        try {
          // Fetch consumables data
          consumablesData = await consumablesApi.getAllItems({
            page: 0,
            size: 1000,
            sort: 'name,asc'
          })
        } catch (error) {
          console.warn('Failed to fetch consumables data:', error)
        }
        
        try {
          const lowStockConsumablesData = await consumablesApi.getLowStockItems()
          setLowStockConsumables(lowStockConsumablesData)
        } catch (error) {
          console.warn('Failed to fetch low stock consumables data:', error)
        }
        
        try {
          // Fetch recent consumable usage
          usageData = await consumablesApi.getUsageHistory({
            page: 0,
            size: 10,
            sort: 'usageDate,desc'
          })
          setRecentConsumableUsage(usageData.content)
        } catch (error) {
          console.warn('Failed to fetch consumable usage data:', error)
        }
        
        // Update stats with available data
        setStats({
          totalRevenue: financialData?.totalRevenue || 0,
          totalInvoices: financialData?.totalInvoices || 0,
          pendingInvoices: pendingInvoicesData.totalElements || 0,
          totalInventoryItems: inventoryData.totalElements || 0,
          lowStockItems: lowStockInventoryData.length || 0,
          totalConsumables: consumablesData.totalElements || 0,
          recentUsage: usageData.totalElements || 0,
          totalCategories: 0
        })
        
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
        // Set default stats even if all API calls fail
        setStats({
          totalRevenue: 0,
          totalInvoices: 0,
          pendingInvoices: 0,
          totalInventoryItems: 0,
          lowStockItems: 0,
          totalConsumables: 0,
          recentUsage: 0,
          totalCategories: 0
        })
      } finally {
        setLoading(false)
      }
    }

    // Only load data if user is authenticated
    if (user) {
      loadDashboardData()
    } else {
      setLoading(false)
    }
  }, [user])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(amount)
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <Building2 className="h-10 w-10 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Authentication Required</h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Please log in to view the business dashboard.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <ErrorDialog 
        isOpen={isErrorOpen} 
        error={error} 
        onClose={hideError} 
      />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Business Management Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive overview of financial, inventory, and consumables management
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center">
            <BarChart3 className="mr-2 h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm text-green-600 dark:text-green-400 font-medium">↑ 12.5%</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Revenue</h3>
          <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white break-words leading-tight min-h-[2rem] flex items-center">
            {formatCurrency(stats.totalRevenue)}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">This month</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Package className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-sm text-green-600 dark:text-green-400 font-medium">↑ 8.2%</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Inventory Items</h3>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalInventoryItems}</div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total items</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Beaker className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-sm text-green-600 dark:text-green-400 font-medium">↑ 15.3%</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Consumables</h3>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalConsumables}</div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Active items</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <span className="text-sm text-red-600 dark:text-red-400 font-medium">↓ 5.1%</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Low Stock</h3>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.lowStockItems}</div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Items need restock</p>
        </div>
      </div>

      {/* Main Dashboard Tabs */}
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('finance')}
            className={`flex items-center px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'finance'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <DollarSign className="mr-2 h-4 w-4" />
            Financial Management
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'inventory'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Package className="mr-2 h-4 w-4" />
            Inventory Management
          </button>
          <button
            onClick={() => setActiveTab('consumables')}
            className={`flex items-center px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'consumables'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Beaker className="mr-2 h-4 w-4" />
            Consumables Management
          </button>
        </div>

        {/* Financial Management Section */}
        {activeTab === 'finance' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Financial Overview */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
                    <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Financial Overview</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Key financial metrics and performance indicators</p>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Invoices</span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                      {stats.totalInvoices}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Pending Invoices</span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                      {stats.pendingInvoices}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Revenue</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(stats.totalRevenue)}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
                    <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Common financial management tasks</p>
                <div className="space-y-3">
                  <Link href="/dashboard/finance/invoices/create">
                    <button className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 hover:shadow-sm">
                      <FileText className="mr-3 h-4 w-4" />
                      Create New Invoice
                    </button>
                  </Link>
                  <Link href="/dashboard/finance/invoices">
                    <button className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 hover:shadow-sm">
                      <BarChart3 className="mr-3 h-4 w-4" />
                      View All Invoices
                    </button>
                  </Link>
                  <Link href="/dashboard/finance/reports">
                    <button className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 hover:shadow-sm">
                      <TrendingUp className="mr-3 h-4 w-4" />
                      Financial Reports
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Inventory Management Section */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Inventory Overview */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mr-3">
                    <Package className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Inventory Overview</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Current inventory status and alerts</p>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Items</span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                      {stats.totalInventoryItems}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Categories</span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                      {stats.totalCategories}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Low Stock Items</span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                      {stats.lowStockItems}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mr-3">
                    <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Common inventory management tasks</p>
                <div className="space-y-3">
                  <Link href="/dashboard/inventory/items/create">
                    <button className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 hover:shadow-sm">
                      <Package className="mr-3 h-4 w-4" />
                      Add New Item
                    </button>
                  </Link>
                  <Link href="/dashboard/inventory/low-stock">
                    <button className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 hover:shadow-sm">
                      <AlertTriangle className="mr-3 h-4 w-4" />
                      View Low Stock
                    </button>
                  </Link>
                  <Link href="/dashboard/inventory/restock">
                    <button className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 hover:shadow-sm">
                      <Activity className="mr-3 h-4 w-4" />
                      Record Restock
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Consumables Management Section */}
        {activeTab === 'consumables' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Consumables Overview */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg mr-3">
                    <Beaker className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Consumables Overview</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Internal hospital consumables status</p>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Items</span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                      {stats.totalConsumables}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Recent Usage</span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                      {stats.recentUsage}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Categories</span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                      {stats.totalCategories}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg mr-3">
                    <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Common consumables management tasks</p>
                <div className="space-y-3">
                  <Link href="/dashboard/consumables/items">
                    <button className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 hover:shadow-sm">
                      <Beaker className="mr-3 h-4 w-4" />
                      Manage Items
                    </button>
                  </Link>
                  <Link href="/dashboard/consumables/usage">
                    <button className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 hover:shadow-sm">
                      <Activity className="mr-3 h-4 w-4" />
                      Record Usage
                    </button>
                  </Link>
                  <Link href="/dashboard/consumables/usage/history">
                    <button className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 hover:shadow-sm">
                      <History className="mr-3 h-4 w-4" />
                      Usage History
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mt-8">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
            <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Latest updates across all business management areas</p>
        <div className="space-y-4">
          {recentInvoices.length > 0 && (
            <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Latest Invoice</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Invoice #{recentInvoices[0].invoiceNumber} - {formatCurrency(recentInvoices[0].totalAmount)}
                </p>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(recentInvoices[0].invoiceDate).toLocaleDateString()}
              </span>
            </div>
          )}
          
          {lowStockInventory.length > 0 && (
            <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Package className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Low Stock Alert</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {lowStockInventory[0].name} - {lowStockInventory[0].quantityInStock} units remaining
                </p>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Needs restock</span>
            </div>
          )}
          
          {recentConsumableUsage.length > 0 && (
            <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Beaker className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Recent Consumable Usage</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {recentConsumableUsage[0].consumableItemName} - {recentConsumableUsage[0].quantityUsed} units used
                </p>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(recentConsumableUsage[0].usageDate).toLocaleDateString()}
              </span>
            </div>
          )}
          
          {recentInvoices.length === 0 && lowStockInventory.length === 0 && recentConsumableUsage.length === 0 && (
            <div className="text-center py-8">
              <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Activity className="h-8 w-8 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {stats.totalRevenue === 0 && stats.totalInvoices === 0 && stats.totalInventoryItems === 0 
                  ? "Unable to load data. Please check your connection and try again." 
                  : "No recent activity to display"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

