'use client'
// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { FileText, ArrowLeft, Search, Plus, Eye, ShoppingCart, Calculator, Receipt, DollarSign } from 'lucide-react'
import { patientVisitSessionApi, opticsApi, inventoryApi } from '@/lib/api'
import { formatUGX } from '@/lib/currency'
import type { PatientVisitSession, InventoryItem } from '@/lib/types'
import VisitSessionHeader from '../../_components/VisitSessionHeader'

interface ItemSelection {
  itemId: number
  item: InventoryItem
  quantity: number
  notes?: string
  calculatedPrice?: number
}

export default function PatientOpticsPage() {
  const params = useParams()
  const visitSessionId = Number(params.id)

  const [visitSession, setVisitSession] = useState<PatientVisitSession | null>(null)
  const [opticalItems, setOpticalItems] = useState<InventoryItem[]>([])
  const [selectedItems, setSelectedItems] = useState<ItemSelection[]>([])
  const [availableBrands, setAvailableBrands] = useState<string[]>([])
  const [availableShapes, setAvailableShapes] = useState<string[]>([])
  const [availableMaterials, setAvailableMaterials] = useState<string[]>([])
  const [availableTypes, setAvailableTypes] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('')
  const [selectedShape, setSelectedShape] = useState('')
  const [selectedMaterial, setSelectedMaterial] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [searchMode, setSearchMode] = useState<'frames' | 'lenses' | 'all'>('all')
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [creatingInvoice, setCreatingInvoice] = useState(false)

  useEffect(() => {
    loadData()
  }, [visitSessionId])

  // Reload optical items when search or search mode changes
  // Debounce search input (2 seconds after user stops typing)
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(search), 2000)
    return () => clearTimeout(handle)
  }, [search])

  useEffect(() => {
    if (visitSession) {
      loadOpticalItems()
    }
  }, [debouncedSearch, searchMode, visitSession])

  const loadData = async () => {
    try {
      setLoading(true)

      // Load visit session
      const vs = await patientVisitSessionApi.getVisitSession(visitSessionId)
      setVisitSession(vs)

      // Load optical data and available options
      await Promise.all([
        loadOpticalItems(),
        loadAvailableFilters()
      ])
    } finally {
      setLoading(false)
    }
  }

  const loadOpticalItems = async () => {
    try {
      let response;
      if (searchMode === 'frames') {
        if (debouncedSearch.trim()) {
          // Use backend search for frames
          response = await opticsApi.searchFrameItems(debouncedSearch)
        } else {
          response = await opticsApi.getOpticalItemsByType('FRAME')
        }
      } else if (searchMode === 'lenses') {
        if (debouncedSearch.trim()) {
          // For lenses, use general search and filter client-side
          response = await opticsApi.searchAllOpticalItems(debouncedSearch)
        } else {
          response = await opticsApi.getOpticalItemsByType('LENS')
        }
      } else {
        // ALL mode: Load everything from inventory so user can pick optics
        if (debouncedSearch.trim()) {
          // Use inventory paginated search to support name and SKU on backend
          const page = await inventoryApi.getAllItems({ page: 0, size: 50 }, debouncedSearch)
          setOpticalItems(page.content || [])
          return
        } else {
          // Paginated load of all active inventory items
          response = await inventoryApi.getAllItems({ page: 0, size: 50 })
        }
      }
      setOpticalItems(response.content || [])
    } catch (error) {
      console.error('Failed to load optical items:', error)
      setOpticalItems([])
    }
  }

  const loadAvailableFilters = async () => {
    try {
      const [brands, shapes, materials, types] = await Promise.all([
        opticsApi.getAvailableOpticalItemBrands(),
        opticsApi.getAvailableFrameShapes(),
        opticsApi.getAvailableFrameMaterials(),
        opticsApi.getAvailableLensTypesFromInventory()
      ])
      setAvailableBrands(brands || [])
      setAvailableShapes(shapes || [])
      setAvailableMaterials(materials || [])
      setAvailableTypes(types || [])
    } catch (error) {
      console.error('Failed to load filters:', error)
    }
  }


  const filteredItems = useMemo(() => {
    let items = opticalItems

    // Client-side search across multiple fields, including SKU
    const q = debouncedSearch.trim().toLowerCase()
    if (q) {
      items = items.filter(item =>
        (item.name && item.name.toLowerCase().includes(q)) ||
        (item.sku && item.sku.toLowerCase().includes(q)) ||
        (item.categoryName && item.categoryName.toLowerCase().includes(q)) ||
        (item.brand && item.brand.toLowerCase().includes(q)) ||
        (item.model && item.model.toLowerCase().includes(q))
      )
    }

    // Filter by item type (only if not already filtered by search)
    if (selectedType && !q) {
      items = items.filter(item => item.opticsType === selectedType)
    }

    // Filter by brand
    if (selectedBrand) {
      items = items.filter(item => item.brand === selectedBrand)
    }

    // Filter by shape/material (for frames and lenses)
    if (selectedShape) {
      items = items.filter(item => item.frameShape === selectedShape)
    }

    if (selectedMaterial) {
      items = items.filter(item => item.frameMaterial === selectedMaterial)
    }

    return items
  }, [opticalItems, selectedBrand, selectedShape, selectedMaterial, selectedType, debouncedSearch])

  const addItemToSelection = (item: InventoryItem) => {
    const existing = selectedItems.find(s => s.itemId === item.id)
    if (existing) {
      setSelectedItems(selectedItems.map(s =>
        s.itemId === item.id
          ? { ...s, quantity: s.quantity + 1 }
          : s
      ))
    } else {
      setSelectedItems([...selectedItems, {
        itemId: item.id,
        item,
        quantity: 1,
        notes: '',
        calculatedPrice: item.unitPrice
      }])
    }
  }

  const updateItemQuantity = (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      setSelectedItems(selectedItems.filter(s => s.itemId !== itemId))
    } else {
      setSelectedItems(selectedItems.map(s =>
        s.itemId === itemId ? { ...s, quantity } : s
      ))
    }
  }

  const updateItemNotes = (itemId: number, notes: string) => {
    setSelectedItems(selectedItems.map(s =>
      s.itemId === itemId ? { ...s, notes } : s
    ))
  }

  const removeItemSelection = (itemId: number) => {
    setSelectedItems(selectedItems.filter(s => s.itemId !== itemId))
  }

  const calculateTotal = () => {
    return selectedItems.reduce((total, selection) => {
      return total + ((selection.calculatedPrice || selection.item.unitPrice) * selection.quantity)
    }, 0)
  }

  const handleCreateInvoice = async () => {
    if (selectedItems.length === 0) {
      alert('Please select at least one item')
      return
    }

    setCreatingInvoice(true)
    try {
      const invoice = await opticsApi.createInvoiceFromItems(visitSessionId, selectedItems.map(selection => ({
        itemId: selection.itemId,
        quantity: selection.quantity,
        notes: selection.notes
      })))

      alert(`Invoice created successfully! Invoice ID: ${invoice.id}`)
      setSelectedItems([])
      setShowInvoiceModal(false)

      // Optionally refresh visit session data
      await loadData()
    } catch (error: any) {
      console.error('Failed to create invoice:', error)
      alert(`Failed to create invoice: ${error.message || 'Unknown error'}`)
    } finally {
      setCreatingInvoice(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-16 bg-gray-300 dark:bg-gray-700 rounded"></div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                <div className="h-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href={`/dashboard/patient-visit-sessions/${visitSessionId}`}>
                <button className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Visit Session
                </button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Optics Management</h1>
                {visitSession && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {visitSession.patientName} - Visit #{visitSession.id}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">Selected Items</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedItems.length}</p>
              </div>
              <button
                onClick={() => setShowInvoiceModal(true)}
                disabled={selectedItems.length === 0}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Receipt className="h-4 w-4 mr-2" />
                Create Invoice ({selectedItems.length})
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Optics Catalog */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              {/* Filters */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap gap-4 mb-4">
                  {/* Search */}
                  <div className="flex-1 min-w-64">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by name, SKU, category, brand..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Search Mode Toggle */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600 dark:text-gray-400">Search:</label>
                    <div className="flex rounded-md border border-gray-300 dark:border-gray-600">
                      <button
                        onClick={() => {
                          setSearchMode('frames')
                          setSelectedType('')
                          loadData()
                        }}
                        className={`px-3 py-2 text-sm ${
                          searchMode === 'frames'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                        }`}
                      >
                        Frames
                      </button>
                      <button
                        onClick={() => {
                          setSearchMode('lenses')
                          setSelectedType('')
                          loadData()
                        }}
                        className={`px-3 py-2 text-sm ${
                          searchMode === 'lenses'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                        }`}
                      >
                        Lenses
                      </button>
                      <button
                        onClick={() => {
                          setSearchMode('all')
                          setSelectedType('')
                          loadData()
                        }}
                        className={`px-3 py-2 text-sm rounded-r-md ${
                          searchMode === 'all'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                        }`}
                      >
                        All Items
                      </button>
                    </div>
                  </div>
                </div>

                {/* Filter Controls */}
                <div className="flex flex-wrap gap-4">
                  {/* Item Type Filter */}
                  {availableTypes.length > 0 && (
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">All Types</option>
                      {availableTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  )}

                  {availableBrands.length > 0 && (
                    <select
                      value={selectedBrand}
                      onChange={(e) => setSelectedBrand(e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">All Brands</option>
                      {availableBrands.map(brand => (
                        <option key={brand} value={brand}>{brand}</option>
                      ))}
                    </select>
                  )}

                  {availableShapes.length > 0 && (
                    <select
                      value={selectedShape}
                      onChange={(e) => setSelectedShape(e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">All Shapes</option>
                      {availableShapes.map(shape => (
                        <option key={shape} value={shape}>{shape}</option>
                      ))}
                    </select>
                  )}

                  {availableMaterials.length > 0 && (
                    <select
                      value={selectedMaterial}
                      onChange={(e) => setSelectedMaterial(e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">All Materials</option>
                      {availableMaterials.map(material => (
                        <option key={material} value={material}>{material}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Optical Items */}
              <div className="p-6">
                {filteredItems.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No items found</p>
                    <p className="text-sm mt-1">Try adjusting your filters or search terms</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredItems.map((item) => {
                      const isSelected = selectedItems.some(s => s.itemId === item.id)
                      const isLens = item.opticsType === 'LENS'
                      const isFrame = item.opticsType === 'FRAME'
                      const badgeLabel = item.opticsType ? (isLens ? 'LENS' : 'FRAME') : (item.categoryName || 'ITEM')

                      return (
                        <div key={item.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">{item.name}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{item.brand} {item.model}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              isLens
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                : isFrame
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                            }`}>
                              {badgeLabel}
                            </span>
                          </div>

                          <div className="space-y-1 mb-3">
                            {isLens ? (
                              <>
                                {item.frameMaterial && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    <span className="font-medium">Material:</span> {item.frameMaterial}
                                  </p>
                                )}
                                {item.frameShape && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    <span className="font-medium">Type:</span> {item.frameShape}
                                  </p>
                                )}
                              </>
                            ) : isFrame ? (
                              <>
                                {item.frameShape && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    <span className="font-medium">Shape:</span> {item.frameShape}
                                  </p>
                                )}
                                {item.frameMaterial && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    <span className="font-medium">Material:</span> {item.frameMaterial}
                                  </p>
                                )}
                              </>
                            ) : (
                              <>
                                {item.categoryName && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    <span className="font-medium">Category:</span> {item.categoryName}
                                  </p>
                                )}
                                {item.sku && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    <span className="font-medium">SKU:</span> {item.sku}
                                  </p>
                                )}
                              </>
                            )}
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              <span className="font-medium">Stock:</span> {item.quantityInStock || 0} units
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-lg font-bold text-green-600 dark:text-green-400">
                              {formatUGX(item.unitPrice)}
                            </span>
                            <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
                              <button
                                onClick={() => addItemToSelection(item)}
                                disabled={(item.quantityInStock || 0) <= 0}
                                className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ${
                                  isLens
                                    ? 'bg-blue-600 hover:bg-blue-700'
                                    : isFrame
                                      ? 'bg-green-600 hover:bg-green-700'
                                      : 'bg-gray-700 hover:bg-gray-800'
                                }`}
                              >
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                {isLens ? 'Add Lens' : isFrame ? 'Add Frame' : 'Add Item'}
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Selection Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Selected Optics</h3>
            </div>

            <div className="p-6">
              {selectedItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No items selected</p>
                  <p className="text-sm mt-1">Choose frames and lenses from the catalog</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedItems.map((selection) => (
                    <div key={selection.itemId} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{selection.item.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{selection.item.brand}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{selection.item.opticsType}</p>
                        </div>
                        <button
                          onClick={() => removeItemSelection(selection.itemId)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <label className="text-sm text-gray-600 dark:text-gray-400">Qty:</label>
                          <input
                            type="number"
                            min="1"
                            max={selection.item.quantityInStock || 1}
                            value={selection.quantity}
                            onChange={(e) => updateItemQuantity(selection.itemId, parseInt(e.target.value) || 1)}
                            className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <span className="font-medium text-green-600 dark:text-green-400">
                          {formatUGX(selection.calculatedPrice * selection.quantity)}
                        </span>
                      </div>

                      <textarea
                        placeholder="Notes (optional)"
                        value={selection.notes || ''}
                        onChange={(e) => updateItemNotes(selection.itemId, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-700 dark:text-white"
                        rows={2}
                      />
                    </div>
                  ))}

                  <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span className="text-gray-900 dark:text-white">Total:</span>
                      <span className="text-green-600 dark:text-green-400">{formatUGX(calculateTotal())}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowInvoiceModal(true)}
                    className="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Calculator className="h-4 w-4 mr-2" />
                    Create Invoice
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Invoice Creation Modal */}
        {showInvoiceModal && (
          <div className="fixed inset-0 z-50 grid place-items-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowInvoiceModal(false)} />
            <div className="relative z-10 w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
              <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                <h4 className="text-md font-semibold text-gray-900 dark:text-white">Create Frame + Lens Invoice</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Create an invoice for the selected frame and lens combinations
                </p>
              </div>
              <div className="px-5 py-4 space-y-3">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="space-y-2">
                    {selectedItems.map((selection) => (
                      <div key={selection.itemId} className="text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-700 dark:text-gray-300">
                            {selection.item.name} (x{selection.quantity})
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {formatUGX(selection.calculatedPrice * selection.quantity)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-4">
                          {selection.item.opticsType} - {selection.item.brand}
                        </div>
                      </div>
                    ))}
                    <div className="border-t border-gray-300 dark:border-gray-600 pt-2 flex justify-between font-bold">
                      <span className="text-gray-900 dark:text-white">Total</span>
                      <span className="text-green-600 dark:text-green-400">{formatUGX(calculateTotal())}</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This will create an invoice and automatically deduct stock when payment is received.
                </p>
              </div>
              <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(false)}
                  className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateInvoice}
                  disabled={creatingInvoice}
                  className="px-4 py-2 text-sm rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                  {creatingInvoice ? 'Creating...' : 'Create Invoice'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
