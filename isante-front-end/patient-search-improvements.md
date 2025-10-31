# Patient Search Improvements for Appointment Form

## Current Implementation Issues

The current appointment form in `app/dashboard/appointments/page.tsx` uses mock data for patient search instead of integrating with the real patient API. Here are the key improvements needed:

## 1. Replace Mock Patient Search with Real API

### Current Code (Mock Data):
```typescript
// SIMPLE PATIENT SEARCH - NO CALLBACKS
const searchPatients = (searchTerm: string) => {
  console.log('Searching patients for:', searchTerm)
  
  if (searchTerm.length < 2) {
    setPatients([])
    return
  }

  setIsLoadingPatients(true)
  
  // Simple mock data
  const mockPatients = [
    { id: 101, firstName: "John", lastName: "Doe", phone: "+256701234567", alternativePhone: "+256701234567", email: "john.doe@email.com", ageInYears: 35, gender: "Male", maritalStatus: "Married" },
    // ... more mock data
  ].filter(patient => 
    patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm) ||
    patient.alternativePhone.includes(searchTerm)
  )
  
  setPatients(mockPatients)
  setIsLoadingPatients(false)
}
```

### Improved Code (Real API):
```typescript
const searchPatients = useCallback(async (searchTerm: string) => {
  if (searchTerm.length < 2) {
    setPatients([])
    return
  }

  setIsLoadingPatients(true)
  setError(null)

  try {
    // Create pageable object for patient search
    const pageable: Pageable = {
      page: 0,
      size: 20, // Limit results for better performance
      sort: 'firstName,asc'
    }

    // Call the actual patient API
    const response: Page<Patient> = await patientApi.getAll(pageable)
    
    // Filter patients based on search term
    const filteredPatients = response.content.filter(patient => 
      patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone?.includes(searchTerm) ||
      patient.alternativePhone?.includes(searchTerm) ||
      patient.nationalId?.includes(searchTerm)
    )

    console.log('Found patients from API:', filteredPatients)
    setPatients(filteredPatients)
  } catch (error) {
    console.error('Failed to search patients:', error)
    setError('Failed to search patients. Please try again.')
    setPatients([])
  } finally {
    setIsLoadingPatients(false)
  }
}, [])
```

## 2. Add Debouncing for Better Performance

### Current Implementation:
```typescript
const handlePatientSearchChange = (value: string) => {
  setPatientSearchTerm(value)
  setShowPatientDropdown(true)
  
  if (value.length >= 2) {
    searchPatients(value)
  } else {
    setPatients([])
  }
}
```

### Improved Implementation with Debouncing:
```typescript
const handlePatientSearchChange = useCallback((value: string) => {
  setPatientSearchTerm(value)
  setShowPatientDropdown(true)
  
  if (value.length >= 2) {
    // Debounce the search to avoid too many API calls
    const timeoutId = setTimeout(() => {
      searchPatients(value)
    }, 300)
    
    return () => clearTimeout(timeoutId)
  } else {
    setPatients([])
  }
}, [searchPatients])
```

## 3. Enhanced Patient Display in Dropdown

### Current Display:
```typescript
{patients.map((patient) => (
  <div
    key={patient.id}
    onClick={() => {
      console.log('Selected patient:', patient.firstName, patient.lastName)
      alert(`Selected: ${patient.firstName} ${patient.lastName}`)
      setSelectedPatient(patient)
      setPatientSearchTerm(`${patient.firstName} ${patient.lastName}`)
      setShowPatientDropdown(false)
    }}
    className="p-3 hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0"
  >
    <div className="font-medium text-gray-900 dark:text-white">
      {patient.firstName} {patient.lastName}
    </div>
    <div className="text-gray-500 dark:text-gray-400 text-xs">
      Phone: {patient.phone}
    </div>
  </div>
))}
```

### Improved Display with More Information:
```typescript
{patients.map((patient) => (
  <div
    key={patient.id}
    onClick={() => {
      setSelectedPatient(patient)
      setPatientSearchTerm(`${patient.firstName} ${patient.lastName}`)
      setShowPatientDropdown(false)
    }}
    className="p-3 hover:bg-blue-50 dark:hover:bg-blue-900 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0"
  >
    <div className="font-medium text-gray-900 dark:text-white">
      {patient.firstName} {patient.lastName}
    </div>
    <div className="text-sm text-gray-500 dark:text-gray-400">
      ID: {patient.id} • Phone: {patient.phone || patient.alternativePhone || 'N/A'}
    </div>
    {patient.dateOfBirth && (
      <div className="text-xs text-gray-400 dark:text-gray-500">
        DOB: {new Date(patient.dateOfBirth).toLocaleDateString()} • Age: {patient.ageInYears || 'N/A'}
      </div>
    )}
  </div>
))}
```

## 4. Better Error Handling

### Add Error State:
```typescript
const [error, setError] = useState<string | null>(null)
```

### Display Error Messages:
```typescript
{error && (
  <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
    <div className="text-sm text-red-800 dark:text-red-400">{error}</div>
  </div>
)}
```

## 5. Enhanced Selected Patient Display

### Current Display:
```typescript
{selectedPatient && (
  <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm font-medium text-green-800 dark:text-green-400">
          Selected: {selectedPatient.firstName} {selectedPatient.lastName}
        </div>
        <div className="text-xs text-green-600 dark:text-green-500">
          ID: {selectedPatient.id} • {selectedPatient.phone || selectedPatient.alternativePhone || 'No phone'}
        </div>
      </div>
      <button
        type="button"
        onClick={() => {
          setSelectedPatient(null)
          setPatientSearchTerm('')
        }}
        className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
      >
        <XCircle className="h-4 w-4" />
      </button>
    </div>
  </div>
)}
```

### Improved Display with More Details:
```typescript
{selectedPatient && (
  <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="text-sm font-medium text-green-800 dark:text-green-400">
          Selected: {selectedPatient.firstName} {selectedPatient.lastName}
        </div>
        <div className="text-xs text-green-600 dark:text-green-500">
          ID: {selectedPatient.id} • Phone: {selectedPatient.phone || selectedPatient.alternativePhone || 'N/A'}
        </div>
        {selectedPatient.dateOfBirth && (
          <div className="text-xs text-green-600 dark:text-green-500">
            DOB: {new Date(selectedPatient.dateOfBirth).toLocaleDateString()} • Age: {selectedPatient.ageInYears || 'N/A'}
          </div>
        )}
        {selectedPatient.gender && (
          <div className="text-xs text-green-600 dark:text-green-500">
            Gender: {selectedPatient.gender} • {selectedPatient.maritalStatus || 'N/A'}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={() => {
          setSelectedPatient(null)
          setPatientSearchTerm('')
        }}
        className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 ml-2"
      >
        <XCircle className="h-4 w-4" />
      </button>
    </div>
  </div>
)}
```

## 6. Search by Multiple Criteria

### Enhanced Search Logic:
```typescript
const filteredPatients = response.content.filter(patient => 
  patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
  patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
  patient.phone?.includes(searchTerm) ||
  patient.alternativePhone?.includes(searchTerm) ||
  patient.nationalId?.includes(searchTerm) ||
  `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
)
```

## 7. Loading States and User Feedback

### Enhanced Loading Indicator:
```typescript
{isLoadingPatients && (
  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
  </div>
)}
```

### No Results State:
```typescript
{showPatientDropdown && !isLoadingPatients && patients.length === 0 && patientSearchTerm.length >= 2 && (
  <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg">
    <div className="p-3 text-sm text-gray-500 dark:text-gray-400 text-center">
      No patients found matching "{patientSearchTerm}"
    </div>
  </div>
)}
```

## 8. Form Validation Integration

### Enhanced Form Validation:
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  
  // Validate that patient is selected
  if (!selectedPatient) {
    setError('Please select a patient')
    return
  }
  
  // Validate other required fields
  if (!formData.appointmentDate || !formData.appointmentTime) {
    setError('Please select appointment date and time')
    return
  }
  
  if (!formData.reason) {
    setError('Please provide a reason for the appointment')
    return
  }

  // ... rest of submission logic
}
```

## Implementation Steps

1. **Replace mock data with real API calls** in the `searchPatients` function
2. **Add debouncing** to prevent excessive API calls
3. **Enhance error handling** with proper error states and messages
4. **Improve patient display** with more detailed information
5. **Add loading states** for better user experience
6. **Enhance form validation** to ensure patient selection
7. **Test the integration** with the actual patient API

## Benefits

- **Real-time data**: Always shows current patient information
- **Better performance**: Debouncing reduces unnecessary API calls
- **Enhanced UX**: Better loading states and error handling
- **More information**: Shows comprehensive patient details
- **Reliability**: Uses actual database data instead of mock data

This implementation will provide a much better user experience and ensure that the appointment form works with real patient data from your API. 