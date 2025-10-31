'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { usePermissions } from '@/lib/hooks/use-permissions'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import {
  LogOut,
  Menu,
  X,
  Building2,
  BarChart3,
  Users,
  UserPlus,
  Shield,
  Settings,
  Calendar,
  FileText,
  Eye,
  Clock,
  DollarSign,
  Package,
  FolderOpen,
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Activity,
  Beaker,
  History,
  TrendingUp,
  Stethoscope,
  User,
  Scissors,
  Plus
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { PasswordChangeModal } from '@/components/password-change-modal'

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles: string[]
  submenu?: NavigationItem[]
  key?: string
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set())
  const { user, logout, passwordChangeRequired, userRoles } = useAuth()
  const { 
    canCreatePatients, 
    canUpdatePatients, 
    canDeletePatients,
    canCreateVisitSessions,
    canUpdateVisitSessions,
    canCreateExaminations,
    canUpdateExaminations,
    canCreateTriage,
    canUpdateTriage,
    isDoctor,
    isReceptionist,
    isAdmin
  } = usePermissions()
  const router = useRouter()
  const pathname = usePathname()

  // Define navigation items based on user permissions
  const navigation = useMemo((): NavigationItem[] => {
    // If user is a receptionist, only show reception menu
    if (isReceptionist && !isAdmin) {
      return [
        { name: 'Overview', href: '/dashboard', icon: BarChart3, roles: ['RECEPTIONIST'] },
        { name: 'Patient Registration', href: '/dashboard/patients/add', icon: UserPlus, roles: ['RECEPTIONIST'] },
        { name: 'Patient List', href: '/dashboard/patients', icon: Users, roles: ['RECEPTIONIST'] },
        { name: 'Visit Sessions', href: '/dashboard/patient-visit-sessions', icon: FileText, roles: ['RECEPTIONIST'] },
        { name: 'Appointments', href: '/dashboard/appointments', icon: Calendar, roles: ['RECEPTIONIST'] },
        { name: 'Doctor Schedules', href: '/dashboard/schedules', icon: Clock, roles: ['RECEPTIONIST'] },
      ]
    }

    // For other roles, show full navigation
    const baseItems: NavigationItem[] = [
      { name: 'Overview', href: '/dashboard', icon: BarChart3, roles: ['SUPER_ADMIN', 'ADMIN', 'OPTOMETRIST', 'OPHTHALMOLOGIST'] },
    ]

    const adminItems: NavigationItem[] = [
      { 
        name: 'Administration', 
        href: '/dashboard/users', 
        icon: Settings, 
        roles: ['SUPER_ADMIN', 'ADMIN'],
        submenu: [
          { name: 'User Management', href: '/dashboard/users', icon: Users, roles: ['SUPER_ADMIN', 'ADMIN'] },
          { name: 'Departments', href: '/dashboard/departments', icon: Building2, roles: ['SUPER_ADMIN', 'ADMIN'] },
          { name: 'Roles & Permissions', href: '/dashboard/roles', icon: Shield, roles: ['SUPER_ADMIN'] },
        ]
      }
    ]

    const clinicalItems: NavigationItem[] = [
      { 
        name: 'Clinical', 
        href: '/dashboard/patients', 
        icon: Eye, 
        roles: (isDoctor || (isAdmin && !userRoles.includes('ACCOUNT_STORE_MANAGER'))) ? ['*'] : [],
        submenu: [
          { name: 'Patients', href: '/dashboard/patients', icon: Users, roles: ['*'] }, // All authenticated users can view patients
          { name: 'Triage', href: '/dashboard/triage', icon: Activity, roles: canCreateTriage ? ['*'] : [] },
          { name: 'Basic Refraction Exams', href: '/dashboard/basic-refraction-exams', icon: Eye, roles: canCreateExaminations ? ['*'] : [] },
          { name: 'Main Exams', href: '/dashboard/main-exams', icon: Eye, roles: canCreateExaminations ? ['*'] : [] },
          { name: 'Diagnoses', href: '/dashboard/diagnoses', icon: Stethoscope, roles: canCreateExaminations ? ['*'] : [] },
          { name: 'Visit Sessions', href: '/dashboard/patient-visit-sessions', icon: FileText, roles: ['*'] }, // All authenticated users can view visit sessions
          { name: 'Procedures', href: '/dashboard/procedures', icon: FileText, roles: ['*'] },
        ]
      }
    ]

    const theaterItems: NavigationItem[] = [
      { 
        name: 'Theater', 
        href: '/dashboard/theater', 
        icon: Scissors, 
        roles: ['*'], // All authenticated users can access theater
        submenu: [
          { name: 'Theater Dashboard', href: '/dashboard/theater', icon: Scissors, roles: ['*'] },
          { name: 'Theater Stores', href: '/dashboard/theater/stores', icon: Building2, roles: ['*'] },
          { name: 'Requisitions', href: '/dashboard/theater/requisitions', icon: Package, roles: ['*'] },
          { name: 'Procedure Reports', href: '/dashboard/theater/procedure-reports', icon: FileText, roles: ['*'] },
        ]
      }
    ]

    const businessManagementItems: NavigationItem[] = [
      { 
        name: 'Business Management', 
        href: '/dashboard/business', 
        icon: Building2, 
        roles: ['SUPER_ADMIN', 'ADMIN', 'OPTOMETRIST', 'OPHTHALMOLOGIST', 'USER'],
        submenu: [
          // Dashboard Overview
          { name: 'Dashboard Overview', href: '/dashboard/business', icon: BarChart3, roles: ['SUPER_ADMIN', 'ADMIN', 'OPTOMETRIST', 'OPHTHALMOLOGIST', 'USER'] },
          // Divider
          { name: '---', href: '#', icon: Building2, roles: ['SUPER_ADMIN', 'ADMIN', 'OPTOMETRIST', 'OPHTHALMOLOGIST', 'USER'], key: 'divider-1' },
          // Finance Section
          { name: 'Financial Dashboard', href: '/dashboard/finance', icon: DollarSign, roles: ['SUPER_ADMIN', 'ADMIN'] },
          { name: 'Invoices', href: '/dashboard/finance/invoices', icon: FileText, roles: ['SUPER_ADMIN', 'ADMIN'] },
          { name: 'Financial Reports', href: '/dashboard/finance/reports', icon: TrendingUp, roles: ['SUPER_ADMIN', 'ADMIN'] },
          // Divider
          { name: '---', href: '#', icon: Building2, roles: ['SUPER_ADMIN', 'ADMIN', 'OPTOMETRIST', 'OPHTHALMOLOGIST', 'USER'], key: 'divider-2' },
          // Inventory Section
          { name: 'Inventory Dashboard', href: '/dashboard/inventory', icon: Package, roles: ['SUPER_ADMIN', 'ADMIN', 'OPTOMETRIST', 'OPHTHALMOLOGIST', 'USER'] },
          { name: 'Categories', href: '/dashboard/inventory/categories', icon: FolderOpen, roles: ['SUPER_ADMIN', 'ADMIN', 'OPTOMETRIST', 'OPHTHALMOLOGIST', 'USER'] },
          { name: 'Items', href: '/dashboard/inventory/items', icon: Package, roles: ['SUPER_ADMIN', 'ADMIN', 'OPTOMETRIST', 'OPHTHALMOLOGIST', 'USER'] },
          { name: 'Low Stock', href: '/dashboard/inventory/low-stock', icon: AlertTriangle, roles: ['SUPER_ADMIN', 'ADMIN', 'OPTOMETRIST', 'OPHTHALMOLOGIST', 'USER'] },
          { name: 'Restock', href: '/dashboard/inventory/restock', icon: RefreshCw, roles: ['SUPER_ADMIN', 'ADMIN', 'OPTOMETRIST', 'OPHTHALMOLOGIST', 'USER'] },
          // Divider
          { name: '---', href: '#', icon: Building2, roles: ['SUPER_ADMIN', 'ADMIN', 'OPTOMETRIST', 'OPHTHALMOLOGIST', 'USER'], key: 'divider-3' },
          // Consumables Section
          { name: 'Consumables Dashboard', href: '/dashboard/consumables', icon: Beaker, roles: ['SUPER_ADMIN', 'ADMIN', 'OPTOMETRIST', 'OPHTHALMOLOGIST', 'USER'] },
          { name: 'Consumable Items', href: '/dashboard/consumables/items', icon: Package, roles: ['SUPER_ADMIN', 'ADMIN', 'OPTOMETRIST', 'OPHTHALMOLOGIST', 'USER'] },
          { name: 'Record Usage', href: '/dashboard/consumables/usage', icon: Activity, roles: ['SUPER_ADMIN', 'ADMIN', 'OPTOMETRIST', 'OPHTHALMOLOGIST', 'USER'] },
          // Divider
          { name: '---', href: '#', icon: Building2, roles: ['SUPER_ADMIN', 'ADMIN', 'OPTOMETRIST', 'OPHTHALMOLOGIST', 'USER'], key: 'divider-4' },
          // Requisitions Section
          { name: 'Requisitions Waiting for Approval', href: '/dashboard/business/requisitions-approval', icon: Clock, roles: ['SUPER_ADMIN', 'ADMIN', 'ACCOUNT_STORE_MANAGER', 'ACCOUNTANT'] },
        ]
      }
    ]

    // Special menu items for ACCOUNT_STORE_MANAGER - direct access without submenus
    const accountStoreManagerItems: NavigationItem[] = [
      { 
        name: 'Business Management', 
        href: '/dashboard/business', 
        icon: Building2, 
        roles: ['ACCOUNT_STORE_MANAGER'],
        submenu: [
          // Dashboard Overview
          { name: 'Dashboard Overview', href: '/dashboard/business', icon: BarChart3, roles: ['ACCOUNT_STORE_MANAGER'] },
          // Divider
          { name: '---', href: '#', icon: Building2, roles: ['ACCOUNT_STORE_MANAGER'], key: 'divider-1' },
          // Finance Section
          { name: 'Financial Dashboard', href: '/dashboard/finance', icon: DollarSign, roles: ['ACCOUNT_STORE_MANAGER'] },
          { name: 'Invoices', href: '/dashboard/finance/invoices', icon: FileText, roles: ['ACCOUNT_STORE_MANAGER'] },
          { name: 'Financial Reports', href: '/dashboard/finance/reports', icon: TrendingUp, roles: ['ACCOUNT_STORE_MANAGER'] },
          // Divider
          { name: '---', href: '#', icon: Building2, roles: ['ACCOUNT_STORE_MANAGER'], key: 'divider-2' },
          // Inventory Section
          { name: 'Inventory Dashboard', href: '/dashboard/inventory', icon: Package, roles: ['ACCOUNT_STORE_MANAGER'] },
          { name: 'Categories', href: '/dashboard/inventory/categories', icon: FolderOpen, roles: ['ACCOUNT_STORE_MANAGER'] },
          { name: 'Items', href: '/dashboard/inventory/items', icon: Package, roles: ['ACCOUNT_STORE_MANAGER'] },
          { name: 'Low Stock', href: '/dashboard/inventory/low-stock', icon: AlertTriangle, roles: ['ACCOUNT_STORE_MANAGER'] },
          { name: 'Restock', href: '/dashboard/inventory/restock', icon: RefreshCw, roles: ['ACCOUNT_STORE_MANAGER'] },
          // Divider
          { name: '---', href: '#', icon: Building2, roles: ['ACCOUNT_STORE_MANAGER'], key: 'divider-3' },
          // Consumables Section
          { name: 'Consumables Dashboard', href: '/dashboard/consumables', icon: Beaker, roles: ['ACCOUNT_STORE_MANAGER'] },
          { name: 'Consumable Items', href: '/dashboard/consumables/items', icon: Package, roles: ['ACCOUNT_STORE_MANAGER'] },
          { name: 'Record Usage', href: '/dashboard/consumables/usage', icon: Activity, roles: ['ACCOUNT_STORE_MANAGER'] },
          // Divider
          { name: '---', href: '#', icon: Building2, roles: ['ACCOUNT_STORE_MANAGER'], key: 'divider-4' },
          // Requisitions Section
          { name: 'Requisitions Waiting for Approval', href: '/dashboard/business/requisitions-approval', icon: Clock, roles: ['ACCOUNT_STORE_MANAGER'] },
        ]
      }
    ]

    const receptionItems: NavigationItem[] = [
      { 
        name: 'Reception', 
        href: '/dashboard/reception', 
        icon: UserPlus, 
        roles: ['SUPER_ADMIN', 'ADMIN'],
        submenu: [
          { name: 'Patient Registration', href: '/dashboard/patients/add', icon: UserPlus, roles: ['SUPER_ADMIN', 'ADMIN'] },
          { name: 'Patient List', href: '/dashboard/patients', icon: Users, roles: ['SUPER_ADMIN', 'ADMIN'] },
          { name: 'Visit Sessions', href: '/dashboard/patient-visit-sessions', icon: FileText, roles: ['SUPER_ADMIN', 'ADMIN'] },
          { name: 'Appointments', href: '/dashboard/appointments', icon: Calendar, roles: ['SUPER_ADMIN', 'ADMIN'] },
          { name: 'Doctor Schedules', href: '/dashboard/schedules', icon: Clock, roles: ['SUPER_ADMIN', 'ADMIN'] },
        ]
      }
    ]

    // Combine all items and filter based on user permissions
    // Ensure only one Business Management menu is included to avoid duplicate keys
    const businessMenu = userRoles.includes('ACCOUNT_STORE_MANAGER') ? accountStoreManagerItems : businessManagementItems
    const allItems = [...baseItems, ...adminItems, ...clinicalItems, ...theaterItems, ...businessMenu, ...receptionItems]
    
    // Filter items based on user permissions
    const filteredItems = allItems.filter(item => {
      // If roles includes '*', it means all authenticated users can access
      if (item.roles.includes('*')) return true
      
      // Otherwise, check if user has any of the required roles
      return item.roles.some(role => userRoles.includes(role))
    })
    
    return filteredItems
  }, [userRoles, canCreatePatients, canCreateVisitSessions, canCreateExaminations, canCreateTriage, isDoctor, isReceptionist, isAdmin])

  const handleLogout = useCallback(() => {
    logout()
    router.push('/login')
  }, [logout, router])

  const handlePasswordChangeSuccess = useCallback(() => {
    setShowPasswordChangeModal(false)
  }, [])

  // Show password change modal if required
  React.useEffect(() => {
    if (passwordChangeRequired && !showPasswordChangeModal) {
      setShowPasswordChangeModal(true)
    }
  }, [passwordChangeRequired, showPasswordChangeModal])

  const toggleSubmenu = useCallback((menuKey: string) => {
    setExpandedMenus(prev => {
      const newSet = new Set(prev)
      if (newSet.has(menuKey)) {
        newSet.delete(menuKey)
      } else {
        newSet.add(menuKey)
      }
      return newSet
    })
  }, [])

  const isSubmenuExpanded = (menuKey: string) => expandedMenus.has(menuKey)

  const isActiveItem = useCallback((item: NavigationItem) => {
    if (pathname === item.href) return true
    if (item.submenu) {
      return item.submenu.some(subItem => pathname === subItem.href)
    }
    return false
  }, [pathname])

  if (!user) {
    return null
  }

  // Get user's primary role for display
  const getPrimaryRoleDisplay = () => {
    if (userRoles.includes('SUPER_ADMIN')) return 'Super Admin'
    if (userRoles.includes('ADMIN')) return 'Admin'
    if (userRoles.includes('RECEPTIONIST')) return 'Receptionist'
    if (userRoles.includes('OPTOMETRIST')) return 'Optometrist'
    if (userRoles.includes('OPHTHALMOLOGIST')) return 'Ophthalmologist'
    return 'User'
  }

  const renderNavigationItem = (item: NavigationItem, isMobile = false) => {
    const itemKey = item.key || `${item.href}|${item.name}`
    const isActive = isActiveItem(item)
    const hasSubmenu = item.submenu && item.submenu.length > 0
    const isExpanded = hasSubmenu ? isSubmenuExpanded(itemKey) : false

    if (hasSubmenu) {
      return (
        <div key={itemKey}>
          <button
            onClick={() => toggleSubmenu(itemKey)}
            className={`group flex items-center justify-between w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${
              isActive
                ? 'bg-blue-500 text-white shadow-lg'
                : 'text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-md'
            }`}
          >
            <div className="flex items-center">
              <item.icon className={`mr-3 h-5 w-5 transition-colors duration-300 ${
                isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
              }`} />
              {item.name}
            </div>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 transition-transform duration-300" />
            ) : (
              <ChevronRight className="h-4 w-4 transition-transform duration-300" />
            )}
          </button>
          {isExpanded && (
            <div className="ml-4 mt-3 space-y-2">
              {item.submenu!.map((subItem) => {
                const isSubActive = pathname === subItem.href
                
                // Handle divider
                if (subItem.name === '---') {
                  return (
                    <div key={subItem.key || `divider-${subItem.href}-${subItem.name}`} className="border-t border-gray-200 dark:border-gray-600 my-3"></div>
                  )
                }
                
                return (
                  <Link
                    key={subItem.key || `${subItem.href}-${subItem.name}`}
                    href={subItem.href}
                    className={`group flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${
                      isSubActive
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                    onClick={() => isMobile && setSidebarOpen(false)}
                  >
                    <subItem.icon className="mr-3 h-4 w-4" />
                    {subItem.name}
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      )
    }

    return (
      <Link
        key={itemKey}
        href={item.href}
        className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${
          isActive
            ? 'bg-blue-500 text-white shadow-lg'
            : 'text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-md'
        }`}
        onClick={() => isMobile && setSidebarOpen(false)}
      >
        <item.icon className={`mr-3 h-5 w-5 transition-colors duration-300 ${
          isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
        }`} />
        {item.name}
      </Link>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white dark:bg-gray-800 shadow-2xl">
          <div className="flex h-16 items-center justify-between px-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center">
              <Image src="/logo.png" alt="Good Eyes Hospital" width={32} height={32} className="rounded-md" />
              <span className="ml-3 text-xl font-bold text-gray-900 dark:text-white">Good Eyes Hospital</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto max-h-[calc(100vh-120px)] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500">
            {navigation.map((item) => renderNavigationItem(item, true))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-80 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 shadow-xl">
          {/* Header */}
          <div className="flex h-20 items-center px-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
            <div className="flex items-center">
              <Image src="/logo.png" alt="Good Eyes Hospital" width={40} height={40} className="rounded-md" />
              <span className="ml-3 text-2xl font-bold text-gray-900 dark:text-white">Good Eyes Hospital</span>
            </div>
          </div>
          
          {/* Navigation */}
          <div className="flex-1 relative">
            <nav className="space-y-3 px-6 py-8 overflow-y-auto max-h-[calc(100vh-240px)] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500">
              {navigation.map((item) => renderNavigationItem(item))}
            </nav>
            {/* Fade indicator for scrollable content */}
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white dark:from-gray-800 to-transparent pointer-events-none"></div>
          </div>
          
          {/* User Profile Section */}
          <div className="border-t border-gray-100 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <span className="text-sm font-bold text-white">
                    {user.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {user.username}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 truncate font-medium">
                  {getPrimaryRoleDisplay()}
                </p>
              </div>
              <div className="flex items-center space-x-1">
                <Link
                  href="/dashboard/profile"
                  className="flex-shrink-0 p-2 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  title="Edit Profile"
                >
                  <User className="h-4 w-4" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-80">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-20 shrink-0 items-center gap-x-4 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 shadow-sm">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 dark:text-gray-300 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1" />
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <ThemeToggle />
              {/* Mobile user info - hidden on desktop since it's in sidebar */}
              <div className="flex items-center gap-x-2 lg:hidden">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Welcome, {user.username}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ({getPrimaryRoleDisplay()})
                </span>
              </div>
              <Link
                href="/dashboard/profile"
                className="flex items-center gap-x-2 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 lg:hidden"
              >
                <User className="h-5 w-5" />
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-x-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 lg:hidden"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-8">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
            {children}
          </div>
        </main>
      </div>
      
      {/* Password Change Modal */}
      <PasswordChangeModal
        isOpen={showPasswordChangeModal}
        onClose={() => setShowPasswordChangeModal(false)}
        onSuccess={handlePasswordChangeSuccess}
      />
    </div>
  )
} 