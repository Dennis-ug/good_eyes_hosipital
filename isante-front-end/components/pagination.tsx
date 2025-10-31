'use client'

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { Page } from '@/lib/types'

interface PaginationProps {
  page: Page<unknown>
  onPageChange: (page: number) => void
  className?: string
}

export function Pagination({ page, onPageChange, className = '' }: PaginationProps) {
  const { number, totalPages, first, last, totalElements, size } = page
  
  if (totalPages <= 1) {
    return null
  }

  const startItem = number * size + 1
  const endItem = Math.min((number + 1) * size, totalElements)

  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 0; i < totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Show pages around current page
      let start = Math.max(0, number - 2)
      let end = Math.min(totalPages - 1, number + 2)
      
      // Adjust if we're near the edges
      if (number <= 2) {
        end = Math.min(totalPages - 1, 4)
      } else if (number >= totalPages - 3) {
        start = Math.max(0, totalPages - 5)
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
    }
    
    return pages
  }

  return (
    <div className={`flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6 ${className}`}>
      <div className="flex items-center justify-between flex-1 sm:hidden">
        <button
          onClick={() => onPageChange(number - 1)}
          disabled={first}
          className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(number + 1)}
          disabled={last}
          className="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
      
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{startItem}</span> to{' '}
            <span className="font-medium">{endItem}</span> of{' '}
            <span className="font-medium">{totalElements}</span> results
          </p>
        </div>
        
        <div>
          <nav className="inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            {/* First page */}
            <button
              onClick={() => onPageChange(0)}
              disabled={first}
              className="relative inline-flex items-center px-2 py-2 text-gray-400 border border-gray-300 bg-white text-sm font-medium rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">First</span>
              <ChevronsLeft className="h-4 w-4" />
            </button>
            
            {/* Previous page */}
            <button
              onClick={() => onPageChange(number - 1)}
              disabled={first}
              className="relative inline-flex items-center px-2 py-2 text-gray-400 border border-gray-300 bg-white text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            {/* Page numbers */}
            {getPageNumbers().map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium border ${
                  pageNum === number
                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                }`}
              >
                {pageNum + 1}
              </button>
            ))}
            
            {/* Next page */}
            <button
              onClick={() => onPageChange(number + 1)}
              disabled={last}
              className="relative inline-flex items-center px-2 py-2 text-gray-400 border border-gray-300 bg-white text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
            
            {/* Last page */}
            <button
              onClick={() => onPageChange(totalPages - 1)}
              disabled={last}
              className="relative inline-flex items-center px-2 py-2 text-gray-400 border border-gray-300 bg-white text-sm font-medium rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Last</span>
              <ChevronsRight className="h-4 w-4" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  )
} 