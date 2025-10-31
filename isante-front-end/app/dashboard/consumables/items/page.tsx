'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Package, Plus, Search, Trash2, ChevronLeft, ChevronRight, Loader2, Eye, Edit } from 'lucide-react'
import Link from 'next/link'
import { consumablesApi } from '@/lib/api'
import { ConsumableItem, Page } from '@/lib/types'
import { useDebounce } from '@/lib/hooks/use-debounce'

export default function ConsumablesItemsPage() {
  const [items, setItems] = useState<ConsumableItem[]>([])
  const [page, setPage] = useState<Page<ConsumableItem> | null>(null)
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [viewingId, setViewingId] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize] = useState(10)
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  const fetchItems = useCallback(async (pageNumber = 0, searchQuery = '') => {
    try {
      setLoading(true)
      setError(null)
      
      let response: Page<ConsumableItem>
      
      if (searchQuery.trim()) {
        // Use search API for search queries
        const searchResults = await consumablesApi.searchItems(searchQuery)
        // Convert search results to Page format for consistency
        response = {
          content: searchResults,
          totalElements: searchResults.length,
          totalPages: 1,
          size: searchResults.length,
          number: 0,
          first: true,
          last: true,
          numberOfElements: searchResults.length,
          empty: searchResults.length === 0,
          sort: { empty: true, sorted: false, unsorted: true },
          pageable: {
            pageNumber: 0,
            pageSize: searchResults.length,
            sort: { empty: true, sorted: false, unsorted: true },
            offset: 0,
            paged: false,
            unpaged: true
          }
        }
      } else {
        // Use paginated API for regular listing
        response = await consumablesApi.getAllItems({ 
          page: pageNumber, 
          size: pageSize 
        })
      }
      
      setItems(response.content || [])
      setPage(response)
      setCurrentPage(pageNumber)
    } catch (err) {
      console.error('Failed to fetch consumable items:', err)
      setError('Failed to load items')
      // Set demo data for testing
      setItems([
        {
          id: 1,
          name: 'Surgical Gloves',
          description: 'Disposable surgical gloves',
          currentStock: 25,
          unitOfMeasure: 'boxes',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 2,
          name: 'Cleaning Solution',
          description: 'Hospital grade cleaning solution',
          currentStock: 8,
          unitOfMeasure: 'liters',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ])
    } finally {
      setLoading(false)
    }
  }, [pageSize])

  // Fetch items when component mounts or when search term changes
  useEffect(() => {
    fetchItems(0, debouncedSearchTerm)
  }, [fetchItems, debouncedSearchTerm])

  // Reset to first page when search term changes
  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) {
      setCurrentPage(0)
    }
  }, [debouncedSearchTerm, searchTerm])

  const handleView = async (itemId: number) => {
    try {
      setViewingId(itemId)
      // Simulate a small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 300))
      // Navigate to view page
      window.location.href = `/dashboard/consumables/items/${itemId}`
    } catch (error) {
      console.error('Failed to navigate to view page:', error)
    } finally {
      setViewingId(null)
    }
  }

  const handleEdit = async (itemId: number) => {
    try {
      setEditingId(itemId)
      // Simulate a small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 300))
      // Navigate to edit page
      window.location.href = `/dashboard/consumables/items/${itemId}/edit`
    } catch (error) {
      console.error('Failed to navigate to edit page:', error)
    } finally {
      setEditingId(null)
    }
  }

  const handleDelete = async (itemId: number, itemName: string) => {
    if (!confirm(`Are you sure you want to delete "${itemName}"? This action cannot be undone.`)) {
      return
    }

    try {
      setDeletingId(itemId)
      
      await consumablesApi.deleteItem(itemId)
      
      // Refresh the current page
      await fetchItems(currentPage, debouncedSearchTerm)
      
    } catch (error) {
      console.error('Failed to delete item:', error)
      
      // Check if it's a dependency error
      if (error.message && error.message.includes('usage records') || error.message.includes('restock records')) {
        const useSoftDelete = confirm(
          'This item has related records and cannot be permanently deleted. Would you like to deactivate it instead? (This will hide it from the active items list but preserve the data.)'
        )
        
        if (useSoftDelete) {
          try {
            await consumablesApi.softDeleteItem(itemId)
            // Refresh the current page
            await fetchItems(currentPage, debouncedSearchTerm)
            return
          } catch (softDeleteError) {
            console.error('Failed to soft delete item:', softDeleteError)
            alert('Failed to deactivate item. Please try again.')
          }
        }
      } else {
        alert('Failed to delete item. Please try again.')
      }
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading consumable items...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Consumable Items</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage internal hospital consumables</p>
        </div>
        <Link 
          href="/dashboard/consumables/items/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Item
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg mr-3">
              <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-0 outline-none flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Current Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Unit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</div>
                      {item.description && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">{item.description}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{item.currentStock}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{item.unitOfMeasure}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      item.currentStock <= (item.minimumStockLevel || 0) 
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' 
                        : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                    }`}>
                      {item.currentStock <= (item.minimumStockLevel || 0) ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleView(item.id)}
                        disabled={viewingId === item.id || deletingId === item.id || editingId === item.id}
                        className="inline-flex items-center p-2 text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="View Details"
                      >
                        {viewingId === item.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEdit(item.id)}
                        disabled={editingId === item.id || deletingId === item.id || viewingId === item.id}
                        className="inline-flex items-center p-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Edit Item"
                      >
                        {editingId === item.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Edit className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.name)}
                        disabled={deletingId === item.id || viewingId === item.id || editingId === item.id}
                        className="inline-flex items-center p-2 text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete Item"
                      >
                        {deletingId === item.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {page && page.totalPages > 1 && !debouncedSearchTerm && (
          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing {page.number * page.size + 1} to {Math.min((page.number + 1) * page.size, page.totalElements)} of {page.totalElements} items
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => fetchItems(currentPage - 1, debouncedSearchTerm)}
                  disabled={page.first || loading}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, page.totalPages) }, (_, i) => {
                    let pageNum;
                    if (page.totalPages <= 5) {
                      pageNum = i;
                    } else if (page.number <= 2) {
                      pageNum = i;
                    } else if (page.number >= page.totalPages - 3) {
                      pageNum = page.totalPages - 5 + i;
                    } else {
                      pageNum = page.number - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => fetchItems(pageNum, debouncedSearchTerm)}
                        disabled={loading}
                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                          pageNum === page.number
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {pageNum + 1}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => fetchItems(currentPage + 1, debouncedSearchTerm)}
                  disabled={page.last || loading}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        )}

        {items.length === 0 && (
          <div className="text-center py-8">
            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Package className="h-8 w-8 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              {debouncedSearchTerm ? 'No items found matching your search.' : 'No consumable items found'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
