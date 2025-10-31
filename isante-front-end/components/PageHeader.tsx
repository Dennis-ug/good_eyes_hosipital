'use client'

import Link from 'next/link'
import { ReactNode } from 'react'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface PageHeaderProps {
  breadcrumbs?: BreadcrumbItem[]
  title: string
  subtitle?: string
  icon?: ReactNode
  action?: ReactNode
}

export default function PageHeader({ breadcrumbs = [], title, subtitle, icon, action }: PageHeaderProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
        {breadcrumbs.length > 0 && (
          <nav className="-mb-1 flex items-center text-sm text-gray-500 dark:text-gray-400" aria-label="Breadcrumb">
            {breadcrumbs.map((bc, idx) => (
              <span key={idx} className="flex items-center">
                {bc.href ? (
                  <Link href={bc.href} className="hover:text-gray-700 dark:hover:text-gray-300">{bc.label}</Link>
                ) : (
                  <span className="text-gray-700 dark:text-gray-200">{bc.label}</span>
                )}
                {idx < breadcrumbs.length - 1 && <span className="mx-2">/</span>}
              </span>
            ))}
          </nav>
        )}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center">
            {icon && (
              <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 mr-3">
                {icon}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
              {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
            </div>
          </div>
          {action}
        </div>
      </div>
    </div>
  )
}


