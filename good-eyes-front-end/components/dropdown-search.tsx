'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, ChevronDown, X } from 'lucide-react'
import { Patient } from '@/lib/types'

interface DropdownSearchProps<T> {
  placeholder: string
  value: string
  onChange: (value: string) => void
  onSelect: (item: T) => void
  onClear?: () => void
  items: T[]
  isLoading?: boolean
  displayKey: keyof T
  searchKeys: (keyof T)[]
  renderItem?: (item: T) => React.ReactNode
  renderSelected?: (item: T) => React.ReactNode
  maxHeight?: string
  minSearchLength?: number
  noResultsMessage?: string
  className?: string
  disabled?: boolean
  required?: boolean
  label?: string
}

export function DropdownSearch<T>({
  placeholder,
  value,
  onChange,
  onSelect,
  onClear,
  items,
  isLoading = false,
  displayKey,
  searchKeys,
  renderItem,
  renderSelected,
  maxHeight = "200px",
  minSearchLength = 2,
  noResultsMessage = "No results found",
  className = "",
  disabled = false,
  required = false,
  label
}: DropdownSearchProps<T>) {
  const [isOpen, setIsOpen] = useState(false)
  const [filteredItems, setFilteredItems] = useState<T[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Filter items based on search term
  useEffect(() => {
    if (value.length >= minSearchLength) {
      const filtered = items.filter(item => 
        searchKeys.some(key => {
          const fieldValue = item[key]
          if (fieldValue === null || fieldValue === undefined) return false
          return String(fieldValue).toLowerCase().includes(value.toLowerCase())
        })
      )
      setFilteredItems(filtered)
    } else {
      setFilteredItems([])
    }
  }, [value, items, searchKeys, minSearchLength])

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Handle input focus
  const handleInputFocus = () => {
    if (value.length >= minSearchLength) {
      setIsOpen(true)
    }
  }

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    
    if (newValue.length >= minSearchLength) {
      setIsOpen(true)
    } else {
      setIsOpen(false)
    }
  }

  // Handle item selection
  const handleItemSelect = (item: T) => {
    onSelect(item)
    setIsOpen(false)
  }

  // Handle clear
  const handleClear = () => {
    onChange('')
    onClear?.()
    setIsOpen(false)
    inputRef.current?.focus()
  }

  // Handle key navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
      inputRef.current?.blur()
    } else if (e.key === 'Enter' && filteredItems.length > 0) {
      handleItemSelect(filteredItems[0])
    }
  }

  // Default render functions
  const defaultRenderItem = (item: T) => (
    <div className="p-3 hover:bg-blue-50 dark:hover:bg-blue-900 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0">
      <div className="font-medium text-gray-900 dark:text-white">
        {String(item[displayKey])}
      </div>
    </div>
  )

  const defaultRenderSelected = (item: T) => (
    <div className="text-sm font-medium text-gray-900 dark:text-white">
      {String(item[displayKey])}
    </div>
  )

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
            bg-white dark:bg-gray-700 text-gray-900 dark:text-white
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${isOpen ? 'border-blue-500 ring-2 ring-blue-500' : ''}
          `}
        />

        {/* Clear Button */}
        {value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-8 flex items-center pr-2"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
          </button>
        )}

        {/* Dropdown Arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <ChevronDown 
            className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`} 
          />
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="absolute inset-y-0 right-12 flex items-center pr-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div 
          className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg"
          style={{ maxHeight }}
        >
          <div className="overflow-y-auto">
            {filteredItems.length > 0 ? (
              filteredItems.map((item, index) => (
                <div
                  key={index}
                  onClick={() => handleItemSelect(item)}
                  className="cursor-pointer"
                >
                  {renderItem ? renderItem(item) : defaultRenderItem(item)}
                </div>
              ))
            ) : value.length >= minSearchLength ? (
              <div className="p-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                {noResultsMessage}
              </div>
            ) : (
              <div className="p-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                Type at least {minSearchLength} characters to search...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Specialized Consumable Search Component
import { ConsumableItem } from '@/lib/types'
import { formatUGX } from '@/lib/currency'

interface ConsumableSearchProps {
  value: string
  onChange: (value: string) => void
  onSelect: (consumable: ConsumableItem) => void
  onClear?: () => void
  consumables: ConsumableItem[]
  isLoading?: boolean
  className?: string
  disabled?: boolean
  required?: boolean
  label?: string
}

export function ConsumableSearch({
  value,
  onChange,
  onSelect,
  onClear,
  consumables,
  isLoading = false,
  className = "",
  disabled = false,
  required = false,
  label = "Consumable Item"
}: ConsumableSearchProps) {
  const renderConsumableItem = (consumable: ConsumableItem) => (
    <div className="p-3 hover:bg-blue-50 dark:hover:bg-blue-900 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0">
      <div className="font-medium text-gray-900 dark:text-white">
        {consumable.name}
      </div>
      <div className="text-sm text-gray-500 dark:text-gray-400">
        SKU: {consumable.sku} • Stock: {consumable.currentStock} {consumable.unitOfMeasure}
      </div>
      <div className="text-xs text-gray-400 dark:text-gray-500">
        {consumable.categoryName} • {formatUGX(consumable.costPerUnit)} per {consumable.unitOfMeasure}
      </div>
    </div>
  )

  const renderSelectedConsumable = (consumable: ConsumableItem) => (
    <div className="text-sm font-medium text-gray-900 dark:text-white">
      {consumable.name} ({consumable.sku})
    </div>
  )

  return (
    <DropdownSearch<ConsumableItem>
      placeholder="Search for consumable items by name, SKU, or description..."
      value={value}
      onChange={onChange}
      onSelect={onSelect}
      onClear={onClear}
      items={consumables}
      isLoading={isLoading}
      displayKey="name"
      searchKeys={['name', 'sku', 'description', 'categoryName']}
      renderItem={renderConsumableItem}
      renderSelected={renderSelectedConsumable}
      minSearchLength={2}
      noResultsMessage="No consumable items found"
      className={className}
      disabled={disabled}
      required={required}
      label={label}
    />
  )
}

// Specialized Patient Search Component


interface PatientSearchProps {
  value: string
  onChange: (value: string) => void
  onSelect: (patient: Patient) => void
  onClear?: () => void
  patients: Patient[]
  isLoading?: boolean
  className?: string
  disabled?: boolean
  required?: boolean
  label?: string
}

export function PatientSearch({
  value,
  onChange,
  onSelect,
  onClear,
  patients,
  isLoading = false,
  className = "",
  disabled = false,
  required = false,
  label = "Patient"
}: PatientSearchProps) {
  const renderPatientItem = (patient: Patient) => (
    <div className="p-3 hover:bg-blue-50 dark:hover:bg-blue-900 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0">
      <div className="font-medium text-gray-900 dark:text-white">
        {patient.firstName} {patient.lastName}
      </div>
      <div className="text-sm text-gray-500 dark:text-gray-400">
        {patient.patientNumber} • Phone: {patient.phone || patient.alternativePhone || 'N/A'}
      </div>
      {patient.dateOfBirth && (
        <div className="text-xs text-gray-400 dark:text-gray-500">
          DOB: {new Date(patient.dateOfBirth).toLocaleDateString()} • Age: {patient.ageInYears || 'N/A'}
        </div>
      )}
    </div>
  )

  return (
    <DropdownSearch<Patient>
      placeholder="Search for patient by name, phone, or ID..."
      value={value}
      onChange={onChange}
      onSelect={onSelect}
      onClear={onClear}
      items={patients}
      isLoading={isLoading}
      displayKey="firstName"
      searchKeys={['firstName', 'lastName', 'phone', 'alternativePhone', 'nationalId', 'patientNumber']}
      renderItem={renderPatientItem}
      minSearchLength={2}
      noResultsMessage="No patients found"
      className={className}
      disabled={disabled}
      required={required}
      label={label}
    />
  )
}

// Specialized Doctor Search Component
import { User } from '@/lib/types'

interface DoctorSearchProps {
  value: string
  onChange: (value: string) => void
  onSelect: (doctor: User) => void
  onClear?: () => void
  doctors: User[]
  isLoading?: boolean
  className?: string
  disabled?: boolean
  required?: boolean
  label?: string
}

export function DoctorSearch({
  value,
  onChange,
  onSelect,
  onClear,
  doctors,
  isLoading = false,
  className = "",
  disabled = false,
  required = false,
  label = "Hospital Personnel"
}: DoctorSearchProps) {
  const renderDoctorItem = (doctor: User) => (
    <div className="p-3 hover:bg-blue-50 dark:hover:bg-blue-900 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0">
      <div className="font-medium text-gray-900 dark:text-white">
        {doctor.username}
      </div>
      <div className="text-sm text-gray-500 dark:text-gray-400">
        {doctor.roles?.map(role => role.name).join(', ')} • {doctor.email} {doctor.departmentName ? `• ${doctor.departmentName}` : ''}
      </div>
    </div>
  )

  return (
    <DropdownSearch<User>
      placeholder="Search for hospital personnel by username, email, or department..."
      value={value}
      onChange={onChange}
      onSelect={onSelect}
      onClear={onClear}
      items={doctors}
      isLoading={isLoading}
      displayKey="username"
      searchKeys={['username', 'email', 'departmentName']}
      renderItem={renderDoctorItem}
      minSearchLength={2}
      noResultsMessage="No hospital personnel found"
      className={className}
      disabled={disabled}
      required={required}
      label={label}
    />
  )
} 